//供第三方跳转使用
mui.plusReady(function(e) {
	app.init();
	$('#dataGrid1').datagrid({height: $(window).height() - $("#infos").height() - 35});
	$('#dataGrid2').datagrid({height: $(window).height() - $("#infos").height() - 35});
	
	var self = plus.webview.currentWebview();
	var BarCode = self.extras.BarCode;
	var waitySendQty = self.extras.waitySendQty;

	mui("#txtBarCode")[0].value = BarCode;
	mui("#txtCFCount")[0].value = waitySendQty;

	//得到详情信息
	BarCodeKeyPress();
	$('#txtCFCount').focus();
	
	//$('#tabsid').tabs({height: $(window).height() - $("#infos").height() - 5});
	//$('#dataGrid1').datagrid({height: $(window).height() - $("#infos").height() - 30});
	//$('#dataGrid2').datagrid({height: $(window).height() - $("#infos").height() - 30});
});

//设置tabs属性
// $('#tabsid').tabs({
// 	height: $(window).height() - $("#infos").height() - 5,
// 	justified: true,
// 	tabHeight: 30,
// 	narrow: true
// });

var CFType = false; //拆分类型

$('#dataGrid1').datagrid({
	rownumbers: true,
	singleSelect: true,
	showFooter: true,
	onClickCell: function(index, field) {
		if(editIndex != index && CFType) {
			if(endEditing()) {
				$('#dataGrid1').datagrid('selectRow', index).datagrid('beginEdit', index);
				var ed = $('#dataGrid1').datagrid('getEditor', {
					index: index,
					field: field
				});
				if(ed) {
					($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();
				}
				editIndex = index;
			} else {
				setTimeout(function() {
					$('#dataGrid1').datagrid('selectRow', editIndex);
				}, 0);
			}
		}
	},
	onEndEdit: function(index, row, changes) {
		var ed = $(this).datagrid('getEditor', {
			index: index,
			field: 'productid'
		});
		compute();
		//row.productname = $(ed.target).combobox('getText');
	}
});

var editIndex = undefined;

function endEditing() {
	if(editIndex == undefined) {
		return true
	}
	if($('#dataGrid1').datagrid('validateRow', editIndex)) {
		$('#dataGrid1').datagrid('endEdit', editIndex);
		editIndex = undefined;
		$('#dataGrid1').datagrid('autoSizeColumn', 'DAB006');
		return true;
	} else {
		return false;
	}
}
//计算数量总和
function compute() {
	var rows = $('#dataGrid1').datagrid('getRows') //获取当前的数据行
	var ptotal = 0; //计算listprice的总和
	for(var i = 0; i < rows.length; i++) {
		ptotal += parseFloat(rows[i]['DAB006']);　　　　
	}
	$('#dataGrid1').datagrid('reloadFooter', [{
		DAB006: ptotal
	}]);
	$('#dataGrid1').datagrid('autoSizeColumn', 'DAB006'); //自适应列
}

var userPicker;
$(function() {
	$('#txtBarCode').focus();
	//原条码回车事件
	$('#txtBarCode').keydown(function(event) {
		if(event.keyCode != "13" || mui('#txtBarCode')[0].value == "") {
			return;
		}
		BarCodeKeyPress(); //得到详情信息
	});

	userPicker = new mui.PopPicker();
	//选择单号
	$('#cmbPrint').click(function() {
		userPicker.show(function(items) {
			$('#cmbPrint').val(items[0]['value']);
		});
	});
	//拆分类型开关事件
	document.getElementById("switchType").addEventListener("toggle", function(event) {
		CFType = event.detail.isActive; //true-条码个数拆分 false-物料数量拆分
		$("#txtCFCount").placeholder = (event.detail.isActive) ? "条码数" : "物料数";
		$("#labCFCount").text((event.detail.isActive) ? "条码数拆" : "物料数拆");
		$("#txtCFCount").val(""); //重新清空
		$("#txtCFCount").focus(); //获得焦点
	});

});

//得到详情信息  
function BarCodeKeyPress() {
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id='2222';
	$.ajax({
		url: app.API_URL_HEADER + "/WARBCF/BarCodeKeyPress",
		data: {
			BarCode: mui('#txtBarCode')[0].value,
			printName: mui('#cmbPrint')[0].value,
			LoginId:user_id
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(data) { //成功后操作，返回行集合(data)			
			if(data.status == 1) {
				mui.alert(data.message);
				$('#txtBarCode').val('').focus();
				return;
			}

			mui('#txtMataNo')[0].value = data.data.MaterNo;
			mui('#txtMataCount')[0].value = data.data.MaterCount;
			mui('#txtMataName')[0].value = data.data.MaterName;

			$('#dataGrid1').datagrid('loadData', data.data.MasterTable);
			$('#dataGrid2').datagrid('loadData', data.data.dataGrid2);
			mui('#dataGrid1-sum')[0].innerHTML = data.data.MasterTable.length;
			mui('#dataGrid2-sum')[0].innerHTML = data.data.dataGrid2.length;
			$('#txtCFCount').focus();
			userPicker.setData(data.data.SelectPrint);
			$('#cmbPrint').val(data.data.SelectPrint[0]['value']);
			if(data.data.DefaultPrint!="")
				$('#cmbPrint').val(data.data.DefaultPrint);
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//拆分点击事件
function btnOKClick() {
	if(mui('#txtBarCode')[0].value == "") {
		mui.alert("请先扫描条码~");
		playerAudio('NG');
		$('#txtBarCode').focus();
		return;
	}

	if(mui('#txtCFCount')[0].value == "") {
		mui.alert(CFType ? "请输入条码个数~" : "请输入拆分物料数量~");
		playerAudio('NG');
		$('#txtCFCount').focus();
		return;
	}
	btnClick("btnOKClick");

	//修改合计数量
	$('#dataGrid1').datagrid('reloadFooter', [{
		DAB006: CFType ?
			$("#txtMataCount").val() : $("#txtCFCount").val()
	}]);
	$('#dataGrid1').datagrid('autoSizeColumn', 'DAB006'); //自适应列

}

//打印点击事件
function btnPrintClick() {
	if(mui('#txtBarCode')[0].value == "") {
		mui.alert("请先扫描条码~");
		playerAudio('NG');
		$('#txtBarCode').focus();
		
		return;
	}

	if(mui('#txtCFCount')[0].value == "") {
		mui.alert(CFType ? "请输入条码个数~" : "请输入拆分物料数量~");
		playerAudio('NG');
		$('#txtCFCount').focus();
		return;
	}

	if(mui('#cmbPrint')[0].value == "") {
		mui.alert("请选择打印机~");
		playerAudio('NG');
		$('#cmbPrint').focus();
		return;
	}
//	txtMataCount
    document.getElementById("txtBarCode").select();
	btnClick("btnPrintClick");
}

function btnPrintTestClick()
{
	$.ajax({
		url: app.API_URL_HEADER + "/WARBCF/PrintTest",
//url: "http://localhost:27611/api/WARBCF/PrintTest",
		data: {
			BarCode: mui('#txtBarCode')[0].value, //原条码
			printName: mui('#cmbPrint')[0].value //选择的打印机ip
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 1) {
				mui.alert(data.message);
				return;
			}			
			else
			{
				document.getElementById("txtBarCode").select();
				mui.toast("打印成功~");
			}

		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//所有按钮回车事件
function btnClick(type) {
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//var user_id='2222';
	$.ajax({
		url: app.API_URL_HEADER + "/WARBCF/BtnKeyPress",
//url: "http://localhost:27611/api/WARBCF/BtnKeyPress",
		data: {
			BarCode: mui('#txtBarCode')[0].value, //原条码
			CFCount: mui('#txtCFCount')[0].value, //拆分数量
			checkByShu: !CFType, //false-条码拆分,true-物料拆分
			MataNo: mui('#txtMataNo')[0].value, //物料编码
			MaterCount: mui('#txtMataCount')[0].value, //条码原数量
			Type: type, //拆分/打印区别
			LoginID: user_id, //操作用户
			printName: mui('#cmbPrint')[0].value //选择的打印机ip
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 1) {
				mui.alert(data.message);
				return;
			}

			if("btnOKClick" == type) {
				$('#dataGrid1').datagrid('loadData', data.data);
				mui('#dataGrid1-sum')[0].innerHTML = data.data.length;

				mui.toast("拆分成功~");
			} else {
				mui('#txtMataCount')[0].value = data.data.MaterCount;

				$('#dataGrid2').datagrid('loadData', data.data.dataGrid2);
				mui('#dataGrid2-sum')[0].innerHTML = data.data.dataGrid2.length;
				mui.toast("打印成功~");
				$('#txtCFCount').val("");
			}

		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}