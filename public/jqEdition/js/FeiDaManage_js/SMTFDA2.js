mui("#texBillNo")[0].focus();
var next = []; //跳过集合
var thisDAG003 = ''; //记录当前操作的物料信息

$('#tabsid').tabs({
	height: $(window).height() - $("#form").height(),
	onSelect: function(title, index) {
		if(title == "绑定操作"){
			mui("#texMaterial")[0].focus();
		}
		if(title != "绑定操作" || thisDAG003 == "")
			return;
		if(mui("#texMaterial")[0].value.trim() == "")
			return;
		var DAG003 = $('#MaterialList').datagrid('getSelected').DAG003;
		if(thisDAG003 != DAG003) {
			$('#MaterialList').datagrid('selectRecord', thisDAG003);
		}
	}
});

//批量设置表格属性
$('.easyui-datagrid').datagrid({
	rownumbers: true,
	singleSelect: true
});
$(function() {
	//物料信息
	$('#MaterialList').datagrid({
		idField: "DAG003",
		rowStyler: function(index, row) { //自定义行样式
			if(row.CCB030 <= 0) {
				return 'color:red;';
			} else {
				return 'color:green;font-weight:bold;';
			}
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData) {
				return;
			}
				var text = 
				"站位：" + rowData.CCB007 +
				"\n飞达编号" + rowData.FDA009 
//				"\n这里不显示都没关系。。。。不要这个输入框";
				
			//这里把对应的飞达编号展示出来，
				
			mui("#MaterialInfo")[0].innerHTML = text;
		},
		onLoadSuccess: function(data) {
			mui('#MaterialList-sum')[0].innerHTML = 
			(!data || data.rows.length <= 0)
			? '0' : data.total;
		}
	});
	$('#SMTFDAList').datagrid({
		idField: "FDA010",
		onLoadSuccess: function(data) {
			mui('#SMTFDAList-sum')[0].innerHTML = 
			(!data || data.rows.length <= 0) ? '0' : data.total;
		}
	});
});

/**
 * 工单回车事件
 */
document.getElementById('texBillNo').addEventListener('keydown', function(e) {
	//重新修改过工单，重置全部数据
	if(e.keyCode != 13)
		return;
	SetSheBei();
	ResetTb();
});

var shiBeiPicker = new mui.PopPicker({
	layer: 2
}); //设备分区选择框事件

/**
 * 分区 
 */
document.getElementById('dpartition').addEventListener('tap', function(e) {
	SetSheBei();
});
/**
 * 设备
 */
document.getElementById('Equipment').addEventListener('tap', function(e) {
	SetSheBei();
});


/**
 * 飞达编号回车事件
 */
document.getElementById('texMaterial').addEventListener('keydown', function(e) {
	if(e.keyCode != 13)
		return;
	CheckMaterialInfo(); //检查条码信息
});

/**
 * 站位编号回车事件
 */
document.getElementById('txtFeederID').addEventListener('keydown', function(e) {
	if(e.keyCode != 13)
		return;
		
	var FDA018 = mui("#txtFeederID")[0].value;//绑定站位ID
	var FDA002=mui('#Equipment')[0].value; //设备编号
	
	//看看扫描的设备编号格式是不是“设备编号-”+“序号”
	if(FDA018.split('-')[0]!=FDA002)
	{
		playerAudio('NG');
		alert("站位编号"+FDA018+"，不属于当前设备"+FDA002+"，格式为：“设备编号-”+“序号”");
		mui("#txtFeederID")[0].value='';
		return;
	}
		
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var data = {
		DAG002: mui("#prepareBill")[0].value, //备料单号
		FDA001: mui("#texBillNo")[0].value, //指令单号
		DAG003: thisDAG003, //当前操作的配料单序号
		FDA018: mui("#txtFeederID")[0].value, //绑定站位ID（设备编号）
		FDA009: mui("#texMaterial")[0].value, //绑定飞达ID
		FDA012: currentSession.user_id //登陆用户  --这里写了报了 Internal server error
//      FDA012:"G98138"//先写死试一下
	};
	var responseData = AjaxOperation(data, "设备绑定", true, "/SMTFDA/EquipmentBindFD");
	if(!responseData.state) {
		playerAudio('NG');
        mui("#txtFeederID")[0].value='';
		return;
	}
	
	//alert("绑定成功！");
	playerAudio('OK');
	mui.toast('绑定成功！');
	//刷新界面，
	//检查是否还有数据
	//跳到下一条
	AgainScan(); //继续扫描
	GetThisOrderBanding();
});

/**
 * 跳过到下一条
 */
document.getElementById("next_SMTDAG").addEventListener("tap", function(e) {
	thisDAG003 = "";
	var data = $('#MaterialList').datagrid('getData');
	if(data.rows.length <= 0)
		return;
	var selectData = $('#MaterialList').datagrid('getSelected');
	if(!selectData) {
		$('#MaterialList').datagrid('selectRow', 0);
		selectData = $('#MaterialList').datagrid('getSelected');
	}
	if($.inArray(selectData.DAG003, next) < 0) {
		next.push(selectData.DAG003); //WOMDAG序号
	}
	var tiaoguo = mui("#tiaoguo")[0];
	var thisPage = false; //当前页是否存在还未备料的信息：默认false:没有
	$.each(data.rows, function(index, item) {
		if($.inArray(item.DAG003, next) < 0) { //跳过列表中不存在，则选择这行
			$('#MaterialList').datagrid('selectRow', index);
			mui.toast('跳过！');
			thisPage = true;
			tiaoguo.innerHTML = next.length;
			return false;
		}
	});
	if(thisPage) //当前页没有可处理的数据（除开跳过的数据），就进行换页操作
		return;
	next = [];
	tiaoguo.innerHTML = "0";
	$('#MaterialList').datagrid('selectRow', 0);
});

/**
 * 重新扫描条码
 */
document.getElementById("again_code").addEventListener("click", function(e) {
	AgainScan();
});

function AgainScan() {
	if($("#Equipment").val() == "") //设备分区为空就不进行操作
		return;
	//这个顺序不要换，因为物料条码有失去焦点事件，所以要先把飞达输入框清空先
	$("#divtxtFeederID").val("").css("display", "none");
	$("#divtexMaterial").css("display","");
	$("#texMaterial").val("").focus();
	thisDAG003 = "";
}

/**
 * 设备、分区点选事件
 */
function SetSheBei() { //设置设备分区
	var workBill = mui("#texBillNo")[0].value
	if(workBill == "") {
		playerAudio("NG");
		mui.toast("请输入指令单号！");
		mui("#texBillNo")[0].focus(); //指令获得交单
		return;
	}
	var data = GetSheBeiData(workBill);
	if(data.length <= 0)
		return;
	shiBeiPicker.setData(data);
	var Equipment = document.getElementById('Equipment');
	var dpartition = document.getElementById('dpartition');
	shiBeiPicker.show(function(items) {
		var a = items[0].value;
		var b = items[1].value;
		if(Equipment.value == a && dpartition.value == b)
			return;
		//如果有变更才继续执行
		Equipment.value = a ? a : "";
		dpartition.value = b ? b : "";
		GetThisOrderBanding();
		$("#divtexMaterial").css("display","");
		$("#texMaterial").val("").focus();
	});
};

/**
 * 设备、分区点击后出发的功能
 * @param {指令单号} workBill
 */
function GetSheBeiData(workBill) {
	var SheBeiData = [];
	var data = {
		OrderNum: workBill,
		bangDingType:'2'//标记飞达跟设备之间的绑定
	};
	var responseData = AjaxOperation(data, "获取设备分区", true, "/SMTFDA/GetOrderNumInfo");
	if(!responseData.state) {
		ResetTb();
		return SheBeiData;
	}
	var EquipmentRows = responseData.data.data.DicunBindInfo;
	for(var key in EquipmentRows) {
		var i = {
			text: key,
			value: key,
			children: []
		};
		for(var item in EquipmentRows[key]) {
			var children = {};
			children.text = EquipmentRows[key][item];
			children.value = EquipmentRows[key][item];
			i.children.push(children)
		}
		SheBeiData.push(i);
	}
	return SheBeiData;
}

/**
 * 检测材料条码信息，然后回填提示
 */
function CheckMaterialInfo() {
	var code = mui("#texMaterial")[0].value.trim();
	if(code == '') {
		playerAudio("NG");
		alert('飞达编号不能为空！');
		return;
	}
	var data = {
		DAH002: mui("#prepareBill")[0].value, //备料单号
		FDA001: mui("#texBillNo")[0].value, //指令单号
		FDA009: code, //飞达编号
		FDA002:mui('#Equipment')[0].value, //设备
		FDA003:mui('#dpartition')[0].value //分区
	};
	var responseData = AjaxOperation(data, "检查飞达编号信息", true, "/SMTFDA/CheckFD");
	if(!responseData.state) {
		playerAudio("NG");
		$("#texMaterial").val("");
		$("#texMaterial").focus();
		return;
	}
	$("#divtexMaterial").css("display", "none");
	$("#divtxtFeederID").css("display","");
	$("#txtFeederID").val("").focus();
	$('#MaterialList').datagrid('selectRecord', responseData.data.data); //返回序号
	thisDAG003 = responseData.data.data; //回填当前序号
}

/**
 * 点击确定后加载出当前分区绑定的信息
 */
function GetThisOrderBanding() {
	var WorkOrder = mui('#texBillNo')[0].value; //指令单号
	var Equipment = mui('#Equipment')[0].value; //设备
	var Dpartment = mui('#dpartition')[0].value; //分区
	var data = {
		WorkOrder: WorkOrder,
		Equipment: Equipment,
		Dpartment: Dpartment
	};
	GetFeederBindInfo(data); //获取未绑定的物料、栈位的信息
}

/**
 * 获取未绑定的物料、栈位的信息
 * @param {查询参数} data
 */
function GetFeederBindInfo(data) {
	//获取物料信息
	var responseData = AjaxOperation(data, "获取物料信息", true, "/SMTFDA/GetEquipmentBindInfo");
	if(!responseData.state) {
		//说明该分区备料已经OK
		ResetTb();
		$('#SMTFDAList').datagrid('loadData', responseData.data.data.SMTFDA);
		$('#texMaterial').val('');
		return false;
	}
	var tbBindInfo = responseData.data.data.tbBindInfo;
	$('#MaterialList').datagrid('loadData', tbBindInfo);
	$.each(tbBindInfo, function(index, item) {
		if($.inArray(item.DAG003, next) < 0) { //跳过列表中不存在，则选择这行
			$('#MaterialList').datagrid('selectRow', index);
			return false; //跳出
		}
	});
	$("#prepareBill").val(tbBindInfo[0].DAG002);
	$('#SMTFDAList').datagrid('loadData', responseData.data.data.SMTFDA);
	return true;
}

/**
 * 获取材料明细信息
 */
function SearchReelIDInfo(data) {
	var responseData = AjaxOperation(data, "获取物料材料明细", true, "/SMTFDA/SearchReelIDInfo");
	if(!responseData.state)
		return false;
	return true;
}

/**
 * 重置清空数据表格、输入框、跳过等
 */
function ResetTb() {
	$(':input', '#info').val("");
	mui("#MaterialInfo")[0].innerHTML = "";
	mui('#MaterialList-sum')[0].innerHTML = '0';
	mui('#SMTFDAList-sum')[0].innerHTML = '0';
	next = [];
	thisDAG003 = "";
	mui("#tiaoguo")[0].innerHTML = '0';
	$('#MaterialList').datagrid('loadData', []);
	$('#SMTFDAList').datagrid('loadData', []);
	$("#divtexMaterial").css("display", "");
	$("#divtxtFeederID").css("display", "none");
	$("#txtMaterial").val('').focus();
	$("#txtFeederID").val('');
}