/*
作者：黄邦文
时间：2019-02-21
描述：工序报工--工序录入
 */
mui.init();
var curGXID = 'G006';
var curGXMC = '内箱核对';
var curStartShu;
var curZYRY = app.userid;
var curSBBM;
var curCXBM;
var curCXMC;
var checkZYRY;
var checkSBBM;
var checkCXBM;
var isFirstGX = false;
mui.plusReady(function(e) {
	$('#dgSCMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50,
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
		},
	});
	$('#divTxtInfo').height($(window).height() - $("#item1").height() - 50);
	
});

$(function() {
	$("#txtCurGX").html("当前工序是：" + curGXMC);
	$("#txtCurGXID").html(curGXID);
	$('#txtBarcodeCP').focus();
	//获取人员
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetRenYuan',
		data: {
			RenYuan: curZYRY
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			$("#txtZuoYeRenYuan").val(resdata.data);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});

	// $('#dgSCMX').datagrid({
	// 	height: $(window).height() - $("#item1").height() - 50,
	// 	onSelect: function(rowIndex, rowData) {
	// 		if(!rowData)
	// 			return;
	// 	},
	// });
	// $('#divTxtInfo').height($(window).height() - $("#item1").height() - 50);

	//扫描
	$('#txtBarcodeCP').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeCPInfo',
			data: {
				BarcodeCP: $('#txtBarcodeCP').val()
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					console.log(JSON.stringify(resdata));
					dt = $.parseJSON(resdata.data.CPInfo);
					if(dt.length > 0) {
						var row = dt[0];
						if(row.QAB020 == $("#txtCurGXID").html()) {
							playerAudio("OK");

							var m = "指令单号：" + row.QAB003 + 
								"\n数量:" + row.QAB017 +
								"\n产品编码：" + row.QAB005 +
								"\n产品名称：" + row.QAB006 +
								"\n产品规格：" + row.QAB007 +
								"\n前一工序：" + row.QAB010 + 
								"\n当前工序：" + row.QAB021;
							$('#txtInfo').val(m);
							$('#txtLineName').val(row.MIH004);
							$("#txtBarcodeHG").val('').focus();
							$('#dgSCMX').datagrid('loadData', $.parseJSON(resdata.data.ShengChanInfo));
						} else if(confirm('当前条码下一工序应为：[' + row.QAB021 + ']，是否仅查询信息！')) {
							var m = "指令单号：" + row.QAB003 + 
							    "\n数量:" + row.QAB017 +
								"\n产品编码：" + row.QAB005 +
								"\n产品名称：" + row.QAB006 +
								"\n产品规格：" + row.QAB007 +
								"\n前一工序：" + row.QAB010 + 
								"\n当前工序：" + row.QAB021;
							$('#txtInfo').val(m);
							$('#txtLineName').val(row.MIH004);
							$('#txtBarcodeCP').val('').focus();
							$('#dgSCMX').datagrid('loadData', $.parseJSON(resdata.data.ShengChanInfo));
						} else {
							playerAudio("NG");
							if(row.QAB021 == null)
								mui.toast('当前条码的上一工序应为：' + row.QAB010 + '；所有工序数据已采集完成!');
							else
								mui.toast('当前条码的下一工序应为：' + row.QAB021 + '；请重新选择工序进行采集!');
							$('#txtBarcodeCP').val("");
							$('#txtInfo').val("");
							$("#txtBarcodeCP").val('').focus();
							$('#dgSCMX').datagrid('loadData', []);
						}
					} else {
						playerAudio("NG");
						mui.toast('没有找到此产品条码对应的数据！');
						$('#txtBarcodeCP').val("");
						$('#txtInfo').val("");
						$("#txtBarcodeCP").focus();
					}
				} else {
					playerAudio("NG");
					mui.toast(resdata.message);
					$('#txtBarcodeCP').val("");
					$('#txtInfo').val("");
					$("#txtBarcodeCP").focus();
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
	$('#txtBarcodeHG').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if($('#txtBarcodeHG').val()=="")
		{
			mui.toast("请扫描后盖条码!");
			$("#txtBarcodeHG").focus();
			return;
		}
		SubmitData();
	})

})

function ClearData() {
	$("txtInfo").html('');
	$('#dgSCMX').datagrid('loadData', []);
	$("#txtBarcodeHG").val('');
	$("#txtBarcodeCP").val('').focus();
}

function CheckData() {
	if($('#txtBarcodeCP').val() == "") {
		playerAudio("NG");
		mui.toast('请扫描产品条码!');
		$('#txtBarcodeCP').focus();
		return false;
	}
	if($('#txtBarcodeHG').val() == "") {
		playerAudio("NG");
		mui.toast('请扫描后盖条码!');
		$('#txtBarcodeHG').focus();
		return false;
	}
	if($('#txtBarcodeHG').val()!=$('#txtBarcodeCP').val()){
		playerAudio("NG");
		alert('内箱核对失败：产品条码（'+$('#txtBarcodeCP').val()+'）与后盖条码（'+$('#txtBarcodeHG').val()+'）不一致!');
		$('#txtBarcodeCP').val()='';
		$('#txtBarcodeHG').val()='';
		$('#txtBarcodeCP').focus();
		return false;
	}
	return true;
}

function SubmitData() {
	if(CheckData() == false)
		return;
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "App_NeiXiangHeDui",
			returnvalue: 1,
			_sp_BarcodeCP: $("#txtBarcodeCP").val(),
			_sp_GongXuID: curGXID,
			_sp_GongXuMC: curGXMC,
			_sp_ZuoYeRenYuan: app.userid,
			_sp_BarcodeHG: $("#txtBarcodeHG").val()
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 0) {
				playerAudio('OK');
				mui.toast('核对成功!');
				ClearData();
				$('#txtBarcodeCP').focus();
			} else {
				playerAudio('NG');
				mui.toast('核对失败！' + data.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));

		}
	});
}