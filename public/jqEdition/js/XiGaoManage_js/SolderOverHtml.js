/*
作者：黄邦文
时间：2018-10-05
描述：锡膏用毕
 */
mui.init();

$(function() {
	//扫描条码的处理
	$('#txtBarcode').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			playerAudio('NG');
			alert("条码输入不能为空", {
				verticalAlign: 'center'
			});
			return false;
		}
		
		$.ajax({
			url: app.API_URL_HEADER + '/XiGao/GetUseOverBarcodeMsg',
			data: {
				Barcode: barCode
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				//console.log(JSON.stringify(res));
				//mui("#info")[0].value = data.data;
				if(res.status == 0) {
					var dt1 = $.parseJSON(res.data);
					if(dt1.length > 0) {
						playerAudio('OK');
						var msg = "条码：" + dt1[0]["Barcode"] + "\n";
						msg = msg + "数量：" + dt1[0]["KC"] + "\n";
						msg = msg + "物料编码：" + dt1[0]["WLBM"] + "\n";
						msg = msg + "物料名称：" + dt1[0]["WLMC"] + "\n";
						msg = msg + "规格：" + dt1[0]["WLGG"] + "\n";
						msg = msg + "开始领用时间：" + dt1[0]["KaiShiTime"] + "\n";
						msg = msg + "已回温次数：" + dt1[0]["BanBen"] + "\n";
						msg = msg + "最大回温次数：" + dt1[0]["MaxCiShu"] + "\n";
						msg = msg + "当前状态：" + dt1[0]["statu"] + "\n";
						$('#info').val(msg);
					} else {
						playerAudio('NG');
						mui.toast('此条码未进行回温或已用毕！');
						$('#info').val('');
						$('#txtBarcode').val('').focus();
					}
				} else {
					playerAudio('NG');
					mui.toast('此条码未进行回温或已用毕！');
					$('#txtBarcode').val('').focus();
					$('#info').val('');
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio('NG');
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
	
	$('#btn_ok').click(function() {
		//更新用毕数据
		UpdateUseOver();
	});
	$('#btn_clear').click(function() {
		ClearData();
	});	
});

//更新冷冻数据
function UpdateUseOver() {	
	var info = $('#info').val();
	var barcode = $('#txtBarcode').val();
	
	if(info == '') {
		playerAudio('NG');
		alert('请扫描条码！');
		$('#txtBarcode').focus();
		return;
	}
		var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		var user_id = currentSession.user_id;
//	var user_id = 'noid';
	$.ajax({
		url: app.API_URL_HEADER + '/XiGao/UpdateUseOver',
		data: {
			Barcode: barcode,
			LoginUser: user_id
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == '0') {
				playerAudio('OK');
				ClearData();
				$('#txtBarcode').focus();
				mui.toast('锡膏用毕成功!');
			}
			else
			{
				playerAudio('NG');
				ClearData();
				$('#txtBarcode').focus();
				mui.toast('锡膏用毕失败'+resdata.message+'!');
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function ClearData() {
	$('#info').val('');
	$('#txtBarcode').val('').focus();

}