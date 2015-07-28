getVolumeDetails = function(id){ 
   
    //var gridDom = $("#" + id);
    var popUpContainer = $("#popup-grid_volume");
    
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        create:function(eve, ui){
            //todo code for after creation
        },
        
        open: function(eve, ui){
            
            var grid = $("#volume-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
            if(grid.hasClass('pq-grid')){
                grid = grid.destroy();
            }
            else{
                grid.pqGrid({
                    height: ht,
                    width: wd,
                    colModel: getVolumeDetailsColumn(),
                    dataModel: getVolumeDataModel()
                });

            }
        },
        close: function(){
            
            $("#volume-details").pqGrid("destroy");
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
            var grid = $("#volume-details");

        }
    }).dialog( "open" );
    
}

getVolumeDetailsColumn = function(){
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
            title: "Disks", width: 100, dataIndx: "volume", editable: false
        }
    ];
}

getVolumeDataModel = function(){
    return {
        location: "remote",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        getUrl: function(){
            return {url: '../data_volume/'}
        },
        getData: function (dataJSON) {
            //var data=                
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.data };                
        }
    };
}

