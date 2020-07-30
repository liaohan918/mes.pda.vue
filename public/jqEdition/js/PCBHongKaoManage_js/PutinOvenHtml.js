/*
作者：吴冰荣
时间：2018-09-14
描述：放入烤箱
 */
mui.init();

$(function() {
	$('#txtInfo').height($(window).height() - $("#txt1").height() - $("#txt2").height() - $("#divBtnStartBake").height() - 18);	
//	$("#btnStartBake").attr("disabled", true);
	
	var userPicker = new mui.PopPicker();
	//获取烤箱编码
	$.ajax({
		url: app.API_URL_HEADER + '/PutinOven/BindBOXInfo',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = resdata.data;
			userPicker.setData(dt);
			//赋值烤箱编码
			$('#cbbOvenInfo').val(dt[0]['value']);
			$('#txtReelID').focus();
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择烤箱编码
	$('#cbbOvenInfo').click(function() {
		userPicker.show(function(items) {
			$('#cbbOvenInfo').val(items[0]['value']);
			$('#txtReelID').focus();
			//返回 false 可以阻止选择框的关闭
			//return false;
		});

	});

	$('#txtReelID').keyup(function(event) {
		//回车
		if(event.keyCode == "13") {
			var tmpTxtReelID = mui('#txtReelID')[0].value;
			if(tmpTxtReelID == "") {
				return;
			}
			$.ajax({
				url: app.API_URL_HEADER + "/PutinOven/TxtReelIDKeyPress",
				data: {
					Reelid: tmpTxtReelID
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: true, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						alert("警告：" + data.message);
					}else{
						$('#txtRegInfo').val(data.message);
						$("#btnStartBake").attr("disabled", false);
					}
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					//console.log(errorThrown);
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
				}
			});
		}
	});
});

//开始烘烤
function btnStartBake_Click() {
	var tmpCbbOvenInfo = mui('#cbbOvenInfo')[0].value;
	if(tmpCbbOvenInfo == ""){
		alert("请选择烤箱编码，再进行操作~");
		return;
	}
	var tmpTxtReelID = mui('#txtReelID')[0].value;
	if(tmpTxtReelID == "") {
		alert("请扫描物料条码，再进行操作~");
		return;
	}
	
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "G90567";
	
	$.ajax({
		url: app.API_URL_HEADER + "/PutinOven/BtnStartBakeClick",
		data: {
			Reelid : tmpTxtReelID,
			CbbOvenInfo : tmpCbbOvenInfo,
			LoginID : user_id
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				alert("警告：" + data.message);
			}else{
				$("#btnStartBake").attr("disabled", true);
				mui.toast("操作成功~");
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}