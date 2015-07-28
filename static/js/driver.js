getDiskDetails = function(id){ 
    debugger;
    //var gridDom = $("#" + id);
    var popUpContainer = $("#popup-grid");
    
    popUpContainer.dialog ({
        autoOpen: false,
        height: 500,
        width: 500,
        create:function(eve, ui){
            debugger;
        },
        
        open: function(eve, ui){
            debugger;
            var grid = $("#driver-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
                grid.pqGrid({
                    height: ht,
                    width: wd,
                    freezeCols:1,
                    selectionModel: { type: 'row' },
                    editable:true,
                    colModel: getDiskDetailsColumn(),
                    dataModel: getDiskDataModel(),
                    editModel: {clicksToEdit: 2},
                   selectionModel: {mode: 'single'},
                   render: function(eve, ui){
                        var rowData = ui.rowData;
                        var $toolbar = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-top", this));
                        $("<span>Claim Disk</span>").appendTo($toolbar).button({
                            icons: {
                                //primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            claimdisk();
                        });
                        $("<span>Remove Disk</span>").appendTo($toolbar).button({
                            icons: {
                                //primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                           //deletevolume();
                        });
                    }
                });
            
        },
        close: function(){
            debugger;
            $("#driver-details").pqGrid("destroy");
        },
        show: {
            //effect: "blind",
            duration: 100
        },
        hide: {
            //effect: "explode",
            duration: 100
        }
    }).dialog( "open" );
    
}

getDiskDetailsColumn = function(){
    return [
        {
            title: "Disk Name", width: 100, dataIndx: "name", editable: false
        },
        {
            title: "Size", width: 100, dataIndx: "size", editable: false
        },
        {
            title: "Status", width: 100, dataIndx: "status", editable: false
        },
        {
            title: "Vendor", width: 100, dataIndx: "vendor", editable: false
        },
        {
            title: "Volumes", width: 100, dataIndx: "volume", editable: false
        }
    ];
}

getDiskDataModel = function(){
    return {
        location: "remote",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        getUrl: function(){
            return {url: '../data_disk/'}
        },
        getData: function (dataJSON) {
            //var data=                
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.data };                
        }
    };
}

claimdisk = function(){
    var $grid = $("#driver-details");
    //alert(getRowIndx());
    var rowIndx = getDriveRowIndx();
            if (rowIndx != null) {
                //debugger;
                var DM = $grid.pqGrid("option", "dataModel");
                var data = DM.data;
                var row = data[rowIndx];
                debugger;
                var name = '{"DISK":{"name":"'+row.name+'"}}';
                //alert(rowIndx);
                $.ajax({
                 type:"POST",
                 url:"../claim_disk/",
                 data: {
                        //csrfmiddlewaretoken: "{{ csrf_token }}",
                        disk_name: name // from form
                        },
                        //contentType: "application/text; charset=utf-8",
              dataType: "text",
              success: function(data) {
              //debugger;
              //$("#vol_create").dialog('close');
              $("#disk-details").pqGrid("refreshDataAndView" );
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

function getDriveRowIndx() {
            //var $grid = $("#grid_render_cells");

            //var obj = $grid.pqGrid("getSelection");
            //debugger;
            var $grid = $("#driver-details");

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