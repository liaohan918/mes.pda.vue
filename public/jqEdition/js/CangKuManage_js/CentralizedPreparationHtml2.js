//设置tabs属性
$('#tabsid').tabs({
	height: $(window).height() - $("#infos").height(),
	justified: true,
	tabHeight: 30,
	narrow: true,
	pill: true
});

//批量设置表格属性
$('.easyui-datagrid').datagrid({
	striped: true,
	rownumbers: true,
	singleSelect: true,
	//	pagination: true,
	pageSize: 10,
	sortable: false
});

//物料编码
var DAG004;
//待发数量
var waitySendQty = "";
//老工单
var OldWorkBill;
//仓库选择
var userPicker;
//仓库选择
var typePicker;
//是否不先进先出，默认不是
var sign = false;

var MergeBill;
var Warehouse;

//供第三方跳转使用
mui.plusReady(function(e) {
	var self = plus.webview.currentWebview();
	MergeBill = self.extras.MergeBill;
	Warehouse = self.extras.Warehouse;
	mui("#ItemClass")[0].value = Warehouse;
	mui("#workBill")[0].value = MergeBill;

	$('#tiaoMa').focus();
	Init();

});

$(function() {
	$('#tiaoMa').focus();

	//测试用
//	MergeBill = "P201904020015";
//	Warehouse = "主控DIP仓";
//	mui("#ItemClass")[0].value = Warehouse;
//	mui("#workBill")[0].value = MergeBill;
//	Init();

	
});

function Init(){
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
			if(row.Cycount < 0) {
				return 'color:red;font-weight:bold;';
			} else {
				return 'background-color:lightgreen;';
			}
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
		},
		onDblClickRow: function(rowIndex, rowData) {}
	});

	$('#gridKWList').datagrid({}).datagrid('clientPaging', KuWeiDistribution);
	$('#dataGrid2').datagrid({}).datagrid('clientPaging', ScannedListPage);

	InitDatable();
}

//条码事件
function TiaoMaAction() {
	var tmpTiaoMa = mui('#tiaoMa')[0].value;
	if(tmpTiaoMa == "") {
		mui.toast("请扫描材料条码~");
		return;
	}
	//每次重置数量
	waitySendQty = "";

	//用户ID
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "admin";

	var data = {
		MergeBill: mui("#workBill")[0].value,
		Warehouse: mui("#ItemClass")[0].value,
		Barcode: tmpTiaoMa,
		LoginID: user_id,
		BarCancel: mui("#quXiao")[0].checked,
		Sign: sign
	};
	var responseData = AjaxOperation(data, "", true, "/CentralizedPreparation2/BarCodeKeyPress")
	if(!responseData.state) {
		playerAudio("NG");
		if("Fail" == responseData.data.message) {			
			waitySendQty = responseData.data.data.waitySendQty;

			mui.alert(responseData.data.data.Message);
			return;
		}
		if("这不是最早批次的物料" == responseData.data.message.substring(0, 10)) {
			if(confirm(responseData.data.message + "  确认发料？")) {
				sign = true;
				TiaoMaAction();
				sign = false;
				return;
			}
			return;
		}
		
		$('#tiaoMa').val('');
		mui.alert(responseData.data.message);		
		return;
	}
	playerAudio("OK");
	//成功后处理
	$('#dataGrid1').datagrid('loadData', responseData.data.data.dataGrid1);
	mui('#dataGrid1-sum')[0].innerHTML = responseData.data.data.dataGrid1.length;

	if(mui("#quXiao")[0].checked) {
		mui.toast('条码' + tmpTiaoMa + '取消备料成功！');
	} else {
		mui.toast('条码' + tmpTiaoMa + '增加成功！');
	}
	$('#tiaoMa').val('');
	
	ScannedListPage();
}

//库位分页
function KuWeiDistribution() {
	//查询选中的物料库位
	var data = {
		strMataNo: DAG004,
		pageSize: $('#gridKWList').datagrid('options').pageSize, //页容量
		pageNumber: $('#gridKWList').datagrid('options').pageNumber, //初始化页码
		keys: 'DAB029,DAB016' //分页主键	
	};
	var responseData = AjaxOperation(data, "", true, "/WONOToLine/GetgridKWList")
	if(!responseData.state) {
		mui.alert(responseData.data.message);
		return;
	}
	var dgData = {};
	dgData.rows = responseData.data.data.StockInfo;
	dgData.sumDataNo = responseData.data.data.TotalCount;
	mui('#gridKWList-sum')[0].innerHTML = responseData.data.data.TotalCount;
	$('#gridKWList').datagrid('loadData', dgData);
};

//已扫描列表分页
function ScannedListPage(){
	var data = {
		spname : "JT_APP_CentralizedPreparation2InitDatable",
		_sp_MergeBill: mui("#workBill")[0].value,
		_sp_Warehouse: mui("#ItemClass")[0].value,
		_sp_PageSize: $('#dataGrid2').datagrid('options').pageSize, //页容量
		_sp_PageNumber: $('#dataGrid2').datagrid('options').pageNumber, //初始化页码
		_sp_Key: 'DAH010', //分页主键
		returnvalue: '1'
	};
	var responseData = AjaxOperation(data, "", true, "/b/esp")
	if(!responseData.state) {
		mui.alert(responseData.data.message);
		return;
	}
	var dgData = {};
	dgData.rows = responseData.data.data[1];
	dgData.sumDataNo = responseData.data.data[0][0]["TotalCount"];
	mui('#dataGrid2-sum')[0].innerHTML = responseData.data.data[0][0]["TotalCount"];
	$('#dataGrid2').datagrid('loadData', dgData);
}

//初始化表格数据
function InitDatable() {

	if(MergeBill == null || Warehouse == null) {
		return;
	}
	var data = {
		MergeBill: MergeBill,
		Warehouse: Warehouse
	};
	var responseData = AjaxOperation(data, "", true, "/CentralizedPreparation2/InitDatable")
	if(!responseData.state) {
		mui.alert(responseData.data.message);
		return;
	}

	//成功后处理
	$('#dataGrid1').datagrid('loadData', responseData.data.data.dataGrid1);
	mui('#dataGrid1-sum')[0].innerHTML = responseData.data.data.dataGrid1.length;

	ScannedListPage();

	//库位列表
	DAG004 = responseData.data.data.dataGrid1[0]["DAG004"];
	KuWeiDistribution();
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
}

//备料完成点击
function FinishPreparation() {
	var btnArray = ['否', '是'];
	mui.confirm('确认备料完成？', '警告', btnArray, function(e) {
		if(e.index == 1) {
			//用户ID
			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var user_id = currentSession.user_id;
//			var user_id = "admin";

			var data = {
				spname: 'JT_APP_CentralizedPreparation2Finish',
				_sp_MergeBill: mui("#workBill")[0].value,
				_sp_LoginID: user_id,
				_sp_Warehouse: mui("#ItemClass")[0].value,
				returnvalue: '1'
			};
			var responseData = AjaxOperation(data, "", true, "/b/esp")
			if(!responseData.state) {
				playerAudio("NG");
				mui.alert(responseData.data.message);
				return;
			}

			playerAudio("OK");
			mui.toast("备料完成~");
			return;
		}
		mui.toast("已取消~");
	});

}