getUserDetails = function(id){ 

   //document.write("<input type=text name=\"company\" />");
    //var gridDom = $("#" + id);

    var popUpContainer = $("#popup-grid_user");
    //popUpContainer.innerHTML += '<br>Some new content!';
    popUpContainer = popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 600,
        modal:true,
        draggable: true,

        create:function(eve, ui){
            //todo code for after creation
        },
        
        open: function(eve, ui){
            debugger;
	    document.getElementById('tabs').style.display = "block";
            var grid = $("#user-details"), ht = $(this).height() - 5, wd = $(this).width() - 30; 
            grid.parent().css('padding', '2px');
            grid.pqGrid({
                    height: ht,
                    width: wd,
                    colModel: getUserDetailsColumn(),
                    dataModel: getUserDataModel(),
                    render: function(eve, ui){
                        var $toolbar = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-top", this));
			var $toolbar1 = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-bottom", this));
                        $("<span>Create User</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            addUser();
                        });

			$("<span>Import csv file</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-arrow-s"
                            }
                        }).click(function (evt) {
                            importCsv();
                        });

			$("<span>Delete User</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            deleteUser();
                        });

			$("<span>Convert to external user</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-person"
                            }
                        }).click(function (evt) {
                            externalUser();
                        });

			$("<span>Select all</span>").appendTo($toolbar1).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            selectUser();
                        });

			$("<span>Unselect all</span>").appendTo($toolbar1).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            unselectUser();
                        });
                    }
                });
            grid.children('.pq-grid-top').children('.pq-grid-title').hide();






var grid1 = $("#user-details1"), ht = $(this).height() - 5, wd = $(this).width() - 30; 
            grid1.parent().css('padding', '2px');
            grid1.pqGrid({
                    height: ht,
                    width: wd,
                    colModel: getUserDetailsColumn(),
                    dataModel: getUserDataModel(),
                    render: function(eve, ui){
                        var $toolbar = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-top", this));
			var $toolbar1 = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-bottom", this));
                        

			$("<span>Delete User</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            deleteExtUser();
                        });

			

			$("<span>Select all</span>").appendTo($toolbar1).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            selectExtUser();
                        });

			$("<span>Unselect all</span>").appendTo($toolbar1).button({
                            icons: {
                                primary: "ui-icon-circle-minus"
                            }
                        }).click(function (evt) {
                            unselectExtUser();
                        });
                    }
                });
            grid1.children('.pq-grid-top').children('.pq-grid-title').hide();

        },
        close: function(){
            
            $("#user-details").pqGrid("destroy");
	    $("#user-details1").pqGrid("destroy");
        },
        show: {
            //effect: "blind",
            duration: 100
        },
        hide: {
           // effect: "explode",
            duration: 100
        },
        resizeStop: function(eve, ui){
            var grid = $("#user-details");
	    var grid1 = $("#user-details1");

        }

    });

 
popUpContainer.dialog( "open" );
$( "#tabs" ).tabs({heightStyle : "auto"});

    
}

getUserDetailsColumn = function(){
    return [
        {
            title: "User Name", width: 100, dataIndx: "name", editable: false
        },
        {
            title: "Description", width: 100, dataIndx: "description", editable: false
        },
        {
            title: "Quota Alert Capacity", width: 100, dataIndx: "quotaalert", editable: false
        },
        {
            title: "Quota Capacity", width: 100, dataIndx: "quotacapacity", editable: false
        },
        {
            title: "Group", width: 100, dataIndx: "group", editable: false
        },
	{
            title: "Access Restrictions", width: 100, dataIndx: "accessrestrictions", editable: false
        }
    ];
}




getUserDataModel = function(){
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




deleteExtUser = function(){
    var popUpContainer = $("#delete_extuser");
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

             $("#delete_extuser_inner").html(html.join(""));
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


selectExtUser = function(){
    var popUpContainer = $("#extuser_select");
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

             $("#extuser_select_inner").html(html.join(""));
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
          //  effect: "explode",
            duration: 100
        },


        }).dialog( "open" );

}


unselectExtUser = function(){
    var popUpContainer = $("#extuser_unselect");
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

             $("#extuser_unselect_inner").html(html.join(""));
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



selectUser = function(){
    var popUpContainer = $("#user_select");
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

             $("#user_select_inner").html(html.join(""));
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


unselectUser = function(){
    var popUpContainer = $("#user_unselect");
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

             $("#user_unselect_inner").html(html.join(""));
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

importCsv = function(){
    var popUpContainer = $("#csv_import");
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

             $("#csv_import_inner").html(html.join(""));
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


deleteUser = function(){
    var popUpContainer = $("#delete_user");
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

             $("#delete_user_inner").html(html.join(""));
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

externalUser = function(){
    var popUpContainer = $("#ext_user");
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

             $("#ext_user_inner").html(html.join(""));
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


addUser = function(){
    var popUpContainer = $("#user_create");
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

             $("#user_create_inner").html(html.join(""));
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

createUser(JSON.stringify({ volume: volume }));

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
   
createUser =function(inpu){
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
        debugger;
        $("#user_create").dialog('close');
        $("#user-details").pqGrid("refreshDataAndView" );
    },
    error: function(data){
        debugger;
        alert("fail");
            
            }
        });
           // return false;
}
   
