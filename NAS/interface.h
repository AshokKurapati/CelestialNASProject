


#define FILESIZE(file) do { \
    struct stat st; \
    if (fstat(fileno(file), &st) == 0) {    \
        fsize = st.st_size; }   \
} while(0)

#define SIZEINBYTES(size) do { \
	uint32_t mul1 = 1024*1024; \
	uint64_t mul2 = mul1 * 1024; \
	SizeInBytes = (size * mul2); \
} while(0)

#define VOLSIZEINGB(size) do {        \
	uint32_t mul1 = 1024*1024;        \
	VolSizeInGB = (size/mul1);        \
} while(0)


#define TRUE 0
#define FALSE 1

#define SPAN	99
#define RAID0	0
#define RAID1	1
#define RAID10	10
#define RAID5	5
#define RAID6	6
#define RAID60	60

#define PROC_SCSI /proc/scsi/scsi

typedef struct create_volume
{
	const char *name;
	char *fs;
	char *rlevel;
	char *size;
	uint8_t *block;
	uint8_t *fcache;
	uint8_t *secure;
	char *disk;
}CV_t;

typedef struct disk_l
{
	char disk1[10];
	char disk2[10];
	char disk3[10];
	char disk4[10];
}DL_t;

void __CV(char *);
void __EV(char *);
void __MV(char *);
void __MigV(char *);
void __DV(char *);
void __CI(char *file,int mod);
void get_data (char *cmd, char *out);
