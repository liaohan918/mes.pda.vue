var userId;

mui.plusReady(function(){
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
    userId = currentSession.user_id;
});

$(function(){
	$('#workBillNo').focus();
	$('#info').height($(window).height() - $("#head").height() - $("#bottom").height());
	//条码回车显示明细
	$('#barCode').keydown(function(e){
		if(e.keyCode != 13)
			return;
		var workBillNo = $('#workBillNo').val();//生产指令
		var barCode = $('#barCode').val();//条码
		if(workBillNo.trim() == ""){
			mui.toast("请输入指令单号");
			return;
		}
		if(barCode.trim() == ""){
			mui.toast("请扫描物料条码");
			return;
		}
		$.ajax({
			url:app.API_URL_HEADER + "/Blanking/getBarCodeInfo",
			data: {
				workBillNo:workBillNo,
				barCode:barCode,
			},
			DataType: "json",
			Type: "post",
			async: false,
			success: function(resData) {
				if(resData.status == 1){
					mui.toast(resData.message);
					playerAudio('NG');
					return;
				}
				var dt = resData.data[0];
				var info = "物料名称"+ dt.MBA002 + "\r" 
						+  "分区："+dt.BND006 + "\r"
						+  "站位："+dt.BND007 + "\r"
						+  "条码数量："+dt. DAB006;
				$('#barCodeInfo').val(info);//条码信息
				$('#reNum').val(dt.DAH025);//剩余数量
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				return false;
			}
		})
	});
		
	//输入数量回车更新
	$('#reNum').keydown(function(e){
		if(e.keyCode != 13)
			return;
		commit();
	});	
});

//提交更新
function commit(){	
	var workBillNo = $('#workBillNo').val();//生产指令
	var barCode = $('#barCode').val();//条码
	var reNum = $('#reNum').val();//剩余数量
	if(workBillNo.trim() == ""){
		mui.toast("请输入指令单号");
		$('#workBillNo').focus();
		playerAudio('NG');
		return;
	}
	if(barCode.trim() == ""){
		mui.toast("请扫描物料条码");
		$('#barCode').focus();
		playerAudio('NG');
		return;
	}
	if(!/^\d+$/.test(reNum)){
	 	mui.toast("剩余数量必须为整数");
	 	$('#reNum').val("");
		$('#reNum').focus();
		playerAudio('NG');
		return;
	}
	if(reNum < 0){
		mui.toast("剩余数量必须大于0");
		$('#reNum').val("");
		$('#reNum').focus();
		playerAudio('NG');
		return;
	}
	$.ajax({
		type:"post",
		url:app.API_URL_HEADER + "/Blanking/commit",
		data : {
			workBillNo:workBillNo,
			barCode:barCode,
			reNum:reNum,
			userId : userId
		},
		async:true,
		success:function(resdata){
			if(resdata.status == 1){
				mui.toast(resdata.message);
				playerAudio('NG');
				return;
			}
			$('#workBillNo').val();
			$('#barCode').val();
			$('#reNum').val();
			$('#barCodeInfo').val();
			playerAudio('OK');
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
				return false;
		}
	});
}
