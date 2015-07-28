getUserDetails = function(id){ 
    debugger;
    //var gridDom = $("#" + id);
    var popUpContainer = $("#user-grid");
    
    popUpContainer.dialog ({
        autoOpen: false,
        height: 500,
        width: 500,
        create:function(eve, ui){
            debugger;
        },
        
        open: function(eve, ui){
            debugger;
            var grid = $("#user-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
            if(grid.hasClass('pq-grid')){
                grid = grid.destroy();
            }
            else{
                grid.pqGrid({
                    height: ht,
                    width: wd,
                    colModel: getUserDetailsColumn(),
                    dataModel: getUserDataModel()
                });
            }
        },
        close: function(){
            debugger; quota
            $("#user-details").pqGrid("destroy");
        },
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    }).dialog( "open" );
    
}

getUserDetailsColumn = function(){
    return [
        {
            title: "Files", width: 100, dataIndx: "files", editable: false
        },
        {
            title: "LF", width: 100, dataIndx: "lf", editable: false
        },
        {
            title: "Blocks", width: 100, dataIndx: "blocks", editable: false
        },
        {
            title: "UID", width: 100, dataIndx: "uid", editable: false
        },
        {
            title: "Quota", width: 100, dataIndx: "quota", editable: false
        },
        {
            title: "Limit", width: 100, dataIndx: "limit", editable: false
        },
        {
            title: "QF", width: 100, dataIndx: "qf", editable: false
        },
    ];
}

getUserDataModel = function(){
    return {
        location: "remote",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        getUrl: function(){
            return {url: '../data_user/'}
        },
        getData: function (dataJSON) {
            //var data=                
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.data };                
        }
    };
}


