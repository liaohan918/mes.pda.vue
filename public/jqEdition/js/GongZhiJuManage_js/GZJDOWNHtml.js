/**
 * 作者：G98138 黎锋
 * 日期：2018-09-14
 * 描述：工治具下线
 */
// = = = = = = = = = = = = = = = = //

$(function(){
	$('#MZJ001').focus();
	$("#infos").height($(window).height() - $("#row001").height() - $("#div001").height());
	
	$('#MZJ001').keydown(function(e){
	if(e.keyCode == 13)
		ScanBarCode_Down();
	
})
});
/**
 * 扫描工治具条码处理：
 * 防呆：
 * ①条码框为空
 * ②工治具条码不存在防呆（SMTMZJ）
 * ③工治具未领用（不在线）防呆（GZJUSE）
 * ④工治具已下线防呆（GZJUSE）
 * 防呆过后：
 * 1.带出工治具信息
 * 2.“下线”按钮：
 *  2.1.领用状态（未上线使用）：线别清空、不需要更新使用次数
 *  2.2.校验状态（已上线使用）：
 *   ①更新工治具总使用次数（GZJUSE）
 *   ②更新工治具总使用次数、保养后使用次数、生产线（SMTMZJ）
 */



function ScanBarCode_Down(){
	if($("#MZJ001").val() == ""){
		playerAudio('NG');
		mui.alert("条码不能为空，请输入!");
		return false;
	}
	    //用户ID
    var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//		var user_id = "admin";//暂时写死，测试
	$.ajax({
			url:app.API_URL_HEADER + "/GZJUSE/ScanBarCode_Down",
//	url: "http://localhost:27611/api/GZJUSE/ScanBarCode_Down",
	data: {
		MZJ001:$("#MZJ001").val(),
		user_id:user_id,
	},
	DataType: "json",
	Type: "post",
	async: false,
	success: function(data) {
		console.log(JSON.stringify(data));
		if(data.status == 1){
			playerAudio('NG');
		    alert(data.message);
		    $("#MZJ001").focus();
		    document.getElementById("MZJ001").select();
			return false;
		}
		playerAudio('OK');
		mui.toast(data.message);
		$("#infos").val(data.data.infos);
		$("#MZJ001").focus();
		document.getElementById("MZJ001").select();
		return true;
	},
	error: function(xhr, type, errorThrown) {
		alert("获取数据异常：" + JSON.stringify(errorThrown));
		return false;
	}
});
};
