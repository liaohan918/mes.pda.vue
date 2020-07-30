/*
作者：黄邦文
时间：2019-05-21
描述：产品管制卡绑定
 */
mui.init();
var PidPrefix = "";
var BidPrefix = "";
var GZKQTY=0;

$(function() {
	$('#dgGrid').datagrid({
		height: $(window).height() - $("#form").height() - $("#divBtn").height()
	});

	getBarcodeRule();

	$('#txtCPBarcode').focus();

	//产品标签(追溯码)扫码
	$('#txtCPBarcode').keydown(function(e) {
		if (e.keyCode != 13) return;
		GetProductLabelData();
	});
	//管制卡号获取
	$('#txtGZKHao').keydown(function(e) {
		if (e.keyCode != 13) return;
		if (mui("#chkbox")[0].checked == true) {
			FreeBindData();
		} else {
			GetRouteCardInfo();
			$('#txtZRSL').focus();
		}
	});

	//装入数量回车后进行绑定
	$('#txtZRSL').keydown(function(e) {
		if (e.keyCode != 13) return;
		BindData();
	});

	$('#btn_clear').click(function() {
		ClearData();
	});
});

/* 扫描追溯码获取列表级产品标签对应的内容*/
function GetProductLabelData() {
	var barCode = $('#txtCPBarcode').val().trim().toUpperCase(); //产品追溯码
	if (barCode.trim() == "") {
		playerAudio("NG");
		alert("条码输入不能为空", {
			verticalAlign: 'center'
		});
		return false;
	}	
	if (barCode.indexOf(PidPrefix) < 0) {
		playerAudio("NG");
		mui.alert("产品条码不合规则");
		return;
	}	
	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/GetBarcodeMSG',
		data: {
			barCode: barCode
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(res) {
			console.log(JSON.stringify(res));
			if (res.status == 0) {
				$('#dgGrid').datagrid('loadData', res.data.tbList);
				$("#txtProductCode").val(res.data.ProductCode); //产品编码
				$("#txtStdPacking").val(res.data.StdPacking); //标准量
				$("#txtCanPacking").val(res.data.CanPacking); //可捆包量
				$("#txtGZKHao").focus();
				playerAudio("OK");
			} else {
				$("#txtProductCode").val(''); //产品编码
				$("#txtStdPacking").val(''); //标准量
				$("#txtCanPacking").val('')//可装入数量
				$('#dgGrid').datagrid('loadData', {
					total: 0,
					rows: []
				});
				$("#txtGZKHao").focus();
				//playerAudio("NG");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$('#txtCPBarcode').val('').focus();
			playerAudio("NG");
		}
	});
}

//绑定数据
function BindData() {
	
	var CPBarcode = $('#txtCPBarcode').val();//追溯码
	var GZKBarcode = $('#txtGZKHao').val();//管制卡号
	var ZRSL = $('#txtZRSL').val();//装入数量
	
	if (CPBarcode.trim() == "") {
		playerAudio("NG");
		alert("请扫描产品标签");
		$("#txtCPBarcode").focus();
		return;
	}
	if (GZKBarcode == '') {
		playerAudio("NG");
		alert('请扫描管制卡号！');
		$("#txtGZKHao").focus();
		return;
	}
	if (ZRSL == '' || ZRSL == 0) {
		playerAudio("NG");
		alert('装入数量不能为空和0！');
		$("#txtZRSL").focus();
		return;
	}
	//装入数量（修改数量）大于管制卡的数量
	if (Number(ZRSL) > Number(GZKQTY)) {
		playerAudio("NG");
		alert('装入数量:' + ZRSL + '不可大于管制卡剩余数量' + GZKQTY + '！');
		$("#txtZRSL").select();
		return;
	}
	
	CanPacking = $("#txtCanPacking").val();
	if (Number(ZRSL) > Number(CanPacking)) {
		playerAudio("NG");
		alert('装入数量:' + ZRSL + '不可大于待装入数量' + CanPacking + '！');
		$("#txtZRSL").select();
		return;
	}
		

	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/BindPLabelAndGZK',
		data: {
			CPBarcode: CPBarcode,
			GZKBarcode: GZKBarcode,
			ZRSL: ZRSL,
			LoginUser: app.userid()
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(res) {
			if (res.status == 0) {
				console.log(JSON.stringify(res));
				GetProductLabelData();
				//可装入数=装入数
				if (CanPacking == ZRSL) {
					ClearData();
				}
				$("#txtGZKHao").val('');
				$("#txtZRSL").val('');
				playerAudio("OK");
			} else {
				mui.toast(res.message);
				$("#txtZRSL").select();
				playerAudio("NG");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$("#txtZRSL").select();
			playerAudio("NG");
		}
	});
}


/*获取流程卡信息*/
function GetRouteCardInfo() {
	var txtProductCode = $('#txtProductCode').val(); //产品编码
	var CPBarcode = $('#txtCPBarcode').val(); //追溯码
	var GZKBarcode = $('#txtGZKHao').val(); //管制卡号

	if (CPBarcode.trim() == "") {
		playerAudio("NG");
		alert("请扫描产品标签");
		$("#txtCPBarcode").focus();
		return;
	}
	if (GZKBarcode == '') {
		playerAudio("NG");
		alert('请扫描管制卡号！');
		$("#txtGZKHao").focus();
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/GetRouteCard',
		data: {
			GZKBarcode: GZKBarcode,
			ProductCode: txtProductCode
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if (res.status == 0) {
				console.log(JSON.stringify(res));
				if (txtProductCode == "") {
					$("#txtProductCode").val(res.data.ProductCode); //产品编码
					$("#txtStdPacking").val(res.data.StdPacking); //标准量
					$("#txtCanPacking").val(res.data.CanPacking); //可捆包量
				}
				GZKQTY=res.data.GZKQty;
				$("#txtZRSL").val(res.data.GZKQty); //管制卡数量
				$("#txtZRSL").select();
				$("#txtZRSL").focus();
				playerAudio("OK");
			} else {
				mui.alert(res.message);
				$("#txtGZKHao").val('');
				$("#txtZRSL").val('');
				playerAudio("NG");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$("#txtGZKHao").select();
			playerAudio("NG");
		}
	});
}



//解绑管制卡数据
function FreeBindData() {
	var CPBarcode = $('#txtCPBarcode').val();
	var GZKBarcode = $('#txtGZKHao').val();
	var ZRSL = $('#txtZRSL').val();
	if (CPBarcode.trim() == "") {
		playerAudio("NG");
		alert("请扫描产品标签");
		$("#txtCPBarcode").focus();
		return;
	}
	if (GZKBarcode == '') {
		playerAudio("NG");
		alert('请扫描管制卡号！');
		$("#txtGZKHao").focus();
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/FreeBindData',
		data: {
			CPBarcode: CPBarcode,
			GZKBarcode: GZKBarcode,
			ZRSL: ZRSL
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if (res.status == 0) {
				console.log(JSON.stringify(res));
				// mui("#chkbox")[0].checked = false;
				GetProductLabelData();
				$("#txtGZKHao").val('');
				$("#txtZRSL").val('');
				playerAudio("OK");
			} else {
				mui.toast(res.message);
				$("#txtGZKHao").select();
				playerAudio("NG");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$("#txtGZKHao").select();
			playerAudio("NG");
		}
	});
}


/* 获取条码生成规则 */
function getBarcodeRule() {
	$.ajax({
		url: app.API_URL_HEADER + '/PackingBoxBind/GetRule',
		data: "",
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				PidPrefix = resdata.data.PidPrefix;
				BidPrefix = resdata.data.BidPrefix;
			}
		}
	})
}

function ClearData() {
	$("#form input").val("");
	$('#dgGrid').datagrid('loadData', {
		total: 0,
		rows: []
	});
	$("#chkbox").attr("checked", false);
	$('#txtCPBarcode').val('').focus();
}
