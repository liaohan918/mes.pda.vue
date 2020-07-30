/*
作者：黄邦文
时间：2019-02-21
描述：工序报工--核对送检
 */
mui.init();
var curGXID = 'G007';
var curGXMC = '核对送检';
var curZYRY = app.userid;
var curCXBM;
var curCXMC;
var isSongJian = false;
var isFirstGX = false;
var SCLine='';
mui.plusReady(function(e) {
	$('#dgSCMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50,
		rowStyler: function(index, row) { //自定义行样式
			if(row.QAB002 == row.CPTM) {
				return 'background-color:lightgreen;';
			}
		},
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
	$('#dgKBMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50
	});
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
	// 	rowStyler: function(index, row) { //自定义行样式
	// 		if(row.QAB002 == row.CPTM) {
	// 			return 'background-color:lightgreen;';
	// 		}
	// 	},
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
	// $('#dgKBMX').datagrid({
	// 	height: $(window).height() - $("#item1").height() - 50
	// });
	//卡板条码
	$('#txtBarcodeKaBan').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeKaBanInfo',
			data: {
				BarcodeKaBan: $('#txtBarcodeKaBan').val()
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					console.log(JSON.stringify(resdata));
					dt = $.parseJSON(resdata.data.KBInfo);
					if(dt.length > 0) {
						var row = dt[0];
						$('#dgKBMX').datagrid('loadData', dt);
						$('#txtKeZhuangSL').val(row.kbsl);
						SCLine=row.DAA042;
						var DaiZhuangSL = resdata.data.DaiZhuangShu;
						$('#txtDaiZhuangSL').val(DaiZhuangSL);
						$("#txtSJState").html(row.sjstate == 'N' ? '未送检' : '已送检');
						isSongJian = row.sjstate == 'N' ? false : true;
						$("#txtSJState").css('backgroundColor', row.sjstate == 'N' ? 'red' : 'lightgreen')

						if(row.sjstate == 'Y' || row.sjstate == '1' || row.sjstate == '2') {
							playerAudio("NG");
							$('#dgKBMX').datagrid('loadData', dt);
							mui.toast('该卡板已送检完成，无需再进行其它操作！');
							$('#btnSongJian').attr({
								"disabled": "disabled"
							});
							$('#btnSubmit').attr({
								"disabled": "disabled"
							});
						} else if(DaiZhuangSL==0 && confirm('该卡板已装满，是否需要送检?')) {
							$('#btnSongJian').removeAttr("disabled");
							$('#btnSubmit').removeAttr("disabled");
							SongJian();
						} else {
							$('#btnSongJian').removeAttr("disabled");
							$('#btnSubmit').removeAttr("disabled");
							$('#txtBarcodeBox').val('').focus();
						}
					} else {
						playerAudio("NG");
						mui.toast('没有找到此产品条码对应的数据！');
						ClearData('all');
					}
				} else {
					playerAudio("NG");
					mui.toast(resdata.message);
					ClearData('all');
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});

	//扫描箱条码
	$('#txtBarcodeBox').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if(isSongJian == true) {
			mui.toast('该卡板已送检了，请选择另一个卡板再扫描!');
			$('#txtBarcodeBox').val('');
			$('#txtBarcodeKaBan').select();
			return;
		}
		if($('#txtBarcodeKaBan').val() == '') {
			mui.toast('请先扫描卡板条码!');
			return;
		}
		if($('#txtDaiZhuangSL').val()==0) {
			mui.toast('当前卡板已装满，请直接送检!');
			$('#txtBarcodeBox').val('');
			$('#txtBarcodeCP').val('').focus();
			return;
		}
		if($('#dgSCMX').datagrid('getData').rows.length >= $('#txtBoxSL').val()) {
			mui.toast('当前箱已装满，请开始扫描产品条码了!');
			$('#txtBarcodeBox').val('');
			$('#txtBarcodeCP').val('').focus();
			return;
		}
		if($('#dgSCMX').datagrid('getData').rows.length > 0) {
			if(IsScanAgain($('#txtBarcodeBox').val(), 'QAB002')) {
				mui.toast('条码已扫描过了!')
				$('#txtBarcodeBox').val('').focus();
				return;
			}
		}
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeBoxInfo',
			data: {
				BarcodeBox: $('#txtBarcodeBox').val(),
				BarcodeKaBan: $('#txtBarcodeKaBan').val()
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					console.log(JSON.stringify(resdata));
					dt = $.parseJSON(resdata.data.CPInfo);
					if(dt.length > 0) {
						var row = dt[0];
						//考虑没有内外箱的装箱工序时，直接用产品条码进行绑定卡板，把产品条码当成箱条码
						if(row.QAB020 == $("#txtCurGXID").html()) {
							playerAudio("OK");
							$('#txtLineName').val(row.MIH004);
							$('#dgSCMX').datagrid('appendRow', {
								QAB002: $('#txtBarcodeBox').val(),
								CPTM: "",
								QAB017: row.QAB017,
								QAB005: row.QAB005,
								QAB006: row.QAB006,
								QAB007: row.QAB007
							});
							if($('#dgSCMX').datagrid('getData').rows.length == $('#txtBoxSL').val()) {
								$('#txtBarcodeCP').val('').focus();
							} else {
								$('#txtBarcodeBox').val('').focus();
							}
							//$('#dgSCMX').datagrid('loadData', $.parseJSON(resdata.data.ShengChanInfo));
						} else {
							playerAudio("NG");
							//							if(row.QAB021 == null)
							//								mui.toast('当前条码的上一工序应为：' + row.QAB010 + '；所有工序数据已采集完成!');
							//							else
							mui.toast('当前条码的下一工序应为：' + row.QAB021 + '；请重新选择工序进行采集!');
							$('#txtBarcodeBox').val("");
							$('#txtInfo').val("");
							$("#txtBarcodeBox").val('').focus();
							$('#dgSCMX').datagrid('loadData', []);
						}
					} else {
						playerAudio("NG");
						mui.toast('没有找到此产品条码对应的数据！');
						$('#txtBarcodeBox').val("");
						$('#txtInfo').val("");
						$("#txtBarcodeBox").focus();
					}
				} else {
					playerAudio("NG");
					mui.toast(resdata.message);
					$('#txtBarcodeBox').val("");
					$('#txtInfo').val("");
					$("#txtBarcodeBox").focus();
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
	//扫描产品小条码
	$('#txtBarcodeCP').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if(isSongJian == true) {
			mui.toast('该卡板已送检了，请选择另一个卡板再扫描!');
			$('#txtBarcodeCP').val('');
			$('#txtBarcodeKaBan').select();
			return;
		}
		if($('#txtDaiZhuangSL').val()==0) {
			mui.toast('当前卡板已装满，请直接送检!');
			$('#txtBarcodeBox').val();
			$('#txtBarcodeCP').val('').focus();
			return;
		}
		if($('#txtBarcodeKaBan').val() == '') {
			mui.toast('请先扫描卡板条码!');
			return;
		}
		if($('#dgSCMX').datagrid('getData').rows.length > 0) {
			if(IsScanAgain($('#txtBarcodeCP').val(), 'CPTM')) {
				mui.toast('条码已扫描过了!')
				$('#txtBarcodeCP').val('').focus();
				return;
			}
			if(ScanCPTM($('#txtBarcodeCP').val()) == false) {
				mui.toast('条码不属于该箱内条码!')
				$('#txtBarcodeCP').val('').focus();
				return;
			}
		} else {
			mui.toast('箱条码未扫描!')
			$('#txtBarcodeBox').val('').focus();
		}
		if(CPTMIsScanFull()==true)
		{
			SubmitData();
			refreshKaBan();
		}
		else
		{
			$('#txtBarcodeCP').val('').focus();
		}
	})

	$('#btnSongJian').click(function() {
		if($('#txtBarcodeKaBan').val() == '') {
			mui.toast('请先扫描卡板条码!');
			return;
		}
		SongJian();
	})
	$('#btnSubmit').click(function() {
		if($('#txtBarcodeKaBan').val() == '') {
			mui.toast('请先扫描卡板条码!');
			return;
		}
		SubmitData();
		refreshKaBan();
	})
	//提交数据
	$('#btnReset').click(function() {
		ClearData('all');
	})

})

function refreshKaBan() {
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeKaBanInfo',
		data: {
			BarcodeKaBan: $('#txtBarcodeKaBan').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 0) {
				console.log(JSON.stringify(resdata));
				dt = $.parseJSON(resdata.data.KBInfo);
				if(dt.length > 0) {
					var row = dt[0];
					$('#dgKBMX').datagrid('loadData', dt);
					$('#txtKeZhuangSL').val(row.kbsl);
					SCLine=row.DAA042;
					var DaiZhuangSL = resdata.data.DaiZhuangShu;
					$('#txtDaiZhuangSL').val(DaiZhuangSL);
					$("#txtSJState").html(row.sjstate == 'N' ? '未送检' : '已送检');
					$("#txtSJState").css('backgroundColor', row.sjstate == 'N' ? 'red' : 'lightgreen')
					$('#txtBarcodeBox').focus();
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function IsScanAgain(barcode, column) {
	var isScan = false;
	var rows = $('#dgSCMX').datagrid('getData').rows;
	$.each(rows, function(index, item) {
		if(item[column] == barcode) {
			isScan = true;
		}
	});
	return isScan;
}

function ScanCPTM(barcode) {
	var isScan = false;
	var rows = $('#dgSCMX').datagrid('getData').rows;
	$.each(rows, function(index, item) {
		if(item['QAB002'] == barcode) {
			isScan = true;
			item['CPTM'] = barcode;
			$('#dgSCMX').datagrid('refreshRow', index);
		}
	});
	return isScan;
}
function CPTMIsScanFull() {
	var isFull = true;
	var rows = $('#dgSCMX').datagrid('getData').rows;
	$.each(rows, function(index, item) {
		if(item['QAB002'] != item['CPTM']) {
			isFull = false;
		}
	});
	return isFull;
}

function ClearData(cleartype) {
	$("#txtBarcodeBox").val('');
	$("#txtBarcodeCP").val('');
	$('#dgSCMX').datagrid('loadData', []);
	if(cleartype == 'all') {
		$('#dgKBMX').datagrid('loadData', []);
		$('#txtDaiZhuangSL').val('0');
		$('#txtKeZhuangSL').val('0');
		$("#txtBarcodeKaBan").val('').focus();
	} else {
		$("#txtBarcodeBox").val('').focus();
	}

	$('#btnSongJian').removeAttr("disabled");
	$('#btnSubmit').removeAttr("disabled");
	isSongJian = false;
}

function CheckData() {
	if($('#dgSCMX').datagrid('getData').rows.length < $('#txtBoxSL').val()) {
		mui.toast('箱条码未扫描满，请增加箱条码！');
		$('#txtBarcodeBox').val('').focus();
		return false;
	}
	var rows = $('#dgSCMX').datagrid('getData').rows;
	$.each(rows, function(index, item) {
		if(item['QAB002']!=item['CPTM'])
		{
			mui.toast('产品条码未扫描满，请产品条码！');
			$('#txtBarcodeCP').val('').focus();
			return false;
		}
	});
	return true;
}

function SongJian() {
	if($('#txtBarcodeKaBan').val() == '') {
		mui.toast('请先扫描卡板条码!');
		return;
	}
	if($('#txtDaiZhuangSL').val()!=0){
		playerAudio("NG");
		mui.toast('卡板条码未装满，不能送检!');
		$('#txtBarcodeKaBan').select();
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/SongJian',
		data: {
			BarcodeKaBan: $('#txtBarcodeKaBan').val(),
			SCLine: SCLine,
			ZuoYeRenYuan: app.userid
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 0) {
				playerAudio("OK");
				mui.toast('送检成功!')
				ClearData('all');
			} else {
				playerAudio("NG");
				mui.toast(resdata.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	return true;
}

function SubmitData() {
	if(CheckData() == false)
		return;
	var BarcodeList = '';
	var rows = $('#dgSCMX').datagrid('getData').rows;
	$.each(rows, function(index, item) {
		BarcodeList = BarcodeList + item['CPTM'] + '|';
	});
	BarcodeList = BarcodeList.substring(0, BarcodeList.length - 1);
	//	console.log(BarcodeList);
	//	return;
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "App_WaiBaoZhuangCaiJi",
			returnvalue: 1,
			_sp_BarcodeKaBan: $('#txtBarcodeKaBan').val(),
			_sp_GongXuID: curGXID,
			_sp_GongXuMC: curGXMC,
			_sp_ZuoYeRenYuan: app.userid,
			_sp_BarcodeList: BarcodeList
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 0) {
				playerAudio('OK');
				mui.toast('数据提交成功!');
				ClearData('box');
				$('#txtBarcodeBox').focus();
			} else {
				playerAudio('NG');
				mui.toast('数据提交失败！' + data.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));

		}
	});
}