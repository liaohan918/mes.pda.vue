/*
作者：黄邦文
时间：2019-05-07
描述：合并调拔发料
 */
var userPicker;

//add by HCW 20200317
mui.plusReady(function() {
	$('#tabsid').tabs({
		height: $(window).height() - $("#infos").height() - $("#bottomid").height()-65
	});
	$('#dgCHK').datagrid({
		height: $(window).height() - $("#infos").height() - $("#bottomid").height() - 100,
	});
});

$(function() {
	userPicker = new mui.PopPicker();

	$('#dgCHK').datagrid({
		height: $(window).height() - $("#infos").height() - $("#bottomid").height() - 100,
		rowStyler: function(index, row) { //自定义行样式
			if(row.DFC007 != 0) {
				return 'color:red;font-weight:bold;';
			} else {
				return 'background-color:lightgreen;';
			}
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			var DFC004 = rowData.DFC004; //物料编码
			var DFC007 = rowData.DFC007; //差异数量
			if(rowData["DFC007"] > 0) {
				GetKuWeiMsg(DFC004);
			}
		},
		onLoadSuccess: function() {
			$('#dgCHK').datagrid('selectAll');
		}
	});
	$('#divTxtInfo').height($(window).height() - $("#infos").height() - $("#dgCHK").height() - 275);

	var userPickerDJType = new mui.PopPicker();

	//获取单据类型
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFAHeBing/GetNoSendJiXing',
		//		url: "http://localhost:27611/api/INVDFA/GetDJType",
		data: {
			chkToday: $("#chkToday").prop("checked") == true ? "Y" : "N"
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPickerDJType.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择机型
	$('#txtJiXing').click(function() {
		userPickerDJType.show(function(items) {
			$('#txtJiXing').val(items[0]['value']);
			//			$('#dgCHK').datagrid('loadData', {
			//				total: 0,
			//				rows: []
			//			});
			//GetDBHao(items[0]['value']);
			GetListByJiXing();
		});
	});
	//刷新机型数据
	$('#btnRefresh').click(function() {
		$.ajax({
			url: app.API_URL_HEADER + '/INVDFAHeBing/GetNoSendJiXing',
			//		url: "http://localhost:27611/api/INVDFA/GetDJType",
			data: {
				chkToday: $("#chkToday").prop("checked") == true ? "Y" : "N"
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				console.log(JSON.stringify(resdata));
				dt = $.parseJSON(resdata.data);
				var rows = [];
				userPickerDJType.setData(dt);
				$("#txtJiXing").val("");
				$('#dgCHK').datagrid('loadData', {
					total: 0,
					rows: []
				});
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});

	$("#btnHeBing").click(function() {
		var selRows = $('#dgCHK').datagrid('getChecked');
		var result = "";
		if(selRows.length == 0)
			mui.toast('未选择任何行！');
		else {
			var total = $('#dgCHK').datagrid('getData').rows.length;
			if(total != selRows.length) {
				if(confirm('总行数为:' + total + '|选择行数:' + selRows.length + '是否继续合并？')) {
					$.each(selRows, function(index, item) {
						result = result + "|" + item["DFA002"];
					});
				}
			} else {
				$.each(selRows, function(index, item) {
					result = result + "|" + item["DFA002"];
				});
			}
			if(result.length > 0) {
				$.ajax({
					url: app.API_URL_HEADER + '/INVDFAHeBing/UpdateINVDFAGroup',
					data: {
						BillList: result
					},
					dataType: "json",
					type: "post",
					success: function(resdata) {
						if(resdata.status == 0) {
							mui.toast('合并成功！');
							playerAudio("OK");
							$('#btnRefresh').click();
						} else {
							mui.toast('合并失败！');
							playerAudio("NG");
						}

					},
					error: function(xhr, type, errorThrown) {
						playerAudio("NG");
						alert("获取数据异常：" + JSON.stringify(errorThrown));
					}
				});
			}
		}

	});

});

function GetListByJiXing() {
	//获取单号
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFAHeBing/GetListByJiXing',
		//url: "http://localhost:27611/api/INVDFA/GetDBHao",
		data: {
			JiXing: $("#txtJiXing").val(),
			chkToday: $("#chkToday").prop("checked") == true ? "Y" : "N"
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数
		dataType: "json",
		type: "post",
		success: function(resdata) {
			var dd = $.parseJSON(resdata.data);
			if(dd.length > 0) {
				$('#dgCHK').datagrid('loadData', dd); //给表格设置数据源
			} else {
				playerAudio("NG");
				mui.toast('此单据无数据!');
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});

}

//得到明细表数据与仓库数据
function GetData(DBType, DBHao) {
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/LoadData', //获取数据:调用webApi服务路径
		//url: "http://localhost:27611/api/INVDFA/LoadData",
		data: {
			DBType: DBType,
			DBHao: DBHao
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(data) {
			var dd = $.parseJSON(data.data);
			if(dd.length > 0) {
				playerAudio("OK");
				$('#dgWLMX').datagrid('loadData', dd); //给表格设置数据源
				$('#dgWLMX-sum')[0].innerHTML = dd.length;
				//				$('#dgBarcode-sum')[0].innerHTML = data.message;
				$('#dgBarcode-sum')[0].innerHTML = 0;
				DFA002 = dd[0]["DFA002"];
			} else {
				playerAudio("NG");
				mui.toast('此单据无数据!');
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}