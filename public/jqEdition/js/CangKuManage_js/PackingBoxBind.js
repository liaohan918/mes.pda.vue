/*
作者：DZP
时间：2019-05-25
描述：装箱绑定
 */
var PidPrefix = ""; //产品标签前缀
var BidPrefix = ""; //箱标签前缀

$(function() {
	$('#tblist').height($(window).height() - $("#form").height() - $("#divBtn").height());
	$('#dgGrid').datagrid({
		height: $(window).height() - $("#form").height() - $("#divBtn").height()
	});
	$('#txtBoxBarCode').focus();
	//获取标签生成规则
	getBarcodeRule();
	//箱标签回车事件
	$('#txtBoxBarCode').keydown(function(e) {
		if(e.keyCode != 13) return;
		getBoxBarCode();
	});
	//产品标签回车事件
	$('#txtProductBarCode').keydown(function(e) {
		if(e.keyCode != 13) return;
		getProductBarCode(function() {
			BindProductToBox();
		});

	});

	$('#btn_clear').click(function() {
		ClearData();
	});

	// 	$('#btn_ok').click(function() {
	// 		BindProductToBox();
	// 	});
	// 	$('#chkbox').change(function() {
	// 		if ($("#chkbox").prop("checked") == true) {
	// 			$("#btn_ok").text("解绑");
	// 		} else {
	// 			$("#btn_ok").text("绑定");
	// 		}
	// 	});
});

/* 获取条码生成规则 */
function getBarcodeRule() {
	$.ajax({
		url: app.API_URL_HEADER + '/PackingBoxBind/GetRule',
		data: "",
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				PidPrefix = resdata.data.PidPrefix;
				BidPrefix = resdata.data.BidPrefix;
			}
		}
	})
}

/* 获取箱条码信息 */
function getBoxBarCode() {
	var BoxBarCode = $("#txtBoxBarCode").val();
	if(BoxBarCode.indexOf(BidPrefix) < 0) {
		playerAudio("NG");
		mui.toast("箱条码不合规则");
		$("#txtBoxBarCode").val('').focus();
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/PackingBoxBind/GetBARDAB',
		//		url: "http://localhost:27611/api" + '/PackingBoxBind/GetBARDAB',
		data: {
			BarCode: BoxBarCode,
			qType: "B", //B，代表box
			unBind: ($("#chkbox").prop("checked") == true) ? "Y" : "N"
		},
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				playerAudio("NG");
				mui.alert(resdata.message);
				return;
			} else {
				$('#dgGrid').datagrid('loadData', resdata.data.tbList);
				$("#txtProductCode").val(resdata.data.ProductCode); //产品编码
				$("#txtStdPacking").val(resdata.data.StdPacking); //标准量
				$("#txtCanPacking").val(resdata.data.CanPacking); //可捆包量
				$("#txtProductBarCode")[0].focus();
				playerAudio("OK");
			}
		}
	})
}

function getProductBarCode(callback) {
	var ProductBarCode = $("#txtProductBarCode").val();
	if(ProductBarCode.indexOf(PidPrefix) < 0 || ProductBarCode.length > 14) {
		playerAudio("NG");
		mui.alert("产品条码不合规则");
		$("#txtProductBarCode").val('');
		return;
	}
	if($("#txtBoxBarCode").val() == "") {
		mui.alert("箱标签为空");
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/PackingBoxBind/GetBARDAB',
		//		url: "http://localhost:27611/api" + '/PackingBoxBind/GetBARDAB',
		data: {
			BarCode: ProductBarCode,
			qType: "P", //B，代表Product
			unBind: ($("#chkbox").prop("checked") == true) ? "Y" : "N"
		},
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				playerAudio("NG");
				mui.alert(resdata.message);
				$("#txtProductBarCode").val("");
				return;
			} else {
				var productcode = resdata.data.ProductCode;
				if($.trim(productcode) != $.trim($("#txtProductCode").val())) {
					mui.alert("产品不符");
					playerAudio("NG");
					$("#txtProductBarCode").val("");
					$("#txtProductBarCode").focus();
					return;
				}
				$("#txtProductQty").val(resdata.data.ProductQty);
				$("#btn_ok").focus();
				playerAudio("OK");

				if(typeof callback == "function") {
					callback();
				}
			}
		}
	})
}

function BindProductToBox() {
	var ProductBarCode = $("#txtProductBarCode").val();
	if(ProductBarCode.indexOf(PidPrefix) < 0 || ProductBarCode.length > 14) {
		playerAudio("NG");
		mui.alert("产品条码不合规则");
		$("#txtProductBarCode").val('');
		return;
	}
	if($("#txtBoxBarCode").val() == "") {
		mui.alert("箱标签为空");
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/PackingBoxBind/BindPackingBox',
		// 		url: "http://localhost:27611/api" + '/PackingBoxBind/BindPackingBox',
		data: {
			BoxBarCode: $("#txtBoxBarCode").val(),
			StdPacking: $("#txtStdPacking").val(),
			ProductCode: $("#txtProductCode").val(),
			ProductBarCode: $("#txtProductBarCode").val(),
			ProductQty: $("#txtProductQty").val(),
			UserID: app.userid(),
			unBind: ($("#chkbox").prop("checked") == true) ? "Y" : "N"
		},
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				$("#txtBoxBarCode").val('');
				$("#txtBoxBarCode").focus();
				playerAudio("NG");

				$("#txtBoxBarCode").val(''); //箱标签
				$("#txtProductCode").val(''); //产品编号
				$("#txtStdPacking").val(''); //标准量
				$("#txtCanPacking").val(''); //可装量
				$("#txtProductBarCode").val(''); //产品标签
				$("#txtProductQty").val(''); //标签数量
				$("#txtProductBarCode").val(''); //产品标签
				return;
			} else {
				if(resdata.data.CanPacking <= 0) {
					ClearData();
					$("#txtBoxBarCode")[0].focus();
					return;
				}
				$('#dgGrid').datagrid('loadData', resdata.data.tbList);
				$("#txtProductCode").val(resdata.data.ProductCode); //产品编码
				$("#txtStdPacking").val(resdata.data.StdPacking); //标准量
				$("#txtCanPacking").val(resdata.data.CanPacking); //可捆包量
				$("#txtProductBarCode")[0].focus();
				$("#txtProductBarCode").val('');
				playerAudio("OK");
			}
		}
	})
}

/* 清空数据 */
function ClearData() {
	$("#form input").val("");
	$('#dgGrid').datagrid('loadData', {
		total: 0,
		rows: []
	});
	$("#chkbox").attr("checked", false);
}