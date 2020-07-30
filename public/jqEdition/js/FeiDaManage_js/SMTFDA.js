mui("#texBillNo")[0].focus();
var next = []; //跳过集合
var thisDAG003 = ''; //记录当前操作的物料信息
var flag = false;

/* 飞达解绑：将物料和feeder取消关联 */
$("#txtunBindFeeder").keydown(function(e) {
	if (e.keyCode != 13) return;
	unBINDFeeder();
});

function unBINDFeeder() {
	var feeder = $("#txtunBindFeeder").val(); //解绑飞达
	if (!confirm('是否要解绑飞达：' + feeder))
		return;
	var data = {
		FeederID: feeder
	};
	var responseData = AjaxOperation(data, "飞达解绑", true, "/FeederunBind/FeederUnbind");
	if (responseData.state) {
		var del_index = $('#SMTFDAList').datagrid('getRowIndex', feeder);;
		$('#SMTFDAList').datagrid('deleteRow', del_index)
		var i = mui('#SMTFDAList-sum')[0].innerHTML;
		mui('#SMTFDAList-sum')[0].innerHTML = i - 1;
		$("#divtexMaterial").css("display", "");
		$("#divtxtFeederID").css("display", "none");
		$("#txtMaterial").val('').focus();
		$("#txtFeederID").val('');
		$("#txtunBindFeeder").val('');
	}
};

$('#tabsid').tabs({
	height: $(window).height() - $("#form").height(),
	onSelect: function(title, index) {
		/*重新获取一下获取未绑定的物料、栈位的信息，因为解绑后，没有刷新数据，导致推荐错误*/
		//黎锋 2019.5.24 改
		if (title == "物料信息") {
			var WorkOrder = mui('#texBillNo')[0].value; //指令单号
			var Equipment = mui('#Equipment')[0].value; //设备
			var Dpartment = mui('#dpartition')[0].value; //分区
			var data = {
				WorkOrder: WorkOrder,
				Equipment: Equipment,
				Dpartment: Dpartment
			};
			if (WorkOrder != "" && Equipment != "" && Dpartment != "")
				GetFeederBindInfo(data); //获取未绑定的物料、栈位的信息
			/*重新获取一下获取未绑定的物料、栈位的信息，因为解绑后，没有刷新数据，导致推荐错误*/
		}
		if (title == "绑定操作") {
			mui("#texMaterial")[0].focus();
		}
		if (title == "已绑定列表") {
			mui("#txtunBindFeeder")[0].focus();
		}
		if (title != "绑定操作" || thisDAG003 == "") {
			return;
		}
		
		if (mui("#texMaterial")[0].value.trim() == "")
			return;
		var DAG003 = $('#MaterialList').datagrid('getSelected').DAG003;
		if (thisDAG003 != DAG003) {
			$('#MaterialList').datagrid('selectRecord', thisDAG003);
		}
	}
});

//批量设置表格属性
$('.easyui-datagrid').datagrid({
	rownumbers: true,
	singleSelect: true
})

$(function() {
	//物料信息
	$('#MaterialList').datagrid({
		idField: "DAG003",
		rowStyler: function(index, row) { //自定义行样式
			if (row.CCB030 <= 0) {
				return 'color:red;';
			} else {
				return 'color:green;font-weight:bold;';
			}
		},
		onSelect: function(rowIndex, rowData) {
			if (!rowData) {
				$('#BarcodeMaterial').datagrid('loadData', []);
				return;
			}
			var text = "飞达位置：" + rowData.CCB007 +
				"\n飞达规格：" + rowData.CCB022 +
				"\n物料编码：" + rowData.CCB010 +
				"\n推荐绑定物料条码：";
			if (rowData.CCB030 <= 0) {
				text += "\n当前飞达位置未备料";
				mui("#MaterialInfo")[0].innerHTML = text;
				return;
			}
			//1.获取条码明细
			var data = {
				WorkOrder: rowData.DAG002, //备料单号
				DAH006: rowData.CCB010, //设备编码
				DAG038: rowData.CCB006, //分区
				DAG039: rowData.CCB007 //站位
			};
			SearchReelIDInfo(data);
			$('#BarcodeMaterial').datagrid('selectRow', 0);
			var data_SMTFDA = $('#BarcodeMaterial').datagrid('getSelected');
			text += "\n物料条码：" + data_SMTFDA.DAH005 +
				"\n备料数量：" + data_SMTFDA.DAH011 +
				"\n备料时间：" + data_SMTFDA.DAH010;
			mui("#MaterialInfo")[0].innerHTML = text;
		},
		onLoadSuccess: function(data) {
			mui('#MaterialList-sum')[0].innerHTML =
				(!data || data.rows.length <= 0) ?
				'0' : data.total;
		}
	});
	$('#SMTFDAList').datagrid({
		idField: "FDA009",
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
	if (e.keyCode != 13)
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
 * 物料条码回车事件
 */
document.getElementById('texMaterial').addEventListener('keydown', function(e) {
	if (e.keyCode != 13)
		return;
	CheckMaterialInfo(); //检查条码信息
});

/**
 * 飞达回车事件
 */
document.getElementById('txtFeederID').addEventListener('keydown', function(e) {
	if (e.keyCode != 13)
		return;
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var data = {
		spname: "Create_SMTFDA", //飞达绑定前校验
		returnvalue: 1,
		_sp_DAG002: mui("#prepareBill")[0].value, //备料单号
		_sp_FDA001: mui("#texBillNo")[0].value, //指令单号
		_sp_DAG003: thisDAG003, //当前操作的配料单序号
		_sp_FDA009: mui("#txtFeederID")[0].value, //绑定飞达ID
		_sp_FDA010: mui("#texMaterial")[0].value, //绑定条码
		_sp_FDA002: mui("#Equipment")[0].value, //设备编码
		_sp_FDA003: mui("#dpartition")[0].value, //设备分区
		_sp_FDA012: currentSession.user_id //登陆用户
	};

	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: data,
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			results = data;
			if (data.status == 0) {
				playerAudio('OK');
				//mui.alert("绑定成功！");
				mui.toast('绑定成功！');
				mui("#texMaterial")[0].focus(); //材料条码输入框获得焦点
				mui("#texMaterial")[0].value = '';
				flag = true;
				return true;
			} else {
				playerAudio('NG');
				mui.alert(data.message);
				mui("#txtFeederID")[0].focus(); //飞达输入框获得焦点
				mui("#txtFeederID")[0].value = '';
				//document.getElementById("txtFeederID").focus();//飞达输入框获得焦点
				//document.getElementById("txtFeederID").select();//全选
				flag = false;
				return false;
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			console.log("获取数据异常：" + JSON.stringify(errorThrown));
			//			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown))
		}
	});

	//	var responseData = AjaxOperation(data, "获取设备分区", true, "/SMTFDA/CheckFeederInfo");
	//	if(!responseData.state) {
	//		//记得提醒一下，我不写了。。。
	//		$("#txtFeederID").val('').focus();
	//		return;
	//	}
	//刷新界面，
	//检查是否还有数据
	//跳到下一条
	if (flag)
		AgainScan(); //继续扫描
	GetThisOrderBanding();
});

/**
 * 跳过到下一条
 */
document.getElementById("next_SMTDAG").addEventListener("tap", function(e) {
	thisDAG003 = "";
	var data = $('#MaterialList').datagrid('getData');
	if (data.rows.length <= 0)
		return;
	var selectData = $('#MaterialList').datagrid('getSelected');
	if (!selectData) {
		$('#MaterialList').datagrid('selectRow', 0);
		selectData = $('#MaterialList').datagrid('getSelected');
	}
	if ($.inArray(selectData.DAG003, next) < 0) {
		next.push(selectData.DAG003); //WOMDAG序号
	}
	var tiaoguo = mui("#tiaoguo")[0];
	var thisPage = false; //当前页是否存在还未备料的信息：默认false:没有
	$.each(data.rows, function(index, item) {
		if ($.inArray(item.DAG003, next) < 0) { //跳过列表中不存在，则选择这行
			$('#MaterialList').datagrid('selectRow', index);
			mui.toast('跳过！');
			thisPage = true;
			tiaoguo.innerHTML = next.length;
			return false;
		}
	});
	if (thisPage) //当前页没有可处理的数据（除开跳过的数据），就进行换页操作
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
	if ($("#Equipment").val() == "") //设备分区为空就不进行操作
		return;
	//这个顺序不要换，因为物料条码有失去焦点事件，所以要先把飞达输入框清空先
	$("#divtxtFeederID").val("").css("display", "none");
	$("#divtexMaterial").css("display", "");
	$("#texMaterial").val("").focus();
	thisDAG003 = "";
}

/**
 * 设备、分区点选事件
 */
function SetSheBei() { //设置设备分区
	var workBill = mui("#texBillNo")[0].value
	if (workBill == "") {
		playerAudio("NG");
		mui.toast("请输入指令单号！");
		mui("#texBillNo")[0].focus(); //指令获得交单
		return;
	}
	var data = GetSheBeiData(workBill);
	if (data.length <= 0)
		return;
	shiBeiPicker.setData(data);
	var Equipment = document.getElementById('Equipment');
	var dpartition = document.getElementById('dpartition');
	shiBeiPicker.show(function(items) {
		var a = items[0].value;
		var b = items[1].value;
		if (Equipment.value == a && dpartition.value == b)
			return;
		//如果有变更才继续执行
		Equipment.value = a ? a : "";
		dpartition.value = b ? b : "";
		GetThisOrderBanding();
		$("#divtexMaterial").css("display", "");
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
		bangDingType: '1' //标记飞达与料盘绑定
	};
	var responseData = AjaxOperation(data, "获取设备分区", true, "/SMTFDA/GetOrderNumInfo");
	if (!responseData.state) {
		ResetTb();
		return SheBeiData;
	}
	var EquipmentRows = responseData.data.data.DicunBindInfo;
	for (var key in EquipmentRows) {
		var i = {
			text: key,
			value: key,
			children: []
		};
		for (var item in EquipmentRows[key]) {
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
	if (code == '') {
		playerAudio("NG");
		alert('条码不能为空！');
		$("#texMaterial").focus();
		return;
	}
	var data = {
		DAH002: mui("#prepareBill")[0].value, //备料单号
		DAB001: code //材料条码
	};
	var responseData = AjaxOperation(data, "检查物料条码信息", true, "/SMTFDA/CheckMaterialInfo");
	if (!responseData.state) {
		playerAudio("NG");
		$("#texMaterial").val('').focus();
		return;
	}
	$("#divtexMaterial").css("display", "none");
	$("#divtxtFeederID").css("display", "");
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
	var responseData = AjaxOperation(data, "获取物料信息", true, "/SMTFDA/GetFeederBindInfo");
	if (!responseData.state) {
		//说明该分区备料已经OK
		ResetTb();
		$('#SMTFDAList').datagrid('loadData', responseData.data.data.SMTFDA);
		$('#texMaterial').val('');
		return false;
	}
	var tbBindInfo = responseData.data.data.tbBindInfo;
	$('#MaterialList').datagrid('loadData', tbBindInfo);
	$.each(tbBindInfo, function(index, item) {
		if ($.inArray(item.DAG003, next) < 0) { //跳过列表中不存在，则选择这行
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
	if (!responseData.state)
		return false;
	$('#BarcodeMaterial').datagrid('loadData', responseData.data.data);
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
	$('#BarcodeMaterial').datagrid('loadData', []);
	$('#SMTFDAList').datagrid('loadData', []);
	$("#divtexMaterial").css("display", "");
	$("#divtxtFeederID").css("display", "none");
	$("#txtMaterial").val('').focus();
	$("#txtFeederID").val('');
}
