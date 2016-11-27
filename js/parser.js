$(document).ready(function(){

TranscodeRule = JSON.parse(TranscodeRule);

$('.start').click(function(){
  parse_new_data( $('.originalDATA').val(), false, true );
})

$('.clear').click(function(){
  $('.originalDATA').val('');
  $('.dataForm').html('');
  $('.datalog').val('');
  $('.dataText').val('');
})

$('.record').click(function(){

 $.ajax({
   type: 'POST',
   url: "appphp/getRecord.php",
   dataType: "json",
   success: function (data) {

     data.Records.forEach(function(record,index){
       var num = index+1;

       $('.recordTable').append('<tr>\
                                   <td>'+num+'</td>\
                                   <td>'+record.SourceData+'</td>\
                                   <td>'+record.TimeStamp+'</td>\
                                   <td><button type="button" class="btn btn-primary record'+num+'" data-recordid="'+record.id+'">LOAD</button></td>\
                                 <tr>')

     })

     for(var i=1;i<=50;i++){
       $('.record'+i).click(function(){
         getSingleRecord($(this).data('recordid'));
         $('#recordModal').modal('hide');
       })
     }

   }
 });

})

$('#recordModal').on('hidden.bs.modal', function (e) {
  $('.recordTable').html('<tr>\
                            <th>#</th>\
                            <th>SourceData</th>\
                            <th>TimeStamp</th>\
                            <th>LOAD</th>\
                          <tr>')
})

$('.import').click(function(){
  serverfilelist('../uploadfiles');
})

$('#importModal').on('hidden.bs.modal', function (e) {
  $('.progress').css('display','none');
  $('#progress .progress-bar').css('width','0%');
  $('#files').html('');
  $('#serverfilelist').html('');
})

function serverfilelist(path){

  $.ajax({
    type: 'POST',
    url: "appphp/upload_filelist.php",
    data:{path:path},
    dataType: "json",
    success: function (data) {
      console.log(data);

      if(path !== '../uploadfiles'){
        $('#serverfilelist').append('<span class="fileline" data-type="folder" data-url="'+path.substring(0,path.lastIndexOf('/'))+'"><i class="glyphicon glyphicon-folder-open"></i><span class="serverfile">&nbsp;&nbsp;...</span></span>')
      }

      for(var index in data){
        if(data[index].fileType === 'folder'){
          $('#serverfilelist').append('<span class="fileline" data-type="'+data[index].fileType+'" data-url="'+data[index].path+'"><i class="glyphicon glyphicon-folder-close"></i><span class="serverfile">&nbsp;&nbsp;'+index+'</span></span>')
        }else if (data[index].fileType === 'file') {
          $('#serverfilelist').append('<span class="fileline" data-type="'+data[index].fileType+'" data-url="'+data[index].path+'"><i class="glyphicon glyphicon-file"></i><span class="serverfile">&nbsp;&nbsp;'+index+'</span></span>')
        }
      }

      $('.fileline').on('click',function(e){
        console.log(e);
        if(e.currentTarget.dataset.type === 'folder'){
          $('#serverfilelist').html('');
          serverfilelist(e.currentTarget.dataset.url);
        }else if (e.currentTarget.dataset.type === 'file') {
          $('#importModal').modal('hide');
          parse_file_onServer(e.currentTarget.dataset.url);
        }
      })

    }
  });

}

function parse_file_onServer(path){

  $.ajax({
    type: 'POST',
    url: "appphp/parse_file_onServer.php",
    data:{path:path},
    dataType: "json",
    success: function (data) {
      parse_new_data(data.sourceData, true, true);
    }
  });

}

$('.checkContent').click(function(e){
  if($('.checkContent').prop('checked')){
    $('.description').css('display','inline-block');
  }else {
    $('.description').css('display','none');
  }
})

$('.checktransCode').click(function(e){
  if($('.checktransCode').prop('checked')){
    $('.transCode').css('display','inline');
  }else {
    $('.transCode').css('display','none');
  }
})

$('.checktranscodeRule').click(function(e){
  if($('.checktranscodeRule').prop('checked')){
    $('.transCodeRule').css('display','inline');
  }else {
    $('.transCodeRule').css('display','none');
  }
})

function parse_new_data(originalDATA,replaceOriginalDATA,insertRecord){

  originalDATA = originalDATA.replace(/\r?\n|\r/g,'');
  originalDATA = originalDATA.replace(/\s/g,'');

  var sortData = newTextData(originalDATA);
  var data = newFormData(sortData);

  if(replaceOriginalDATA){
    $('.originalDATA').val(originalDATA);
  }
  $('.dataForm').html('');

  $('.dataForm').append(data.lineHtml);
  $('.dataText').val(data.lineText);
  $('.datalog').val(data.lineLog);

  if(insertRecord){
    var datapost = {
      sourceData:originalDATA,
      transCodeLog:data.lineLog,
    }

    $.ajax({
      type: 'POST',
      url: "appphp/insertRecord.php",
      data: datapost,
      dataType: "json",
      success: function (data) {

      }
    });
  }

}

function getSingleRecord(recordid){

 $.ajax({
   type: 'POST',
   url: "appphp/getSingleRecord.php",
   data: {recordid:recordid},
   dataType: "json",
   success: function (data) {

     parse_new_data(data.Record.SourceData,true,false);

   }
 });

}

function newTextData(originalDATA){

  var dataLength = originalDATA.length;
  var startPOS = 0;
  var headCount = Object.keys(TranscodeRule.DataHead).length;

  var dataLines = [
    ['1',''],
    ['2',''],
    ['3',''],
    ['4','=====表頭=====']
  ];

  for(var index in TranscodeRule.DataHead){
    if(index !== '1' && index !== '2' && index !== '3' && index !== '4'){
      dataLines.push( [index,originalDATA.substring(startPOS,startPOS+TranscodeRule.DataHead[index].length)] );
      startPOS += TranscodeRule.DataHead[index].length;
    }
  }

  dataLines.push([(headCount+1).toString(),'=====第1表身=====']);

  var bodyCount = 1
  while(startPOS < dataLength){

    for(var index in TranscodeRule.DataBody){
      if(index !== (headCount+1).toString()){
        dataLines.push( [index,originalDATA.substring(startPOS,startPOS+TranscodeRule.DataBody[index].length)] );
        startPOS += TranscodeRule.DataBody[index].length;
      }
    }

    bodyCount ++;

    dataLines.push([(headCount+1).toString(),'=====第'+bodyCount+'表身=====']);
  }

  return dataLines;
}

function newFormData(sortData){

  var lineHtml = '';
  var lineText = '';
  var lineLog = '';
  var linesText = [];

  sortData.forEach(function(value,lineNumber){

    var index = value[0];
    var sourceData = value[1];
    var headCount = Object.keys(TranscodeRule.DataHead).length;
    var bodyCount = Object.keys(TranscodeRule.DataBody).length;

    //re-calculate line number
    lineNumber ++;

    var section = (lineNumber <= headCount) ? 'DataHead' : 'DataBody';

    if(lineNumber > headCount){
      if( (lineNumber-headCount)%bodyCount !== 0 ){
        lineNumber = (lineNumber-headCount)%bodyCount+headCount;
      }else if ( (lineNumber-headCount)%bodyCount === 0 ) {
        lineNumber = bodyCount+headCount;
      }
    }

    //add zero afront of number
    if(lineNumber < 10){
      lineNumText = '00'+lineNumber.toString();
      lineLog += lineNumText+' ';
    }else if (lineNumber < 99) {
      lineNumText = '0'+lineNumber.toString();
      lineLog += lineNumText+' ';
    }else if (lineNumber >= 100) {
      lineNumText = lineNumber.toString();
      lineLog += lineNumText+' ';
    }

    var exp = TranscodeRule[section][index].Exp;
    var lsb = TranscodeRule[section][index].LSB;
    var dataCoding = TranscodeRule[section][index].dataCoding;
    var unixTime = TranscodeRule[section][index].UnixTime;

    //start writing line html
    //line DIV
    lineHtml +='<div class="lineDiv" >';
    //line number span
    lineHtml +='<span class="lineNumber">'+lineNumText+'</span>';
    //**************************************************************************

    //line content span
    if($('.checkContent').prop('checked')){
      lineHtml +='<span class="description" style="display:inline-block;">'+exp+'</span>';
    }else {
      lineHtml +='<span class="description" style="display:none;">'+exp+'</span>';
    }
    lineLog += exp+' ';
    //**************************************************************************

    //sourceData span
    lineHtml +='<span class="lineData">'+sourceData+'</span>';
    lineText += sourceData+' ';
    lineLog += sourceData+' ';

    //line transCode span
      var transCode = sourceData;
      var rulesCount = TranscodeRule[section][index].Rule.length;
      lineLog += '-->';

      TranscodeRule[section][index].Rule.forEach(function(rule,index){

        if(rule === 'AN'){

            //create array with each two number in line
            var twoNumArray = eachTwoNum(sourceData);
            var antext = '';
            twoNumArray.forEach(function(value,index){
              if(typeof an[parseInt(value,16)] !== 'undefined'){
                antext += an[parseInt(value,16)];
              }else if (typeof an[parseInt(value,16)] === 'undefined') {
                antext += '['+value+'?]';
              }
            })

           transCode = antext;

           if(index !== rulesCount -1) lineLog += transCode+'-->';
           if(index === rulesCount -1) lineLog += transCode+' ';

        }

        if(rule === 'LSB'){

            //create array with each two number in line
            var twoNumArray = eachTwoNum(sourceData);
            transCode = twoNumArray.reverse().join('');

            if(index !== rulesCount -1) lineLog += transCode+'-->';
            if(index === rulesCount -1) lineLog += transCode+' ';

        }

        if(rule === 'Decimal'){
            transCode = parseInt(transCode,16);

            if(index !== rulesCount -1) lineLog += transCode+'-->';
            if(index === rulesCount -1) lineLog += transCode+' ';

        }

        if(rule === 'UnixTime'){
            var d = new Date( (Number(transCode)*1000)-28800000 );
            transCode = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+
                        d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();

            if(index !== rulesCount -1) lineLog += transCode+'-->';
            if(index === rulesCount -1) lineLog += transCode+' ';

        }
      })

      if($('.checktransCode').prop('checked')){
        lineHtml +='<span class="transCode" style="display:inline;">'+transCode+'</span>';
      }else {
        lineHtml +='<span class="transCode" style="display:none;">'+transCode+'</span>';
      }

    //**************************************************************************

    //line transCodeRule span

      var rules = '';
      var rulesCount = TranscodeRule[section][index].Rule.length;

      TranscodeRule[section][index].Rule.forEach(function(rule,key){

        if(key === 0){
          if(rulesCount === 1)  rules += rule;
          if(rulesCount > 1)  rules += rule+'-->'
        }

        if(key !== 0 && key !== rulesCount-1){
          rules += rule+'-->';
        }

        if(key === rulesCount-1 && key !== 0){
          rules += rule;
        }
      })

      if($('.checktranscodeRule').prop('checked')){
        lineHtml +='<span class="transCodeRule" style="display:inline;">'+rules+'</span>';
      }else {
        lineHtml +='<span class="transCodeRule" style="display:none;">'+rules+'</span>';
      }

      lineText += rules;
      lineLog += rules+' ';

    //**************************************************************************

    lineHtml +='</div>';
    lineText += "\n";
    lineLog += "\n";
  })

  return {lineHtml:lineHtml,lineText:lineText,lineLog:lineLog};
}

function eachTwoNum(sourceData){

  var twoNumArray = [];
  var twoNumber = '';
  sourceData.split('').forEach(function(value,index){
    twoNumber += value;
    if(index%2 === 1){
      twoNumArray.push(twoNumber);
      twoNumber = '';
    }
  })
  return twoNumArray;
}

function everySecondNum(sourceData){
  //create array with every second number in line
  var secondNumArray = [];
  sourceData.split('').forEach(function(value,index){
    if(index%2 === 1){
      secondNumArray.push(value);
    }
  })
  return secondNumArray;
}

$('.RuleID').editable({
  mode:'popup',
  type:'text',
  title:'Change Rule',
  emptytext:null,
  placement:'top',
  container:'body',
})

$('.RuleID').on('shown',function(e, params){

  $('.editable-input > input').css('display','none');

  $('.editable-buttons').prepend('\
  <button class="btn btn-default btn-sm btn-minus">\
  <i class="glyphicon glyphicon-minus"></i>\
  </button>');

  $('.editable-buttons').prepend('\
  <button class="btn btn-default btn-sm btn-plus" style="position:relative;left:5px;">\
    <i class="glyphicon glyphicon-plus"></i>\
  </button>');

  $('.btn-minus').on('click',function(){
    updateRule('minus',e.target.dataset.ruleid,getRuleData(e.target.dataset.ruleid))
  })

  $('.btn-plus').on('click',function(){
    updateRule('plus',e.target.dataset.ruleid,getRuleData(e.target.dataset.ruleid))
  })

  $('.editable-submit').on('click',function(){
    updateRule('update',e.target.dataset.ruleid,getRuleData(e.target.dataset.ruleid))
  })

})

function getRuleData(ruleid){
  var data = {};
  $('.rule'+ruleid).each(function(){
    if($(this).data('type') !== 'Section') data[$(this).data('type')] = $(this).val();
    if($(this).data('type') === 'Section') data.Section = $(this).html();
  })
  return data;
}

function updateRule(op,ruleid,data){

 $.ajax({
   type: 'POST',
   url: "appphp/updateRule.php",
   data: {op:op,ruleid:ruleid,data:data},
   dataType: "json",
   success: function (data) {
     window.location = 'parser.php?tab=rule';
   }
 });

}

//***** Upload Course ZIP file **********************
$('#fileupload').fileupload({
  url: 'appphp/parse_upload_file.php',
  dataType: 'json',
  autoUpload: true,
  acceptFileTypes: /(\.|\/)(dat)$/i,
  disableImageResize: false,
  previewMaxWidth: 100,
  previewMaxHeight: 100,
  previewCrop: true
}).on('fileuploadadd', function (e, data) {

  $('.progress').css('display','block');
  data.context = $('<div id="filelist"/>').appendTo('#files');
  $.each(data.files, function (index, file) {
    var node = $('<p/>').append($('<span/>').text('uploading... ' + file.name));
    if (!index) { node.append('<br>');}
    node.appendTo(data.context);
  });

}).on('fileuploadprocessalways', function (e, data) {

  var index = data.index,
      file = data.files[index],
      node = $(data.context.children()[index]);

  if (file.error) {
    node.append('<br>')
        .append($('<span class="text-danger"/>').text(file.error));
  }

}).on('fileuploadprogressall', function (e, data) {

  var progress = parseInt(data.loaded / data.total * 100, 10);
  $('#progress .progress-bar').css('width',progress + '%');

}).on('fileuploaddone', function (e, data) {

   setTimeout(function(){
     $('#importModal').modal('hide');
     $('.progress').css('display','none');
     $('#progress .progress-bar').css('width','0%');
     $('#files').html('');
     parse_new_data(data.result.files[0].content,true,true);
   },500);

}).on('fileuploadfail', function (e, data) {

}).prop('disabled', !$.support.fileInput)
    .parent().addClass($.support.fileInput ? undefined : 'disabled');


})
