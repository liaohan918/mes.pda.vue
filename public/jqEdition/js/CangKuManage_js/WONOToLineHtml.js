mui.plusReady(function(e) {
	app.init();
	$('#dataGrid1').datagrid({height: $(window).height() - $("#infos").height()-35});
	$('#gridKWList').datagrid({height: $(window).height() - $("#infos").height()-35});
	$('#dataGrid2').datagrid({height: $(window).height() - $("#infos").height()-35});
	$('#dataGrid3').datagrid({height: $(window).height() - $("#infos").height()-35});
});

//设置tabs属性
// $('#tabsid').tabs({
// 	height: $(window).height() - $("#infos").height(),
// 	justified: true,
// 	tabHeight: 30,
// 	narrow: true,
// 	pill: true
// });

//批量设置表格属性
$('.easyui-datagrid').datagrid({
	striped: true,
	rownumbers: true,
	singleSelect: true,
	pageSize: 10,
	sortable: false
});

//物料编码
var DAG004;
//待发数量
var waitySendQty = "";
//老工单
var OldWorkBill = "";
//仓库选择
var userPicker;
//是否不先进先出，默认不是
var sign = false;
//已推送，是否允许取消备料
var ispush=false;

$(function() {
	$('#workBill').focus();
	userPicker = new mui.PopPicker();
	//选择仓库
//	$('#ItemClass').click(function() {
//		userPicker.show(function(items) {
//			$('#ItemClass').val(items[0]['value']);
//
//			if(mui('#workBill')[0].value == "") {
//				alert('请先扫描指令单号！');
//				playerAudio("NG");
//				return;
//			}
//			//重调指令单号
//			//GetBillNo();
//			$('#dataGrid1').datagrid('loadData',$('#dataGrid1').datagrid("getData"));
//		});
//	});

	//指令工单回车
	$('#workBill').keydown(function(event) {
		if(event.keyCode != "13") {
			return;
		}

		var tmpWorkBill = mui('#workBill')[0].value;
		if(tmpWorkBill == "") {
			return;
		}
		OldWorkBill = tmpWorkBill;

		GetBillNo();
		GetWorkBillGroup(tmpWorkBill);
		dataGrid2Paging('');
	});

	//材料条码回车
	$('#tiaoMa').keydown(function(event) {
		if(event.keyCode != "13") {
			return;
		}	
		TiaoMaAction();
		
	});

	//材料列表
	$('#dataGrid1').datagrid({
		rowStyler: function(index, row) { //自定义行样式
//			if(row.MBA026!=mui('#ItemClass')[0].value
//			&&mui('#ItemClass')[0].value!=''){
//				return 'display:none';
//			} else 
			if(row.Cycount <= 0) {
				return 'background-color:lightgreen;';
			} 
//			else {return 'color:red;font-weight:bold;';
//				return 'background-color:lightgreen;';
//			}
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			DAG004 = rowData.DAG004; //物料编码
			var Cycount = rowData.Cycount; //差异数量
			if(rowData["Cycount"] > 0) {
				//查询选中的物料库位
				KuWeiDistribution();
			}
			dataGrid2Paging(DAG004);
		}	
	});
	
	
	$('#gridKWList').datagrid({		
	}).datagrid('clientPaging', KuWeiDistribution);
	
	$('#dataGrid2').datagrid({		
	}).datagrid('clientPaging', dataGrid2Paging);
});

//条码事件
function TiaoMaAction(){
	var tmpWorkBill = mui('#workBill')[0].value;
		var tmpTiaoMa = mui('#tiaoMa')[0].value;

		if(tmpTiaoMa == "") {
			return;
		}

		if(tmpWorkBill == "") {
			playerAudio("NG");
			alert("请先扫描单号~")
			return;
		}

		//每次重置数量
		waitySendQty = "";

		//用户ID
//		var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
//		var user_id = currentSession.user_id;
		//var user_id = "admin";

		var MataNo = $('#dataGrid1').datagrid('getData').rows[0].DAG004;

		$.ajax({
			url: app.API_URL_HEADER + "/WONOToLine/BarCodeKeyPress",
			data: {
				BillNo: tmpWorkBill,
				Barcode: tmpTiaoMa,
				strMataNo: MataNo,
				LoginID: app.userid,
				BarCancel: mui("#quXiao")[0].checked,
				//ItemClass: mui('#ItemClass')[0].value,
				OldWorkBill: OldWorkBill,
				pageSize: $('#gridKWList').datagrid('options').pageSize, //页容量
				pageNumber: $('#gridKWList').datagrid('options').pageNumber, //初始化页码
				keys: 'DAB029,DAB016', //分页主键
				Sign: sign,
				isPush:ispush
				
			},
			dataType: "json", //数据类型
			type: "post", //"get" 请求方式
			async: true,
			success: function(data) { //成功后操作，返回行集合(data)	
				//备料
				if(data.status == 1&&!mui("#quXiao")[0].checked) {
					playerAudio("NG");
					if("Fail" == data.message) {
						waitySendQty = data.data.waitySendQty;
						
						mui.alert(data.data.Message);
						return;
					}
					if("违反先进先出规则" == data.message.substring(0,8)){
						if(confirm(data.message + "  确认发料？"))
						{
							sign = true;
							TiaoMaAction();
							sign = false;
							return;
						}
						return;
					}
					mui.alert(data.message);
					return;
				}

				if(mui("#quXiao")[0].checked) {
					if(data.status == 0){
						$('#dataGrid1').datagrid('loadData', data.data.dataGrid1);
						mui('#dataGrid1-sum')[0].innerHTML = data.data.dataGrid1.length;
						
						playerAudio("OK");
						mui("#tiaoMa")[0].value = "";
						dataGrid2Paging('');
						mui.toast('条码' + tmpTiaoMa + '取消备料成功！');
						ispush=false;
					}
					else if(data.status == 1){
						mui.toast(data.message);
						playerAudio("NG");
					}else if(data.status == 2){
						if(confirm(data.message)){
				        	ispush=true;
				        	TiaoMaAction();
					   }
					}
					
				} else {
					$('#dataGrid1').datagrid('loadData', data.data.dataGrid1);
					mui('#dataGrid1-sum')[0].innerHTML = data.data.dataGrid1.length;
					
					playerAudio("OK");
					mui("#tiaoMa")[0].value = "";
					dataGrid2Paging('');
					mui.toast('条码' + tmpTiaoMa + '增加成功！');
				}

//				if(data.data.dataGrid2[0]["AUDITING"] == 'Y') {
//					mui.alert("当前仓库/类型已备料完成~");
//				}

			},
			error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
				return "";
			}
		});
}

//库位分页
function KuWeiDistribution(){
	//更换成异步处理
	var data = {
		strMataNo: DAG004,
		pageSize: $('#gridKWList').datagrid('options').pageSize, //页容量
		pageNumber: $('#gridKWList').datagrid('options').pageNumber, //初始化页码
		keys: 'DAB029,DAB016', //分页主键
	};

	Ajax.httpAsyncPost("/WONOToLine/GetgridKWList", data, function(data) {
		if(data.status == 1) {
			playerAudio("NG");
			mui.alert(data.message);
			return;
		}
		var dgData = {};
		dgData.rows = data.data.StockInfo;
		dgData.sumDataNo = data.data.TotalCount;
		mui('#gridKWList-sum')[0].innerHTML = data.data.TotalCount;
		$('#gridKWList').datagrid('loadData', dgData);
	});

};

//已扫列表分页
function dataGrid2Paging(WLBM){
	//更换成异步处理
	var data = {
		spname : "JT_APP_WONOToLine_SweepList",
		_sp_WorkBill: mui("#workBill")[0].value,
		_sp_WLBM: WLBM,
		_sp_ItemClass: app.userid,//modify by hbw仓库分类改为人员工号，由此去匹配区域
		_sp_PageSize: 99999999,//$('#dataGrid2').datagrid('options').pageSize, //页容量
		_sp_PageNumber: 1,//$('#dataGrid2').datagrid('options').pageNumber, //初始化页码
		returnvalue: '1'
	};

	Ajax.httpAsyncPost("/b/esp", data, function(data) {
		if(data.status == 1) {
			mui.alert(data.message);
			playerAudio("NG");
			return;
		}
		var dgData = {};
		dgData.rows = data.data[1];
		dgData.sumDataNo = data.data[0][0]["TotalCount"];
		mui('#dataGrid2-sum')[0].innerHTML = data.data[0][0]["TotalCount"];
		$('#dataGrid2').datagrid('loadData', dgData);
	});
	
}

//得到详情信息  
function GetBillNo() {
	$.ajax({
		url: app.API_URL_HEADER + "/WONOToLine/BillNoKeyPress",
		data: {
			BillNo: mui('#workBill')[0].value,
			userid: app.userid,
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(data) { //成功后操作，返回行集合(data)			
			if(data.status == 1) {
				playerAudio("NG");
				alert("获取数据失败:" + data.message);
				return;
			}
			playerAudio("OK");
			$('#dataGrid1').datagrid('loadData', data.data.MasterTable);
			mui('#dataGrid1-sum')[0].innerHTML = data.data.MasterTable.length;
			//重设仓库 分类
			//userPicker.setData(data.data.ItemClassType);

			$('#tiaoMa').focus();
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//条码拆分
function SplitBarcode(e) {

	var tmpTiaoMa = mui('#tiaoMa')[0].value;
	if(tmpTiaoMa == "") {
		playerAudio("NG");
		mui.alert("请先扫描条码，再拆分操作~")
		return;
	}

	if(waitySendQty == "") {
		playerAudio("NG");
		mui.alert("无待发数量，不需要拆分操作~")
		return;
	}

	//跳转界面
	var extras = {
		BarCode: mui('#tiaoMa')[0].value,
		waitySendQty: waitySendQty
	};
	newpage(e, extras);
	mui('#tiaoMa')[0].value='';
}

//备料完成点击
function FinishPreparation(){
	var tmpWorkBill = mui('#workBill')[0].value;
	if(tmpWorkBill == "") {
		playerAudio("NG");
		mui.alert("请先扫描指令单号~")
		return;
	}
		
	var btnArray = ['否', '是'];
	mui.confirm('确认备料完成？', '警告', btnArray, function(e) {
		if(e.index == 1) {
			$.ajax({
				url: app.API_URL_HEADER + "/WONOToLine/FinishPreparation",
				data: {
					BillNo: mui('#workBill')[0].value
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false,
				success: function(data) { //成功后操作，返回行集合(data)		
					if(data.status==1){
						alert(data.message);
						playerAudio("OK");
						return "";
					}else{
						mui.toast("推送成功");	
						playerAudio("OK");
						return "";
					}
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					playerAudio("NG");
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
					return "";
				}
			});
		}
		else
			mui.toast("取消成功~");	
	});	
}

//得到指令列表
function GetWorkBillGroup(WorkBill){
	var data = {
		WorkBill : WorkBill
	};

	Ajax.httpAsyncPost("/WONOToLine/SeachWorkBillInfo", data, function(data) {
		if(data.status == 1) {
			mui.alert(data.message);
			playerAudio("NG");
			return;
		}
		
		var dgData = {};
		dgData.rows = data.data.WorkBillInfo;
		dgData.sumDataNo = data.data.TotalCount;
		mui('#dataGrid3-sum')[0].innerHTML = data.data.TotalCount;
		$('#dataGrid3').datagrid('loadData', dgData);
	});
}
