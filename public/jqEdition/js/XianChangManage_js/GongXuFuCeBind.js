/*
作者：黄邦文
时间：2019-06-06
描述：工序复测绑定
 */
var CPBM = '';
$(function() {
	DateInit();
	$('#txtDateStart').click(function() {
		ChangeDate(this);
	});
	$('#txtDateEnd').click(function() {
		ChangeDate(this);
	});
	var userPicker = new mui.PopPicker();
	//获取工序
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetGongXu',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择工序
	$('#txtGongXuID').click(function() {
		userPicker.show(function(items) {
			$('#txtGongXuMC').val(items[0]['text']);
			$('#txtGongXuID').val(items[0]['value']);
		});

	});
	$('#dgCHK').datagrid({
		height: $(window).height() - $("#infos").height() - $("#divBind").height() - 75,
		rowStyler: function(index, row) { //自定义行样式
			//			if(row.DFC007 != 0) {
			//				return 'color:red;font-weight:bold;';
			//			} else {
			//				return 'background-color:lightgreen;';
			//			}
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
		},
		onLoadSuccess: function() {
			$('#dgCHK').datagrid('selectAll');
		}
	});

	$('#txtSheBeiID').keypress(function(e) {
		if(e.keyCode != 13) return;
		if($('#txtSheBeiID').val() != '') {
			$('#btnRefresh').click();
		} else {
			$('#txtSheBeiID').focus();
		}
	});
	//刷新数据
	$('#btnRefresh').click(function() {
		if($('#txtDateStart').val() == '') {
			playerAudio('NG');
			mui.toast('请选择开始日期！');
			$('#txtDateStart').click();
			return;
		}
		if($('#txtDateEnd').val() == '') {
			playerAudio('NG');
			mui.toast('请选择结束日期！');
			$('#txtDateEnd').click();
			return;
		}
		if($('#txtGongXuID').val() == '') {
			playerAudio('NG');
			mui.toast('请选择工序！');
			$('#txtGongXuID').click();
			return;
		}
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetWeiBindInfo',
			data: {
				GongXuID: $('#txtGongXuID').val(),
				DateStart: $('#txtDateStart').val(),
				DateEnd: $('#txtDateEnd').val(),
				SeBeiID: $('#txtSheBeiID').val()
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				console.log(JSON.stringify(res));
				dt = $.parseJSON(res.data);
				$('#dgCHK').datagrid('loadData', dt);
				var selRows = $('#dgCHK').datagrid('getChecked');
				var TotalShu=0;
				$.each(selRows, function(index, item) {
						TotalShu += item["QAC020"];						
					});
				$('#txtFuCeShu').val(TotalShu);	
				$('#txtFuCeID').focus();
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
	//扫描复测卡号
	$('#txtFuCeID').keypress(function(e) {
		if(e.keyCode != 13) return;
		$('#txtFuCeShu').focus().select();
	});
	//保存复测卡
	$("#btnBind").click(function() {
		var selRows = $('#dgCHK').datagrid('getChecked');
		var result = "";
		
		if($('#txtFuCeID').val() == '') {
			playerAudio('NG');
			$('#txtFuCeID').focus();
			mui.toast('复测卡号不能为空！');
			return;
		}
		if($('#txtFuCeShu').val() == '' || $('#txtFuCeShu').val()<=0) {
			playerAudio('NG');
			$('#txtFuCeShu').focus();
			mui.toast('复测数量不能小于等于0！');
			return;
		}
		
		if(selRows.length == 0) {
			playerAudio('NG');
			mui.toast('未选择任何行！');
		} else {
			var total = $('#dgCHK').datagrid('getData').rows.length;
			if(total != selRows.length) {
				if(confirm('总行数为:' + total + '|选择行数:' + selRows.length + '是否继续？')) {
					$.each(selRows, function(index, item) {
						result = result + item["QAC002"]+ "|";
						if(CPBM == '')
							CPBM = item["QAC005"];
						if(CPBM!=item["QAC005"])
						{
							alert('选择的管制卡列表不能存在不同的产品型号！');
							return;
						}
					});
					SaveFuCeBindInfo(result);
				}
			} else {
				$.each(selRows, function(index, item) {
					result = result  + item["QAC002"]+"|";
					if(CPBM == '')
							CPBM = item["QAC005"];
						if(CPBM!=item["QAC005"])
						{
							alert('选择的管制卡列表不能存在不同的产品型号！');
							return;
						}
				});
				SaveFuCeBindInfo(result);
			}
		}
	});

});

/**
 * {获取日期}
 */
function DateInit() {
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	$('#txtDateStart').val(dateTime.substring(0,16));//formatDate(DateTemp)
	$('#txtDateEnd').val(dateTime.substring(0,16));//formatDate(DateTemp)
	$('#txtGongXuMC').val('ICT测试');
	$('#txtGongXuID').val('1024');
}
/** 
 * {选择交易日期}
 */
function ChangeDate(e) {
	var result = e;
	var picker = new mui.DtPicker({
		type: 'datetime'
	});
	picker.show(function(rs) {
		result.value = rs.text;
		if($('#txtDateEnd').val() < $('#txtDateStart').val()) {
			mui.toast('结束日期不能小于开始日期');
			$('#txtDateEnd').val($('#txtDateStart').val());
		}
		picker.dispose();
	});
};

function SaveFuCeBindInfo(GZKList) {
	if($('#txtGongXuID').val() == '') {
		playerAudio('NG');
		mui.toast('请扫描复测卡号！');
		$('#txtGongXuID').focus();
		return;
	}
	if($('#txtFuCeShu').val() == '') {
		playerAudio('NG');
		mui.toast('请录入复测数量！');
		$('#txtFuCeShu').focus();
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/SaveFuCeBindInfo',
		data: {
			GongXuID: $('#txtGongXuID').val(),
			FuCeID: $('#txtFuCeID').val(),
			FuCeShu: $('#txtFuCeShu').val(),
			SeBeiID: $('#txtSheBeiID').val(),
			GZKList: GZKList,
			CPBM: CPBM,
			userid: app.userid
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if(res.status == '0') {
				playerAudio('OK');
				mui.toast('复测卡绑定成功!');
				$('#txtFuCeShu').val('');
				$('#btnRefresh').click();
				$('#txtFuCeID').val('').focus();
			} else {
				playerAudio('NG');
				mui.toast('复测卡绑定失败!' + res.message);
			}

		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}