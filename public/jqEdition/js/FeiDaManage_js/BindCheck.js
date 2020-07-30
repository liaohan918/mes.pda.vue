/**
 *      作者：张凌玮
 *     	时间：2018-09-13
 *    	描述：配送核对
 */

//核对的物料列表
var tbMaterialList;
//当前已经绑定的物料信息
var tbSMTFDA;
var tbMaterialListIndex = 0;
//扫描结果存储
var ScanResult = {};
ScanResult.FDB010 = "Y";
ScanResult.FDB011 = "";
//设备分区选择框事件
var shiBeiPicker = new mui.PopPicker({
	layer: 2
});

/*
 * 通过工单带出信息
 */
function GetOrderNumInfoByOrderNum() {
	var billNo = document.getElementById("TexWorkOrder").value;
	var data = {
		OrderNum: billNo
	};
	var responseData = AjaxOperation(data, "获取设备分区", true, "/BindCheck/GetOrderNumInfo");
	var EquipmentRows = responseData.data.data.DicunBindInfo;
	if(!responseData.state)
		return;
	document.getElementById("TexLine").value = responseData.data.data.LineNum;
	var SheBeiData = [];
	//固定选择项
	fixed = {
		value: '',
		text: '无',
		children: [{
			value: '',
			text: '无'
		}]
	};
	SheBeiData.push(fixed);
	for(var key in EquipmentRows) {
		var text = key;
		var value = key;
		var i = {};
		i.text = text;
		i.value = value;
		i.children = [];
		for(var item in EquipmentRows[key]) {
			var children = {};
			children.text = EquipmentRows[key][item];
			children.value = EquipmentRows[key][item];
			i.children.push(children)
		}
		SheBeiData.push(i);
	}
	shiBeiPicker.setData(SheBeiData);
}

/*
 * 材料条码扫描事件
 */
function GetOrderNumInfoByMaterial() {
	var MaterialBarCode = document.getElementById("TexMaterialBar").value;
	if(MaterialBarCode == "") {
		mui.toast("物料条码！");
		mui("#TexMaterialBar")[0].focus(); //指令获得交单
		return;
	}
	var data = {
		MaterialBar: MaterialBarCode
	};
	var responseData = AjaxOperation(data, "获取条码信息", true, "/BindCheck/GetOrderNumInfoByMaterial");
	if(!responseData.state)
		return;
	document.getElementById("TexWorkOrder").value = responseData.data.data.FeederBindInfo[0]["FDA001"];
	document.getElementById("TexLine").value = responseData.data.data.FeederBindInfo[0]["FDA004"];
	document.getElementById("Equipment").value = responseData.data.data.FeederBindInfo[0]["FDA002"];
	document.getElementById("TexTable").value = responseData.data.data.FeederBindInfo[0]["FDA003"];
}

/**
 * 设备、分区点选事件
 */
function SetSheBei() { //设置设备分区
	var workBill = mui("#TexWorkOrder")[0].value
	if(workBill == "") {
		mui.toast("请输入指令单号！");
		mui("#TexWorkOrder")[0].focus(); //指令获得交单
		return;
	}
	shiBeiPicker.setData(GetSheBeiData(workBill));
	var Equipment = document.getElementById('Equipment');
	var TexTable = document.getElementById('TexTable');
	shiBeiPicker.show(function(items) {
		var a = items[0].value;
		var b = items[1].value;
		if(Equipment.value == a && TexTable.value == b)
			return;
		//如果有变更才继续执行
		next = []; //设备修改的时候把跳过集合清空
		Equipment.value = a ? a : "";
		TexTable.value = b ? b : "";

		OrderCommit();
		StartVerify();
	});
};

/**
 * 设备、分区点击后出发的功能
 * @param {Object} workBill
 */
function GetSheBeiData(workBill) {
	var data = {
		OrderNum: workBill
	};
	var responseData = AjaxOperation(data, "获取设备分区", true, "/BindCheck/GetOrderNumInfo");
	var EquipmentRows = responseData.data.data.DicunBindInfo;
	if(!responseData.state)
		return;
	var SheBeiData = [];
	//固定选择项
	fixed = {
		value: '',
		text: '无',
		children: [{
			value: '',
			text: '无'
		}]
	};
	SheBeiData.push(fixed);
	for(var key in EquipmentRows) {
		var text = key;
		var value = key;
		var i = {};
		i.text = text;
		i.value = value;
		i.children = [];
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

/*
 * 工单界面确定事件
 */
function OrderCommit() {
	var OrderNum = document.getElementById("TexWorkOrder").value;
	var LinNum = document.getElementById("TexLine").value;
	var Equipment = document.getElementById("Equipment").value;
	var Table = document.getElementById("TexTable").value;

	if(OrderNum == "") {
		mui.alert("请选择工单!");
		return;
	}
	if(LinNum == "") {
		mui.alert("产线不能为空!");
		return;
	}
	if(Equipment == "") {
		return;
	}
	if(Table == "") {
		return;
	}

	var data = {
		OrderNum: OrderNum,
		LinNum: LinNum,
		Equipment: Equipment,
		Table: Table
	};
	var responseData = AjaxOperation(data, "获取条码信息", true, "/BindCheck/GetSMTCCBAndFDA");
	if(!responseData.state)
		return;
	tbMaterialList = responseData.data.data.MaterList;
	tbSMTFDA = responseData.data.data.tbSMTFDA;
	$('#gridMaterList').datagrid('loadData', tbMaterialList);
	console.log(JSON.stringify(tbMaterialList));
	$('#tabsid').tabs('select', 1);
}

function StartVerify() {
	var OrderNum = document.getElementById("TexWorkOrder").value;
	var LinNum = document.getElementById("TexLine").value;
	var Equipment = document.getElementById("Equipment").value;
	var Table = document.getElementById("TexTable").value;
		mui("#TexWorkOrder")[0].focus();

	if(OrderNum == "") {
		return;
	}
	if(Equipment == "") {
		return;
	}
	if(LinNum == "") {
		return;
	}
	if(Table == "") {
		return;
	}
		mui("#txtCode")[0].focus();

	bulidInfo();

}

function bulidInfo() {
	var OrderNum = document.getElementById("TexWorkOrder").value;
	var LinNum = document.getElementById("TexLine").value;
	var Equipment = document.getElementById("Equipment").value;
	var Table = document.getElementById("TexTable").value;
	var thisRow = tbMaterialList[tbMaterialListIndex];
	var arr = new Array();
	arr.push("生产线编码 : " + LinNum);
	arr.push("工单编码 : " + OrderNum);
	arr.push("设备编码 : " + Equipment);
	arr.push("设备分区 : " + Table);
	arr.push("飞达位置 : " + tbMaterialList[tbMaterialListIndex]["CCB007"]);
	arr.push("飞达规格 : " + tbMaterialList[tbMaterialListIndex]["CCB022"]);
	arr.push("物料编码 : " + tbMaterialList[tbMaterialListIndex]["CCB010"]);
	arr.push("当前检查位置/飞达总数 :  " + Number((Number(tbMaterialListIndex) + 1)) + "/" + tbMaterialList.length);
	var str = arr.join("\n");
	document.getElementById("MaterialInfo").value = str;
}

function SMTFDBNowRows() {
	var OrderNum = document.getElementById("TexWorkOrder").value;
	var LinNum = document.getElementById("TexLine").value;
	var Equipment = document.getElementById("Equipment").value;
	var Table = document.getElementById("TexTable").value;

	//	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	//	console.log(JSON.stringify(currentSession));
	//	var user_id = currentSession.user_id;
	var user_id = "zlw";
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "[MES_CREATE_SMTFDB]", //获取用户菜单权限
			returnvalue: 1,

			_sp_WorkOrder: OrderNum,
			_sp_WorkLine: LinNum,
			_sp_Equipment: Equipment,
			_sp_Table: Table,
			_sp_LoginId: user_id,
			_sp_ScanResult: ScanResult.FDB010,
			_sp_Scanmsg: ScanResult.FDB011
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
		},
		error: function(xhr, type, errorThrown) {
			console.log("获取数据异常：" + JSON.stringify(errorThrown));
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));

		}
	});
}

/*
 * 通过Feeder校验
 */
function VerifyByFeeder() {
	var FeederID = document.getElementById("txtCode").value;
	if(FeederID == "") {
		return;
	}

	var drs = tbSMTFDA.filter(function(e) {
		return e.FDA009 == FeederID;
	});
	if(drs.length < 1) {
		ShowSingleResult("飞达未绑定到当前分区!");
		return;
	}
	var reelIDPosition = drs[0]["FDA005"];
	if(reelIDPosition != tbMaterialList[tbMaterialListIndex]["CCB007"]) {
		ShowSingleResult("飞达绑定的分区飞达位置为:" + drs["FDA005"]);
		return;
	}

	CheckEndShowResult();
}

/*
 * 通过物料条码校验
 */
function VerifyByMaterial() {
	var Material = document.getElementById("txtCode").value;
	if(Material == "") {
		return;
	}
	var drs = tbSMTFDA.filter(function(e) {
		return e.FDA010 == Material;
	});
	if(drs.length < 1) {
		ShowSingleResult("飞达未绑定到当前分区!");
		return;
	}
	var reelIDPosition = drs[0]["FDA005"];
	if(reelIDPosition != tbMaterialList[tbMaterialListIndex]["CCB007"]) {
		ShowSingleResult("飞达绑定的分区飞达位置为:" + drs["FDA005"]);
		return;
	}

	CheckEndShowResult();
}

function CheckEndShowResult() {
	tbMaterialListIndex = Number((Number(tbMaterialListIndex) + 1));
	document.getElementById('txtFeederID').value = "";
	if(tbMaterialListIndex >= tbMaterialList.length) {
		SMTFDBNowRows();
		if(ScanResult.FDB010 == "Y")
			mui.alert("该分区核对结果无误!");
		else
			mui.alert("ScanResult.FDB011");
		$('#tabsid').tabs('select', 0);
		tbMaterialListIndex = 0;
	}
	bulidInfo();
}

function ShowSingleResult(ngResult) {
	ScanResult.FDB010 = "N";
	ScanResult.FDB011 += "飞达位置:" + tbMaterialList[tbMaterialListIndex]["CCB007"] +
		"\r\nNG原因:" + ngResult + "\r\n";
	alert(ScanResult.FDB011);
	if(!confirm("是否还要继续核对其他位置?")) {
		SMTFDBNowRows();
		ScanResult = null;
		$('#tabsid').tabs('select', 0);
	} else {
		CheckEndShowResult();
	}
}