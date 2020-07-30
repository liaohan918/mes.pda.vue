//描述：分区备料和前加工备料公用的js，所以在修改方法后请查看一下是否会互相影响
        
//*************************************
//初始化设置
var next = []; //跳过集合
//修改者庄卓杰
var shouTao=false;
//设置tabs属性
$('#tabsid').tabs({
	height: $(window).height() - $("#infos").height() - 35,
	justified: true,
	tabHeight: 30,
	narrow: true,
	pill: true
});

//add by HCW 20200317
mui.plusReady(function() {
	$('#tabsid').tabs({
		height: $(window).height() - $("#infos").height() - 35
	});
});

//批量设置表格属性
$('.easyui-datagrid').datagrid({
	striped: true,
	rownumbers: true,
	singleSelect: true,
	pagination: true,
	pageSize: 30,
	sortable: false
});
$(function() {
	//材料列表
	$('#dgWOMDAG').datagrid({
		rowStyler: function(index, row) { //自定义行样式
			//首套
			//修改者：庄卓杰
			if($('#shouTao').is(":checked")){
				if(row.DAG015 <= (mui("#shouTaoNum")[0].value==''?0:mui("#shouTaoNum")[0].value)) {//修改：庄卓杰 2019年8月4日
					return 'color:red;font-weight:bold;';
				} else {
					return 'background-color:lightgreen;';
				}
			}
			else{
				if(row.Cycount < 0) {
					return 'color:red;font-weight:bold;';
				} else {
					return 'background-color:lightgreen;';
				}
			}
//			if(row.Cycount < 0) {
//				return 'color:red;font-weight:bold;';
//			} else {
//				return 'background-color:lightgreen;';
//			}
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			var DAG004 = rowData.DAG004; //物料编码
			var Cycount = rowData.Cycount; //差异数量
			var DAG037 = rowData.DAG037; //设备编号
			var DAG038 = rowData.DAG038; //分区
			var DAG039 = rowData.DAG039; //站位
			//修改者：庄卓杰
			if($('#shouTao').is(":checked")){
				//修改：庄卓杰 2019年8月4日
				if(rowData["DAG015"] <= (mui("#shouTaoNum")[0].value==''?0:mui("#shouTaoNum")[0].value)) {
					$('#div_BARDAB').show();
					var B_Data = GetDatadgBARDAB($('#dgBARDAB'), 1, $('#dgBARDAB').datagrid('options').pageSize);
					mui('#dgBARDAB-sum')[0].innerHTML = !B_Data ? '0' : B_Data.sumDataNo;
					$('#dgBARDAB').datagrid('loadData', B_Data);
	
				} else {
					$('#div_BARDAB').hide();
					mui('#dgBARDAB-sum')[0].innerHTML = '0';
					$('#dgBARDAB').datagrid('loadData', []);
				}	
			}
			else{
				if(rowData["Cycount"] < 0) {
					$('#div_BARDAB').show();
					var B_Data = GetDatadgBARDAB($('#dgBARDAB'), 1, $('#dgBARDAB').datagrid('options').pageSize);
					mui('#dgBARDAB-sum')[0].innerHTML = !B_Data ? '0' : B_Data.sumDataNo;
					$('#dgBARDAB').datagrid('loadData', B_Data);
	
				} else {
					$('#div_BARDAB').hide();
					mui('#dgBARDAB-sum')[0].innerHTML = '0';
					$('#dgBARDAB').datagrid('loadData', []);
				}				
			}
//			if(rowData["Cycount"] < 0) {
//				$('#div_BARDAB').show();
//				var B_Data = GetDatadgBARDAB($('#dgBARDAB'), 1, $('#dgBARDAB').datagrid('options').pageSize);
//				mui('#dgBARDAB-sum')[0].innerHTML = !B_Data ? '0' : B_Data.sumDataNo;
//				$('#dgBARDAB').datagrid('loadData', B_Data);
//
//			} else {
//				$('#div_BARDAB').hide();
//				mui('#dgBARDAB-sum')[0].innerHTML = '0';
//				$('#dgBARDAB').datagrid('loadData', []);
//			}
			mui('#info_BARDAB')[0].innerHTML = DAG004 + " 差异:" + Cycount + " 站位:" + DAG039;
		},
		onDblClickRow: function(rowIndex, rowData) {
			//if(rowData && rowData["Cycount"] < 0) {
			//	$('#tabsid').tabs('select', '库位列表');
			//}
		}
	}).datagrid('clientPaging', GetDatadgWOMDAG);
	//库位列表
	$('#dgWOMDAH').datagrid({}).datagrid('clientPaging', GetDatadgWOMDAH);
	//已扫描列表
	$('#dgBARDAB').datagrid({
		//height: $('#tabsid').height() - 35
	}).datagrid('clientPaging', GetDatadgBARDAB);
});

/**
 * 获取材料列表数据
 */
function GetDatadgWOMDAG() {
	var keys = "DAG023,DAG004,DAG037,DAG038,DAG039,DAG003 desc";
	var G_Data = GetData($('#dgWOMDAG'), "WOMDAG", keys);
	mui('#dgWOMDAG-sum')[0].innerHTML = !G_Data ? '0' : G_Data.sumDataNo;
	return !G_Data ? [] : G_Data;
}
/**
 * 获取已扫描列表数据
 */
function GetDatadgWOMDAH() {
	var keys = "DAH006,DAH011,DAH003";
	var H_Data = GetData($('#dgWOMDAH'), "WOMDAH", keys);
	mui('#dgWOMDAH-sum')[0].innerHTML = !H_Data ? '0' : H_Data.sumDataNo;
	return !H_Data ? [] : H_Data;
}

function GetDataDAG_DAH(data) {
	var dgData = {
		rows: [],
		sumDataNo: 0
	};
	var responseData =
		AjaxOperation(data, "获取指令信息", true, "/ReadyMaterial/OpenData")
	if(!responseData.state||responseData.data.message=='NG')//修改：庄卓杰 2019年8月4日
		return dgData;
	dgData.rows = responseData.data.data.tbData;
	dgData.sumDataNo = responseData.data.data.sum;
	return dgData;
}

/**
 * 设置表格数据
 * @param {选择索引} index
 */
function SetDataDAG_DAH(index) {
	$('#dgWOMDAG').datagrid('loadData', GetDatadgWOMDAG());
	var len = $('#dgWOMDAG').datagrid('getData').rows.length;
	if(len <= 0) {
		playerAudio("NG");
		//修改者庄卓杰 2019年8月4日
		if(typeof($("#shouTao").prop("checked")) == 'undefined')
			shouTao=false;
		else
			shouTao=mui("#shouTao")[0].checked;
		if(shouTao&&confirm('首套料以备完，是否备所有料？')){
			$('#shouTao').prop('checked',false);
			SetShouTaoNum(false);
			SetDataDAG_DAH();
			return;
		}
		else
			ResetTb();
		return;
	}
	$('#dgWOMDAH').datagrid('loadData', GetDatadgWOMDAH());
	$('#dgWOMDAG').datagrid('selectRow', index?index:0);

	mui("#tiaoMa")[0].focus(); //指令获得交单
}

/**
 * 跳过到下一条
 */
document.getElementById("next_BARDAB").addEventListener("tap", function(e) {
	var DAG003 = $('#dgWOMDAG').datagrid('getSelected').DAG003;
	if($.inArray(DAG003, next) < 0) {
		next.push(DAG003); //WOMDAG序号
	}
	var stateType = mui("#stateType")[0];
	if(stateType)
		stateType.checked = false; //跳过的时候只对备料未完成的进行操作
	var data = $('#dgWOMDAG').datagrid('getData');
	if(!data)
		return;
	var thisPage = false; //当前页是否存在还未备料的信息：默认false:没有
	$.each(data.rows, function(index, item) {
		if($.inArray(item.DAG003, next) < 0) { //跳过列表中不存在，则选择这行
			$('#dgWOMDAG').datagrid('selectRow', index);
			mui.toast('下一个！');
			thisPage = true;
			return false;
		}
	});
	if(thisPage) //当前页没有可处理的数据（除开跳过的数据），就进行换页操作
		return;
	var pageNumber = $('#dgWOMDAG').datagrid('options').pageNumber;
	var pageSize = $('#dgWOMDAG').datagrid('options').pageSize;
	var total = data.total;
	if(total < pageSize * pageNumber) { //超过总数量后重新清空跳过集合，并重新从第一页开始
		mui.toast('返回第一页');
		next = [];
		$('#dgWOMDAG').datagrid('getPager').pagination('select', 1);
	} else {
		mui.toast('下一页');
		$('#dgWOMDAG').datagrid('getPager').pagination('select', pageNumber + 1);
	}
});

/**
 * 获取当前物料编码在库的库位列表
 * @param {当前触发页改变事件的表格} e
 * @param {当前页} pageNum
 * @param {总页数} pageSize
 */
function GetDatadgBARDAB(e, pageNum, pageSize) {
	var dgData = {};
	var keys = "DAB028,CASE WHEN (DAB029 <> '' or DAB029 is null) THEN DAB029 ELSE '2200-01-01' END,DAB016,DAB001";
	var data = {
		strPH: $('#dgWOMDAG').datagrid('getSelected')["DAG004"],
		pageSize: pageSize,
		pageNumber: pageNum,
		keys: keys
	};
	var responseData =
		AjaxOperation(data, "获取库位列表", true, "/ReadyMaterial/GetStockInfo")
	if(!responseData.state)
		return;
	dgData.rows = responseData.data.data.tbData;
	dgData.sumDataNo = responseData.data.data.sum;
	return dgData;
}

/**
 * 材料条码回车事件
 */


document.getElementById('tiaoMa').addEventListener('keydown', function(e) {
	if(e.keyCode != 13)
		return;
	var barcode = mui("#tiaoMa")[0].value; //材料条码
	if(barcode.trim() == "") {
		playerAudio("NG");
		alert("请扫描物料条码！");
		mui('#tiaoMa')[0].focus();
		return;
	}
	var workBill = mui("#workBill")[0].value; //指令单号
	if(workBill == "") {
		playerAudio("NG");
		alert("请输入指令单号！");
		mui("#tiaoMa")[0].value='';
		mui("#workBill")[0].focus(); //指令获得交单
		return;
	}
	if(typeof(mui("#dcode")[0])!='undefined'&&typeof(mui("#dpartition")[0])!='undefined'){
		var dcode=mui("#dcode")[0].value;
		var dpartition=mui("#dpartition")[0].value;
		if(dcode == ''||dpartition=='') {
			playerAudio("NG");
			alert("请选择设备和分区！");
			mui("#tiaoMa")[0].value='';
			return;
		}
	}
	//修改者庄卓杰 2019年8月4日
	var shouTaoNum;
	if(typeof($("#shouTao").prop("checked")) == 'undefined'){
		shouTao=false;
		shouTaoNum=''
	}
	else{
		shouTao=mui("#shouTao")[0].checked;	
		shouTaoNum=mui("#shouTaoNum")[0].value;
	}
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var data = {
		Auditor: currentSession.user_id, //用户ID 'admin',
		DAB001: barcode, //材料条码
		DAF015: workBill, //指令单号
		DAF002: mui("#prepareBill")[0].value, //备料单号
		DAG037: mui("#dcode")[0] ? mui("#dcode")[0].value : "", //设备编号
		DAG038: mui("#dpartition")[0] ? mui("#dpartition")[0].value : "", //设备分区
		/*修改者：庄卓杰*/
		shouTao: shouTao,
		//修改：庄卓杰 2019年8月4日
		shouTaoNum:shouTaoNum
	};
	//根据是否是取消备料，来进行执行不同的操作
	if(mui("#quXiao")[0].checked) {
		if(!confirm("是否取消条码" + barcode + "的备料信息")){
			mui("#tiaoMa")[0].focus();
			mui("#tiaoMa")[0].select();
			return;			
		}
		var responseData =
			AjaxOperation(data, "取消备料", true, "/ReadyMaterial/BarCancelReady")
		if(!responseData.state)
		{
			mui("#tiaoMa")[0].focus();
			mui("#tiaoMa")[0].select();
			playerAudio("NG");
			return;
		}
			
		mui.toast('条码' + barcode + '取消备料成功！');
		playerAudio("OK");
		SetDataDAG_DAH(0);

	} else {
		//1.刷新数据
		//2.根据清空继续选择当前 页/行
		if(AddMaterial(data)) {
			
			mui.toast('条码' + barcode + '增加成功！');
			playerAudio("OK");
			var aa = $('#dgWOMDAG').datagrid('getSelected');
			var index = !aa?0:aa.rownumber;
			SetDataDAG_DAH(index);
		}
	}
	$(this).focus();
	$(this).select();
});

/**
 * 检查该条码信息是否符合条件
 * 检查该条码是否符合当前工单
 * 如果符合当前工单：当前料是否已经满足当前工单
 * 检查条码是否符合先进先出
 * 插入备料表（WOMDAH）
 * 刷界面：材料列表、已扫描列表
 * 查询该条码所对应的物料是不是最新批次
 */
function AddMaterial(data) {
	var responseData =
		AjaxOperation(data, "检查材料条码信息", true, "/ReadyMaterial/IsNewLotNo")
	if(!responseData.state)
	{
		playerAudio("NG");
		return false;
	}
		
	if(!responseData.data.data) { //不是最早批次，是否进行备料
		if(confirm(responseData.data.message)) {
			responseData =
				AjaxOperation(data, "插入材料条码信息", true, "/ReadyMaterial/AddMaterial")
			if(!responseData.state)
			{
				playerAudio("NG");
				return false;
			}
				
		}
	}
	return true;
}

/**
 * 重置清空数据表格、输入框、跳过等
 */
function ResetTb() {
	$(':input', '#filtra').val("");
	mui('#dgWOMDAG-sum')[0].innerHTML = '0';
	mui('#dgWOMDAG-sum')[0].innerHTML = '0';
	mui('#dgBARDAB-sum')[0].innerHTML = '0';
	$('#div_BARDAB').hide();
	mui('#info_BARDAB')[0].innerHTML = "";
	mui('#dgBARDAB-sum')[0].innerHTML = '0';
	next = [];
	$('#dgWOMDAG').datagrid('loadData', []);
	$('#dgWOMDAH').datagrid('loadData', []);
	$('#dgBARDAB').datagrid('loadData', []);
}

