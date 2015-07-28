getFolderDetails = function(id){ 
   //document.write("<input type=text name=\"company\" />");
    //var gridDom = $("#" + id);

    var popUpContainer = $("#popup-grid");
    //popUpContainer.innerHTML += '<br>Some new content!';
    popUpContainer.dialog ({
        autoOpen: false,
        height: 500,
        width: 600,
        modal:true,
        draggable: true,
        create:function(eve, ui){
            //todo code for after creation
        },
        

        open: function(eve, ui){
            document.getElementById('folder_empty_inner').style.display = "block";
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
           // effect: "blind",
            duration: 100
        },
        hide: {
            //effect: "explode",
            duration: 100
        },
        resizeStop: function(eve, ui){
            var grid = $("#folder-details");

        }

    }).dialog( "open" );





    
}

getFolderDetailsColumn = function(){
    //debugger;
    return [
        {
            title: "Name", width: 100, dataIndx: "sharedFolderName", editable: false
        },
        {
            title: "ownerName", width: 100, dataIndx: "ownerName", editable: false
        },
        {
            title: "volumeName", width: 100, dataIndx: "volumeName", editable: false
        },
        {
            title: "description", width: 100, dataIndx: "description", editable: false
        },
        {
            title: "wiki", width: 100, dataIndx: "wiki", editable: false
        },
	    {
            title: "cifs", width: 100, dataIndx: "cifs", editable: false
        },
	    {
            title: "ftp", width: 100, dataIndx: "ftp", editable: false
        },
	    {
            title: "nfs", width: 100, dataIndx: "nfs", editable: false
        },
	    {
            title: "rb", width: 100, dataIndx: "rb", editable: false
        },
	    {
            title: "ms", width: 100, dataIndx: "ms", editable: false
        },
        {
            title: "afp", width: 100, dataIndx: "afp", editable: false
        },
        {
            title: "webdav", width: 100, dataIndx: "webdav", editable: false
        },
        {
            title: "encrypt", width: 100, dataIndx: "encrypt", editable: false
        },

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
            return {url: '../data_shared_folder/'}
        },
        getData: function (dataJSON) {
            //var data=   
            debugger;             
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
            //effect: "blind",
            duration: 100
        },
        
        hide: {
            //effect: "explode",
            duration: 100
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
           // effect: "blind",
            duration: 100
        },
        
        hide: {
           // effect: "explode",
            duration: 100
        },


        }).dialog( "open" );

}

deleteFolder = function(){
    var $grid = $("#folder-details");
    //alert(getRowIndx());
    var rowIndx = getFolderRowIndx();
            if (rowIndx != null) {
                //debugger;
                var DM = $grid.pqGrid("option", "dataModel");
                var data = DM.data;
                var row = data[rowIndx];
                var imp = '{"sharedFolder":{"volumeName":"'+row.volumeName+'", "sharedFolderName":"'+row.sharedFolderName+'", "ownerName":"'+row.ownerName+'", "uniqueID":"0"}}';
                //alert(rowIndx);
                $.ajax({
                 type:"POST",
                 url:"../delete_folder/",
                 data: {
                        //csrfmiddlewaretoken: "{{ csrf_token }}",
                        folder_name: imp // from form
                        },
                        //contentType: "application/text; charset=utf-8",
              dataType: "text",
              success: function(data) {
              //debugger;
              //$("#vol_create").dialog('close');
              $("#folder-details").pqGrid("refreshDataAndView" );
         },
    error: function(data){
        //debugger;
        alert("fail");
            
            }
        });
           // return false;

                //DM.data.splice(rowIndx, 1);
                //debugger;
                $grid.pqGrid("refreshDataAndView");
                $grid.pqGrid("setSelection", {
                    rowIndx: rowIndx
                });


            } 
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
    debugger;
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
        url:"../vol_list",
        success: function(response){
            debugger;
            var obj = $.parseJSON(response),
                //diskChar = "abcdefghijklmnopqrstuvwxyz".split(""),
                html = "";
                debugger;

            var volList = obj.volume, count = obj.count, i = 0;
            var volListstr =[]
            for (var i=0; i<volList.length;i++)
            {
                volListstr.push("<option value = \""+volList[i]+"\">"+volList[i]+"</option>");

            }
            debugger;

            html = [

'<div class=\"confirm\" >',
 '<div class="body-content-modal">' ,
  
  '<p>Name * <br/> ',
  		'<span class="text-input-pop"><input id ="folder-name" type="text" class="text-add" /></span>',
    '</p>',
  
  '<p>Volume<br/> ',
  	'<span class="text-input-pop">',
        '<select id="select_vol">',
        	volListstr.join(" "),
        '</select>',
    '</span>',
  '</p>',
  
 ' <p>Public<br/> ',
  	'<span class="text-input-pop">',
     '   <select id="public" onChange="myFunction()">',
      '  	<option value="1" selected>Yes</option>',
       '     <option value="2">No</option>',
        '</select>',
    '</span>',
  '</p>',
  
  
  '<p id="user" style="display:none;">User<br/>', 
  	'<span class="text-input-pop">',
        '<select id ="sel_user">',
        	'<option selected>-- Select User --</option>',
        	'<option value ="amit">Amit</option>',
            '<option value ="ashok">Ashok</option>',
            '<option value ="gautam">Ashok</option>',
        '</select>',
    '</span>',
  '</p>',
  
   '<p>Description <br/>', 
  		'<span class="text-input-pop"><textarea id="desc" class="text-add" ></textarea></span>',
  '</p>',
  '<p style="margin-top:10px;">LAN Protocol Support:', 
    '<div class="raid-disk-cont" style="margin:0 3rem;display:inline-table;"> ',
        '<span class="text-input-pop"><input name ="services" id ="wiki" type="checkbox" class="text-add" /> Wiki </span><br/>',
        '<span class="text-input-pop"><input name ="services" id ="cifs" type="checkbox" class="text-add" /> Cifs</span><br/>',
        '<span class="text-input-pop"><input  name ="services" id="ftp" type="checkbox" class="text-add" /> FTP</span><br/>',
        '<span class="text-input-pop"><input  name ="services"  id ="rb" type="checkbox" class="text-add" /> RB</span><br/>',
      '<span class="text-input-pop"><input  name ="services"  id ="nfs" type="checkbox" class="text-add" /> NFS </span><br/>',
      '<span class="text-input-pop"><input  name ="services"  id ="ms" type="checkbox" class="text-add" /> MS</span><br/>',
      '<span class="text-input-pop"><input  name ="services"  id ="afp" type="checkbox" class="text-add" />AFP</span><br/>',
      '<span class="text-input-pop"><input  name ="services"  id ="webdav" type="checkbox" class="text-add" />WebDav</span><br/>',
      '<span class="text-input-pop"><input  name ="services"  id ="encrypt" type="checkbox" class="text-add" />Encrypt</span><br/>',
    '</div>',
    '<div class="raid-disk-cont" style="margin:0 3rem;display:inline-table;"> ',
       //' <span class="text-input-pop"><input type="checkbox" class="text-add" /> AFP (Mac)</span><br/>',
        //'<span class="text-input-pop"><input type="checkbox" class="text-add" /> Backup',
'</span><br/>',
    //'<span class="text-input-pop"><input type="checkbox" class="text-add" /> WebAccess </span><br/>',
      
'</div>',
  '</p>',
  '<div style="height:5px; border-bottom:1px #666 dotted;"></div>',
  '<div style="height:5px;"></div>',
	
  '<p>Backup<br/> ',
  	'<span class="text-input-pop">',
        '<select id="backup" onChange="backup()">',
        	'<option value="1">Yes</option>',
            '<option selected value="2">No</option>',
        '</select>',
    '</span>',
  '</p>  ',
    
  '<p id="user-id" style="display:none;">User Id * <br/> ',
  		'<span class="text-input-pop"><input id="rUser" type="text" class="text-add" /></span>',
  '</p> ',
  
  '<p id="user-pass" style="display:none;">Password * <br/> ',
  		'<span class="text-input-pop"><input id="rPass" type="password" class="text-add" /></span>',
  '</p> ',
   
   
 '</div> ', 
  
  
 '<div class="cancel-button">',
  '<button id="cancel-dialog">Cancel</button>',
  '<button autofocus onclick =\"folder_confirmed()\"   >Confirm</button>',
  '</div>',
'</div>'


                
            ];

             $("#folder_create_inner").html(html.join(""));
        },
        error: function(){

        }
    });

        },
        
        show: {
           // effect: "blind",
            duration: 100
        },
        
        hide: {
           // effect: "explode",
            duration: 100
        },


        }).dialog( "open" );

}


folder_confirmed =function(){

debugger;
var services_json ={
    wiki:"no",
    cifs:"no",
    ftp:"no",
    nfs:"no",
    rb:"no",
    ms:"no",
    afp:"no",
    webdav:"no",
    encrypt:"no"

}; 
if($('#wiki').is(":checked")){
    services_json.wiki ="yes";
}
if($('#cifs').is(":checked")){
    services_json.cifs ="yes";
}
if($('#ftp').is(":checked")){
    services_json.ftp ="yes";
}
if($('#nfs').is(":checked")){
    services_json.nfs ="yes";
}
if($('#rb').is(":checked")){
    services_json.rb ="yes";
}
if($('#ms').is(":checked")){
    services_json.ms ="yes";
}
if($('#afp').is(":checked")){
    services_json.afp ="yes";
}
if($('#weddav').is(":checked")){
    services_json.weedav ="yes";
}
if($('#encrypt').is(":checked")){
    services_json.encrypt ="yes";
}
debugger;
var backup_json={
    rName:"",
    rPasswd:""
};
var sharedfolder = {
    sharedFolderName: $("#folder-name").val(),
    //ownerName:"",
    volumeName:$("#select_vol").val(),
    description:$('#desc').val(),   
    uniqueID:"0",
    public:"",
    services: JSON.stringify(services_json),
    //backup: backup_json
};

if($('#public').val()=="2")
{
    sharedfolder.public = "no";
    sharedfolder.ownerName=$('#sel_user').val();
}
if($('#public').val()=="1")
{
    sharedfolder.public="yes";
    sharedfolder.ownerName="admin";
}
if($('#backup').val()=="1")
{
    backup_json.rName=$("#rUser").val();
    backup_json.rPasswd=$("#rPass").val();
    sharedfolder.backup=JSON.stringify(backup_json);
}
debugger;

//     rlevel: $("#select_raid").val(),
//     size: $("#size").val(),
//     secure: "0",
//     block: "0",
//     fs: $("#fs_type").val(),
//     disk: selDisk.join(" "),
//     fcache: "0"
// };

console.log(sharedfolder);
createFolder(sharedfolder);
//createFolder(JSON.stringify(sharedfolder),JSON.stringify(backup_json),JSON.stringify(services_json));
//createFolder(JSON.stringify(sharedfolder));
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
   
createFolder =function(sharedfolder){
    console.log(sharedfolder);
    $.ajax({
                 type:"POST",
                 url:"../create_folder/",
                 data: sharedfolder,
                        //contentType: "application/text; charset=utf-8",
              dataType: "json",
              
         success: function(data) {
        //debugger;
        $("#folder_create").dialog('close');
        $("#folder-details").pqGrid("refreshDataAndView" );
    },
    error: function(data){
        $("#folder_create").dialog('close');
        $("#folder-details").pqGrid("refreshDataAndView" );
        //debugger;
        alert("fail");
            
            }
        });    //$.post('../create_folder/',sharedfolder,function(){.fail(function(){debugger;})});
    //$.post("../create_volume/",{'sf':sharedfolder});
//var jsonquery = JSON.stringify(sharedfolder);
// $.ajax({
//     url: '../create_folder/',
//     type: 'POST',
//     contentType: 'application/json; charset=utf-8',
//     data: $.toJSON(sharedfolder),
//     dataType: 'text',
//     success: function(result) {
//         alert(result.Result);
//     }
// });
            return false;
}
   
function myFunction() {
    var x = document.getElementById("public").value;
    //alert(x);
    if (x === "2")
    {
    document.getElementById("user").style.display="block";
    }

    else    
    {
    document.getElementById("user").style.display="none";
    }
    
   //document.getElementById("demo").innerHTML = "You selected: " + x;
}

function backup() {
    var x = document.getElementById("backup").value;
    //alert(x);
    if (x === "2")
    {
    document.getElementById("user-id").style.display="none";
    document.getElementById("user-pass").style.display="none";
    }

    else    
    {
    document.getElementById("user-id").style.display="block";
    document.getElementById("user-pass").style.display="block";
    }
    
   //document.getElementById("demo").innerHTML = "You selected: " + x;
}

function getFolderRowIndx() {
            //var $grid = $("#grid_render_cells");

            //var obj = $grid.pqGrid("getSelection");
            //debugger;
            var $grid = $("#folder-details");

            var arr = $grid.pqGrid("selection", {
                type: 'row',
                method: 'getSelection'
            });
            if (arr && arr.length > 0) {
                var rowIndx = arr[0].rowIndx;

                //if (rowIndx != null && colIndx == null) {
                return rowIndx;
            } else {
                alert("Select a row.");
                return null;
            }
        }
