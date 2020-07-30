/**
 * 作者：G98138 黎锋
 * 时间：2018-09-05
 * 描述：库位、物料编码、物料条码查询
 * 
 */
var sumDataNo = 0; //总行数量
//$(function(){
//	$("#DAB001")[0].focus();
//	$("#tb1").datagrid().datagrid("clientPaging",GetData);
//});
mui.plusReady(function() {
	$("#DAB001")[0].focus();
	$('#tb1').datagrid({height: $(window).height() - $("#input01").height() - $("#input04").height() - 35})
	$('#tb2').datagrid({height: $(window).height() - $("#input02").height() - 75}); 
	$('#tb3').datagrid({height:$(window).height() - $("#input03").height() - 75});
	$("#barCodeInfo").height($(window).height() - $("#input03").height() - $("#div001").height() - 88);
		// $("#checkbox01").prop("checked", true);
}); 
 
$(function() {
	$("#tb1").datagrid().datagrid("clientPaging", GetData);
	$("#checkbox01").prop("checked", true);
	$('#tb1').datagrid({height: $(window).height() - $("#input01").height() - $("#input04").height() - 35})
	$('#tb2').datagrid({height: $(window).height() - $("#input02").height() - 75}); 
	$('#tb3').datagrid({height:$(window).height() - $("#input03").height() - 75});
	$("#barCodeInfo").height($(window).height() - $("#input03").height() - $("#div001").height() - 88);
});
/**
 * 根据库位查询物料
 */
function GetMaterielByStore() {
	//库位为空
	//如果未输入条码，跳出方法
	if(event.keyCode == 13) {
		if($("#DAB001").val() == "") {
			playerAudio("NG");
			return false;
		}
		$("#tb1").datagrid('loadData', {
			total: 0,
			rows: []
		}); //清空一下表格数据
		$("#tb1").datagrid("loadData", GetData());
		document.getElementById("DAB001").select();
		playerAudio("OK");
		return true;
	}
};

/*
 * 选择时间
 */
function ClickDate() {

	var a = $("#ruKuDate");
	//var userPicker = new mui.pickDate();
	//  var year=new Date().getFullYear() ;
	//  var  month=new Date().getMonth();
	//  var day=new Date().getDate();
	//  
	var dtPicker = new mui.DtPicker({
		type: "date", //设置日历初始视图模式 
		beginDate: new Date(2019, 01, 01), //设置开始日期 
		endDate: new Date(3099, 03, 01), //设置结束日期 
		//	labels: ['年', '月', '日'],//设置默认标签区域提示语 
		//	language:'zh-CN',
		//  customData: {}//时间/日期别名 
	})
	dtPicker.show(function(e) {
		$("#ruKuDate").val(e.y.text + "-" + e.m.text + "-" + e.d.text);
		$("#DAB001").val("");
		$("#DAB001").focus();

	});
};

/**
 * 通过ajax获取页面数据
 * @param{是否分页}
 * @param{页容量}
 * @param{页码}
 * @param{分页主键}
 */
function GetData() {
	var dgData = {};
	$.ajax({
		url: app.API_URL_HEADER + '/WARBAA/GetMetrialByStore',
		data: {
			paging: true, //是否分页
			pageSize: $("#tb1").datagrid('options').pageSize, //页容量
			pageNumber: $("#tb1").datagrid('options').pageNumber, //初始化页面
			keys: "PartNo", //分页主键
			DAB001: $("#DAB001").val(), //查询条件
			check: $("#checkbox01").prop("checked") == true ? "1" : "2", //获取复选框是否被选中（1-在库，2-在线）
			ruKuDate: $("#ruKuDate").val().toString(),
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) { //成功
			if(data.status == 0) {
				var rows = [];
				if(data.data.tbData.length <= 0) {
					playerAudio("NG");
					mui.alert("该库位无物料数据，请确认库位是否正确！");
					return false;
				}
				$.each(data.data.tbData, function(index, item) {
					rows.push({
						PartNo: item["PartNo"],
						PartName: item["PartName"],
						Barcode: item["Barcode"],
						Qty: item["Qty"],
						SupplyInfo: item["SupplyInfo"],
						ArrivalBillNo: item["ArrivalBillNo"],
						POBillNo: item["POBillNo"],
						ArrivalDate: item["ArrivalDate"]
					});
				});
				dgData.rows = rows;
				dgData.sumDataNo = data.data.sum;
				$("#tb1").datagrid("loadData", data.data.tbData);
				document.getElementById("DAB001").select();
				//数量标签
				$("#sum01")[0].innerHTML = rows.length;
				playerAudio("OK");
			} else {
				playerAudio("NG");
				mui.alert(data.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(data.message));
			playerAudio("NG");
		}
	});
	return dgData;
};

/**
 * “在库”勾选与取消勾选处理方法
 */
function checkInStore() {
	if($("#DAB001").val() == "") { //库位为空时，不做处理
		$("#tb1").datagrid('loadData', {
			total: 0,
			rows: []
		}); //清空一下表格数据
		return false;
	}
	$("#tb1").datagrid('loadData', {
		total: 0,
		rows: []
	}); //清空一下表格数据
	$("#tb1").datagrid("loadData", GetData());
	return true;

};

/****************************以上未库位查询处理**********************************/

/****************************以下为空库位查询处理********************************/

/**
 * 获取仓库列表
 */
function ClickStore() {
	var userPicker = new mui.PopPicker(); //声明对象
	$.ajax({
		url: app.API_URL_HEADER + '/WARBAA/GetEmptyStore',
		data: {},
		DataType: "json",
		type: "post",
		success: function(data) {
			console.log(JSON.stringify(data));
			var dt = data.data;
			userPicker.setData(dt); //设置弹框（仓库列表）内容
			//		$("#MDA001").val(dt[0]["MDA001"]);//默认显示首项
			//		GetStoreList(dt[0]["MDA001"]);//获取仓库列表
			//获取空库位列表
			userPicker.show(function(items) {
				$("#MDA001").val(items[0]['text']);
				GetStoreList(items[0]['value']);
			});
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			playerAudio("NG");
		}
	});
};

/**
 * 根据仓库编码获取空库位列表
 * 
 */
function GetStoreList(wareHouseNo) {
	$.ajax({
		url: app.API_URL_HEADER + '/WARBAA/GetStoreList',
		data: {
			wareHouseNo: wareHouseNo
		},
		DataType: "json",
		type: "post",
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.data.length <= 0) {
				playerAudio("NG");
				mui.alert("仓库：" + wareHouseNo + " 无空库位！");
				$("#tb2").datagrid('loadData', {
					total: 0,
					rows: []
				}); //清空一下表格数据
				return false;
			}
			$("#tb2").datagrid('loadData', data.data);
			$("#sum02")[0].innerHTML = $("#tb2").datagrid("getRows").length; //数量标签

			playerAudio("OK");
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			playerAudio("NG");
		}
	});
};
/********************以上为空库位查询处理*******************************/

/********************以下为条码查询处理********************************/
/**
 * 根据物料条码查询信息
 */
function GetMaterielByBarCode() {
	if(event.keyCode == 13) {
		$("#barCodeInfo").val("");
		if($("#BARDAB001").val() == "") {
			playerAudio("NG");
			return;
		}
		$.ajax({
			url: app.API_URL_HEADER + '/WARBAA/GetMaterielInfo',
			data: {
				barCode: $("#BARDAB001").val()
			},
			DataType: "json",
			type: "post",
			async: true,
			success: function(data) {
				if(data.data == null) {
					document.getElementById("BARDAB001").select();
					playerAudio("NG");
					mui.alert("物料条码不存在,请确认条码是否正确!");

					return false;
				}
				$("#barCodeInfo").val(data.data);

				document.getElementById("BARDAB001").select();
				playerAudio("OK");
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
			}
		});
	}
};
/********************以上为条码查询处理********************************/

/********************以下为物料编码查询处理*****************************/
/**
 * 根据物料编码查询物料信息（支持模糊查询）
 */
function GetMateriels(isTM) {
	if(event.keyCode == 13) {
		$("#tb3").datagrid('loadData', {
			total: 0,
			rows: [],
			footer:[]
		}); //清空一下表格数据
		var DAB020='';
		if(isTM == 'Y') {
			if($("#TM").val() == "") {
				playerAudio("NG");
				return;
			}
			DAB020=$("#TM").val();
		} else {
			if($("#DAB020").val() == "") {
				playerAudio("NG");
				return;
			}
			DAB020=$("#DAB020").val();
		}

		$.ajax({
			url: app.API_URL_HEADER + '/WARBAA/GetMateriels',
			data: {
				DAB020: DAB020,
				isTM: isTM
			},
			DataType: "json",
			type: "post",
			async: true,
			success: function(data) {
				console.log(data.data);
				if(data.data.length <= 0) {
					playerAudio("NG");
					document.getElementById("DAB020").select();
					mui.alert("该物料编码无数据，请核对物料编码是否输入正确！");
					return false;
				} else {
					//杨俊燃，添加汇总数据 2019-10-24
					var da = {
							rows: data.data.tbMetrial,
							footer:[
							{"DAB020":"原材料","DAB003":data.data.yilouSum,"DAB006":"WIP","DAB035":data.data.erlouSum},
							]
					}
					$("#tb3").datagrid('loadData', da);
					//如何给数量小标签赋值
					$("#sum04")[0].innerHTML = $("#tb3").datagrid("getRows").length; //数量标签
					document.getElementById("DAB020").select();
					playerAudio("OK");
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
			}
		});
	}
};