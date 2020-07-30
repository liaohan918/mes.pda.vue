/*
作者：黄邦文
时间：2019-02-21
描述：工序报工--工序录入
 */
mui.init();
var curGXID = 'G005';
var curGXMC = '产品绑定';
var curStartShu;
var curZYRY = app.userid;
var curSBBM;
var curCXBM;
var curCXMC;
var checkZYRY;
var checkSBBM;
var checkCXBM;
var isFirstGX = false;
var curCPShu=0;	
var isKaBarCode="N";
var curTM;
mui.plusReady(function(e) {
	$('#dgSCMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50,
		//		rowStyler: function(index, row) { //自定义行样式
		//			if(row.DFC007 != 0) {
		//				return 'color:red;font-weight:bold;';
		//			} else {
		//				return 'background-color:lightgreen;';
		//			}
		//		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			//			var DFC004 = rowData.DFC004; //物料编码
			//			var DFC007 = rowData.DFC007; //差异数量
			//			if(rowData["DFC007"] > 0) {
			//				GetKuWeiMsg(DFC004);
			//			}
		},
	});
	
	$('#dgTMMX').datagrid({
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
	// 	//		rowStyler: function(index, row) { //自定义行样式
	// 	//			if(row.DFC007 != 0) {
	// 	//				return 'color:red;font-weight:bold;';
	// 	//			} else {
	// 	//				return 'background-color:lightgreen;';
	// 	//			}
	// 	//		},
	// 	onSelect: function(rowIndex, rowData) {
	// 		if(!rowData)
	// 			return;
	// 		//			var DFC004 = rowData.DFC004; //物料编码
	// 		//			var DFC007 = rowData.DFC007; //差异数量
	// 		//			if(rowData["DFC007"] > 0) {
	// 		//				GetKuWeiMsg(DFC004);
	// 		//			}
	// 	},
	// });
	
	// $('#dgTMMX').datagrid({
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
		if($('#txtBarcodeCP').val()=='')
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

							var m = "指令单号：" + row.QAB003 + 
								"\n数量:" + row.QAB017 +
								"\n产品条码:" + row.QAB002 +
								"\n产品编码：" + row.QAB005 +
								"\n产品名称：" + row.QAB006 +
								"\n产品规格：" + row.QAB007 +
								"\n前一工序：" + row.QAB010 + 
								"\n当前工序：" + row.QAB021;
							$('#txtInfo').val(m);
							$('#txtLineName').val(row.MIH004);
							$('#dgSCMX').datagrid('loadData', $.parseJSON(resdata.data.ShengChanInfo));
							curCPShu=row.QAB017;
							
							if($('#txtBarcodeHG').val()==''){
								$("#txtBarcodeHG").focus();
								return;
							}
								
							if($('#txtBoxNum').val()<(parseInt($('#txtOKNum').val())+curCPShu)){
								playerAudio("NG");
								alert("产品数大于箱剩余数，不能绑定！");
								$('#txtBarcodeCP').val("");
								$("#txtBarcodeCP").focus();
								return;
							}
							SubmitData();
						} else if(confirm('当前条码下一工序应为：[' + row.QAB021 + ']，是否仅查询信息！')) {
							var m = "指令单号：" + row.QAB003 + 
							    "\n数量:" + row.QAB017 +
							    "\n产品条码:" + row.QAB002 +
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
								alert('当前条码的上一工序应为：' + row.QAB010 + '；所有工序数据已采集完成!');
							else
								alert('当前条码的下一工序应为：' + row.QAB021 + '；请重新选择工序进行采集!');
							$('#txtBarcodeCP').val("");
							$('#txtInfo').val("");
							$("#txtBarcodeCP").val('').focus();
							$('#dgSCMX').datagrid('loadData', []);
						}
					} else {
						playerAudio("NG");
						alert('没有找到此产品条码对应的数据！');
						$('#txtBarcodeCP').val("");
						$('#txtInfo').val("");
						$("#txtBarcodeCP").focus();
					}
				} else {
					playerAudio("NG");
					alert(resdata.message);
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
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarCodeBoxNum',
			data: {
				BarcodeHG: $('#txtBarcodeHG').val()
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					$('#dgTMMX').datagrid('loadData', $.parseJSON(resdata.data.YiBangBarCode));
					if(resdata.data.BoxNum==0){
						playerAudio("NG");
						alert("箱数量为0，不能绑定！");
						$('#txtBarcodeHG').val("");
						$("#txtBarcodeHG").focus();
						return;
					}
					if(resdata.data.BoxNum==resdata.data.OKNum){
						playerAudio("NG");
						alert("箱已绑定完，不能再绑！");
						$('#txtBarcodeHG').val("");
						$("#txtBarcodeHG").focus();
						return;
					}
					$('#txtBoxNum').val(resdata.data.BoxNum);
					$('#txtOKNum').val(resdata.data.OKNum);
					isKaBarCode=$.parseJSON(resdata.data.isKaBarCode);
					
					if($('#txtBarcodeCP').val()==''){
						$("#txtBarcodeCP").focus();
						return;
					}
					
					if($('#txtBoxNum').val()<(parseInt($('#txtOKNum').val())+curCPShu)){
						playerAudio("NG");
						alert("产品数大于箱剩余数，不能绑定！");
						$('#txtBarcodeHG').val("");
						$("#txtBarcodeHG").focus();
						return;
					}
					SubmitData();
				}else{
					playerAudio("NG");
					alert(resdata.message);
					$('#txtBarcodeHG').val("");
					$("#txtBarcodeHG").focus();
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				$('#txtBarcodeHG').val("");
				$("#txtBarcodeHG").focus();
			}
		});
		//SubmitData();
		//$('#txtBarcodeBook').val('').focus();
	})
//	$('#txtBarcodeBook').keydown(function(event) {
//		if(event.keyCode != "13")
//			return;
//		if($('#txtBarcodeHG').val()!=$('#txtBarcodeBook').val() && !confirm('当前说明书条码与后盖条码不致,是否继续保存?'))
//		{
//			$("#txtBarcodeBook").val('').focus();
//			return;
//		}
//		SubmitData();
//	})

	//提交数据
	$('#btnSubmit').click(function() {
		//		mui.toast('保存成功');
		SubmitData();
	})
	
	//选择不良
	$('#btnNG').click(function() {
		var extras = {
			curGZKHao: curTM,
			curGXID: curGXID,
			curGXMC: curGXMC
		};
		newpage(this, extras);
	})

})

function ClearData() {
	$("txtInfo").html('');
	$('#dgSCMX').datagrid('loadData', []);
	$("#txtBarcodeCP").val('');
	$("#txtBarcodeCP").focus();
	//$("#txtBarcodeBook").val('');
}

function CheckData() {
	if($('#txtBarcodeCP').val() == "") {
		playerAudio("NG");
		alert('请扫描产品条码!');
		$('#txtBarcodeCP').focus();
		return false;
	}
	if($('#txtBarcodeHG').val() == "") {
		playerAudio("NG");
		alert('请扫描后盖条码!');
		$('#txtBarcodeHG').focus();
		return false;
	}
	if($('#txtBoxNum').val() == "") {
		playerAudio("NG");
		alert('数量不能为空，请扫描后盖条码!');
		$('#txtBarcodeHG').focus();
		return false;
	}
//	if($('#txtBarcodeBook').val() == "") {
//		playerAudio("NG");
//		mui.toast('请扫描说明书条码!');
//		$('#txtBarcodeBook').focus();
//		return false;
//	}
	return true;
}

function SubmitData() {
	if(CheckData() == false)
		return;
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "App_BaoZhuangCaiJi",
			//spname: "Tmp_BaoZhuangCaiJi",
			returnvalue: 1,
			_sp_BarcodeCP: $("#txtBarcodeCP").val(),
			_sp_GongXuID: curGXID,
			_sp_GongXuMC: curGXMC,
			_sp_ZuoYeRenYuan: app.userid,
			_sp_BarcodeHG: $("#txtBarcodeHG").val(),
			_sp_BarcodeBook: $("#txtBarcodeHG").val(),//$("#txtBarcodeBook").val()
			_sp_IsKaBarCode:isKaBarCode
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 0) {
				playerAudio('OK');
				$('#txtOKNum').val(parseInt($('#txtOKNum').val())+curCPShu);
				if($('#txtBoxNum').val()==$('#txtOKNum').val()){
					mui.toast("箱条码已绑定完，请扫下一箱条码！");
					$("#txtBoxNum").val(0);
					$("#txtOKNum").val(0);
					$("#txtBarcodeHG").val('');
				}
				else{
					curTM=$("#txtBarcodeCP").val();
					mui.toast('数据提交成功!');
				}
				ClearData();
				$('#dgTMMX').datagrid('loadData', data.data);
				return;
			} else {
				playerAudio('NG');
				alert('数据提交失败！' + data.message);
				$("#txtBarcodeHG").val('');
				ClearData();
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}