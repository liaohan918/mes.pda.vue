/*
作者：黄邦文
时间：2019-02-21
描述：工序报工--绑定送检
 */
mui.init();
var curGXID = 'G009';
var curGXMC = '绑定送检';
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
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
		},
	});
	$('#dgKBMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50
	});
});

$(function() {
	$("#txtCurGX").html("当前工序是：" + curGXMC);
	$("#txtCurGXID").html(curGXID);
	$('#txtBarcodeKaBan').focus();

	// $('#dgSCMX').datagrid({
	// 	height: $(window).height() - $("#item1").height() - 50,
	// 	rowStyler: function(index, row) { //自定义行样式
	// 	},
	// 	onSelect: function(rowIndex, rowData) {
	// 		if(!rowData)
	// 			return;
	// 	},
	// });
	// $('#dgKBMX').datagrid({
	// 	height: $(window).height() - $("#item1").height() - 50
	// });
	//卡板条码
	$('#txtBarcodeKaBan').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if($('#txtBarcodeKaBan').val() == "")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeKaBanInfo',
			data: {
				BarcodeKaBan: $('#txtBarcodeKaBan').val()
			},
			dataType: "json",
			type: "post",
			async: true,
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
							alert('该卡板已送检完成，无需再进行其它操作！');
							ClearData('all');
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
							$('#txtBarcodeCP').val('');
							$('#txtBarcodeBox').val('').focus();
						}
					} else {
						playerAudio("NG");
						alert('没有找到此产品条码对应的数据！');
						ClearData('all');
					}
				} else {
					playerAudio("NG");
					alert(resdata.message);
					ClearData('all');
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				ClearData('all');
			}
		});
	});

	//扫描箱条码
	$('#txtBarcodeBox').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if($('#txtBarcodeBox').val()=='')
			return;
		if($('#txtBarcodeKaBan').val() == '') {
			playerAudio("NG");
			alert('请先扫描卡板条码!');
			ClearData('all');
			return;
		}
		if($('#txtDaiZhuangSL').val()==0) {
			alert('当前卡板已装满，请直接送检!');
			$('#txtBarcodeBox').val('').focus();
			return;
		}
		$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeBoxSigleInfo',
		data: {
			BarcodeBox: $('#txtBarcodeBox').val()
		},
		dataType: "json",
		type: "post",
		async: true,
		success: function(resdata) {
			if(resdata.status == 0) {
				$('#dgSCMX').datagrid('loadData', []);
				$('#txtBarcodeCP').val('').focus();
			} 
			else if(resdata.status == 2){
				playerAudio("NG");
				alert(resdata.message);
				$('#txtBarcodeBox').val('').focus();
			}
			else {
				console.log(JSON.stringify(resdata));
				dt = $.parseJSON(resdata.data.BoxInfo);
				playerAudio("NG");
				alert(resdata.message);
				$('#dgSCMX').datagrid('loadData', dt);
				$('#txtBarcodeBox').val('').focus();
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$('#txtBarcodeBox').val().focus();
		}
	});
		
	});
	//扫描产品小条码
	$('#txtBarcodeCP').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if($('#txtBarcodeCP').val()=='')
			return;
		if($('#txtBarcodeKaBan').val() == '') {
			playerAudio("NG");
			alert('请先扫描卡板条码!');
			$('#txtBarcodeCP').val('');
			$('#txtBarcodeBox').val('');
			$('#txtBarcodeKaBan').focus();
			return;
		}
		if($('#txtBarcodeBox').val() == '') {
			playerAudio("NG");
			alert('请先扫描箱条码!');
			$('#txtBarcodeCP').val('');
			$('#txtBarcodeBox').focus();
			return;
		}
		if($('#txtDaiZhuangSL').val()==0) {
			alert('当前卡板已装满，请直接送检!');
			$('#txtBarcodeCP').val('').focus();
			return;
		}
		if($('#dgSCMX').datagrid('getData').rows.length > 0) {
			if(IsScanAgain($('#txtBarcodeCP').val(), 'CPTM')) {
				playerAudio("NG");
				alert('条码已扫描过了!');
				$('#txtBarcodeCP').val('').focus();
				return;
			}
		}
		if($('#txtDaiZhuangSL').val()<$('#txtBoxSL').val()){
			playerAudio("NG");
			alert('装箱数大于待装数量，请调整好装箱数!');
			$('#txtBarcodeCP').val('');
			$('#txtBarcodeCP').focus();
			return;
		}
		//表格增加行
		AppendRow();
		if(CPTMIsScanFull() == true) {
			SubmitData();
			refreshKaBan();
			if($('#txtDaiZhuangSL').val()==0){
				alert("卡板条码已绑定完，请送检！");
			}
		} else {
			playerAudio("OK");
			$('#txtBarcodeCP').val('').focus();
		}
	})

	$('#btnSongJian').click(function() {
		if($('#txtBarcodeKaBan').val() == '') {
			playerAudio("NG");
			alert('请先扫描卡板条码!');
			return;
		}
		SongJian();
	})
	$('#btnSubmit').click(function() {
		CheckData();
//		SubmitData();
//		refreshKaBan();
	})
	//提交数据
	$('#btnReset').click(function() {
		ClearData('all');
	})

})

function AppendRow() {
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeCPSigleInfo',
		data: {
			BarcodeCP: $('#txtBarcodeCP').val(),
			BarcodeKaBan: $('#txtBarcodeKaBan').val()
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			if(resdata.status == 0) {
				console.log(JSON.stringify(resdata));
				dt = $.parseJSON(resdata.data.CPInfo);
				var row = dt[0];
				if(row.QAB020!=curGXID){
					playerAudio("NG");
					alert("条码("+$('#txtBarcodeCP').val()+")的下一道工序为"+row.QAB021+",不能绑定！");
					$('#txtBarcodeCP').val("");
					$("#txtBarcodeCP").focus();
					return;
				}
				if($('#dgSCMX').datagrid('getData').rows.length+1 > $('#txtBoxSL').val()) {
					playerAudio("NG");
					alert("箱已装满，不能再装，请扫下一箱！");
					$('#txtBarcodeBox').val("");
					$('#txtBarcodeCP').val("");
					$("#txtBarcodeBox").focus();
					return;
				}
				$('#dgSCMX').datagrid('appendRow', {
					CPTM: $('#txtBarcodeCP').val(),
					QAB017: row.QAB017,
					QAB005: row.QAB005,
					QAB006: row.QAB006,
					QAB007: row.QAB007
				});
			} else {
				playerAudio("NG");
				alert(resdata.message);
				$('#txtBarcodeCP').val("");
				$("#txtBarcodeCP").focus();
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$('#txtBarcodeCP').val("");
			$("#txtBarcodeCP").focus();
		}
	});
}

function refreshKaBan() {
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetBarcodeKaBanInfo',
		data: {
			BarcodeKaBan: $('#txtBarcodeKaBan').val()
		},
		dataType: "json",
		type: "post",
		async: true,
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

function CPTMIsScanFull() {
	var isFull = true;
	var rows = $('#dgSCMX').datagrid('getData').rows;
	if(rows.length != $('#txtBoxSL').val())
		isFull = false;
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
		playerAudio("NG");
		alert('箱条码未扫描满，请增加产品条码！');
		$('#txtBarcodeCP').val('').focus();
		return false;
	}
	if($('#txtBarcodeKaBan').val() == '') {
		playerAudio("NG");
		alert('卡板条码不能为空!');
		$('#txtBarcodeKaBan').focus();
		return false;
	}
	if($('#txtBarcodeBox').val() == '') {
		playerAudio("NG");
		alert('箱条码不能为空!');
		$('#txtBarcodeBox').focus();
		return false;
	}
	if($('#txtBarcodeCP').val() == '') {
		playerAudio("NG");
		alert('产品条码不能为空!');
		$('#txtBarcodeCP').focus();
		return false;
	}
	return true;
}

function SongJian() {
	if($('#txtBarcodeKaBan').val() == '') {
		playerAudio("NG");
		alert('请先扫描卡板条码!');
		return;
	}
	if($('#txtDaiZhuangSL').val()!=0) {
		playerAudio("NG");
		alert('卡板条码未扫描满，请增加箱条码！');
		$('#txtBarcodeBox').val('').focus();
		return false;
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
		async: false,
		success: function(resdata) {
			if(resdata.status == 0) {
				playerAudio("OK");
				mui.toast('送检成功!')
				ClearData('all');
			} else {
				playerAudio("NG");
				alert(resdata.message);
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
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "App_ChanPinBangDing",
			//spname: "Tmp_ChanPinBangDing",
			returnvalue: 1,
			_sp_BarcodeKaBan: $('#txtBarcodeKaBan').val(),
			_sp_GongXuID: curGXID,
			_sp_GongXuMC: curGXMC,
			_sp_ZuoYeRenYuan: app.userid,
			_sp_BarcodeList: BarcodeList,
			_sp_BarcodeBox: $('#txtBarcodeBox').val()
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
			} else {
				playerAudio('NG');
				alert('数据提交失败！' + data.message);
				$("#txtBarcodeCP").val('').focus();
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));
			$("#txtBarcodeCP").val('').focus();
		}
	});
}