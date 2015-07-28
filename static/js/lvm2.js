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
        create:function(eve, ui){
            //todo code for after creation
        },
        
        open: function(eve, ui){
            
            var grid = $("#lvm-details"), ht = grid.parent().height() - 5, wd = grid.parent().width();
            if(grid.hasClass('pq-grid')){
                grid = grid.destroy();
            }
            grid.pqGrid({
                    height: ht,
                    width: wd,
                    colModel: getLvmDetailsColumn(),
                    dataModel: getLvmDataModel(),
                    render: function(eve, ui){
                        //debugger;
                        var $toolbar = $("<div class='pq-grid-toolbar pq-grid-toolbar-crud'></div>").appendTo($(".pq-grid-top", this));
                        $("<span>Create Volume</span>").appendTo($toolbar).button({
                            icons: {
                                primary: "ui-icon-circle-plus"
                            }
                        }).click(function (evt) {
                            addVolume();
                        });
                    }
                });

        },
        close: function(){
            
            $("#lvm-details").pqGrid("destroy");
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
            title: "Disks", width: 100, dataIndx: "volume", editable: false
        }
    ];
}




getLvmDataModel = function(){
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

addVolume = function(){
    var popUpContainer = $("#vol_create");
    popUpContainer.dialog ({
        autoOpen: false,
        height: 400,
        width: 500,
        modal:true,
        create:function(eve, ui){
            //todo code for after creation
        },
        open: function(eve, ui){
            //debugger;

            //var large = '<form>Volume name:  <input type="text" name="fname"><br><br><br>File System : <select name="fs"><option value="ext3">ext3</option><option value="ext4">ext4</option><option value="xfs">xf</option><select> <br><br><br>File System:<input type="text" name="fname"><br><br><br>Size: <input type="number" name="quantity" min="1"><form>'
            //$("#vol_create_inner").html(large);
            $("#vol_create_inner").html(getFormHtmlText());            
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
getFormHtmlText = function(){
    //var disks = [];
     var gjson = getJSON('../no_disks') ;
//alert(gjson);
//var json = '{"result":true,"count":1}',
    obj = JSON.parse(gjson);
//alert(typeof(obj.count));
       var str1 = '<div class="confirm"> {% csrf_token %}<h1>Volume</h1> <p>Name <br/> <span class="text-input-pop"><input type="text" class="text-add" id ="vol_name"/></span> </p><p>Disk <div class="raid-disk-cont" style="margin:0 3rem;"> ';
    var str2 = '</div></p><p>Raid Level <br/> <span class="text-input-pop"> <select id ="select_raid"> <option value ="99">Span</option> <option value ="0">0</option> <option  value ="1">1</option> <option  value ="5">5</option> <option value ="10">10</option> </select> </span> </p><p>FS <br/> <span class="text-input-pop"> <select id ="fs_type"> <option value ="ext3">Ext 3</option> <option value ="ext4">Ext 4</option> <option value ="xfs">XFS</option> </select> </span> </p><p style="margin-bottom:4rem;">Size <br/> <span class="text-input-pop"><input type="number" class="text-add" id = "size" value="1" min="1" max="100"/> GB</span> </p><button id="cancel-dialog">Cancel</button> <button autofocus onclick ="confirmed()">Confirm</button></div>';
    var no_disks = 6;
    var span ="";
    var j = 0;
    for (i = 0; i < obj.count ; i++){
        j = i+1;
        span +='<span class="text-input-pop"><input type="checkbox" class="text-add3" id ="disk_check" name= "disk_check" value='+'\"disk'+j+'\"'+'/>'+ 'disk'+j+'</span><br/>'

    }
    var str = str1+span+str2;
    return str;

    //return '<div class="confirm"> <h1>&nbsp;</h1> <p>Name <br/> <span class="text-input-pop"><input type="text" class="text-add"/></span> </p><p>Disk <div class="raid-disk-cont" style="margin:0 3rem;"> <span class="text-input-pop"><input type="checkbox" class="text-add"/> Disk 1</span><br/> <span class="text-input-pop"><input type="checkbox" class="text-add"/> Disk 2</span><br/> <span class="text-input-pop"><input type="checkbox" class="text-add"/> Disk 3</span><br/> <span class="text-input-pop"><input type="checkbox" class="text-add"/> Disk 4</span> </div></p><p>Raid Level <br/> <span class="text-input-pop"> <select> <option>Span</option> <option>0</option> <option>1</option> <option>5</option> <option>10</option> </select> </span> </p><p>FS <br/> <span class="text-input-pop"> <select> <option>Ext 5</option> <option>Ext 6</option> <option>Ext 7</option> </select> </span> </p><p style="margin-bottom:4.5rem;">Size <br/> <span class="text-input-pop"><input type="number" class="text-add" value="1" min="1" max="100"/> GB</span> </p><button id="cancel-dialog">Cancel</button> <button autofocus>Confirm</button></div>';
}

confirmed =function(){



var inputElems = document.getElementsByName("disk_check");
var disk_count = 0;
var disk_arr = [];
var disk_str = "";
//var size=0;
//var fs ="";

var send_json = '{"volume" :{"name":';
        for (var i=0; i<inputElems.length; i++) {       
           if (inputElems[i].type == "checkbox" && inputElems[i].checked == true){
              disk_count++;
              //alert(inputElems[i].value);
              disk_arr.push(inputElems[i].value);

               }
          }
          for( var a=0; a < disk_arr.length; a++){
            var lastChar = disk_arr[a].charAt(disk_arr[a].length - 1);
            if (lastChar == '1'){disk_str +="sda ";} else if(lastChar == '2'){disk_str +="sdb ";}else if(lastChar == '3'){disk_str +="sdc ";}else if(lastChar == '4'){disk_str +="sdd ";}

          }
              //alert(count);
           var raid_type = document.getElementById("select_raid");
           var raid_selected = raid_type.options[raid_type.selectedIndex].value;
           if (raid_selected == "0" &&  (disk_count !=2 && disk_count != 4)){   
            alert("Either select 2 or 4 disks for RAID Level 0");
            //return;
           }
           else if(raid_selected == "10" && disk_count!= 4){
            alert("Select 4 disks for RAID Level 10");
           }
           else if(raid_selected == "5" && (disk_count!=3 && disk_count!= 4)){
            alert("Either select 3 or 4 disks for RAID Level 5");
           }
           else{
            //call backend here
            send_json += '"'+document.getElementById('vol_name').value+'",'+'"disk": "'+disk_str+'","rlevel": "'+raid_selected+'","size":"'+document.getElementById('size').value+'","secure": "0","block": "0",'+'"fs":"'+document.getElementById("fs_type").options[document.getElementById("fs_type").selectedIndex].value+'"fcache": "0"}}';
            alert(document.getElementById("fs_type").options[document.getElementById("fs_type").selectedIndex].value)
            alert(send_json);
            createVolume(send_json);

           }
           //alert(typeof(strUser));

        
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
    $.post("../create_volume/", {vol_name: inpu });
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
/*$.ajax({
                 type:"POST",
                 url:"../create_volume/",
                 data: {
                        csrfmiddlewaretoken: "{{ csrf_token }}",
                        vol_name: inpu // from form
                        },
                        contentType: "application/text; charset=utf-8",
    dataType: "text",
    success: function(data) {
        alert(data.d);
    },
    error: function(data){
        alert("fail");

                 
            }
        });*/
           // return false;
}
   