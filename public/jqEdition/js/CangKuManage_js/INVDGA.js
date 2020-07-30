/**
 * 报废--岳志鹏
 */
var userid;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
	//add by HCW 20200318
	$('#show').tabs({
		height: $(window).height() - $("#form").height() - $("#box").height() - 35,
	});
	$('#dg2').datagrid({
		height: $("#show").height() - $("#barCode").height() - 35,
		onLoadSuccess: function(data) {
			mui('#dg1-sum')[0].innerHTML =
				(!data || data.rows.length <= 0) ? '0' : data.total;
		}
	})
});

var userPicker = new mui.PopPicker();
var materialId = "";
var barCode = "";

//设置tabs属性
$('#show').tabs({
	height: $(window).height() - $("#form").height() - $("#box").height() - 35,
});

$(function() {
	$('#dg1').datagrid({
				onLoadSuccess: function(data) {
					mui('#dg1-sum')[0].innerHTML =
						(!data || data.rows.length <= 0) ? '0' : data.total;
				}
		}
	).datagrid('clientPaging', GetData);
	$('#dg2').datagrid({
		height: $("#show").height() - $("#barCode").height() - 35,
		onLoadSuccess: function(data) {
			mui('#dg1-sum')[0].innerHTML =
				(!data || data.rows.length <= 0) ? '0' : data.total;
		}
	})
});

$(function() {
	//获取未关闭的报废单
	$.ajax({
		url: app.API_URL_HEADER + "/INVDGA/GetBillNo",
		data: {},
		dataType: "json",
		type: "post",
		async: false,
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
});

/**
 * {选择单号}
 */
document.getElementById("billNo").addEventListener("click",
	function(e) {
		userPicker.show(function(items) {
			$('#billNo').val(items[0]['value']);
			$('#dg1').datagrid('loadData', []);
			$('#dg2').datagrid('loadData', []);
			GetData();
		});
	});

function GetData() {
	//以下才是以后要的实际操作
	$('#dg1').datagrid('loadData', GetMaterialData());
};

function GetMaterialData() {
	var dgData = {};
	$.ajax({
		url: app.API_URL_HEADER + "/INVDGA/GetMaterialData", //获取数据:调用webApi服务路径
		data: {
			paging: true, //是否分页
			pageSize: $('#dg1').datagrid('options').pageSize, //页容量
			pageNumber: $('#dg1').datagrid('options').pageNumber, //初始化页码
			keys: 'DGB002', //分页主键
			DGB001: $("#billNo").val() //语句查询参数3 ：jquery
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 0) {
				var rows = [];
				$.each(data.data.tbData, function(index, item) { //遍历，整理数据
					rows.push({ //将行数据添加(push)到rows对象
						DGB003: item['DGB003'],
						DGB004: item['DGB004'],
						DGB005: item['DGB005'],
						DGB006: item['DGB006'],
					});
				});
				dgData.rows = rows;
				dgData.sumDataNo = data.data.sum;
			} else {
				mui.alert(data.message);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
	return dgData;
}

/**
 * {扫描条码事件}
 */
document.getElementById("txtBarCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		barCode = this.value.trim().toUpperCase();
		var billNo = mui("#billNo")[0].value;
		if(billNo.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请先选择单号");
			return false;
		}
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请扫码条码");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/INVDGA/GetBarInfo",
			data: {
				barCode: barCode,
				billNo: billNo
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					var num1 = data.data.num1;
					var num2 = data.data.num2;
					var wareHouse = data.data.wareHouse;
					var barCodeNum = data.data.barCodeNum;
					var materialNo = data.data.materialNo;
					if(num2 > num1) {
						var btnArray = ['否', '是']; //选项
						mui.confirm('条码数量大于未完成数量,是否继续报废？', '报废提醒', btnArray,
							function(e) {
								if(e.index == 1) { //选择的索引
									InsertINVDGC(wareHouse, barCodeNum, materialNo);
								} else {
									$("#txtBarCode").focus().val('');
								}
							});
					} else {
						InsertINVDGC(wareHouse, barCodeNum, materialNo);
					}
				} else {
					mui.alert(data.message);
					$("#txtBarCode").focus().val('');
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		$("#txtBarCode").focus().val('');
		return true;
	});

function InsertINVDGC(wareHouse, barCodeNum, materialNo) {
	//var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	//currentSession.user_id = document.getElementById("emp_no").value,
	var data = {
		spname: "SLM_BF_InsertBarCode",
		returnvalue: 0,
		_sp_TiaoMa: barCode,
		_sp_BFHao: mui("#billNo")[0].value,
		_sp_LoginId: userid,
	};
	var responseData =
		AjaxOperation(data, "信息异常", true, app.API_METHOD_ESP);
	console.log(JSON.stringify(responseData));

	if(responseData.state) {
		$("#txtBarCode").focus().val('');
		$('#dg2').datagrid('appendRow', {
			DAB001: barCode,
			DAB002: wareHouse,
			DAB006: barCodeNum,
			DAB020: materialNo
		});
	} else {
		return;
	}
	GetData();
	return true;
}

var datajson = [];

document.getElementById("btn_change").addEventListener("click",
	function(e) {
		$('#billNo').attr("disabled", false);
		$('#btn_start').attr("disabled", false);
		$('#btn_change').attr("disabled", true);
	});

document.getElementById("btn_start").addEventListener("click",
	function(e) {
		$('#billNo').attr("disabled", true);
		$('#btn_start').attr("disabled", true);
		$('#btn_change').attr("disabled", false);
		$('#show').tabs('select', '扫描条码');
		$("#txtBarCode").focus();
	});