/**
 * 作者：G98138 黎锋
 * 日期：2018-09-14
 * 描述：工治具归还仓库
 */

$(function(){
	$("#MZJ001").focus();
	$("#info").height($(window).height() - $("#row001").height() - $("#row002").height() - 80);
	
	$('#MZJ001').keydown(function(e){
		if(e.keyCode == 13){
			ScanBarCode_Return();
		}
	})
	
	$('#MZJ013').keydown(function(e){
		if(e.keyCode == 13){
			BingStore();
		}
	})
});
/**
 * 扫描工治具条码，带出工治具信息
 */
function ScanBarCode_Return() {
		if($("#MZJ001").val() == "") {
			playerAudio('NG');
			alert("请先扫描工治具条码！");
			return false;
		}
		//用户ID
		var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		var user_id = currentSession.user_id;
//		var user_id = "admin"; //暂时写死，测试
		$.ajax({
			url: app.API_URL_HEADER + "/GZJUSE/ScanBarCode_Return",
//			url:"http://localhost:27611/api/GZJUSE/ScanBarCode_Return",
			data: {
				MZJ001: $("#MZJ001").val(),
				user_id: user_id
			},
			DataType: "json",
			Type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				if(data.status == 1) {
					playerAudio('NG');
					mui.toast(data.message);
					//ui.alert(data.message);
					$("#MZJ001").focus();
					document.getElementById("MZJ001").select();
					$("#info").val("");
					return false;
				}
				playerAudio('OK');
				$("#MZJ013").focus();
				document.getElementById("MZJ013").select();
				$("#info").val(data.data.gzjInfo);
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				return false;
			}
		});
};
/**
 * 扫描库位条码，绑定库位
 */
function BingStore() {
		if($("#MZJ001").val() == "") {
			playerAudio('NG');
			alert("请先扫描工治具条码！");
			$("#MZJ001").focus();
			return false;
		}
		if($("#MZJ013").val() == "") {
			alert("请先扫描库位条码！");
			$("#MZJ013").focus();
			return false;
		}
		//用户ID
		var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		var user_id = currentSession.user_id;
//		var user_id = "admin"; //暂时写死，测试
		$.ajax({
			url:app.API_URL_HEADER + "/GZJUSE/BingStore",
//			url: "http://localhost:27611/api/GZJUSE/BingStore",
			data: {
				MZJ001: $("#MZJ001").val(),
				MZJ013: $("#MZJ013").val(),
				user_id: user_id,
			},
			DataType: "json",
			Type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				if(data.status == 1) {
					playerAudio('NG');
					alert(data.message);
					$("#MZJ013").focus();
					document.getElementById("MZJ013").select();
					return false;
				} else {
					playerAudio('OK');
					mui.toast(data.message);
					$("#MZJ001").focus();
					document.getElementById("MZJ001").select();
					$("#MZJ013").val("");
					$("#info").val("");
					return true;
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio('NG');
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				return false;
			}
		});
};