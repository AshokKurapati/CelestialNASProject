getFolderDetails = function(id){ 
   //document.write("<input type=text name=\"company\" />");
    //var gridDom = $("#" + id);

    var popUpContainer = $("#popup-grid");
    //popUpContainer.innerHTML += '<br>Some new content!';
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 600,
        modal:true,
        draggable: true,
        create:function(eve, ui){
            //todo code for after creation
        },
        

        open: function(eve, ui){
            
            var grid = $("#folder-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
            if(grid.hasClass('pq-grid')){
                grid = grid.destroy();
            }
            grid.pqGrid({
                    height: ht,
                    width: wd,
                    colModel: getFolderDetailsColumn(),
                    dataModel: getFolderDataModel(),
                    render: function(eve, ui){
                        var $toolbar = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-top", this));
			var $toolbar1 = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-bottom", this));
                        $("<span>Create Folder</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            addFolder();
                        });

			$("<span>Delete Folder</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            deleteFolder();
                        });

			$("<span>Empty recycle bin</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            emptyBin();
                        });
			
			$("<span>Select all</span>").appendTo($toolbar1).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            selectFolder();
                        });

			$("<span>Unselect all</span>").appendTo($toolbar1).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            unselectFolder();
                        });

                    }

                });

















            

        },
        close: function(){
            
            $("#folder-details").pqGrid("destroy");
        },
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        },
        resizeStop: function(eve, ui){
            var grid = $("#folder-details");

        }

    }).dialog( "open" );





    
}

getFolderDetailsColumn = function(){
    return [
        {
            title: "Name", width: 100, dataIndx: "name", editable: false
        },
        {
            title: "Volume", width: 100, dataIndx: "volume", editable: false
        },
        {
            title: "Recycle Bin", width: 100, dataIndx: "recyclebin", editable: false
        },
        {
            title: "SMB", width: 100, dataIndx: "smb", editable: false
        },
        {
            title: "AFP", width: 100, dataIndx: "afp", editable: false
        },
	{
            title: "FTP", width: 100, dataIndx: "ftp", editable: false
        },
	{
            title: "Backup", width: 100, dataIndx: "backup", editable: false
        },
	{
            title: "WebAccess", width: 100, dataIndx: "webaccess", editable: false
        },
	{
            title: "SFTP", width: 100, dataIndx: "sftp", editable: false
        },
	{
            title: "More Details", width: 100, dataIndx: "moredetails", editable: false
        }
    ];
}




getFolderDataModel = function(){
    return {
        location: "remote",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        //paging: 'local',
        getUrl: function(){
            return {url: '../data_volume/'}
        },
        getData: function (dataJSON) {
            //var data=                
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.data };                
        }
    };
}

selectFolder = function(){
    var popUpContainer = $("#folder_select");
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        draggable: true,
        create:function(eve, ui){
            //todo code for after creation
        },
        open: function(eve, ui){
            
            $.ajax({
        type: 'GET',
        url:"../no_disks",
        success: function(response){
            var obj = $.parseJSON(response),
                diskChar = "abcdefghijklmnopqrstuvwxyz".split(""),
                html = "";

            var diskList = [], count = obj.count, i = 0;

            while(i < count){
                diskList.push("<span class=\"text-input-pop\"><input type=\"checkbox\" class=\"text-add3\" name= \"disk_check\" value=\"sd" +diskChar[i] + "\"/>disk" + i + "</span>");
                i++;
            }

            html = [
                "<div class=\"confirm\">",
                    "<p>",
                        "Name",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"text\" class=\"text-add\" id =\"vol_name\"/>",
                        "</span>",
                    "</p>",
                    "<p>",
                        "Disk",
                        "<div class=\"raid-disk-cont\" style=\"margin:0 3rem;\">",
                            diskList.join("<br />"),
                        "</div>",
                    "</p>",
                    "<p>",
                        "Raid Level <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"select_raid\">",
                                "<option value =\"99\">Span</option>",
                                "<option value =\"0\">0</option>",
                                "<option value =\"1\">1</option>",
                                "<option value =\"5\">5</option>",
                                "<option value =\"10\">10</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p>",
                        "FS <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"fs_type\">",
                                "<option value =\"ext3\">Ext 3</option>",
                                "<option value =\"ext4\">Ext 4</option>",
                                "<option value =\"xfs\">XFS</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "Size <br />",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"number\" class=\"text-add\" id=\"size\" value=\"1\" min=\"1\" max=\"100\"/> GB",
                        "</span",
                    "</p>",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "<button id=\"cancel-dialog\">Cancel</button>",
                        "<button autofocus onclick =\"confirmed()\">Confirm</button>",
                    "</p>",
                "</div>"
            ];

             $("#folder_select_inner").html(html.join(""));
        },
        error: function(){

        }
    });

        },
        
        show: {
            effect: "blind",
            duration: 1000
        },
        
        hide: {
            effect: "explode",
            duration: 1000
        },


        }).dialog( "open" );

}


unselectFolder = function(){
    var popUpContainer = $("#folder_unselect");
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        draggable: true,
        create:function(eve, ui){
            //todo code for after creation
        },
        open: function(eve, ui){
            
            $.ajax({
        type: 'GET',
        url:"../no_disks",
        success: function(response){
            var obj = $.parseJSON(response),
                diskChar = "abcdefghijklmnopqrstuvwxyz".split(""),
                html = "";

            var diskList = [], count = obj.count, i = 0;

            while(i < count){
                diskList.push("<span class=\"text-input-pop\"><input type=\"checkbox\" class=\"text-add3\" name= \"disk_check\" value=\"sd" +diskChar[i] + "\"/>disk" + i + "</span>");
                i++;
            }

            html = [
                "<div class=\"confirm\">",
                    "<p>",
                        "Name",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"text\" class=\"text-add\" id =\"vol_name\"/>",
                        "</span>",
                    "</p>",
                    "<p>",
                        "Disk",
                        "<div class=\"raid-disk-cont\" style=\"margin:0 3rem;\">",
                            diskList.join("<br />"),
                        "</div>",
                    "</p>",
                    "<p>",
                        "Raid Level <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"select_raid\">",
                                "<option value =\"99\">Span</option>",
                                "<option value =\"0\">0</option>",
                                "<option value =\"1\">1</option>",
                                "<option value =\"5\">5</option>",
                                "<option value =\"10\">10</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p>",
                        "FS <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"fs_type\">",
                                "<option value =\"ext3\">Ext 3</option>",
                                "<option value =\"ext4\">Ext 4</option>",
                                "<option value =\"xfs\">XFS</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "Size <br />",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"number\" class=\"text-add\" id=\"size\" value=\"1\" min=\"1\" max=\"100\"/> GB",
                        "</span",
                    "</p>",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "<button id=\"cancel-dialog\">Cancel</button>",
                        "<button autofocus onclick =\"confirmed()\">Confirm</button>",
                    "</p>",
                "</div>"
            ];

             $("#folder_unselect_inner").html(html.join(""));
        },
        error: function(){

        }
    });

        },
        
        show: {
            effect: "blind",
            duration: 1000
        },
        
        hide: {
            effect: "explode",
            duration: 1000
        },


        }).dialog( "open" );

}

deleteFolder = function(){
    var popUpContainer = $("#folder_delete");
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        draggable: true,
        create:function(eve, ui){
            //todo code for after creation
        },
        open: function(eve, ui){
            
            $.ajax({
        type: 'GET',
        url:"../no_disks",
        success: function(response){
            var obj = $.parseJSON(response),
                diskChar = "abcdefghijklmnopqrstuvwxyz".split(""),
                html = "";

            var diskList = [], count = obj.count, i = 0;

            while(i < count){
                diskList.push("<span class=\"text-input-pop\"><input type=\"checkbox\" class=\"text-add3\" name= \"disk_check\" value=\"sd" +diskChar[i] + "\"/>disk" + i + "</span>");
                i++;
            }

            html = [
                "<div class=\"confirm\">",
                    "<p>",
                        "Name",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"text\" class=\"text-add\" id =\"vol_name\"/>",
                        "</span>",
                    "</p>",
                    "<p>",
                        "Disk",
                        "<div class=\"raid-disk-cont\" style=\"margin:0 3rem;\">",
                            diskList.join("<br />"),
                        "</div>",
                    "</p>",
                    "<p>",
                        "Raid Level <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"select_raid\">",
                                "<option value =\"99\">Span</option>",
                                "<option value =\"0\">0</option>",
                                "<option value =\"1\">1</option>",
                                "<option value =\"5\">5</option>",
                                "<option value =\"10\">10</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p>",
                        "FS <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"fs_type\">",
                                "<option value =\"ext3\">Ext 3</option>",
                                "<option value =\"ext4\">Ext 4</option>",
                                "<option value =\"xfs\">XFS</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "Size <br />",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"number\" class=\"text-add\" id=\"size\" value=\"1\" min=\"1\" max=\"100\"/> GB",
                        "</span",
                    "</p>",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "<button id=\"cancel-dialog\">Cancel</button>",
                        "<button autofocus onclick =\"confirmed()\">Confirm</button>",
                    "</p>",
                "</div>"
            ];

             $("#folder_delete_inner").html(html.join(""));
        },
        error: function(){

        }
    });

        },
        
        show: {
            effect: "blind",
            duration: 1000
        },
        
        hide: {
            effect: "explode",
            duration: 1000
        },


        }).dialog( "open" );

}



emptyBin = function(){
    
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$( "#folder_empty_inner" ).dialog({
resizable: false,
height:200,
modal: true,
buttons: {
"YES": function() {
$( this ).dialog( "close" );
},
"NO": function() {
$( this ).dialog( "close" );
}
}

});



//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
          

}

addFolder = function(){
    var popUpContainer = $("#folder_create");
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        draggable: true,
        create:function(eve, ui){
            //todo code for after creation
        },
        open: function(eve, ui){
            
            $.ajax({
        type: 'GET',
        url:"../no_disks",
        success: function(response){
            var obj = $.parseJSON(response),
                diskChar = "abcdefghijklmnopqrstuvwxyz".split(""),
                html = "";

            var diskList = [], count = obj.count, i = 0;

            while(i < count){
                diskList.push("<span class=\"text-input-pop\"><input type=\"checkbox\" class=\"text-add3\" name= \"disk_check\" value=\"sd" +diskChar[i] + "\"/>disk" + i + "</span>");
                i++;
            }

            html = [
                "<div class=\"confirm\">",
                    "<p>",
                        "Name",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"text\" class=\"text-add\" id =\"vol_name\"/>",
                        "</span>",
                    "</p>",
                    "<p>",
                        "Disk",
                        "<div class=\"raid-disk-cont\" style=\"margin:0 3rem;\">",
                            diskList.join("<br />"),
                        "</div>",
                    "</p>",
                    "<p>",
                        "Raid Level <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"select_raid\">",
                                "<option value =\"99\">Span</option>",
                                "<option value =\"0\">0</option>",
                                "<option value =\"1\">1</option>",
                                "<option value =\"5\">5</option>",
                                "<option value =\"10\">10</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p>",
                        "FS <br />",
                        "<span class=\"text-input-pop\">",
                            "<select id =\"fs_type\">",
                                "<option value =\"ext3\">Ext 3</option>",
                                "<option value =\"ext4\">Ext 4</option>",
                                "<option value =\"xfs\">XFS</option>",
                            "</select>",
                        "</span",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "Size <br />",
                        "<span class=\"text-input-pop\">",
                            "<input type=\"number\" class=\"text-add\" id=\"size\" value=\"1\" min=\"1\" max=\"100\"/> GB",
                        "</span",
                    "</p>",
                    "</p>",
                    "<p style=\"margin-bottom:4rem;\">",
                        "<button id=\"cancel-dialog\">Cancel</button>",
                        "<button autofocus onclick =\"confirmed()\">Confirm</button>",
                    "</p>",
                "</div>"
            ];

             $("#folder_create_inner").html(html.join(""));
        },
        error: function(){

        }
    });

        },
        
        show: {
            effect: "blind",
            duration: 1000
        },
        
        hide: {
            effect: "explode",
            duration: 1000
        },


        }).dialog( "open" );

}


confirmed =function(){

debugger;

var selDisk = [], inputList = $('input[name="disk_check"]:checked');

inputList.each(function(){
            selDisk.push(this.value);
        }
    );

var volume = {
    name: $("#vol_name").val(),
    rlevel: $("#select_raid").val(),
    size: $("#size").val(),
    secure: "0",
    block: "0",
    fs: $("#fs_type").val(),
    disk: selDisk.join(" "),
    fcache: "0"
};

console.log(volume);

createFolder(JSON.stringify({ volume: volume }));

}

  getJSON = function(url) {
        var resp ;
        var xmlHttp ;

        resp  = '' ;
        xmlHttp = new XMLHttpRequest();

        if(xmlHttp != null)
        {
            xmlHttp.open( "GET", url, false );
            xmlHttp.send( null );
            resp = xmlHttp.responseText;
        }

        return resp ;
    }
   
createFolder =function(inpu){
    
$.ajax({
                 type:"POST",
                 url:"../create_volume/",
                 data: {
                        //csrfmiddlewaretoken: "{{ csrf_token }}",
                        vol_name: inpu // from form
                        },
                        //contentType: "application/text; charset=utf-8",
    dataType: "text",
    success: function(data) {
        debugger;
        $("#folder_create").dialog('close');
        $("#folder-details").pqGrid("refreshDataAndView" );
    },
    error: function(data){
        debugger;
        alert("fail");
            
            }
        });
           // return false;
}
   
