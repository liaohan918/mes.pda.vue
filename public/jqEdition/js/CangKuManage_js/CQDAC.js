mui.plusReady(function(e){
	// $('#barinfo').height($(window).height() - $("#info").height() - $('#ShengYuinfo').height() - 110);
});

$(function() {
	$('#barinfo').height($(window).height() - $("#info").height() - $('#ShengYuinfo').height() - 110);
	
	/**
	 * 条码回车事件
	 */
	document.getElementById('txtBarCode').addEventListener('keydown', function(e) {
		if(e.keyCode != 13) return;
		var barcode = document.getElementById('txtBarCode').value
		var checked = mui("#checkdefault")[0].checked
		GetInfoFromBarCode(barcode, checked);
	});
	/**
	 * 库位回车事件
	 */
	document.getElementById('txtKuWei').addEventListener('keydown', function(e) {
		if(e.keyCode != 13) return;
		ReturnInStockKW();
	});
	mui("#txtBarCode")[0].focus();
});

function GetNoFinishBarcodeCount() {
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/CQTEA/GetNoFinishBarcodeCount',
		data: {
			// BillNo: BillNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			$("#ShengYuinfo").val(resdata.message);
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}
//退料入库
function ReturnInStockKW() {
	var user_id = app.userid;
	var BarCode = $("#txtBarCode").val();
	var KuWei = $("#txtKuWei").val();
	
	if(BarCode == "") {
		mui.toast("条码不能为空，请扫描条码！");
		$("#txtBarCode").focus();
		return;
	} 
	if(KuWei == "") {
		mui.toast("库位不能为空，请扫描库位！");
		$("#txtKuWei").focus();
		return;
	}

	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/CQTEA/ReturnInStockKW',
		data: {
			LoginID: user_id,
			KuWei: KuWei,
			BarCode: BarCode
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				playerAudio("NG");
				mui.alert(resdata.message);
				$("#txtBarCode").val("");
				$("#txtBarCode").focus();
				return;
			} else if(resdata.status == 0) {
				playerAudio("OK");
				mui.toast("条码" + $("#txtBarCode").val() + "返库成功");
				console.log(JSON.stringify(resdata));
				$("#ShengYuinfo").val(resdata.message);
				$("#txtBarCode").val("");
				$("#txtBarCode").focus();
			} else {
				playerAudio("NG");
				mui.toast(resdata.message);
				$("#txtKuWei").val("");
				$("#txtKuWei").focus();
			}

		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}

function GetInfoFromBarCode(BarCode, isDefault) {
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/CQTEA/GetInfoFromBarCode',
		data: {
			BarCode: BarCode
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				$("#txtBarCode").val("");
				$("#txtBarCode").focus();
				return;
			} else {
				console.log(JSON.stringify(resdata));
				if(resdata.data!='')
				{
					mui.toast('该条码已经返库了,无需要再返库');
					$("#barinfo").val(resdata.message);
					$("#txtBarCode").val("");
					$("#txtBarCode").focus();
				}else{
					$("#barinfo").val(resdata.message);
					//如果点了默认库位并且库位正确就可以直接入库
					if($("#checkdefault")[0].checked == true) {
						ReturnInStockKW();
					} else {
						GetNoFinishBarcodeCount();
						$("#txtKuWei").val("").focus();
					}
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}