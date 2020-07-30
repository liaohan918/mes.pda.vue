var userPicker;
$(function(){
	userPicker = new mui.PopPicker(); //声明对象
	initData();
	
	$('#txtBarCode').keydown(function(e){
		if(e.keyCode !=13)
		    return;
	    txtBarCode_keyDown();
	});
	
	$('#txtJiXing').click(function(e){
		txtJiXing_Click();
	});
});

//初始化下拉选项
function initData(){
	$.ajax({
		url:app.API_URL_HEADER + "/XiGao/InitData",
//	url: "http://localhost:27611/api/XiGao/InitData",
	data: {},
	DataType: "json",
	Type: "post",
	async: false,
	success: function(data) { 
		console.log(JSON.stringify(data));
		if(data.status == 1)
		{
			playerAudio('NG');
			mui.alert(data.message);
			return false;
		}
		
		var dt = data.data;
		console.log(JSON.stringify(data.data));
		$('#dgWOMDAH').datagrid('loadData',dt.tb2);
		userPicker.setData(dt.tb1); //设置数据源
//		userPicker.show(function(items) {
//			$('#txtJiXing').val(items[0]["text"]);
//		});
//		
	},
	error: function(xhr, type, errorThrow) {
		alert("获取数据异常：" + JSON.stringify(errorThrow));
		return;
	}
});
}

//机型点选
function txtJiXing_Click(){
	userPicker.show(function(items) {
			$('#txtJiXing').val(items[0]["text"]);
			$('#txtBarCode').focus();
	});
}

//条码扫描，校验机型是否匹配
function txtBarCode_keyDown(){
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
	$.ajax({
			url:app.API_URL_HEADER + "/XiGao/Check",
//	url: "http://localhost:27611/api/XiGao/Check",
	data:{
		JiXing:$('#txtJiXing').val(),
		BarCode:$('#txtBarCode').val(),
		user_id:user_id,
	},
	DataType: "json",
	Type: "post",
	async: false,
	success: function(data) { 
		console.log(JSON.stringify(data));
		if(data.status == 1)
		{
			playerAudio('NG');
			mui.alert(data.message);
			$('#txtBarCode').val('');
			return false;
		}
		else{
			playerAudio('OK');
			mui.toast(data.message);
			$('#txtBarCode').val('');
			initData();
		}
	},
	error: function(xhr, type, errorThrow) {
		alert("获取数据异常：" + JSON.stringify(errorThrow));
		return;
	}
});
}
