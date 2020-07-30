/*
作者：黄邦文
时间：2019-07-16
描述：IPQC申请
 */
var localurl;
var files = [];
var fileList = "";
var GongXuID = "";
var CPMC = "";
var PopPicker = new mui.PopPicker();
mui.plusReady(function() {
	mui.init({
		gestureConfig: {
			tap: true, //默认为true
			doubletap: true, //默认为false
			longtap: true, //默认为false
			swipe: true, //默认为true
			drag: true, //默认为true
			hold: false, //默认为false，不监听
			release: false //默认为false，不监听
		}
	});
	document.addEventListener('longtap', function(e) {
		var target = e.target;
		DelPic(target);
	});
	DateInit();
});
$(function() {
	//设置时间
	SetTime();
	//设置人员
	SetBillNo();
	//保存打印
	SetSave();  
	//规格查找
	SetSpecClick();

});



function SetTime() {
	//获取系统日期
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);

	//设置默认检验日期
	billDate = "2019-03-16";
	$("#txtBillDate").val(billDate);
	//检验日期点选
	$("#txtBillDate").click(function() {
		var dtpicker = new mui.DtPicker({
			"type": "date"
		});
		dtpicker.show(function(items) {
			$("#txtBillDate").val(items.text);
			dtpicker.dispose();
		});
	});
}

function SetBillNo() {
	$("#txtBillNo").click(function() {
		GetBillList();
		PopPicker.show(function(items) {
			var billNo = items[0].text;
			$("#txtBillNo").val(billNo);
			//获取到货单明细
			$("#btnBarCode").removeClass("mui-active");
			$("#tbBarCode").removeClass("mui-active");
			$("#btnMaterial").addClass("mui-active");
			$("#tbMaterial").addClass("mui-active");
			GetBillNoDetail();
		});
	});
}

function GetBillList() {
	var billDate = $("#txtBillDate").val();
	var o = {};
	o["billDate"] = billDate;

	$.ajax({
		url: app.API_URL_HEADER + '/IQCPBA/GetBillNoLists',
		data: JSON.stringify(o),
		dataType: "json",
		type: "post",
		success: function(resdata) {
			var dataWorkers = null;
			dataWorkers = $.parseJSON(resdata.data);
			PopPicker.setData(dataWorkers);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
var tbPURDHB = null;
var tbPURDHC = null;
var curRow = null; //当前正在清点的物料
function GetBillNoDetail() {
	var billNo = $("#txtBillNo").val();
	var o = {};
	o["billNo"] = billNo; 
	$.ajax({
		url: app.API_URL_HEADER + '/IQCPBA/GetBillNoDetail',
		data: JSON.stringify(o),
		dataType: "json",
		type: "post",
		success: function(resdata) {
			var table = $.parseJSON(resdata.data.table);
			tbPURDHB = table;
			var tableCode = $.parseJSON(resdata.data.tableCode);
			tbPURDHC = tableCode; 
			ShowMaterialList(); 
			//开始清点事件绑定
			$(".btnSubmit").click(function() {
				var order = $(this).attr("txtOrder");
				for (var i = 0; i < table.length; i++) {
					var row = table[i];
					if (row["DHB002"] == order) 
					{
						curRow = row;
						ShowRow(row);
						break;
					}
				}

			});
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
function ShowMaterialList(){
	$("#tbMaterialBody").html("");
	for (var i = 0; i < tbPURDHB.length; i++) {
		var row = tbPURDHB[i];
		var diff = Number(row["DHB013"])-Number(row["DHB006"]);
		var txt = '<li class="mui-table-view-cell"> ' +
			'<div class="mui-row">序号:' + row["DHB002"] + '</div>' +
			'<div class="mui-row">物料编码:' + row["DHB003"] + '</div>' +
			'<div class="mui-row">物料名称:' + row["DHB004"] + '</div>' +
			'<div class="mui-row">物料规格:' + row["DHB005"] + '</div>' +
			'<div class="mui-row">交货数量:' + row["DHB006"] + '</div>' +
			'<div class="mui-row">清点数量:' + row["DHB013"] + '</div>' +
			'<div class="mui-row" >' +
			'<div>差异:' + diff + '</div>' +
			'<button class="mui-btn-green btnSubmit" txtOrder=' + row["DHB002"] + ' >开始清点</button>' +
			'</div></li>'
		$("#tbMaterialBody").append(txt);
	}
}
function ShowRow(){ 
	$("#btnBarCode").addClass("mui-active");
	$("#tbBarCode").addClass("mui-active");
	$("#btnMaterial").removeClass("mui-active");
	$("#tbMaterial").removeClass("mui-active");

	$("#txtPdNum").val(curRow["DHB003"]);
	$("#txtCurRowPdNum").text(curRow["DHB003"]);
	$("#txtPdName").val(curRow["DHB004"]);
	$("#txtPdSpec").val(curRow["DHB005"]);
	$("#txtCurRowPdTotalCount").text(curRow["DHB006"]);
	$("#txtCurRowPdCheckTotalCount").text(curRow["DHB013"]);
	$("#txtInputCount").val("");   
	$("#txtStandardCount").val(curRow["MBD006"])
	$("#txtLotNo").val(curRow["DHB010"])
}
function SetSave(){
	$("#btnSave").click(function(){ 
		if(CheckData() == true){
			SavePrint();
		}
	});
} 
//保存打印
function SavePrint(){
	if(true){ 
		//CreateBarCode
		var billNo = curRow["DHB001"];
		var order = curRow["DHB002"];
		var makeCount = $("#txtInputCount").val();
		var standardCount = $("#txtStandardCount").val();
		var pic = $("#txtPicture").val();
		var o = {};
		o["billNo"] = billNo; 
		o["order"] = order; 
		o["makeCount"] = makeCount; 
		o["standardCount"] = standardCount;  
		o["pic"] = pic;
		var sendData = JSON.stringify(o);
		$.ajax({
			url: app.API_URL_HEADER + '/IQCPBA/CreateBarCode',
			data: sendData,
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0){
					alert("打印成功!");
					console.log(resdata.data);
					curRow["DHB013"] = Number(makeCount) + Number(curRow["DHB013"]);
					curRow["MBD006"] = standardCount;
					ShowMaterialList();
					ShowRow(); 
				}else{
					alert("打印失败");
					alert(resdata.message);
					console.log(resdata.data)
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		
	}
}
function SetSpecClick(){
	$("#txtPdSpecReal").keypress(function(e){
		var eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
		if (eCode == 13){
		var specName = $(this).val();
		if(specName == '' || specName == null || specName ==undefined)
		{
			return;
		}
		for(var i=0;i<tbPURDHB.length;i++){
			var row = tbPURDHB[i];
			if(row["DHB005"] == specName){
				curRow = row;
				ShowRow();
				return;
			}
		}
		alert("没有找到相应的规格,请通过列表进行清点!");
		}
	});
	
}
//检查数据是否录完整
function CheckData() {
	if ($('#txtInputCount').val() == '') {
		//playerAudio('NG');
		mui.toast('实际数不能为空！');
		$('#txtInputCount').focus();
		return false;
	}
	if ($('#txtStandardCount').val() == '') {
		//playerAudio('NG');
		mui.toast('标准数不能为空！');
		$('#txtStandardCount').focus();
		return false;
	}
	if(curRow==null){
		mui.toast('你还没有选择要清点物料！');
		return false;
	}
	return true;
}
