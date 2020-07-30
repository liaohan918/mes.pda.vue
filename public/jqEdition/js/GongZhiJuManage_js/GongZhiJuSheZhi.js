/**
 * 作者：G98138 黎锋
 * 日期：2019-08-02
 * 描述：工治具机型关系维护
 */

var userPicker;
$(function(){
	userPicker = new mui.PopPicker(); //声明对象
	initData();
	
	$('#txtJiXing').click(function(e){
		txtJiXing_Click();
	});
	
	$('#txtBarCode').keydown(function(e){
		if(e.keyCode !=13)
		    return;
	    txtBarCode_keyDown();
	});
	
	$('#txtKuWei').keydown(function(e){
		if(e.keyCode !=13)
		    return;
	    txtKuWei_keyDown();
	});
	
	$('#btnOk').click(function(e){
		btnOk_Click();
	});
});

//初始化数据
function initData(){
	$.ajax({
		url:app.API_URL_HEADER + "/GongZhiJuSheZhi/InitData",
//	url: "http://localhost:27611/api/GongZhiJuSheZhi/InitData",
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
			userPicker.setData(dt); //设置数据源
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
			$('#txtBarCode').val('').focus();
			gangWangList($('#txtJiXing').val());
	});
	
}

//获取当前机型的钢网列表
function gangWangList(jixing){
	$.ajax({
		url:app.API_URL_HEADER + "/GongZhiJuSheZhi/GangWangList",
//	url: "http://localhost:27611/api/GongZhiJuSheZhi/GangWangList",
		data: {
			JiXing:jixing,
		},
		DataType: "json",
		Type: "post",
		async: false,
		success: function(data) { 
			playerAudio('OK');
			console.log(JSON.stringify(data));
			$('#dgINVGZJ').datagrid('loadData',data.data);
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
			return;
		}
	});
}

//扫描钢网条码
function txtBarCode_keyDown(){
	$.ajax({
		url:app.API_URL_HEADER + "/GongZhiJuSheZhi/BarCode_keyDown",
//	url: "http://localhost:27611/api/GongZhiJuSheZhi/BarCode_keyDown",
		data: {
			BarCode:$('#txtBarCode').val(),
		},
		DataType: "json",
		Type: "post",
		async: false,
		success: function(data) { 
			console.log(JSON.stringify(data));
			if(data.status == 1)
			{
				playerAudio('NG');
				$('#txtBarCode').val('');
				mui.alert(data.message);
				return false;
			}
			$('#txtKuWei').val(data.data);
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
			return;
		}
	});
}

//扫描库位
function txtKuWei_keyDown() {
	$.ajax({
		url:app.API_URL_HEADER + "/GongZhiJuSheZhi/KuWei_keyDown",
//	url: "http://localhost:27611/api/GongZhiJuSheZhi/KuWei_keyDown",
		data: {
			KuWei:$('#txtKuWei').val(),
		},
		DataType: "json",
		Type: "post",
		async: false,
		success: function(data) { 
			console.log(JSON.stringify(data));
			if(data.status == 1)
			{
				playerAudio('NG');
				$('#txtKuWei').val('');
				mui.alert(data.message);
				return false;
			}
			playerAudio('OK');
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
			return;
		}
	});
}

//点击确认按钮
function btnOk_Click(){
	var itemValue = getRadioRes('simple-radio');
	if($('#txtJiXing').val() == ""){
		playerAudio('NG');
		alert("机型不能为空！");
		return;
	}
	if($('#txtBarCode').val() == ""){
		playerAudio('NG');
		alert("钢网条码不能为空！");
		return;
	}
	if($('#txtKuWei').val() == ""){
		playerAudio('NG');
		alert("库位不能为空！");
		return;
	}
	if(itemValue == ""){
		playerAudio('NG');
		alert("请选择版面标识！");
		return;
	}
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
	$.ajax({
		url:app.API_URL_HEADER + "/GongZhiJuSheZhi/BtnOk_Click",
//	url: "http://localhost:27611/api/GongZhiJuSheZhi/BtnOk_Click",
		data: {
			JiXing:$('#txtJiXing').val(),
			BarCode:$('#txtBarCode').val(),
			KuWei:$('#txtKuWei').val(),
			ItemValue:itemValue,
			user_id:user_id
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
				return false;
			}else{
				playerAudio('OK');
				mui.toast(data.message);
			}
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
			return;
		}
	});
	
}

//获取单选按钮的值
function getRadioRes(className){
	var rdsObj = document.getElementsByClassName(className);
	var checkVal = new Array();
	var k = 0;
	for(i = 0; i < rdsObj.length; i++){
		if(rdsObj[i].checked){
		checkVal[k] = rdsObj[i].value;
		k++;
		}
	}
	return checkVal;
}


