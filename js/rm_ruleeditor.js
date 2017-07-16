$(document).ready(function(){

  $('#page-wrapper').css('width', ($(document).width()-350).toString()+'px' );
  $('#editor').css('height', ($('#page-wrapper').height()-135).toString()+'px' );
  $('#rule_row_container').css('height', ($('#editor').height()-35).toString()+'px' );

  $('#regular_radio_text').on('click',function(e){ $('input[value=regular]').prop("checked", true); })
  $('#blank_radio_text').on('click',function(e){ $('input[value=blank]').prop("checked", true); })
  $('#before_radio_text').on('click',function(e){ $('input[value=before]').prop("checked", true); })
  $('#after_radio_text').on('click',function(e){ $('input[value=after]').prop("checked", true); })

  $( "#rule_row_container" ).sortable({
    handle: ".handle",
    start: function(event,ui){ start_sorting_color(event,ui);},
    stop : function(event,ui){
      end_sorting_color(event,ui);
      sort_linenumber(event,ui);
    }
  });
  $( "#rule_row_container" ).disableSelection();

  $('.rule_row').hover(function(){
    if($(this).data('subject') !== 'Blank' && $(this).data('subject') !== 'HeadTitle' && $(this).data('subject') !== 'BodyTitle') $(this).css('background-color','#e6e6e6');
  },function(){
    if($(this).data('subject') !== 'Blank' && $(this).data('subject') !== 'HeadTitle' && $(this).data('subject') !== 'BodyTitle') $(this).css('background-color','#fff');
  })

  $('.detail_btn').on('click',function(e){ detail_btn_event(e,$(this)); })

  $('.insert_btn').on('click',function(e){
    insert_btn_event(e,$(this));
  })

  $('#insert').on('click',function(e){
    if( $('input[name=type]:checked').length === 0 || $('input[name=position]:checked').length === 0 ){
      $('#insert_err').html('Please select type and position.');
    }else {
      $('#insertRowModal').modal('hide');
      $('#insert_err').html('');
      insert_row($(this).data('id'),$(this).data('linenumber'),$('input[name=type]:checked').val(),$('input[name=position]:checked').val());
    }
  })

  $('.del_btn').on('click',function(e){ del_btn_event(e,$(this)); })

  $('#del_row').on('click',function(e){
    $('#'+$(this).data('id')).css('display','none');
    $('#'+$(this).data('id')).removeClass('rule_row').addClass('rule_row_deleted');
    sort_linenumber(null,null);
    $('#delRowModal').modal('hide');
  })

  $('#save_btn').on('click',function(e){ save_rule_table(e,$(this)); })

})

function start_sorting_color(event,ui){
  var subject = ui.item[0].dataset.subject;
  $(ui.item).css('background-color','black');
  $(ui.item).css('color','white');
}

function end_sorting_color(event,ui){
  var subject = ui.item[0].dataset.subject;
  if(subject === 'Blank'){
    $(ui.item).css('background-color','#d9edf7');
  }else if (subject === 'HeadTitle' || subject === 'BodyTitle') {
    $(ui.item).css('background-color','#B2E0F7');
  }else {
    $(ui.item).css('background-color','#fff');
  }
  $(ui.item).css('color','#000');
}

function sort_linenumber(event,ui){
  $('.rule_row').each(function(index,row){
      $('#'+$(this).attr('id')+' .LineNumber').html(index+1);
      $('#'+$(this).attr('id')+' .insert_btn').attr('data-linenumber',index+1);
      $('#'+$(this).attr('id')+' .del_btn').attr('data-linenumber',index+1);
      // $('#detail_'+$(this).attr('id')+' .detail_linenumber').html('LineNumber : '+(index+1).toString());
  })
}

function detail_btn_event(e,ele){
  $('#detail_'+ele.data('id')).toggle('display');
}

function insert_btn_event(e,ele){
  $('#insert').data('id',ele.data('id'));
  $('#insert').data('linenumber',ele.data('linenumber'));
}

function del_btn_event(e,ele){
  $('#del_row').data('id',ele.data('id'));
  $('#del_row').data('linenumber',ele.data('linenumber'));
}

var tempID = 0;
function insert_row(id,linenumber,type,position){

  tempID ++ ;

  if(position === 'before'){
    if(type === 'blank'){
      $('\
      <div id="temp_'+tempID+'" class="rule_row" style="background-color:#d9edf7;" data-subject="Blank">\
        <span class="handle arrange_span"><i class="fa fa-exchange arrange_icon" aria-hidden="true"></i></span>\
        <span class="LineNumber editor_line_span" style="width:50px;">'+linenumber+'</span>\
          <input class="Exp editor_line_input" type="text" style="width:20%;" value="====="></input>\
          <span class="Length editor_line_span" style="width:10%;">0</span>\
          <span class="DataCoding editor_line_span" style="width:10%;"></span>\
          <span class="LSB editor_line_span" style="width:5%;"></span>\
          <span class="UnixTime editor_line_span" style="width:10%;"></span>\
          <span class="TranscodeRule editor_line_span" style="width:20%;"></span>\
          <span class="editor_line_span">\
          <button class="btn btn-sm-black insert_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#insertRowModal"><i class="fa fa-long-arrow-left" aria-hidden="true"></i>&nbsp;</button>\
          <button class="btn btn-sm-black del_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#delRowModal">&nbsp;<i class="fa fa-times" aria-hidden="true"></i>&nbsp;</button>\
        </span>\
      </div>').insertBefore('#'+id);
    }else if (type === 'regular') {
      $('\
      <div id="temp_'+tempID+'" class="rule_row" data-subject="RuleSet_'+currentRulesetID+'_'+linenumber+'">\
        <span class="handle arrange_span"><i class="fa fa-exchange arrange_icon" aria-hidden="true"></i></span>\
        <span class="LineNumber editor_line_span" style="width:50px;">'+linenumber+'</span>\
        <input class="Exp editor_line_input" type="text" style="width:20%;" value=""></input>\
        <input class="Length editor_line_input" type="text" style="width:10%;" value="0"></input>\
        <input class="DataCoding editor_line_input" type="text" style="width:10%;" value=""></input>\
        <input class="LSB editor_line_input" type="text" style="width:5%;" value=""></input>\
        <input class="UnixTime editor_line_input" type="text" style="width:10%;" value=""></input>\
        <input class="TranscodeRule editor_line_input" type="text" style="width:20%;" value=""></input>\
        <span class="editor_line_span">\
          <button class="btn btn-sm-black insert_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#insertRowModal"><i class="fa fa-long-arrow-left" aria-hidden="true"></i>&nbsp;</button>\
          <button class="btn btn-sm-black del_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#delRowModal">&nbsp;<i class="fa fa-times" aria-hidden="true"></i>&nbsp;</button>\
        </span>').insertBefore('#'+id);
    }

  }else if (position === 'after') {
    linenumber ++ ;
    if(type === 'blank'){
      $('\
      <div id="temp_'+tempID+'" class="rule_row" style="background-color:#d9edf7;" data-subject="Blank">\
        <span class="handle arrange_span"><i class="fa fa-exchange arrange_icon" aria-hidden="true"></i></span>\
        <span class="LineNumber editor_line_span" style="width:50px;">'+linenumber+'</span>\
          <input class="Exp editor_line_input" type="text" style="width:20%;" value="====="></input>\
          <span class="Length editor_line_span" style="width:10%;">0</span>\
          <span class="DataCoding editor_line_span" style="width:10%;"></span>\
          <span class="LSB editor_line_span" style="width:5%;"></span>\
          <span class="UnixTime editor_line_span" style="width:10%;"></span>\
          <span class="TranscodeRule editor_line_span" style="width:20%;"></span>\
          <span class="editor_line_span">\
          <button class="btn btn-sm-black insert_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#insertRowModal"><i class="fa fa-long-arrow-left" aria-hidden="true"></i>&nbsp;</button>\
          <button class="btn btn-sm-black del_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#delRowModal">&nbsp;<i class="fa fa-times" aria-hidden="true"></i>&nbsp;</button>\
        </span>\
      </div>').insertAfter('#'+id);
    }else if (type === 'regular') {
      $('\
      <div id="temp_'+tempID+'" class="rule_row" data-subject="RuleSet_'+currentRulesetID+'_'+linenumber+'">\
        <span class="handle arrange_span"><i class="fa fa-exchange arrange_icon" aria-hidden="true"></i></span>\
        <span class="LineNumber editor_line_span" style="width:50px;">'+linenumber+'</span>\
        <input class="Exp editor_line_input" type="text" style="width:20%;" value=""></input>\
        <input class="Length editor_line_input" type="text" style="width:10%;" value="0"></input>\
        <input class="DataCoding editor_line_input" type="text" style="width:10%;" value=""></input>\
        <input class="LSB editor_line_input" type="text" style="width:5%;" value=""></input>\
        <input class="UnixTime editor_line_input" type="text" style="width:10%;" value=""></input>\
        <input class="TranscodeRule editor_line_input" type="text" style="width:20%;" value=""></input>\
        <span class="editor_line_span">\
          <button class="btn btn-sm-black insert_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#insertRowModal"><i class="fa fa-long-arrow-left" aria-hidden="true"></i>&nbsp;</button>\
          <button class="btn btn-sm-black del_btn" data-id="temp_'+tempID+'" data-linenumber="'+linenumber+'" data-toggle="modal" data-target="#delRowModal">&nbsp;<i class="fa fa-times" aria-hidden="true"></i>&nbsp;</button>\
        </span>').insertAfter('#'+id);
    }
  }

  sort_linenumber(null,null);

  $('.insert_btn').off('click').on('click',function(e){
    insert_btn_event(e,$(this));
  })

  $('.del_btn').off('click').on('click',function(e){ del_btn_event(e,$(this)); })

  $('.rule_row').hover(function(){
    if($(this).data('subject') !== 'Blank' && $(this).data('subject') !== 'HeadTitle' && $(this).data('subject') !== 'BodyTitle') $(this).css('background-color','#e6e6e6');
  },function(){
    if($(this).data('subject') !== 'Blank' && $(this).data('subject') !== 'HeadTitle' && $(this).data('subject') !== 'BodyTitle') $(this).css('background-color','#fff');
  })

}

function save_rule_table(){

  var ruleTable = [];

  $('.rule_row').each(function(index,row){
    ruleTable.push( get_row_value($(this).attr('id'),false) );
  })

  $('.rule_row_deleted').each(function(index,row){
    ruleTable.push( get_row_value($(this).attr('id'),true) );
  })

  $('#loader').css('display','block');
  $.ajax({
    type: 'POST',
    url: "appphp/rm_ruleeditor_backend.php",
    data: {op:'save_rule_table',rulesetid:currentRulesetID,ruleTable:ruleTable},
    dataType: "json",
    success: function (data) {
      location.reload();
    },
    error: function(requestObject, error, errorThrown) {
            $('#loader').css('display','none');
            $('#ajax_err').css('display','block');
    }
  });
}


function get_row_value(id,del){

  if(!del){
    if(id.indexOf('temp') >= 0){
      var op = 'insert';
    }else {
      var op = 'update';
    }
  }else if (del) {
    var op = 'delete';
  }

  var LineNumber = $('#'+id+' .LineNumber').html();

  if( $('#'+id+' .Exp').prop('tagName') === 'SPAN' ){
    var Exp = $('#'+id+' .Exp').html();
  }else if ( $('#'+id+' .Exp').prop('tagName') === 'INPUT' ) {
    var Exp = $('#'+id+' .Exp').val();
  }

  if( $('#'+id+' .Length').prop('tagName') === 'SPAN' ){
    var Length = $('#'+id+' .Length').html();
  }else if ( $('#'+id+' .Length').prop('tagName') === 'INPUT' ) {
    var Length = $('#'+id+' .Length').val();
  }

  if( $('#'+id+' .DataCoding').prop('tagName') === 'SPAN' ){
    var DataCoding = $('#'+id+' .DataCoding').html();
  }else if ( $('#'+id+' .DataCoding').prop('tagName') === 'INPUT' ) {
    var DataCoding = $('#'+id+' .DataCoding').val();
  }

  if( $('#'+id+' .LSB').prop('tagName') === 'SPAN' ){
    var LSB = $('#'+id+' .LSB').html();
  }else if ( $('#'+id+' .LSB').prop('tagName') === 'INPUT' ) {
    var LSB = $('#'+id+' .LSB').val();
  }

  if( $('#'+id+' .UnixTime').prop('tagName') === 'SPAN' ){
    var UnixTime = $('#'+id+' .UnixTime').html();
  }else if ( $('#'+id+' .UnixTime').prop('tagName') === 'INPUT' ) {
    var UnixTime = $('#'+id+' .UnixTime').val();
  }

  if( $('#'+id+' .TranscodeRule').prop('tagName') === 'SPAN' ){
    var TranscodeRule = $('#'+id+' .TranscodeRule').html();
  }else if ( $('#'+id+' .TranscodeRule').prop('tagName') === 'INPUT' ) {
    var TranscodeRule = $('#'+id+' .TranscodeRule').val();
  }

  return {op:op,id:id,LineNumber:LineNumber,Exp:Exp,Length:Length,DataCoding:DataCoding,LSB:LSB,UnixTime:UnixTime,TranscodeRule:TranscodeRule}

}