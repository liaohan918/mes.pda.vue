/*
作者：杨俊燃
时间：2019-03-12
描述：组别调拨/备料调拨
 */
var userPicker;

//add by HCW 20200317
mui.plusReady(function() {
	$('#tabsid').tabs({
		height: $(window).height() - $("#head1").height() - 15
	});
});

$(function() {
	userPicker = new mui.PopPicker();
	var filter = ""; //单别过滤
	var spname = ""; //条码扫描后执行的存储过程,因为参数一致操作不同,所以使用变量形式

	GetMainConfig();

	switch (DBType) {
		case "02": //备料调拨
			filter = "1203";
			spname = "WMS_CREATE_INVDF_BL";
			break;
		case "03": //组别调拨
			filter = "1204";
			spname = "WMS_CREATE_INVDF_ZB";
			break;
	}
	$('#dgKuWei').datagrid({
		height: $(window).height() - $("#head1").height() - $("#head2").height() - 55,
	});
	$('#MainCodeGrid').datagrid({
		height: $(window).height() -
			$("#head1").height() -
			$("#head2").height() - 130
	});
	$('#dgWLMX').datagrid({
		height: $(window).height() - $("#head1").height() - $("#head2").height() - 55,
		rowStyler: function(index, row) { //自定义行样式
			if (row.DFC007 != 0) {
				return 'color:red;font-weight:bold;';
			} else {
				return 'background-color:lightgreen;';
			}
		},
		onSelect: function(rowIndex, rowData) {
			if (!rowData)
				return;
			var DFC004 = rowData.DFC004; //物料编码
			var DFC007 = rowData.DFC007; //差异数量
			if (rowData["DFC007"] > 0) {
				GetKuWeiMsg(DFC004);
			}
			mui('#head2')[0].innerHTML = "当前选择：[物料编码:" + DFC004 + " 待发数量:" + DFC007 + "]";
		},
	});
	$('#divTxtInfo').height($(window).height() - $("#head1").height() - $("#head2").height() - $("#txtBarCode").height() -
		75);



	//tab选项卡改变事件
	$('#tabsid').tabs({
		onSelect: function(title, index) {
			if (title == "扫描条码") {
				$("#checkdefault")[0].checked = false;
				$('#txtBarCode').val("");
				$('#txtBarCode').focus();
			}
			if (title == "物料明细") {
				if ($("#txtDJType").val() == "" || $("#txtDBHao").val() == "") {
					mui.toast('调拨单号或单据类型不能为空!');
					return;
				}
				GetData($("#txtDJType").val(), $("#txtDBHao").val());
			}
			if (title == "主条码") {
				$("#ckMainIsCancel")[0].checked = false;
				$('#txtMainCode').val("");
				$('#txtMainCode').focus();
			}
		}
	});


	var userPickerDJType = new mui.PopPicker();

	//获取单据类型
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/GetDJType',
		//		url: "http://localhost:27611/api/INVDFA/GetDJType",
		data: {},
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
	//选择单据类型
	$('#txtDJType').click(function() {
		userPickerDJType.show(function(items) {
			$('#txtDJType').val(items[0]['value']);
			$('#txtDJTypeText').val(items[0]['text']);
			$("#txtDBHao").val("");
			$("#txtDBHao").focus();
			$('#dgWLMX').datagrid('loadData', {
				total: 0,
				rows: []
			});
			$('#MainCodeGrid').datagrid('loadData', {
				total: 0,
				rows: []
			});
			$('#txtMainCode').val("");
			//GetDBHao(items[0]['value']);
		});
	});

	//扫描单号
	$("#txtDBHao").keydown(function(event) {
		if (event.keyCode == "13") {
			if ($('#txtDJType').val() == "") {
				mui.toast('请先选择单据类型!');
				$('#dgWLMX').datagrid('loadData', {
					total: 0,
					rows: []
				});
				return;
			}
			var txtDBHao = $('#txtDBHao').val();
			if (txtDBHao == "") {
				mui.toast('请扫描单号!');
				$('#dgWLMX').datagrid('loadData', {
					total: 0,
					rows: []
				});
				return;
			}
			$('#MainCodeGrid').datagrid('loadData', {
				total: 0,
				rows: []
			});
			$('#txtMainCode').val("");
			GetData($("#txtDJType").val(), txtDBHao);
		}
	})
	//扫描条码回车,开始调拨
	$('#txtBarCode').keydown(function(event) {
		if (event.keyCode != "13")
			return;
		var tmpBarCode = mui('#txtBarCode')[0].value;
		if (tmpBarCode == "") {
			mui.toast('请扫描物料条码!');
			return;
		}
		if (mui("#checkdefault")[0].checked) //判断是否时取消条码操作
		{
			if (!confirm("是否取消条码" + tmpBarCode + "的调拨信息？"))
				return;
			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var user_id = currentSession.user_id;
			//			var user_id ="admin";
			$.ajax({
				url: app.API_URL_HEADER + app.API_METHOD_ESP,
				data: {
					spname: "WMS_CREATE_INVDF_Cancel", //获取用户菜单权限
					returnvalue: 1,
					_sp_BillNo: DFA002, //调拨单号ID 注:这里使用的时调拨单的单号ID;      
					_sp_BillType: $("#txtDJType").val(), //调拨单别;      
					_sp_BillDate: "", //调拨日期(是为了解决盘点日前后交易日的获取),若为空，则默认为当天      
					_sp_BarCode: tmpBarCode, //条码     
					_sp_UserID: user_id //调拨人员
				},
				dataType: "json",
				type: "post",
				async: false,
				success: function(data) {
					if (data.status == 0) {
						mui.toast('取消条码调拨成功');
						GetData($("#txtDJType").val(), $('#txtDBHao').val()); //重新加载物料明细数据
						$("#checkdefault")[0].checked = false;
						$('#txtBarCode').val("");
						$('#txtBarCode').focus();
						playerAudio("OK");
					} else {
						playerAudio("NG");
						alert(data.message);
					}
				},
				error: function(xhr, type, errorThrown) {
					mui.toast("取消条码调拨异常：" + JSON.stringify(errorThrown));
					playerAudio("NG");
				}
			});
		} else {
			//判断条码是否是最早日期 是否符合FIFO	
			$.ajax({
				url: app.API_URL_HEADER + '/INVDFA/GetWLMsgByBarcode',
				//				url: "http://localhost:27611/api/INVDFA/GetWLMsgByBarcode",
				data: {
					Barcode: tmpBarCode
				},
				dataType: "json",
				type: "post",
				async: false,
				success: function(resdata) {
					//console.log(JSON.stringify(resdata));
					//dt = $.parseJSON(resdata.data);
					if (resdata.status == 1) {
						mui.toast(resdata.message);
						playerAudio("NG");
						$('#txtBarCode').val("");
						$('#txtBarCode').focus();
					}
					/*===============暂时取消FIFO限制，待盘点数据准确后开启(2019-04-25 黎锋)*/
					/*else if(resdata.status == 2) {
						playerAudio("OK");
						if(confirm(resdata.message)) {
							var res = GetWLMsgByBarcodeIsOver(tmpBarCode);
							if(res == "OK") {
								DoDiaoBo();
							}
						} else {
							$('#txtBarCode').val("");
							$('#txtBarCode').focus();
						}
					}*/
					/*===============暂时取消FIFO限制，待盘点数据准确后开启(2019-04-25 黎锋)*/
					else {
						var res = GetWLMsgByBarcodeIsOver(tmpBarCode);
						if (res == "OK") {
							playerAudio("OK");
							DoDiaoBo();
						} else {
							playerAudio("NG");
						}
					}

				},
				error: function(xhr, type, errorThrown) {
					playerAudio("NG");
					alert("获取数据异常：" + JSON.stringify(errorThrown));
				}
			});
		}
	});

	$("#txtMainCode").keydown(function(event) {
		if (event.keyCode != "13")
			return;
		//如果快捷出库选中，则扫描后调用执行主条码出库函数
		if ($("#ckquick").prop("checked") == false)
			ScanfMainBarCode();
		else ScanfMainBarCode(function() {
			execMainBarCode(false);
		});

	})
	$("#btnDoMainCode").click(function() {
		execMainBarCode(true);
	})

});
//执行调拔
var wlbm = ""; //物料编码
var i = 0; //统计当前物料已扫条码数
function DoDiaoBo() {
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
	//	user_id = "admin";
	$.ajax({
		//url: "http://localhost:27611/api/b/esp",
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "WMS_CREATE_INVDF_BL",
			returnvalue: 1,
			_sp_BillNo: mui('#txtDBHao')[0].value, //调拨单号;
			_sp_BillType: mui('#txtDJType')[0].value, //调拨单别; 默认 1204
			_sp_BillDate: '', //调拨日期(是为了解决盘点日前后交易日的获取),若为空，则默认为当天      
			_sp_BarCode: mui('#txtBarCode')[0].value, //条码
			_sp_UserID: user_id // 调拨人员
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if ("1" == data.status) {
				alert("调拨异常：" + data.message);
				$('#txtBarCode').val("");
				$('#txtBarCode').focus();
				playerAudio("NG");
				return;
			}
			///GetData($('#txtDBHao').val()); 作用和意义是什么？？？黎锋（2019-04-27）
			var row = data.data[0];
			var m = "物料条码:" + row.DAB001 +
				"\n物料编码:" + row.DAB020 +
				"\n物料名称:" + row.DAB021 +
				"\n物料规格:" + row.DAB008 +
				"\n仓库:" + row.DAB002 + "    " + "库位:" + row.DAB003 +
				"\n数量:" + row.DAB006 +
				"\n检验方式:" + (row.DAB024 == 'N' ? 'N-免检' : 'Y-受检') +
				"\n质量状态:" + (row.DAB011 == '0' ? '0-未知' : (row.DAB011 == '1' ? '1-良品' : '2-不良')) +
				"\n位置状态:" + (row.DAB035 == '1' ? '1-在库' : '2-在线');
			$('#txtInfo').val(m);
			if (row.DAB020 != wlbm) //如果切换了物料编码，则刷新物料明细和库位列表，测试一下能不能加快反应速度（黎锋 2019-04-27）
			{
				//GetData($("#txtDJType").val(), $("#txtDBHao").val());--当点击"物料明细"选项卡时，再统一刷新数据
				wlbm = row.DAB020;
				i = 1; //重新统计已扫条码数量
				$("#dgBarcode-sum")[0].innerHTML = 1;
			} else
				$("#dgBarcode-sum")[0].innerHTML = ++i;
			mui('#head2')[0].innerHTML = "当前扫描：[物料编码:" + row.DAB020 + " 待发数量:" + row.WeiOKCount + "]";
			$('#txtBarCode').val("");
			$('#txtBarCode').focus();
			playerAudio("OK");
			mui.toast('调拨成功!');
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
			playerAudio("NG");
		}
	});
}

function GetWLMsgByBarcodeIsOver(Barcode) {
	var res;
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/GetWLMsgByBarcodeIsOver',
		//url: "http://localhost:27611/api/INVDFA/GetWLMsgByBarcodeIsOver",
		data: {
			Barcode: Barcode,
			DJType: $("#txtDJType").val(),
			DJHao: $("#txtDBHao").val()
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数
		dataType: "json",
		async: false,
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.toast(resdata.message);
				$('#txtBarCode').val("");
				$('#txtBarCode').focus();
				res = "NG";
			} else if (resdata.status == 2) {
				alert(resdata.message);
				$('#txtBarCode').val("");
				$('#txtBarCode').focus();
				res = "NG";
			} else {
				res = "OK";
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	return res;
}

function GetKuWeiMsg(WLBM) {
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/GetKuWeiMsgByWLBM',
		//url: "http://localhost:27611/api/INVDFA/GetKuWeiMsgByWLBM",
		data: {
			WLBM: WLBM
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			$('#dgKuWei').datagrid('loadData', dt);
			$("#dgKuWei-sum")[0].innerHTML = dt.length;
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function GetDBHao(DBType) {
	//userPicker.setData();
	//获取单号
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/GetDBHao',
		//url: "http://localhost:27611/api/INVDFA/GetDBHao",
		data: {
			DJType: $("#txtDJType").val()
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});

	//选择单号
	//	$('#txtDBHao').click(function() {
	//		userPicker.show(function(items) {
	//			$('#txtDBHao').val(items[0]['value']);
	//			GetData($("#txtDJType").val(),items[0]['value']);
	//		});
	//	});
}
var DFA002 = ""; //调拨单单号ID

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
			if (dd.length > 0) {
				//playerAudio("OK");
				$('#dgWLMX').datagrid('loadData', dd); //给表格设置数据源
				$('#dgWLMX-sum')[0].innerHTML = dd.length;
				//				$('#dgBarcode-sum')[0].innerHTML = data.message;
				$('#dgBarcode-sum')[0].innerHTML = 0;
				DFA002 = dd[0]["DFA002"];
			} else {
				//playerAudio("NG");
				mui.toast('此单据无数据!');
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

/* 获取主条码的配置 */
var useMainCode = "N";
var mainCodeprefix = "";

function GetMainConfig() {
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/GetMainCodeRule',
		data: "",
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				useMainCode = resdata.data.UseMainCode;
				mainCodeprefix = resdata.data.MainCodePrefix;
			}
		}
	})
}

function ScanfMainBarCode(callback) {
	var mainbarcode = $("#txtMainCode").val();
	if (useMainCode == "N") {
		playerAudio("NG");
		mui.alert("未启用主条码功能");
		return;
	}
	if (mainCodeprefix.length > 0 && mainbarcode.indexOf(mainCodeprefix) < 0) {
		playerAudio("NG");
		mui.alert("主条码规则不符合规范,请确认");
		return;
	}
	//元盛专用;
	var warehouse = (mui("#ckMainIsCancel")[0].checked) ? "WZ1P" : "53";
	//1.检查此系统是否可以使用主条码
	//2.检查录入的物料是否属于主条码的格式
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/getMainBarCode',
		data: {
			MainBarCode: mainbarcode,
			WareHouse: warehouse
		},
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message, function() {
					playerAudio("NG");
					$("#MainBarCode").focus();
					$("#MainBarCode").val("");
				});
				return;
			} else {
				$('#MainCodeGrid').datagrid('loadData', resdata.data.tbList);
				$("#MainCodeTotal").text("个数:" + resdata.data.Count + ",总数:" + resdata.data.Total);
				$("#btnDoMainCode").focus();
				//如果执行成功则调用执行主条码处理的函数
				if (typeof callback === "function") {
					callback(); //调用传入的回调函数
				}
			}
		}
	})

}
/*主条码处理（确定按钮事件）*/
//isclear是否清空表格
function execMainBarCode(cleargird) {
	//主条码的验证（1.一个主不能有多种物料 2.主条码不能超发）
	var mainbarcode = $("#txtMainCode").val();
	if (mainbarcode == "") {
		playerAudio("NG");
		mui.alert("主条码不能为空")
		return;
	}
	var iscancel = (mui("#ckMainIsCancel")[0].checked) ? "Y" : "N";
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/Execute',
		data: {
			DJType: $("#txtDJType").val(),
			DJHao: $("#txtDBHao").val(),
			UserID: app.userid(),
			MainBarCode: mainbarcode,
			IsCancel: iscancel
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数		
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status != 0) {
				mui.alert(resdata.message, function() {
					$("#txtMainCode").focus();
					playerAudio("NG");
				});
				return;
			} else {
				$("#txtMainCode").focus();
				$("#txtMainCode").val("");
				if (cleargird == true) {
					$("#MainCodeTotal").text("个数:0,总数:0")
					$('#MainCodeGrid').datagrid('loadData', {
						total: 0,
						rows: []
					});
				}
				//循环执行主条码的出库,执行进度条
				mui.toast("执行OK");
				playerAudio("OK");
			}
		}
	})

}
