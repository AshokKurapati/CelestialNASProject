getNetworkDetails = function(id){ 
    debugger;
    var popUpContainer = $("#network-grid");

    //var gridDom = $("#" + id);
    popUpContainer.dialog ({
        autoOpen: false,
        height: 500,
        width: 500,
        create:function(eve, ui){
            debugger;
        },
        
        open: function(eve, ui){
            debugger;
            var grid = $("#network-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
                grid.pqGrid({
                    height: ht,
                    width: wd,
                    freezeCols:1,
                    selectionModel: { type: 'row' },
                    editable:true,
                    colModel: getNetworkDetailsColumn(),
                    dataModel: getNetworkDataModel(),
                    editModel: {clicksToEdit: 2},
                   selectionModel: {mode: 'single'}
                   
                });
            
        },
        close: function(){
            debugger;
            $("#network-details").pqGrid("destroy");
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

getNetworkDetailsColumn = function(){
    return [
        {
            title: "IP", width: 100, dataIndx: "ip", editable: false
        },
        {
            title: "Port", width: 100, dataIndx: "port", editable: false
        },
        {
            title: "Mac", width: 100, dataIndx: "mac", editable: false
        },
        {
            title: "MTU", width: 100, dataIndx: "mtu", editable: false
        }
       
    ];
}

getNetworkDataModel = function(){
    return {
        location: "remote",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        getUrl: function(){
            return {url: '../data_network/'}
        },
        getData: function (dataJSON) {
            //var data=                
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.data };                
        }
    };
}

