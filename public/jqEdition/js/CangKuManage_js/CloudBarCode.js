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
var PopPicker=new mui.PopPicker();  
var dtpicker=new mui.DtPicker({"type":"date"}); 
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
$(function(){ 
	//设置时间
	SetTime();
	//设置到货单
	SetWorkers();  
	//条码回车
	SetBarCode();
	//表格初始化
	SetGrid();
	//刷新页面
	$('#btnReset').click(function() {
		var _page = plus.webview.currentWebview();
		if(_page) {
			_page.reload(true);
		}
	});

	//提交数据
	$('#btnSubmit').click(function(e) {
		e.preventDefault();  
		if(CheckData()){
			var billNo = $("#txtBillNo").val();
			$.post(app.API_URL_HEADER + '/IQCPBA/SysncBarCode?billNo='+billNo,function(result){
				console.log(result);
				if(result.status==0){
					 mui.alert('同步成功','提示','确认');
				}else{
					alert(result.message);
				}
			},"json")
		}
	});
	//取消或者选中扫描条码
	$("#isCancelCode").click(function(){
		if($(this).hasClass("checked")){
			$(this).removeClass("checked");
		}else{
			$(this).addClass("checked");
		}
	});
	$("body").click(function(){
		$("#txtBarCode").val("");
		$("#txtBarCode").focus();
	});

});//jquery
function SetGrid(){
	 $('#gridMaterialList').datagrid({   
	 	singleSelect:true,
	 	rownumbers:true,
	 	columns:[[    
	 	  {field:'DHB002',title:'序号',width:35},   
	 	  {field:'DHB003',title:'物料编码',width:70},  
	 	  {field:'DHB004',title:'物料名称',width:70},    
	 	  {field:'DHB005',title:'物料规格',width:70},   
	 	  {field:'DHB006',title:'交货数量',width:60},  
	 	  {field:'DHB013',title:'清点数量',width:60}, 
	 	  {field:'diff',title:'差异',width:60},
	 	]],
		onSelect:function(index,row){
			curRow = row;
			curRowCode =[];
			for(var i=0;i<tableCode.length;i++)
			{
				if(tableCode[i]["DHC003"] == row[DHB002]){
					curRow.push(tableCode[i]);
				}
			}
		}
	 	});  
	$('#gridBarCodeList').datagrid({   
		singleSelect:true,
		rownumbers:true,
		columns:[[    
		  {field:'DHC004',title:'条码',width:35},   
		  {field:'DHC005',title:'产品编码',width:70},  
		  {field:'DHC006',title:'产品名称',width:70},    
		  {field:'DHC007',title:'物料规格',width:70},   
		  {field:'DHC008',title:'数量',width:60}
		]]
		});   
	
}
function SetBarCode(){
	$("#txtBarCode").keypress(function(e){
		 var eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (eCode == 13){
             var billNo = $("#txtBillNo").val();
			 if(billNo=='' || billNo==null || billNo == undefined){ 
				 $("#txtBarCode").val("");
				 $("#txtBarCode").focus();  
				  mui.alert('请先选择单号','提示','确认');
				 return;
			 }
			 if(curRow==null){
				  mui.alert('请先选一个要清点的物料','提示','确认');
				  return;
			 } 
			 var barCode = $("#txtBarCode").val(); 
			 if(barCode==null || barCode=="" ||barCode==undefined){
				  mui.alert('请输入条码','提示','确认');
				  return;
			 } 
			 var isCancel = $("#isCancelCode").hasClass("checked")?true:false;
			
			
			 var o = {};
			 o["billNo"] = billNo;
			 o["barCode"] = barCode;
			  o["isCancel"] = isCancel;
			 $.ajax({
			 	url: app.API_URL_HEADER + '/IQCPBA/PullBarCode',
			 	data: JSON.stringify(o),
			 	dataType: "json",
			 	type: "post",
			 	success: function(result) {  
			 		if(result.status==0){
			 			var count = result.data;
						curRow["DHB013"] = Number(curRow["DHB013"]) + Number(count);
						curRow["diff"] = Number(curRow["DHB013"]) - Number(curRow["DHB006"]);
						var bar = [];
						bar["DHC004"]=barCode;
						bar["DHC005"]=curRow["DHB003"];
						bar["DHC006"]=curRow["DHB004"];
						bar["DHC007"]=curRow["DHB005"];
						bar["DHC008"]=count;  
						curRowCode.push(bar);
						tableCode.push(bar);
			 		}else{
			 			alert(result.message); 
			 		}
					$('#gridMaterialList').datagrid("loadData",table);
					$('#gridBarCodeList').datagrid("loadData",tableCode);
					$("#txtBarCode").val("");
					$("#txtBarCode").focus();
			 	},
			 	error: function(xhr, type, errorThrown) {
			 		alert("获取数据异常：" + JSON.stringify(errorThrown));
			 	}
			 }); 
        } 
	});
}
function SetTime(){
	//获取系统日期
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
	
	//设置默认检验日期
	billDate = "2019-03-16";
	$("#txtCheckTime").val(billDate);
	GetBillList();
	//检验日期点选
	$("#txtCheckTime").click(function(){ 
		dtpicker.show(function(items){ 
			$("#txtCheckTime").val(items.text);
			GetBillList();
			this.dispose();
		}); 
	}); 
} 
function SetWorkers(){  
	$("#txtBillNo").click(function(){ 
		PopPicker.show(function(items){  
			var billNo = items[0].text;
			$("#txtBillNo").val(billNo); 
			//获取到货单明细 
			GetBillNoDetail();
			$("#txtBarCode").val("");
			$("#txtBarCode").focus();
		}); 
	});
}
function GetBillList(){
	var billDate = $("#txtCheckTime").val();
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
var table = null;
var tableCode =null;
var curRow = null;
var curRowCode = null;
function GetBillNoDetail(){
	table = null;
	tableCode =null;
	curRow = null;
	curRowCode = null;
	var billNo = $("#txtBillNo").val();
	var o = {};
	o["billNo"] = billNo;
	$.ajax({
		url: app.API_URL_HEADER + '/IQCPBA/GetBillNoDetail',
		data: JSON.stringify(o),
		dataType: "json",
		type: "post",
		success: function(resdata) {   
			table =  $.parseJSON(resdata.data.table);
			tableCode =  $.parseJSON(resdata.data.tableCode);  
			$('#gridMaterialList').datagrid("loadData",table);
			$('#gridBarCodeList').datagrid("loadData",tableCode);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}    
/**
 * {获取日期}
 */
function DateInit() {
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
	$('#txtApplyDate').val(billDate); //dateTime.substring(0,16)
	billNo = GetMaxBillNO('6110', formatDate(billDate)); //获取单据编号
	$("#txtBillNo").val(billNo);
	GetNameByGongHao(app.userid, $('#txtApplyerNo'), $('#txtApplyerNo'));
} 
//检查数据是否录完整
function CheckData() {
	if($('#txtBillNo').val() == '') {
		playerAudio('NG');
		mui.toast('单据号不能为空！');
		$('#txtBillNo').focus();
		return false;
	} 
	if($('#txtCheckTime').val() == '') {
		playerAudio('NG');
		mui.toast('日期不能为空！');
		$('#txtCheckTime').focus();
		return false;
	}    
	return true;
} 