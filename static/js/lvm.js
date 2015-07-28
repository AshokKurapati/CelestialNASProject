getLvmDetails = function(id){ 
   //document.write("<input type=text name=\"company\" />");
    //var gridDom = $("#" + id);

    var popUpContainer = $("#popup-grid_lvm");
    //popUpContainer.innerHTML += '<br>Some new content!';
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
            
            var grid = $("#lvm-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
            if(grid.hasClass('pq-grid')){
                grid = grid.destroy();
            }
            var pgrid = grid.pqGrid({
                    height: ht,
                    width: wd,
                    freezeCols:1,
                    selectionModel: { type: 'row' },
                    editable:true,
                    colModel: getLvmDetailsColumn(),
                    dataModel: getLvmDataModel(),
                    editModel: {clicksToEdit: 2},
                   selectionModel: {mode: 'single'},
                    render: function(eve, ui){
                        var rowData = ui.rowData;
                        var $toolbar = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-top", this));
                        $("<span>Create Volume</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            addVolume();
                        });
                        $("<span>Delete Volume</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                           deletevolume();
                        });
                    }
                });
            // pgrid.rowSelect = function (evt, obj) { alert("selected");}


        },
        close: function(){
            
            $("#lvm-details").pqGrid("destroy");
        },
        show: {
            //effect: "blind",
            duration: 100
        },
        hide: {
            //effect: "explode",
            duration: 100
        },
        resizeStop: function(eve, ui){
            var grid = $("#lvm-details");

        }

    }).dialog( "open" );





    
}

getLvmDetailsColumn = function(){
    return [
        {
            title: "Volume Name", width: 100, dataIndx: "name", editable: false
        },
        {
            title: "Size", width: 100, dataIndx: "size", editable: false
        },
        {
            title: "Raid Level", width: 100, dataIndx: "raidlevel", editable: false
        },
        {
            title: "Status", width: 100, dataIndx: "status", editable: false
        },
        {
            title: "Disks", width: 100, dataIndx: "disk", editable: false
        }
    ];
}




getLvmDataModel = function(){
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

addVolume = function(){
    var popUpContainer = $("#vol_create");
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        //draggable: false,
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
		"<div class=\"body-content-modal\">",
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
		"</div>",
		"<div>",
                
                "<button id=\"cancel-dialog\">Cancel</button>",
                "<button autofocus onclick =\"confirmed()\">Confirm</button>",
               
		"</div>",
                "</div>"
            ];

             $("#vol_create_inner").html(html.join(""));
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
           // effect: "explode",
            duration: 100
        },


        }).dialog( "open" );

}
/*
getFormData = function(){
    return {
        location: "remote",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        getUrl: function(){
            return {url: '../create_vol_form/'}
        },
        getData: function (dataJSON) {
            //var data=                
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.data };                
        }
    };
}
*/

confirmed =function(){

//debugger;

var selDisk = [], inputList = $('input[name="disk_check"]:checked');
//alert(selDisk);
inputList.each(function(){
            selDisk.push(this.value);
        }
    );
/*for( var i=0; i<selDisk.length;i++)
{
    if (selDisk[i]=="sdc")
    {
        selDisk[i]="sde";
    }
    else if(selDisk=="sdd")
    {
        selDisk[i]=="sdf";
    }
}*/
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
//debugger;

if($("#select_raid").val()=="0" && (selDisk.length !=2 && selDisk.length != 4)){
alert("For raid level 0 select either 2 or 4 disks");
}
else if($("#select_raid").val()=="10" && selDisk.length != 4){
alert("For raid level 10 select 4 disks only");
}
else if($("#select_raid").val()=="10" && (selDisk.length != 3 && selDisk.length !=4)){
alert("For raid level 5 either select 3 or 4 disks");
}
else{
createVolume(JSON.stringify({ volume: volume }));
}
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
   
createVolume =function(inpu){
    //$.post("../create_volume/", {vol_name: inpu });
    //$.ajax({
    //    type: "POST",
    //   url: "../create_volume/",
    //    dataType: "json",
    //    data: {
            //csrfmiddlewaretoken: "{{ csrf_token }}",
    //        vol_name: inpu
    //    },
     //   success: function(json){
     //       document.write("done");
        //}
    //});
    //alert(typeof(inpu));
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
        //debugger;
        $("#vol_create").dialog('close');
        $("#lvm-details").pqGrid("refreshDataAndView" );
    },
    error: function(data){
        //debugger;
        alert("fail");
            
            }
        });
           // return false;
}

  
  function getRowIndx() {
            //var $grid = $("#grid_render_cells");

            //var obj = $grid.pqGrid("getSelection");
            //debugger;
            var $grid = $("#lvm-details");

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
function deletevolume(){
    var $grid = $("#lvm-details");
    //alert(getRowIndx());
    var rowIndx = getRowIndx();
            if (rowIndx != null) {
                //debugger;
                var DM = $grid.pqGrid("option", "dataModel");
                var data = DM.data;
                var row = data[rowIndx];
                var name = '{"volume":{"name":"'+row.name+'"}}';
                //alert(rowIndx);
                $.ajax({
                 type:"POST",
                 url:"../delete_volume/",
                 data: {
                        //csrfmiddlewaretoken: "{{ csrf_token }}",
                        vol_name: name // from form
                        },
                        //contentType: "application/text; charset=utf-8",
              dataType: "text",
              success: function(data) {
              //debugger;
              //$("#vol_create").dialog('close');
              $("#lvm-details").pqGrid("refreshDataAndView" );
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
