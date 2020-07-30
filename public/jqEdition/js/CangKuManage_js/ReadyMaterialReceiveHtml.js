mui.plusReady(function(e){
	$('#dataGrid1').datagrid({height:$(window).height()-$('#infos').height()-35});
	$('#dataGrid2').datagrid({height:$(window).height()-$('#infos').height()-35});
	$('#dataGrid3').datagrid({height:$(window).height()-$('#infos').height()-35});
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

var workBill='';

$(function(){
	$('#workBill').focus();
	
	//工单单号回车
	$('#workBill').keydown(function(event) {
		if(event.keyCode != "13") {
			return;
		}

		workBill = mui('#workBill')[0].value;
		if(workBill == "") {
			return;
		}

		GetBillNo();
		playerAudio("OK");
		dataGrid2Paging('');
	});
	
	//材料条码回车
	$('#tiaoMa').keydown(function(event) {
		if(event.keyCode != "13") {
			return;
		}	
		if(mui('#tiaoMa')[0].value == "") {
			return;
		}

		if(mui('#workBill')[0].value == "") {
			playerAudio("NG");
			alert("请先扫描单号~")
			return;
		}
		TiaoMaAction();
	});
	
	//材料列表
	$('#dataGrid1').datagrid({
		rowStyler: function(index, row) { //自定义行样式
			if(row.DAG015==row.DAG024&&row.DAG015!=0)
				return 'background-color:lightgreen;';
			else if(row.DAG015==0)
				return 'background-color:red;';
			else
				return 'background-color:yellow;';
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			dataGrid2Paging(rowData.DAG004);
		}	
	});
	
	$('#dataGrid2').datagrid({		
	 	}).datagrid('clientPaging', dataGrid2Paging);
	 	
	$('#dataGrid3').datagrid({		
		}).datagrid('clientPaging', dataGrid2Paging);
});

//得到详情信息  
function GetBillNo() {
	$.ajax({
		url: app.API_URL_HEADER + "/ReadyMaterialReceive/BillNoKeyPress",
		data: {
			BillNo: workBill
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
			$('#dataGrid1').datagrid('loadData', data.data);
			mui('#dataGrid1-sum')[0].innerHTML = data.data.length;

			$('#tiaoMa').focus();
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//已扫列表分页
function dataGrid2Paging(WLBM){
	$.ajax({
		url: app.API_URL_HEADER + "/ReadyMaterialReceive/GetBarCode",
		data: {
			BillNo: workBill,
			DAG004: WLBM
		},
		dataType: "json", //数据类型
		type: "get", //"get" 请求方式
		async: false,
		success: function(data) { //成功后操作，返回行集合(data)	
			var dgData = {};
			dgData.rows = data.data.WOMDAHNO;
			dgData.sumDataNo = data.data.WOMDAHNO.length;
			var dgData1 = {};
			dgData1.rows = data.data.WOMDAHOK;
			dgData1.sumDataNo = data.data.WOMDAHOK.length;
			mui('#dataGrid2-sum')[0].innerHTML = data.data.WOMDAHNO.length;
			$('#dataGrid2').datagrid('loadData', dgData);
			mui('#dataGrid3-sum')[0].innerHTML = data.data.WOMDAHOK.length;
			$('#dataGrid3').datagrid('loadData', dgData1);
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//条码事件
function TiaoMaAction(){
	$.ajax({
		url: app.API_URL_HEADER + "/ReadyMaterialReceive/BarCodeKeyPress",
		data: {
			BillNo: workBill,
			DAH005: mui('#tiaoMa')[0].value,
			LoginID: app.userid
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true,
		success: function(data) { //成功后操作，返回行集合(data)	
			if(data.status==1){
				playerAudio("NG");
				alert(data.message);
				return;
			}
			playerAudio("OK");
			mui.toast(data.message);
			mui('#tiaoMa')[0].value='';
			mui('#tiaoMa')[0].focus();
			GetBillNo();
			dataGrid2Paging('');
			return;
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}