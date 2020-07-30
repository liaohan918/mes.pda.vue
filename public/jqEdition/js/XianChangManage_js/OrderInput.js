/*
作者：胡丁文
时间： 
描述：指令投入
 */ 
$(function(){  
	var form = layui.form;
	layui.use(['table','form'], function(){
	  var form = layui.form; 
	  form.on('select(txtWorkStep)', function(data){
	    $("#txtWorker").focus();
	  });
	  //进入投产 
	  form.on('submit(go)', function(data){ 
	  	   var workStepNo = $("#txtWorkStep").val(); 
	  	   var workStepName = $("#txtWorkStep option:selected").text();
	  	   var worker = $("#txtWorker").val();
	  	   var dev = $("#txtDev").val();
	  	   var line = $("#txtLine").val();  
	  	   window.location.href="OrderInput2.html?workStepNo="+workStepNo+"&workStepName="+workStepName+"&worker="+worker+"&dev="+dev+"&line="+line;
	  		return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。 
	    }); 
	    form.verify({
	  	  notNull: function(value, item){
	  		  var reg = /\S/;  
	  		if(!reg.test(value)){ 
	  			  return '必填项不能为空';
	  		}
	  	  }  
	  	});  
	}); 
	SetWork();
	SetLine();
	   $("#txtWorker").keyup(function(e){ 
	   	 if(e.keyCode == 13){
	   		$("#txtDev").focus(); 
	   	} 
	   	e.preventDefault();
	   });
 
	

});//jquery
function SetLine(){
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) { 
			dt = $.parseJSON(resdata.data); 
			 $.each(dt, function (index, item) {
				$('#txtLine').append(new Option(item.text, item.value));// 下拉菜单里添加元素
				layui.form.render("select");
			 });
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
function SetWork(){ 
	//获取工序
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetGongXu',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) { 
			dt = $.parseJSON(resdata.data); 
			$.each(dt, function (index, item) {
				$('#txtWorkStep').append(new Option(item.text, item.value));// 下拉菜单里添加元素
				layui.form.render("select");
			});
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	}); 
}
function GetTime(){
	//获取系统日期
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp); 
}     