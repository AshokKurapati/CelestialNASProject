/* This is the main interface file for any xml request 
 * For creating volume,share,user,group,iscsi etc...
*/

/*<ransari@gmail.com> */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/ioctl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/utsname.h>
#include <scsi/scsi.h>
#include <stdint.h>
#include <ctype.h>
#include <errno.h>
#include <fcntl.h>
#include <syscall.h>
#include <unistd.h>
#include <stdbool.h>
#include <dirent.h>
#include <linux/hdreg.h>
#include <linux/fs.h>
#include <scsi/scsi_ioctl.h>
#include <sys/socket.h>
#include <linux/if.h>
#include <netdb.h>
#include <errno.h>
#include <dirent.h>
#include <mntent.h>
#include <ftw.h>
#include <fcntl.h>

#include "interface.h"
#include "yajl/yajl_tree.h"

uint32_t fsize = 0;
uint64_t SizeInBytes = 0;
int VolSizeInGB = 0.0;
uint8_t print_disk;
static unsigned char jsonFile[12288];
FILE *logfile;
#define VOLUMELOG /var/log/volume.log

#define logmessage(format, ...) fprintf (logfile, format, ##__VA_ARGS__)

#define DISKPRINTF(fmt, args...) \
	if (print_disk) \
	logmessage(fmt, ##args) \


#define FINDANDREPLACE(str,size,n)	\
		n = 0;						\
		for (n=0; n < size; n++) {	\
		  if (str[n] == '\n')		\
				str[n] = '\0';		\
		}							\
//#ifdef DISKXML
//#define logmessage(fmt, args...) logmessage("%s:%d::  " fmt, __FILE__, __LINE__,##args)
//#define logmessage(fmt, args...) logmessage(fmt, ##args)
//#else
//#define logmessage(fmt, args...)
//#endif

#define GB 1000*1000*1000


#define SIZEINGB(cyl,heads,sector,disk_size) \
	uint64_t _disk_size = cyl*heads*sector*512; \
	disk_size = _disk_size/(GB); \




typedef struct mdu_array_info_s {
    /*
     * Generic constant information
     */
    int major_version;
    int minor_version;
    int patch_version;
    int ctime;
    int level;
    int size;
    int nr_disks;
    int raid_disks;
    int md_minor;
    int not_persistent;

    /*
     * Generic state information
     */
    int utime;      /*  0 Superblock update time              */
    int state;      /*  1 State bits (clean, ...)             */
    int active_disks;   /*  2 Number of currently active disks        */
    int working_disks;  /*  3 Number of working disks             */
    int failed_disks;   /*  4 Number of failed disks              */
    int spare_disks;    /*  5 Number of spare disks           */

    /*
     * Personality information
     */
    int layout;     /*  0 the array's physical layout         */
    int chunk_size; /*  1 chunk size in bytes             */
    
} mdu_array_info_t;
    
typedef struct mdu_disk_info_s {
    /* 
     * configuration/status of one particular disk
     */ 
    int number;
    int major;
    int minor;
    int raid_disk;
    int state;
    
} mdu_disk_info_t;

/*
 * convert a major/minor pair for a block device into a name in /dev, if possible.
 * On the first call, walk /dev collecting name.
 * Put them in a simple linked listfor now.
 */
/* mdadm */
struct devmap {
	int major, minor;
	char *name;
	struct devmap *next;
} *devlist = NULL;
int devlist_ready = 0;


struct mount_point {
	uint8_t claim;
	char devpath[32];
	char mountdir[32];
	char mdpath[24];
	char vgpath[8];
	char lvpath[32];
	char disk_list[32];
	char disk_node[64];
	int raidlevel;
	int size;
	int state;
};
struct mount_point mnt[0];

int total_mount_points = 0;
#define MD_MAJOR 9      // taken from mdadm.h
/* ioctls */

/* status */
#define RAID_VERSION        _IOR (MD_MAJOR, 0x10, mdu_version_t)
#define GET_ARRAY_INFO      _IOR (MD_MAJOR, 0x11, mdu_array_info_t)
#define GET_DISK_INFO       _IOR (MD_MAJOR, 0x12, mdu_disk_info_t)
#define PRINT_RAID_DEBUG    _IO (MD_MAJOR, 0x13)
#define RAID_AUTORUN        _IO (MD_MAJOR, 0x14)
#define GET_BITMAP_FILE     _IOR (MD_MAJOR, 0x15, mdu_bitmap_file_t)
#define TOTAL_DISKS  184

#define MD_DISK_ACTIVE		1 /* disk is running but may not be in sync */
#define FTW_PHYS 1


int add_dev(const char *name, const struct stat *stb, int flag, struct FTW *s)
{
	struct stat st;

	if (S_ISLNK(stb->st_mode)) {
		if (stat(name, &st) != 0)
			return 0;
		stb = &st;
	}

	if ((stb->st_mode&S_IFMT)== S_IFBLK) {
		char *n = strdup(name);
		struct devmap *dm = malloc(sizeof(*dm));
		if (strncmp(n, "/dev/./", 7)==0)
			strcpy(n+4, name+6);
		if (dm) {
			dm->major = major(stb->st_rdev);
			dm->minor = minor(stb->st_rdev);
			dm->name = n;
			dm->next = devlist;
			devlist = dm;
		}
	}
	return 0;
}


/*
 * Find a block device with the right major/minor number.
 * If we find multiple names, choose the shortest.
 * If we find a name in /dev/md/, we prefer that.
 * This applies only to names for MD devices.
 * If 'prefer' is set (normally to e.g. /by-path/)
 * then we prefer a name which contains that string.
 */
char *map_dev_preferred(int major, int minor, int create,
			char *prefer)
{
	struct devmap *p;
	char *regular = NULL, *preferred=NULL;
	int did_check = 0;

	if (major == 0 && minor == 0)
			return NULL;

 retry:
	if (!devlist_ready) {
		char *dev = "/dev";
		struct stat stb;
		while(devlist) {
			struct devmap *d = devlist;
			devlist = d->next;
			free(d->name);
			free(d);
		}
		if (lstat(dev, &stb)==0 &&
		    S_ISLNK(stb.st_mode))
			dev = "/dev/.";
		nftw(dev, add_dev, 10, FTW_PHYS);
		devlist_ready=1;
		did_check = 1;
	}

	for (p=devlist; p; p=p->next)
		if (p->major == major &&
		    p->minor == minor) {
			if (strncmp(p->name, "/dev/md/",8) == 0
			    || (prefer && strstr(p->name, prefer))) {
				if (preferred == NULL ||
				    strlen(p->name) < strlen(preferred))
					preferred = p->name;
			} else {
				if (regular == NULL ||
				    strlen(p->name) < strlen(regular))
					regular = p->name;
			}
		}
	if (!regular && !preferred && !did_check) {
		devlist_ready = 0;
		goto retry;
	}
	if (create && !regular && !preferred) {
		static char buf[30];
		snprintf(buf, sizeof(buf), "%d:%d", major, minor);
		regular = buf;
	}

	return preferred ? preferred : regular;
}

void getInfo(int fd, char *name, char jsvendor[])
{
	int bus,host;
	/* The following are defined by the SCSI-2 specification. */
	typedef struct _scsi_inquiry_cmd
	{
		uint8_t op;
		uint8_t lun;          /* bits 5-7 denote the LUN */
		uint8_t page_code;
		uint8_t reserved;
		uint8_t alloc_length;
		uint8_t control;
	} __attribute__((packed)) scsi_inquiry_cmd_t;

	typedef struct _scsi_inquiry_data
	{
		uint8_t peripheral_info;
		uint8_t device_info;
		uint8_t version_info;
		uint8_t _field1;
		uint8_t additional_length;
		uint8_t _reserved1;
		uint8_t _reserved2;
		uint8_t _field2;
		uint8_t vendor_id[8];
		uint8_t product_id[16];
		uint8_t product_revision[4];
		uint8_t vendor_specific[20];
		uint8_t _reserved3[40];
	} __attribute__((packed)) scsi_inquiry_data_t;

	struct scsi_arg
	{
		unsigned int inlen;
		unsigned int outlen;
		union arg_data
		{
			scsi_inquiry_data_t out;
			scsi_inquiry_cmd_t  in;
		} data;
	} arg;
	struct scsi_idlun
	{
		uint32_t dev_id;
		uint32_t host_unique_id;
	} idlun;

	//*vendor = NULL;
	//*product = NULL;
	if (ioctl (fd, SCSI_IOCTL_GET_IDLUN, &idlun) < 0) {
		arg.data.in.lun = 0;
	} else {
        arg.data.in.lun = idlun.host_unique_id << 5;
    }
    if (ioctl (fd,SCSI_IOCTL_GET_BUS_NUMBER,&bus) == 0) {
        logmessage("Bus:        %d:0:0:0\n",bus);
    }
	if (ioctl(fd, SCSI_IOCTL_PROBE_HOST, &host) == 0) {
		logmessage("Host:   %d\n",host);
	}
	memset (&arg, 0x00, sizeof(struct scsi_arg));
	arg.inlen  = 0;
	arg.outlen = sizeof(scsi_inquiry_data_t);
	arg.data.in.op  = INQUIRY;
	arg.data.in.lun = 0;
	arg.data.in.alloc_length = sizeof(scsi_inquiry_data_t);
	arg.data.in.page_code = 0;
	arg.data.in.reserved = 0;
	arg.data.in.control = 0;

	if (ioctl (fd, SCSI_IOCTL_SEND_COMMAND, &arg) < 0) {
		logmessage("Command processing for disk=%s Failed \n",name);
		return;
	}

	logmessage("Vendor ID:  %s\n",arg.data.out.vendor_id);
	logmessage("Product ID: %s\n",arg.data.out.product_id);
	logmessage("Peripheral: %d\n",arg.data.out.peripheral_info);
	logmessage("DevInfo:    %d\n",arg.data.out.device_info);
	sprintf(jsvendor, "%s", arg.data.out.product_id);
}

int printdiskdetails(char disk_name[], int diskno)
{

	char diskpath[9] = "/dev/";
	char diskpartpath[10];
	int fd,sector_size,data,cyl;
	struct stat dev_stat;
	struct hd_geometry geometry;
	uint64_t len,bytes,sector;
	uint64_t disk_size,heads = 0;
	int part_id = 1;
	int cfd,count;
	char claimdata[12];
	int mddisk=0;
	char compare[6] = {'0'}, vol_list[32] = {0};
	char command[64] = {'0'} ,output[6] = {'0'},dd_output[6] = {'0'};

/* For jSON formatting  */
	FILE *fp;
	char jsname[12], *jsstatus;
	char jssize[12];
	char jsvol_list[256] = {0};
	char jsvendor[64];
/* jSON formatting done */

	fp = fopen("/var/log/disk.js", "a");
	strcat(diskpath,disk_name);
	sprintf(diskpartpath,"/dev/%s%d",disk_name,part_id);
	logmessage("Disk:       		%s\n",diskpath);
	logmessage("DiskPartPath:		%s\n",diskpartpath);

	sprintf(command, "cat /sys/class/net/eth0/address | sed 's/://g'",diskpartpath);
	get_data(command, output);
	
	sprintf(command, "dd count=12 skip=512 bs=1 if=%s 2> /dev/null | awk '{print $0}'",diskpartpath);
	get_data(command,dd_output);
	if(strcmp(output, dd_output)) 
		jsstatus = "Foreign";
	else
		jsstatus =  "Normal";

	fd = open(diskpath,O_RDWR);
	if (fd < 0) {
		perror("open");
		return EXIT_FAILURE;
	}
	if (stat (diskpath, &dev_stat)) {
		perror("stat");
		return EXIT_FAILURE;
	}
	if (ioctl (fd, BLKSSZGET, &sector_size) == 0) {
		//logmessage("sector size is %d\n",sector_size);
	}
	if (ioctl(fd, BLKGETSIZE64, &bytes) == 0) {
		len = bytes/sector_size;
		//logmessage("length is %llu\n",len);
	}
	if (!ioctl (fd, HDIO_GETGEO, &geometry)) {
		cyl = len / (geometry.heads * geometry.sectors);
		heads = geometry.heads;
		sector = geometry.sectors;
		logmessage("Sector:     %d\n",geometry.sectors);
		logmessage("Heads :     %d\n",geometry.heads);
		logmessage("Cylinders:  %d\n",cyl);
		SIZEINGB(cyl,heads,sector,disk_size);
//		disk_size = (cyl*heads*sector*512)/(1000*1000*1000);
		/*
		if (disk_size > 1000) {
			logmessage("Size:	    %lldTB\n",disk_size);
			sprintf(jssize,"%lldTB", disk_size);
		}
		else {
			logmessage("Size:	    %lldGB\n",disk_size);
			sprintf(jssize,"%lldGB", disk_size);
		}
	*/
	logmessage("Size:	    %lldGB\n",disk_size);
	sprintf(jssize,"%lldGB", disk_size);
	}
	getInfo(fd,diskpath,jsvendor);
	if (!strcmp(disk_name,"sdb")) {
		fd = open(diskpartpath,O_RDONLY);
		lseek(fd,512,SEEK_SET);
		read(fd,claimdata,12);
		claimdata[12] ='\0';
	}
	for (mddisk= 0; mddisk <= total_mount_points; mddisk++) {
		logmessage("DISK NODE=%s\n",mnt[mddisk].disk_node);
    	sprintf(compare, "DISK%d", (diskno+1));
	    if (strstr(mnt[mddisk].disk_list, compare)) {
    	    logmessage("%s ", mnt[mddisk].mountdir);
			sprintf(vol_list, "%s ", mnt[mddisk].mountdir);
			strcat(jsvol_list, vol_list);
		}
/*
    	else if (strstr(mnt[mddisk].disk_list, compare)) {
        	logmessage("%s ", mnt[mddisk].mountdir);
			sprintf(vol_list, "%s", mnt[mddisk].mountdir);
			strcat(jsvol_list, vol_list);
		}
	    else if (strstr(mnt[mddisk].disk_list, compare)) {
    	    logmessage("%s ", mnt[mddisk].mountdir);
			sprintf(vol_list, "%s", mnt[mddisk].mountdir);
			strcat(jsvol_list, vol_list);
		}
    	else if (strstr(mnt[mddisk].disk_list, compare)) {
        	logmessage("%s \n", mnt[mddisk].mountdir);
			sprintf(vol_list, "%s", mnt[mddisk].mountdir);
			strcat(jsvol_list, vol_list);
		}
*/
		else {
			logmessage("Unassigned");
			strcpy(jsvol_list,"Unassigned");
		}
	}
	if (total_mount_points < 0) 
		strcpy(jsvol_list, "unassigned");
		
	sprintf(jsname, "DISK%d", (diskno+1));
	
	logmessage("jsname=%s size=%s status=%s vendor=%s vol_list=%s\n", jsname,jssize,jsstatus,jsvendor,jsvol_list);

	fprintf(fp, "    \"%s\": {\n\t\"name\": \"%s\",\n\t\"size\": \"%s\",\n\t\"status\": \"%s\",\n\t\"vendor\": \"%s\",\n\t\"volume\": \"%s\" \n    },\n", jsname, jsname, jssize, jsstatus, jsvendor, jsvol_list);
	fclose(fp);
}

int disk_vol(int diskno) {
	struct mntent *ent;
	FILE *mfile;
	int c = 0,i=0;
	mdu_array_info_t array;
	mdu_disk_info_t disk;
	char *dv;
	int mddisk, raid_disk = 0;
	char *main_disk;
	int channel = 0;
	struct dirent* chndirent;
	DIR *chndir;
	char chnpath[128] = {'0'};
	char disk_name[4] = {'0'};
	char disk_part[12] = {'0'};
	char compare[6] = {'0'};
	mfile = setmntent("/proc/mounts", "r");
	if (mfile == NULL) {
		perror("setmntent");
		exit(1);
	}
	while (NULL != (ent = getmntent(mfile))) {
		if (strstr(ent->mnt_dir,"volNAS")) {
			strcpy(mnt[c].devpath, ent->mnt_fsname);
			strcpy(mnt[c].mountdir, (ent->mnt_dir+8));
			sprintf(mnt[c].mdpath,"/dev/md%c",mnt[c].devpath[18]);
			sprintf(mnt[c].vgpath,"vg%c",mnt[c].devpath[18]);
			sprintf(mnt[c].lvpath,"/dev/vg%c/lv%c",mnt[c].devpath[18],mnt[c].devpath[18]);
			c++;
		}
 	}
	endmntent(mfile);
	if (c)
		total_mount_points = c - 1;
	int fd = open(mnt[i].mdpath, O_RDONLY);
	for (i=0;i<c;i++) {
		if (ioctl(fd, GET_ARRAY_INFO, &array)) {
			fprintf(stderr,"%s does not appear to be active.\n",mnt[i].mdpath);
//	        goto out;
    	}
	logmessage("nr_disk=%d raid_disks=%d spare_disks=%d\n",array.nr_disks, array.raid_disks, array.spare_disks);	
    }
	close(fd);

	for (mddisk = 0; mddisk <= total_mount_points; mddisk++) {
		fd = open(mnt[mddisk].mdpath,O_RDONLY);
		ioctl(fd, GET_ARRAY_INFO, &array);
		for (raid_disk = 0; raid_disk < 384; raid_disk++) {
			disk.number = raid_disk;
			if (ioctl(fd, GET_DISK_INFO, &disk) < 0)
				continue;
			if (mddisk >= array.raid_disks &&
				disk.major == 0 &&
				disk.minor == 0)
				continue;

			if (array.raid_disks > 0 &&
				(disk.state & (1 << MD_DISK_ACTIVE)) == 0)
				continue;
			mnt[mddisk].state = array.state;
			dv = map_dev_preferred(disk.major, disk.minor, 1, NULL);
			if (!dv)
				continue;
			sprintf(disk_part, "%s ", dv);
			strcat(mnt[mddisk].disk_node,disk_part);
			mnt[mddisk].raidlevel = array.level;
			if (mnt[mddisk].raidlevel == 5)
				mnt[mddisk].size = 2*array.size;
			else
				mnt[mddisk].size = array.size;
			logmessage("size=%d rlevel=%d, md=%s\n",array.size, array.level, mnt[mddisk].mdpath);

			for(channel=0; channel <=3; channel++) {
				sprintf(chnpath,"/sys/class/scsi_device/%d:0:0:0/device/block/",channel);
				chndir = opendir(chnpath);
				if (chndir) {
					do {
						if ((chndirent = readdir(chndir)) != NULL) {
							if (!strcmp(chndirent->d_name, ".") || !strcmp(chndirent->d_name, "..")) {
								/* Nothing To Do */
							} else {
								if (strstr(dv,chndirent->d_name)) {
									sprintf(disk_part,"DISK%d ",(channel+1));
									strcat(mnt[mddisk].disk_list,disk_part);
								}
							}
						}
					} while (chndirent != NULL);
					closedir(chndir);
        		}

			}
		}
		close(fd);
	}
	for (mddisk= 0; mddisk <= total_mount_points; mddisk++) {
		logmessage("!!!!!!!mdnum=%d  devpath=%s and mountdir=%s mdpath=%s vgpath=%s  lvpath=%s disk_list=%s disk_node=%s\n",mddisk, mnt[mddisk].devpath, mnt[mddisk].mountdir, mnt[mddisk].mdpath, mnt[mddisk].vgpath, mnt[mddisk].lvpath, mnt[mddisk].disk_list, mnt[mddisk].disk_node);
/*
	sprintf(compare, "DISK%d", (diskno+1));
	logmessage("COMPARE=%s\n",compare);
	if (strstr(mnt[mddisk].disk_list, compare))
		logmessage("On  DISK1 volumes are  %s\n", mnt[mddisk].mountdir);
	if (strstr(mnt[mddisk].disk_list, compare))
		logmessage("On  DISK2 volumes are  %s\n", mnt[mddisk].mountdir);
	if (strstr(mnt[mddisk].disk_list, compare))
		logmessage("On  DISK3 volumes are  %s\n", mnt[mddisk].mountdir);
	if (strstr(mnt[mddisk].disk_list, compare))
		logmessage("On  DISK4 volumes are  %s\n", mnt[mddisk].mountdir);

*/
	}
	return 0;
}


int print_disk_details(void)
{
	int channel = 0;
	struct dirent* chndirent;
	DIR *chndir;
	char chnpath[128] = {'0'};
	char disk_name[4] = {'0'};
	FILE *fp;
	char *formatter1 = "{";
	char *formatter2 = "}";
	disk_vol(channel);
	fclose(fopen("/var/log/disk.js", "w"));
    fp = fopen("/var/log/disk.js", "a");
	fprintf(fp, "%s\n", formatter1);
	fclose(fp);
	for(channel=0; channel <=3; channel++) {
		sprintf(chnpath,"/sys/class/scsi_device/%d:0:0:0/device/block/",channel);
		chndir = opendir(chnpath);
		if (chndir) {
			do {

				if ((chndirent = readdir(chndir)) != NULL ) {
					if (!strcmp(chndirent->d_name, ".") || !strcmp(chndirent->d_name, "..")) {
						/* Nothing To Do */
					} else {
						strcpy(disk_name,chndirent->d_name);
						printdiskdetails(disk_name,channel);
					}
				}
			} while (chndirent != NULL);
			closedir(chndir);
		}
		else {
			if (channel == 0)
				logmessage("DISK1 is not connected to the system\n");
			if (channel == 1)
				logmessage("DISK2 is not connected to the system\n");
			if (channel == 2)
				logmessage("DISK3 is not connected to the system\n");
			if (channel == 3)
				logmessage("DISK4 is not connected to the system\n");
			
		}
	}
	fp = fopen("/var/log/disk.js", "a");
	fprintf(fp, "\n%s\n", formatter2);
	fclose(fp);
	fp = fopen("/var/log/disk.js", "r");
	fseek(fp,0,SEEK_SET);
	fread((void*)jsonFile, 1, (sizeof(jsonFile)) -1, fp);
	printf("%s\n",jsonFile);
	
	return 0;
}

void get_data(char *cmd, char *out)
{
	FILE *f;
	f = popen(cmd,"r");
	if (!f)
	{
		logmessage("Failed to open a pipe for command=%s\n", cmd);
		return;
	}
	fgets(out,512,f);
	if (pclose(f) != 0 ) 
	{ 
		logmessage("failed to close the pipe for command=%s\n", cmd);
		return;
	}
}

int volume_error_check(CV_t *cvol)
{
	int i = 0, dcount = 0;	

	for (i=0; i <= strlen(cvol->disk); i++) {
		if (cvol->disk[i] == ' ') {
			dcount++;
		}
	}
	dcount += 1;
	if (dcount == 1) {
		logmessage("Not enough Disk To Create any RAID LEVEL\n");
		return FALSE;
	}
	logmessage("dcount=%d raid level=%d\n",dcount,atoi(cvol->rlevel));
	switch (atoi(cvol->rlevel)) {
		case SPAN:
			if (dcount > 2) {
				logmessage("Not enough disk to create SPAN\n");
				return FALSE;
			}
			break;
		case RAID0:
			break;
		case RAID1:
			break;
		case RAID10:
			if (dcount !=4) {
				logmessage("Not enough disk to create RAID10\n");
				return FALSE;
			}
			break;
		case RAID5:
			if (dcount < 3) {
				logmessage("Not enough disk to create RAID5\n");
				return FALSE;
			}
			break;
		case RAID6:
			if (dcount != 4) {
				logmessage("Not enough disk to create RAID6\n");
				return FALSE;
			}
			break;
		case RAID60:
			break;
		default:
			logmessage("RAID level Not supported\n");
			return FALSE;
		}
	logmessage("Hello\n");
	return TRUE;
}

int smart_details(char *file)
{
	yajl_val node;
	char fileerr[1024];
	char *diskname;	
	FILE *fp, *fsmart, *js;
	char c;
	char line[256];
	static int count = 0, mcount = 0;
	int i=0, start = 0;
	int row, col;
	int item;
	char data[100];
	char *formatter1 = "{";
	char *formatter2 = "}";
	char *disk = "sda";
	char command[48] = {0};
	char modelfam[64] = {0}, devmodel[32] = {0}, sernumber[32] = {0}, fwversion[32] = {0}, usercap[32] = {0};
	char *smart_attr[ ] = { "Model Family:",			\
							"Device Model:",			\
							"Serial Number:",			\
							"Firmware Version:",		\
							"User Capacity:",			\
							"Raw_Read_Error_Rate",		\
							"Spin_Up_Time",				\
							"Start_Stop_Count",			\
							"Reallocated_Sector_Ct",	\
							"Seek_Error_Rate", 			\
							"Power_On_Hours", 			\
							"Spin_Retry_Count", 		\
							"Calibration_Retry_Count", 	\
							"Power_Cycle_Count", 		\
							"Power-Off_Retract_Count", 	\
							"Load_Cycle_Count", 		\
							"Temperature_Celsius", 		\
							"Runtime_Bad_Block",		\
							"End-to-End_Error",			\
							"Reported_Uncorrect",		\
							"Command_Timeout",			\
							"High_Fly_Writes",			\
							"Airflow_Temperature_Cel",	\
							"Reallocated_Event_Count", 	\
							"Hardware_ECC_Recovered",	\
							"Current_Pending_Sector", 	\
							"Offline_Uncorrectable", 	\
							"UDMA_CRC_Error_Count", 	\
							"Multi_Zone_Error_Rate", 	\
							"Head_Flying_Hours",		\
							"Total_LBAs_Written",		\
							"Total_LBAs_Read" };

	node = yajl_tree_parse((const char *) jsonFile, fileerr, sizeof(fileerr));
	const char * name[] = { "DISK", "name", (const char *) 0 };
	yajl_val v = yajl_tree_get(node, name, yajl_t_string);
	diskname = YAJL_GET_STRING(v);
	
	sprintf(command, "smartctl --all /dev/%s > /var/log/smart.details", diskname);
	system(command);
	if ((fp = fopen("/var/log/smart.details", "r")) == NULL)
		perror("fopen");
	fsmart = fopen("/var/log/smart.data", "a");
	js = fopen("/var/log/smart.js", "a");
	fprintf(js,"%s",formatter1);

	while (fgets(line, 256, fp) != NULL) {
		for (i = 0; i < 32; i++) {
			if (strstr(line, smart_attr[i])) {
				if (i == 0) {
					strcpy(modelfam, (line +18));
					FINDANDREPLACE(modelfam, 64, mcount);
					fprintf(js,"\n    \"smart\": {\n\t\"ModelFamily\": \"%s\",", modelfam);
				}
				else if (i == 1) {
					strcpy(devmodel, (line + 18));
					FINDANDREPLACE(devmodel, 32, mcount);
					fprintf(js,"\n\t\"DeviceModel\": \"%s\",", devmodel);
				}
				else if (i == 2) {
					strcpy(sernumber, (line + 18));
					FINDANDREPLACE(sernumber, 32, mcount);
					fprintf(js,"\n\t\"SerialNumber\": \"%s\",", sernumber);
				}
				else if (i == 3) {
					strcpy(fwversion, (line + 18));
					FINDANDREPLACE(fwversion, 32, mcount);
					fprintf(js,"\n\t\"FirmwareVersion\": \"%s\",", fwversion);
				}
				else if (i == 4) {
					strcpy(usercap, (line + 18));
					FINDANDREPLACE(usercap, 32, mcount);
					fprintf(js,"\n\t\"UserCapacity\": \"%s\"\n\t},", usercap);
				} else {
				fprintf(fsmart, "%s",line);
				}
				count++;
			}
		}
	}
	fclose(fsmart);
	fsmart = fopen("/var/log/smart.data", "r");
	for(row = 0; row < (count - 5); row++) {
		for(col=0; col< 10; col++) {
			if (col == 0) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n    \"smart\": {\n\t\"id\": \"%s\",", data);
			}
			else if (col == 1) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"attrib\": \"%s\",", data);
			}
			else if (col == 2) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"flag\": \"%s\",", data);
			}
			else if (col == 3) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"value\": \"%s\",", data);
			}
			else if (col == 4) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"worst\": \"%s\",", data);
			}
			else if (col == 5) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"thresh\": \"%s\",", data);
			}
			else if (col == 6) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"type\": \"%s\",", data);
			}
			else if (col == 7) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"updated\": \"%s\",", data);
			}
			else if (col == 8) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"whenfailed\": \"%s\",", data);
			}
			else if (col == 9) {
				item = fscanf(fsmart, "%s", data);
				fprintf(js,"\n\t\"rawvalue\": \"%s\"\n\t},", data);
				fgets(line,256,fsmart);
			}
		}
	}

	fprintf(js,"\n%s",formatter2);
	fclose(fp);
	fclose(fsmart);
	fclose(fopen("/var/log/smart.data","w"));
	//printf("modelf=%s devmodel=%s sernumber=%s fwversion=%s  usercap=%s\n",modelfam, devmodel, sernumber, fwversion, usercap);
	fclose(js);
	js = fopen("/var/log/smart.js", "r");
	fseek(js,0,SEEK_SET);
	fread((void*)jsonFile, 1, (sizeof(jsonFile)) -1, js);
	printf("%s\n",jsonFile); 
	fclose(fopen("/var/log/smart.js","w"));

	return 0;
}

int network_setup(char *file)
{
	yajl_val node;
	yajl_val v;
	char fileerr[1024];
	char command[256] = {0}, output[512] = {0};
	char *attrib, *ip, *port, *netmask, *dns, *mtu;

	node = yajl_tree_parse((const char *) jsonFile, fileerr, sizeof(fileerr));
	const char * attrib1[] = { "network", "attrib", (const char *) 0 };
	v = yajl_tree_get(node, attrib1, yajl_t_string);
	attrib = YAJL_GET_STRING(v);
	if (!strcmp(attrib, "static")) {
		const char * ip1[] = { "network", "ip", (const char *) 0 };
		v = yajl_tree_get(node, ip1, yajl_t_string);
		ip = YAJL_GET_STRING(v);
		const char * netmask1[] = { "network", "netmask", (const char *) 0 };
		v = yajl_tree_get(node, netmask1, yajl_t_string);
		netmask = YAJL_GET_STRING(v);
		const char * port1[] = { "network", "port", (const char *) 0 };
       	        v = yajl_tree_get(node, port1, yajl_t_string);
        	port = YAJL_GET_STRING(v);
		const char * dns1[] = { "network", "dns", (const char *) 0 };
	        v = yajl_tree_get(node, dns1, yajl_t_string);
		dns = YAJL_GET_STRING(v);
		const char * mtu1[] = { "network", "mtu", (const char *) 0 };
	        v = yajl_tree_get(node, mtu1, yajl_t_string);
		mtu = YAJL_GET_STRING(v);
		sprintf(command, "/sbin/ifconfig %s %s netmask %s mtu %s", port, ip, netmask, mtu);
		get_data(command, output);
	}
	else if (!strcmp(attrib, "dhcp")) {
		const char * port1[] = { "network", "port", (const char *) 0 };
	        v = yajl_tree_get(node, port1, yajl_t_string);
        	port = YAJL_GET_STRING(v);
		sprintf(command, "dhclient %s", port);
		get_data(command, output);
	}
	else if (!strcmp(attrib, "show")) {
		char sip[18] = {0}, smtu[6] = {0}, snetmask[18] = {0}, smac[18] = {0};
		FILE *fp;
		int count = 0;
		const char * port1[] = { "network", "port", (const char *) 0 };
	        v = yajl_tree_get(node, port1, yajl_t_string);
        	port = YAJL_GET_STRING(v);
		sprintf(command, "ifconfig %s | grep inet | awk '{print $2}'", port);
		get_data(command, output);
		strcpy(sip, output);
		FINDANDREPLACE(sip, 18, count);
		sprintf(command, "cat /sys/class/net/%s/address", port);
		get_data(command, output);
		strcpy(smac, output);
		FINDANDREPLACE(smac,18 , count);
		sprintf(command, "cat /sys/class/net/%s/mtu", port);
		get_data(command, output);
		strcpy(smtu, output);
		FINDANDREPLACE(smtu, 6, count);
		fp = fopen("/var/log/network.js", "a");
		fprintf(fp, " {\n\t\"ip\":\"%s\",\n\t\"port\":\"%s\",\n\t\"mac\":\"%s\",\n\t\"mtu\":\"%s\"\n    }", sip, port, smac,smtu);
		fclose(fp);
		fp = fopen("/var/log/network.js", "r");
		fseek(fp, 0, SEEK_SET);
		memset(jsonFile,0,sizeof(jsonFile));
		fread((void*)jsonFile, 1, (sizeof(jsonFile)) -1, fp);
		printf("%s", jsonFile);
		fclose(fp);
		fclose(fopen("/var/log/network.js", "w"));
	}
	return 0;
}


int create_volume(char *file)
{
	CV_t *cvol;
	uint32_t SizeInGB = 0;
	uint8_t i = 0,dcount=1;
	char command[512];
	char output[512];
	char disk_count[50];
	char junk;
	char cache_disk[10];
	char md[5];
	char pe[5];
	char **diskp;
	static int k;
	int j = 0, mdnum = 0;
	char darray[4] = {0};
	char disk_list[128] = {0};
	uint64_t raid5size = 0;

	yajl_val node;
	char fileerr[1024];

	memset(command,0,512);
	memset(output,0,512);
	memset(disk_count,0,50);
	memset(md,0,5);
	memset(pe,0,5);
	
	SizeInBytes = 0;
	cvol = (CV_t *) malloc(sizeof(CV_t));
/*
	if (fsize) {
		ezxml_t trace = ezxml_parse_str(file, fsize);
		ezxml_t volname,attr;
		volname = ezxml_child(trace, "vol");
		cvol->name = ezxml_attr(volname, "name");
		attr = ezxml_child(volname, "attr");
		cvol->rlevel = ezxml_child(attr, "rlevel")->txt;
		cvol->size = ezxml_child(attr, "size")->txt;
		cvol->secure = ezxml_child(attr, "secure")->txt;
		cvol->block = ezxml_child(attr, "block")->txt;
		cvol->fs = ezxml_child(attr, "fs")->txt;
		cvol->fcache = ezxml_child(attr, "fcache")->txt;
		cvol->disk = ezxml_child(attr, "disk")->txt;
	}
*/
	logmessage("filesData=%s\n",jsonFile);
	node = yajl_tree_parse((const char *) jsonFile, fileerr, sizeof(fileerr));
	const char * name[] = { "volume", "name", (const char *) 0 };
	yajl_val v = yajl_tree_get(node, name, yajl_t_string);
	cvol->name = YAJL_GET_STRING(v);

	const char * disk[] = { "volume", "disk", (const char *) 0 };
	v = yajl_tree_get(node, disk, yajl_t_string);
	cvol->disk = YAJL_GET_STRING(v);

	const char * rlevel[] = { "volume", "rlevel", (const char *) 0 };
	v = yajl_tree_get(node, rlevel, yajl_t_string);
	cvol->rlevel = YAJL_GET_STRING(v);

	const char * size[] = { "volume", "size", (const char *) 0 };
	v = yajl_tree_get(node, size, yajl_t_string);
	cvol->size = YAJL_GET_STRING(v);

	const char * secure[] = { "volume", "secure", (const char *) 0 };
	v = yajl_tree_get(node, secure, yajl_t_string);
	cvol->secure = YAJL_GET_STRING(v);

	const char * block[] = { "volume", "block", (const char *) 0 };
	v = yajl_tree_get(node, block, yajl_t_string);
	cvol->block = YAJL_GET_STRING(v);

	const char * fs[] = { "volume", "fs", (const char *) 0 };
	v = yajl_tree_get(node, fs, yajl_t_string);
	cvol->fs = YAJL_GET_STRING(v);

	const char *fcache[] = { "volume", "fcache", (const char *) 0 };
	v = yajl_tree_get(node, fcache, yajl_t_string);
	cvol->fcache = YAJL_GET_STRING(v);


	logmessage("name=%s rlevel=%s size=%s secure=%s block=%s fs=%s cache=%s disk=%s\n",cvol->name,cvol->rlevel,cvol->size, \
		cvol->secure ,cvol->block,cvol->fs,cvol->fcache,cvol->disk);
	
	if(volume_error_check(cvol))
		return FALSE;
	logmessage("!!!!!!!!!!! CV is %p\n",cvol);
	/* print the all arguments */
	logmessage("name=%s rlevel=%s size=%s secure=%s block=%s fs=%s cache=%s disk=%s\n",cvol->name,cvol->rlevel,cvol->size, \
		cvol->secure ,cvol->block,cvol->fs,cvol->fcache,cvol->disk);
	for (i=0; cvol->disk[i]!='\0';i++){
		if (cvol->disk[i] == ' ')
			dcount++;
	}
	if (strcmp(cvol->rlevel,"1") == 0 || strcmp(cvol->rlevel,"0") == 0 || strcmp(cvol->rlevel,"99") == 0 || strcmp(cvol->rlevel,"5") == 0) {	
		logmessage("Level is %s\n",cvol->rlevel);
		SizeInGB = strtoll(cvol->size, NULL, 0);
		SIZEINBYTES(SizeInGB);
		logmessage("SizeInBytes=%lld in GB=%d\n",SizeInBytes,SizeInGB);
		logmessage("disk size is %d\n",strlen(cvol->disk));

//For RAID5 Calculation
		if (strcmp(cvol->rlevel,"5") == 0) {
			if (dcount == 3)
				SizeInBytes = SizeInBytes/2;
			else if (dcount == 4)
				SizeInBytes = SizeInBytes/3;
			else
				logmessage("Something NOT right !!!\n");
			logmessage("Required size=%lld\n",SizeInBytes);
		}
//DONE RAID5
	
		k=0;
		for ( i=0; i<dcount; i++) {
			for ( j=0; j<3; j++) {
				darray[j] = cvol->disk[k];
				k++;
			}
			k++;
			memset(output,0,512);
			sprintf(command,"/usr/local/system/parted  -s /dev/%s unit B print %lld | grep nas | cut -d '=' -f2",darray,SizeInBytes);
			logmessage("Command is %s\n",command);
			get_data(command,output);
			sprintf(output, "/dev/%s%d",darray,atoi(output));
			memset(darray,0,4);
			if (i==0) {
				strcpy(disk_list,output);
			} else {
				strcat(disk_list," ");
				strcat(disk_list,output);
			}	
			memset(output,0,512);
		}

		sprintf(command,"sh /home/celestial/work/nas/disk/volume/md_max",junk);
		get_data(command,md);
		mdnum = atoi(md);
		logmessage("MD from md_max is %d####\n",mdnum);	
		memset(command,0,512);
		if (strcmp(cvol->rlevel,"99") == 0)
			sprintf(command, "echo 'y' | mdadm -C /dev/md%d -l linear -n %d %s -e 1.2",atoi(md),dcount,disk_list);
		else
			sprintf(command, "echo 'y' | mdadm -C /dev/md%d -l %s -n %d %s -e 1.2",atoi(md),cvol->rlevel,dcount,disk_list);
		logmessage("Raid command====%s\n",command);
		get_data(command,output);
		
		sprintf(command,"pvcreate -ff -y /dev/md%d >/dev/null 2>&1",mdnum);
		logmessage("PVCREATE command=%s\n",command);
		get_data(command,output);
		memset(command,0,512);
		
		sprintf(command,"vgcreate vg%d /dev/md%d >/dev/null 2>&1",mdnum,mdnum);
		get_data(command,output);
		logmessage("VGCREARTE command=%s\n",command);
		memset(command,0,512);
		
		sprintf(command,"vgdisplay vg%d | grep 'Total PE' | awk '{print $3}'",mdnum);
		logmessage("VGDIPLAY=%s\n",command);
		get_data(command,pe);
		memset(command,0,512);
	
		sprintf(command, "lvcreate -l %d -n lv%d vg%d >/dev/null 2>&1",atoi(pe),mdnum,mdnum);
		logmessage("LVCREATE=%s\n",command);
		get_data(command,output);
		memset(command,0,512);
	
		sprintf(command, "mkdir -p /etc/volNAS; mkdir -p /volNAS/%s;  mkfs.ext4 /dev/mapper/vg%d-lv%d >/dev/null",cvol->name,mdnum,mdnum);
		get_data(command,output);

		memset(command,0,512);
		sprintf(command,"mount /dev/mapper/vg%d-lv%d /volNAS/%s ",mdnum,mdnum,cvol->name);
		get_data(command,output);
		memset(command,0,512);
		return TRUE;

	}

//RAID6

	else if (strcmp(cvol->rlevel,"6") == 0) {
		logmessage("Level is %s\n",cvol->rlevel);
		SizeInGB = strtoll(cvol->size, NULL, 0);
		SIZEINBYTES(SizeInGB);
		logmessage("SizeInBytes=%lld in GB=%d\n",SizeInBytes,SizeInGB);
		logmessage("disk size is %d DISK_COUNT=%d\n",strlen(cvol->disk),dcount);
		if (dcount == 3)
			raid5size = SizeInBytes/2;
		else if (dcount == 4)
			raid5size = SizeInBytes/3;
		else
			logmessage("Something NOT right !!!\n");
		logmessage("Required size=%lld\n",raid5size);
		sprintf(command,"/usr/local/system/parted  -s /dev/%s unit B print %lld | grep nas | cut -d '=' -f2",darray,SizeInBytes);
		
//		sprintf(command, "sh /home/jumbo/work/disk/pureNAS/bin/code/chk_partn.sh %s", cvol->disk);
//		get_data(command,output);
//		logmessage("List of final_disk=%s\n",output);
//		sprintf(command,"sh /home/jumbo/work/disk/pureNAS/bin/code/md_max",junk);
//		get_data(command,md);
			
//		sprintf(command, "mdadm -C /dev/md%s -l 5 -n %s -e 1.2 %s",md, disk_count,output);
//		system(command);
		
		
//		sprintf(command,"pvcreate -ff -y /dev/md%s",md,junk);
//		system(command);
//		memset(command,0,512);
		
//		sprintf(command,"vgcreate vg0 /dev/md%s",md,junk);
//		system(command);
//		memset(command,0,512);
		
//		sprintf(command,"vgdisplay vg%s | grep 'Total PE' | awk '{print $3}'",md);
//		get_data(command,pe);
//		memset(command,0,512);
	
//		sprintf(command, "lvcrete -l %s	-n lv%s vg%s",pe,md,md);
//		system(command);
//		memset(command,0,512);
		return TRUE;		
	
	}
	else if (strcmp(cvol->rlevel,"10") == 0)
	{

	}

	if (cvol->fcache)
	{

	}


}

void extend_volume(char *file)
{
	logmessage("in func=%s size of file is %d\n",__func__,fsize);
}

void modify_volume(char *file)
{	
	logmessage("in func=%s size of file is %d\n",__func__,fsize);
}

void migrate_volume(char *file)
{
	logmessage("in func=%s size of file is %d\n",__func__,fsize);
}

void delete_volume(char *file)
{
	char *name;
	char command[512];
	char output[32];
	uint8_t i = 0, count = 0, j = 0, k = 0, kcount = 0;
	char disk[12] = {'0'}, disk1[4] = {'0'}, gdisk[5] = {'0'};
	int channel = 0;
	struct dirent* chndirent;
	DIR *chndir;
	char chnpath[128] = {'0'};

	yajl_val node;
	char fileerr[1024];

	
	memset(command,0,512);
/*	
	if (fsize) {
		logmessage("INSIDE fsize\n");
		ezxml_t trace = ezxml_parse_str(file, fsize);
		ezxml_t vol,attr;
		vol = ezxml_child(trace, "vol");
		name  = ezxml_attr(vol, "name");
	}
*/
	node = yajl_tree_parse((const char *) jsonFile, fileerr, sizeof(fileerr));
	const char * path[] = { "volume", "name", (const char *) 0 };
	yajl_val v = yajl_tree_get(node, path, yajl_t_string);
	name = YAJL_GET_STRING(v);
	logmessage("volume to delete=%s\n", name);
	if (name) {
		logmessage("in func=%s size of file is %d\n",__func__,fsize);
		print_disk = 0;
		print_disk_details();
		logmessage("volume name is %s and total_mount_points=%d\n",name,total_mount_points);
		for (i=0; i <= total_mount_points; i++) {
			if (!strcmp(mnt[i].mountdir,name)) {
				logmessage("Got the volume mnt[i].mountdir=%s\n",mnt[i].mountdir);
				sprintf(command, "umount /volNAS/%s; rm -rf /volNAS/%s", name, name);
				get_data(command, output);
				sprintf(command, "lvremove -f %s >/dev/null 2>&1; sleep 1; vgremove -f %s >/dev/null 2>&1; sleep 1; pvremove -ff -y %s >/dev/null 2>&1", mnt[i].lvpath, mnt[i].vgpath, mnt[i].mdpath);
				get_data(command, output);
				sprintf(command, "mdadm -S %s", mnt[i].mdpath);
				get_data(command, output);
				logmessage("disks_node=%s\n",mnt[i].disk_node);
				for (count = 0; count < 48; count++) {
					disk[j] = mnt[i].disk_node[count];
					
					if (mnt[i].disk_node[count] == ' ') {
						logmessage("disks are %s\n",disk);
						logmessage("disk part=%s\n",(disk+8));
						j = 0;



						for(channel=0; channel <=3; channel++) {
							sprintf(chnpath,"/sys/class/scsi_device/%d:0:0:0/device/block/",channel);
							//logmessage("patch is %s\n",chnpath);
							chndir = opendir(chnpath);
							if (chndir) {
								do {
									if ((chndirent = readdir(chndir)) != NULL ) {
										if (!strcmp(chndirent->d_name, ".") || !strcmp(chndirent->d_name, "..")) {
											/* Nothing To Do */
										} else {
											if (strstr(disk,chndirent->d_name)) {
												
												//sprintf(disk_part,"DISK%d ",(channel+1));
												//strcat(mnt[mddisk].disk_list,disk_part);
												sprintf(command, "mdadm --zero-superblock /dev/%s%s", chndirent->d_name, (disk+8));
												logmessage("mdadm command=%s\n",command);
												get_data(command, output);
												sprintf(command, "parted -s /dev/%s rm %s", chndirent->d_name, (disk+8));
												get_data(command, output);
												logmessage("!!!!!!!!!!!!Disk is %s and disk_name=%s command=%s\n",disk, chndirent->d_name, command);

											}
										}
									}
								} while (chndirent != NULL);
								closedir(chndir);
							}

						}
						continue;
					}
					if (j >= 12)
						j = 0;
					else
						j++;
				}
			}
		}
	}
}

void iscsi_service(char *file)
{
	char *service;
	char *ip;
	char *iscsi;
	char *isns_port;
	char *port;
	char command[512];
	memset(command,0,512);
	logmessage("In start iscsi\n");
/*
	if (fsize) {
		ezxml_t trace = ezxml_parse_str(file, fsize);
		ezxml_t isns,attr;
		isns = ezxml_child(trace, "isns");
		service  = ezxml_attr(isns, "service");
		attr   = ezxml_child(isns, "attr");
		ip    = ezxml_child(attr, "ip")->txt;
		isns_port = ezxml_child(attr,"isns_port")->txt;
		iscsi = ezxml_child(attr,"iscsi")->txt;
		port  = ezxml_child(attr,"port")->txt;
	}
*/
	logmessage("service=%s ip=%s iscsi=%s port=%s\n",service,ip,iscsi,port);
	if ( strcmp(service,"yes") == 0) {
		sprintf(command,"echo '\n'isns.address = %s'\n'isns.port = %s >> /etc/iet/ietd.conf",ip,isns_port);
		system(command);
		memset(command,0,512);
	}
	if ( strcmp (service,"no") == 0) {
		sprintf(command, "sed -i '/isns.address/d' /etc/iet/ietd.conf ; sed -i '/isns.port/d' /etc/iet/ietd.conf",ip);
		system(command);
		memset(command,0,512);
	}
	
	if ( strcmp (iscsi, "yes") == 0) {
		sprintf(command,"ietd -p %s",port);
		system(command);
		memset(command,0,512);
	}
	if ( strcmp(iscsi,"no") == 0) {
		sprintf(command,"killall ietd",port);
		system(command);
	}

}

//cat /etc/iet/ietd.conf | grep -nr "Target iqn-2004-04.com.proNAS:iscsi" | cut -d ':' -f1 | sed -i '2,7d' /etc/iet/ietd.conf

void modify_iscsi(char *file)
{
	char *iname;
	char *vol;
	char command[512];
	char output[10];
	int start =0, end=0;
	char *size,*type,*hd,*dd,*iu,*ou;
	memset(command,0,512);
	memset(output,0,10);
/*
	if (fsize) {
		ezxml_t trace = ezxml_parse_str(file, fsize);
		ezxml_t iscsi,attr;
		iscsi = ezxml_child(trace, "iscsi");
		iname  = ezxml_attr(iscsi, "name");
		attr   = ezxml_child(iscsi, "attr");
		vol    = ezxml_child(attr, "volume")->txt;
		size   = ezxml_child(attr, "size")->txt;
		type   = ezxml_child(attr, "type")->txt;
		hd     = ezxml_child(attr, "hd")->txt;
		dd	   = ezxml_child(attr, "dd")->txt;
		iu 	   = ezxml_child(attr, "iu")->txt;
		ou 	   = ezxml_child(attr, "ou")->txt;
	}
*/
	logmessage("iname=%s and vol=%s\n",iname,vol);
	sprintf(command,"cat /etc/iet/ietd.conf | grep -nrw 'Target iqn.2001-04.com.pronas:%s' | cut -d ':' -f1",iname);
	get_data(command,output);
	logmessage("Hello\n");
	start = atoi(output);
	end = start + 5;
	logmessage("start = %d and end  = %d\n",start,end);	
	memset(command,0,512);
	sprintf(command,"sed -i ''%d','%d'd' /etc/iet/ietd.conf",start,end);
	system(command);
	memset(command,0,512);
	logmessage("Till Here\n");
	if (strcmp(type,"fileio") == 0) {
		/*
		count = atoi(size);
		count = count * 1024;
		sprintf(command, "mkdir -p /proNAS/%s/proiSCSI; cd /proNAS/%s/proiSCSI ; dd if=/dev/zero of=%s bs=1M count=%d", vol,vol,iname,count);
		system(command);
		memset(command,0,0);
		*/
		sprintf(command, "echo '\n'Target iqn.2001-04.com.pronas:%s'\n''\t'Lun 0 Path=/proNAS/%s/proiSCSI/%s,Type=%s'\n''\t'HeaderDigest %s'\n''\t'DataDigest %s'\n''\t'IncomingUser %s'\n''\t'OutgoingUser %s >> /etc/iet/ietd.conf",iname,vol,iname,type,hd,dd,iu,ou);
		system(command);
	}
}

void create_iscsi(char *file,int mod)
{
	char *iname,*vol,*size,*type,*hd,*dd,*iu,*ou;
	char command[512], output[512];
	uint32_t count;
	memset(command,0,512);
	logmessage("In Create iSCSI\n");
/*
	if (fsize) {
		ezxml_t trace = ezxml_parse_str(file, fsize);
		ezxml_t iscsi,attr;
		iscsi = ezxml_child(trace, "iscsi");
		iname  = ezxml_attr(iscsi, "name");
		attr   = ezxml_child(iscsi, "attr");
		vol    = ezxml_child(attr, "volume")->txt;
		size   = ezxml_child(attr, "size")->txt;
		type   = ezxml_child(attr, "type")->txt;
		hd     = ezxml_child(attr, "hd")->txt;
		dd	   = ezxml_child(attr, "dd")->txt;
		iu 	   = ezxml_child(attr, "iu")->txt;
		ou 	   = ezxml_child(attr, "ou")->txt;
	}
*/
	logmessage("iname=%s vol=%s size=%s type=%s mod=%d\n",iname,vol,size,type,mod);
	if (strcmp(type,"fileio") == 0) {
		count = atoi(size);
		count = count * 1024;
		if (mod == 0) {
			sprintf(command, "mkdir -p /volNAS/%s/proiSCSI; cd /volNAS/%s/proiSCSI ; dd if=/dev/zero of=%s bs=1M count=%d", vol,vol,iname,count);
			system(command);
			memset(command,0,0);
		}

		sprintf(command, "echo '\n'Target iqn.2001-04.com.pronas:%s'\n''\t'Lun 0 Path=/volNAS/%s/voliSCSI/%s,Type=%s'\n''\t'HeaderDigest %s'\n''\t'DataDigest %s'\n''\t'IncomingUser %s'\n''\t'OutgoingUser %s >> /etc/iet/ietd.conf",iname,vol,iname,type,hd,dd,iu,ou);
		system(command);
	}

}

void print_volume_details(void)
{
	int mdnum=0,i;
	char status[16] = {'0'};
	char *formatter1 = "{"; 
	char *formatter2 = "}";
	FILE *fp;
	disk_vol(0);
	fclose(fopen("/var/log/vol.js","w"));
	fp = fopen("/var/log/vol.js","a");
	fprintf(fp, "%s", formatter1);
	logmessage("Mount_point=%d\n",total_mount_points);
	for (i=0; i <= total_mount_points; i++) {
		VOLSIZEINGB(mnt[i].size);
		logmessage("!!!!!!!!!!!!!!! size=%d\n",mnt[i].size);
		if (mnt[i].state == 256)
			strcpy(status, "resyncing");
		else if (mnt[i].state == 0)
			strcpy(status, "recovering");
		logmessage("Volname=%s raidlevel=%d size=%dGB state=%s disk=%s\n",mnt[i].mountdir, mnt[i].raidlevel, VolSizeInGB, status, mnt[i].disk_list);
		fprintf(fp, "    \"volume\": {\n\t\"name\": \"%s\",\n\t\"size\": \"%dGB\",\n\t\"raidlevel\": \"%d\",\n\t\"status\": \"%s\",\n\t\"volume\": \"%s\" \n    },\n", mnt[i].mountdir, VolSizeInGB, mnt[i].raidlevel, status, mnt[i].disk_list);
	}
	fprintf(fp, "%s", formatter2);
	fclose(fp);
	fp = fopen("/var/log/vol.js", "r");
	fseek(fp,0,SEEK_SET);
	fread((void*)jsonFile, 1, (sizeof(jsonFile)) -1, fp);
	printf("%s\n",jsonFile);
}

void claim_disk(char *file)
{
	char *name;
	char command[512] = {'0'};
	char output[512] = {'0'};
	char mac[0];
	int partition = 0;
/*
	if (fsize) {
		ezxml_t trace = ezxml_parse_str(file, fsize);
        ezxml_t disk,attr;
        disk = ezxml_child(trace, "disk");
        name  = ezxml_attr(disk, "name");

	}
*/
	for (partition = 1; partition <=15; partition++) {
		sprintf(command, "mdadm --zero-superblock /dev/%s%d &>/dev/null ; parted -s /dev/%s rm %d &>/dev/null ", name, partition, name, partition);
		get_data(command,output);
	}
	sprintf(command, "parted -s /dev/%s mkpart SYS 21.0KB 1MB 2&>/dev/null", name);
	get_data(command,output);
	sprintf(command, "parted -s /dev/%s mkpart SYSRFS1 1MB 1GB 2&>/dev/null ", name);
	get_data(command,output);
	sprintf(command, "parted -s /dev/%s mkpart SWAP 1GB 2GB 2&>/dev/null ", name);
	get_data(command,output);
	sprintf(command, "parted -s /dev/%s mkpart BACKUP 2GB 3GB 2&>/dev/null ", name);
	get_data(command,output);

	sprintf(command, "cat /sys/class/net/eth0/address | sed 's/://g'");
	get_data(command,mac);
	mac[12] = '\0';
   	sprintf(command, "echo %s | dd of=/dev/%s1 seek=512 bs=1", mac, name);
	get_data(command,output);
}

int eject_disk(char *file)
{
	char *name;
	char command[512] = {'0'};
	char output[512] = {'0'};
	int channel = 1;
	int partition = 0;

/*
	if (fsize) {
		ezxml_t trace = ezxml_parse_str(file, fsize);
		ezxml_t disk,attr;
		disk = ezxml_child(trace, "disk");
		name  = ezxml_attr(disk, "name");
	}
*/
	logmessage("disk to eject is %s\n",name);
	sprintf(command,"echo 'scsi remove-single-device %d 0 0 0' > /proc/scsi/scsi", channel);
	get_data(command, output);
	return TRUE;
}

int main(int argc, char *argv[])
{
	FILE *file = stdin;
    char *ftrace, *trace;
    fsize = 0;
    FILESIZE(file);

	char option;
	int mod = 0;

	size_t bytes;

	/* null plug buffers */
	jsonFile[0] = 0;
	if (fsize) {
		/* read the entire config file */
		bytes = fread((void *) jsonFile, 1, sizeof(jsonFile) - 1, stdin);
		if (bytes == 0 || bytes >= sizeof(jsonFile)) {
			logmessage("File is Corrupted\n");
			return 1;
		}
	}
	logfile = fopen("/var/log/volume.log", "a");
	
	/* List of action which is passed as option with the associated xml file
 
    	*|  a: Create Volume      |  i: Create Shares    |  q: Modify User      |  y: Modify iSCSI     
    	*|  b: Modify Volume      |  j: Modify Shares    |  r: Modify Group     |  z: Delete iSCSI
    	*|  c: Extend Volume      |  k: Delete Shares    |  s: Delete User      |  A: Media Service
    	*|  d: Migrate Volume     |  l: Reserved         |  t: Delte Gropu      |  B: ......
    	*|  e: Delete Volume      |  m: Reserved         |  u: Reserved         |  C: ......
    	*|  f: Reserved           |  n: Reserved         |  v: Reserved         |
    	*|  g: Reserved           |  o: Creat Users      |  w: iSCSI Service    |
    	*|  h: Reserved           |  p: Create Group     |  x: Create iSCSI     |
	*/
	
	if ((option = getopt(argc, argv, "abcdefghijklmnopqrstuzwxyzABCDEFGHIJKLMNOPQRSTUV")) != -1) {

		switch(option) {
		case 'a':
				create_volume(jsonFile);		// Create volume
				break;
		case 'b':
				modify_volume(jsonFile);
				break;
		case 'c':
				extend_volume(jsonFile);
				break;
		case 'd':
				migrate_volume(jsonFile);
				break;
		case 'e':
				delete_volume(jsonFile);		//Delete Volume
				break;

		case 'w':				// iSCSI
				iscsi_service(jsonFile);
				break;
		case 'x':
				create_iscsi(jsonFile,mod);
				break;
		case 'y':
				modify_iscsi(jsonFile);
				break;
								// iSCSI End
		case 'D':	// Print Disk Details
				print_disk = 1;
				print_disk_details();
				break;
		case 'V':		// Print Volume Details
				print_volume_details();
				break;
		case 'C':			// Claim Disk
				claim_disk(jsonFile);
				break;
		case 'R':
				eject_disk(jsonFile);
				break;
		case 'S':
				smart_details(jsonFile);
				break;
		case 'n':
				network_setup(jsonFile);
				break;
		default:
				break;
		}
	}
	fclose(logfile);
	return 0;
}

