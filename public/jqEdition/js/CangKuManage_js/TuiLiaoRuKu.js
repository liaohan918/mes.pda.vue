//var userPicker;
//var billDate;
var BillNo = '';

mui.plusReady(function(e){
	$('#barinfo').height($(window).height() - $("#info").height() - $('#ShengYuinfo').height() - 110);
});

$(function() {
	//DateInit();
	//document.getElementById('BillDate').value = billDate;
	
	/**
	 * 申领单点击事件
	 */
	//userPicker = new mui.PopPicker();

//	$('#BillNo').click(function() {
//		GetBillNobyClick()
//	});

	/**
	 * 日期切换事件
	 */
//	document.getElementById('BillDate').addEventListener('tap',
//		function(e) {
//			ChangeDate(e);
//		});
	/**
	 * 条码回车事件
	 */
	document.getElementById('txtBarCode').addEventListener('keydown', function(e) {
		if(e.keyCode != 13) return;
		var barcode = document.getElementById('txtBarCode').value
		var checked = mui("#checkdefault")[0].checked
		//var BillNo = document.getElementById('BillNo').value
		//GetInfoFromBarCode(BillNo, barcode, checked);
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
/** 
 * {选择交易日期}
 */
//function ChangeDate(e) {
//	var result = mui("#BillDate")[0];
//	var picker = new mui.DtPicker({
//		type: 'date'
//	});
//	picker.show(function(rs) {
//		result.value = rs.text;
//		//		result.value = "2018-08-15"; 
//		picker.dispose();
//		billDate = result.value;
//		GetBillNoList();
//	});
//};

/**
 * 订单选中事件
 */
//function GetBillNobyClick() {
//	userPicker.show(function(items) {
//		$('#BillNo').val(items[0]['value']);
//		GetNoFinishBarcodeCount(items[0]['value']);
//	});
//	$("#barinfo").val('');
//	$("#txtKuWei").val('');
//	$("#txtBarCode").val('').focus();
//	
//}

/**
 * {获取日期}
 */
//function DateInit() {
//	var dateTime = GetSysDateTime();
//	CurdateTime = dateTime;
//	DateTemp = new Date(dateTime.replace(/-/g, "/"));
//	billDate = formatDate(DateTemp);
//	GetBillNoList();
//}

/**
 * 获取当天所有的领料单
 */
//function GetBillNoList() {
//	$.ajax({
//		url: app.API_URL_HEADER + '/TuiLiaoRuKu/GetBillNoList',
//		data: {
//			date: billDate
//		},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			if(resdata.status == 1) {
//				mui.alert(resdata.message);
//				return false;
//			} else {
//				console.log(JSON.stringify(resdata));
//				tbBillNos = $.parseJSON(resdata.data);
//				if(tbBillNos.length > 0) {
//					$('#BillNo').val(tbBillNos[0]['value']);
//					userPicker.setData(tbBillNos);
//					GetNoFinishBarcodeCount(tbBillNos[0]['value']);
//					$("#txtBarCode").focus();
//				}
//				else
//				{
//					userPicker.setData($.parseJSON(resdata.data));
//					$('#BillNo').val("");
//					$('#txtBarCode').val("");
//					$('#txtKuWei').val("");
//				}
//				return true;
//			}
//		},
//		error: function(xhr, type, errorThrown) {
//			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
//			return false;
//		}
//	});
//}

function GetNoFinishBarcodeCount(BillNo) {
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/TuiLiaoRuKu/GetNoFinishBarcodeCount',
		data: {
			BillNo: BillNo
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
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	console.log(JSON.stringify(currentSession));
	var user_id = currentSession.user_id;
	var BarCode = $("#txtBarCode").val();
	var KuWei = $("#txtKuWei").val();
	if(BillNo == "") {
		mui.toast("退料单号不能为空，请选择单号！");
		return;
	}
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
		url: app.API_URL_HEADER + '/TuiLiaoRuKu/ReturnInStockKW',
		data: {
			LoginID: user_id,
			KuWei: KuWei,
			BillNo: BillNo,
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
				mui.toast("条码" + $("#txtBarCode").val() + "退料成功");
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
		url: app.API_URL_HEADER + '/TuiLiaoRuKu/GetInfoFromBarCode',
		data: {
			//BillNo: BillNo,
			BarCode: BarCode,
			isDefault: isDefault
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
				BillNo=resdata.data;
				$("#barinfo").val(resdata.message);
				//如果点了默认库位并且库位正确就可以直接入库
				if($("#checkdefault")[0].checked == true) {
					ReturnInStockKW();
				} else {
					GetNoFinishBarcodeCount(BillNo);
					$("#txtKuWei").val("").focus();
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}