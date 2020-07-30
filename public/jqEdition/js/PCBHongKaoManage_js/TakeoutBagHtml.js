/*
作者：吴冰荣
时间：2018-09-17
描述：封包(结束烘烤)
 */
mui.init();
$(function() {

	//	$("#btnCanleBake").attr("disabled", false);
	$('#txtReelID').focus();

	$('#txtReelID').keyup(function(event) {
		//回车
		if(event.keyCode == "13") {
			var tmpTxtReelID = mui('#txtReelID')[0].value;
			if(tmpTxtReelID == "") {
				return;
			}
			
			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var user_id = currentSession.user_id;
//			var user_id = "G90567";			
			$.ajax({
				url: app.API_URL_HEADER + "/PutinOven/TakeoutBagTxtReelIDKeyPress",
				data: {
					Reelid: tmpTxtReelID,
					isAdvanceTakeout : mui('#stateType')[0].checked(),
					LoginID : user_id
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: true, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						alert("警告：" + data.message);
					} else {
//						$("#btnCanleBake").attr("disabled", false);
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

//取消烘烤
function btnCanleBake_Click() {
	var tmpTxtReelID = mui('#txtReelID')[0].value;
	if(tmpTxtReelID == "") {
		return;
	}
	
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "G90567";
	
	$.ajax({
		url: app.API_URL_HEADER + "/PutinOven/BtnCanleBakeClick",
		data: {
			Reelid: tmpTxtReelID,
			LoginID : user_id,
			isAdvanceTakeout : mui("#stateType")[0].checked
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				alert("警告：" + data.message);
			} else {
//				$("#btnCanleBake").attr("disabled", true);
				mui.toast("取消烘烤成功~");
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
//	 	mui.toast("操作成功~");
	// 	$("#btnCanleBake").attr("disabled", false);
}