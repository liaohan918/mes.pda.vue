var userPicker;
var userPicker1;
var billDate = ""; //单据日期

var tmpTxtSingleNumber;//单别
var tmpTxtWarehouse;//仓库
var tmpDatDate;//日期
var tmpMergeBill;//合并的单号

$(function() {

	$('#mergeDetailed').datagrid({
		height: $(window).height() - $("#detailedBottom").height() - 182
	});
	
	$('#mergeMain').datagrid({
		height: $(window).height() - $("#btn_Continue").height() - 229
	});
	
	$('#txtSingleNumber').focus();

	initInfo();	

	//选择仓库
	$('#txtWarehouse').click(function() {
		userPicker.show(function(items) {
			$('#txtWarehouse').val(items[0]['value']);
		});
	});	
	
	//选择单别
	$('#txtSingleNumber').click(function() {
		userPicker1.show(function(items) {
			$('#txtSingleNumber').val(items[0]['value']);
		});
	});	
	
	/**
	 * 日期切换事件
	 */
	document.getElementById('datDate').addEventListener('tap',
		function(e) {
			ChangeDate(e);
		});
	
	//指令号回车
	$('#txtWorkBill').keydown(function(event) {
		if(event.keyCode != "13"){
			return;
		}
		var txtWorkBill = $('#txtWorkBill').val();
		if(txtWorkBill == null){
			return;
		}
		
		if(txtWorkBill.indexOf("-") != -1){
			var index=txtWorkBill.lastIndexOf("-");
    		txtWorkBill = txtWorkBill.substring( 0, index );
		}		
		//判断mergeDetailed表是否存在数据，存在则看是否存在表单，在则打勾，否则提示
		var rows = $('#mergeDetailed').datagrid('getRows');
		if(rows.length <= 0){
			mui.alert("请查询工单后再操作~");
			return;
		}
		for (var i = 0, j = rows.length; i < j; i++) {
			if(rows[i]["DAF015"] == txtWorkBill){
				$('#mergeDetailed').datagrid('checkRow', i);
				$('#txtWorkBill').val("").focus();
				mui.toast("已勾选" + (i + 1));
				playerAudio("OK");
				return;
			}
		}
		if($('#txtWorkBill').val() != ""){
			mui.toast("查找不到数据，请确认~");
			playerAudio("NG");
		}
		
		
	});
});

//初始化信息
function initInfo(){
	userPicker = new mui.PopPicker();
	userPicker1 = new mui.PopPicker();
	DateInit();
	document.getElementById('datDate').value = billDate;
	
	//设置仓库
	var data = {};
	var responseData = AjaxOperation(data, "", true, "/CentralizedPreparation/GetWarehouse")
	if(!responseData.state)
	{
		mui.alert(responseData.data.message);
		return;
	}
	userPicker.setData(responseData.data.data.GetItemClass);
	userPicker1.setData(responseData.data.data.Single);
//	$('#txtWarehouse').val(resdata.data[0]['value']);
}

//查询工单
function searchWorkBill(){
	//单别与仓库是否已有数据
	tmpTxtSingleNumber = $('#txtSingleNumber').val();
	tmpTxtWarehouse = $('#txtWarehouse').val();
	tmpDatDate = $('#datDate').val();
	
	if(tmpTxtSingleNumber == ""){
		mui.toast("请输入单别再操作~");
	}
	if(tmpTxtWarehouse == ""){
		mui.toast("请选择仓库再操作~");
	}
	
	//开始查询数据
	var data = {
		DatDate : tmpDatDate,
		SingleNumber : tmpTxtSingleNumber,
		Warehouse : tmpTxtWarehouse
	};
	var responseData = AjaxOperation(data, "", true, "/CentralizedPreparation/SearchWorkBill")
	if(!responseData.state)
	{
		mui.alert(responseData.data.message);
		return;
	}
	
	//成功处理
	SetTableValue(responseData);
	
}

//开始备料
function StartPreparation(e){
    var rows = $('#mergeDetailed').datagrid('getSelections');    
    if (rows.length <= 0) {
    	mui.alert('请选择勾选单号再进行开始备料操作~');
    	return;
    }
	//DAF002 DAF015	SyncKey
	var totalBillerNumber = "";	
	for (var i = 0, j = rows.length; i < j; i++) {
		if(rows[i]["SyncKey"] != null){
			playerAudio("NG");
			mui.alert("工单号【" + rows[i]["DAF002"] + "】已经合并，请确认~");
			return;
		}
		totalBillerNumber += rows[i]["DAF002"] + ",";
   }
	
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "admin";
	var data = {
		TotalBillerNumber : totalBillerNumber,
		userId : user_id,
		DatDate : tmpDatDate,
		SingleNumber : tmpTxtSingleNumber,
		Warehouse : tmpTxtWarehouse,
	};
	var responseData = AjaxOperation(data, "", true, "/CentralizedPreparation/MergeBillNumber")
	if(!responseData.state)
	{
		playerAudio("NG");
		mui.alert(responseData.data.message);
		return;
	}
	playerAudio("OK");
	SetTableValue(responseData);
	tmpMergeBill = responseData.data.data.MergeBill;
	
	//成功后跳转界面
	JumpView(e);
} 

//继续备料
function btnConfirmClick(e){
	//选择当前行
	var row = $('#mergeMain').datagrid('getSelected');
	if (row){
		tmpMergeBill = row.SyncKey;
	}
	
	if(tmpMergeBill == null){
		playerAudio("NG");
		mui.toast("请选择一行，再继续备料~")
		return;
	}
	playerAudio("OK");
	JumpView(e);
}

//跳转备料界面
function JumpView(e){
	//跳转界面
	var extras = {
		MergeBill: tmpMergeBill,
		Warehouse : tmpTxtWarehouse
	};
	newpage(e, extras);
}

//设置表格值
function SetTableValue(responseData){
	$('#mergeDetailed').datagrid('loadData', responseData.data.data.mergeDetailed);
	mui('#grid-sum0')[0].innerHTML = responseData.data.data.mergeDetailed.length;
	
	$('#mergeMain').datagrid('loadData', responseData.data.data.mergeMain);
	mui('#grid-sum')[0].innerHTML = responseData.data.data.mergeMain.length;
}

//追加合并
function AppendPreparation(){
	var rows = $('#mergeDetailed').datagrid('getSelections');    
    if (rows.length <= 0) {
    	mui.alert('请选择勾选单号再进行追加操作~');
    	return;
    }
	//DAF002 DAF015	SyncKey
	var totalBillerNumberAppend = "";	//需要追加的单号
	var tmpValue = "";//合并入的单号
	
	for (var i = 0, j = rows.length; i < j; i++) {
		if(rows[i]["SyncKey"] != null){
			if(tmpValue == ""){
				tmpValue = rows[i]["SyncKey"];
			}
			else{
				if(tmpValue != rows[i]["SyncKey"]){
					mui.alert("追加不能存在两个不一样的标识【" + tmpValue + "】【" + rows[i]["SyncKey"] + "】" );
					return;
				}
			}
		}else{
			totalBillerNumberAppend += rows[i]["DAF002"] + ",";
		}		
   }
	
	//访问服务器
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "admin";
	var data = {
		TotalBillerNumber : totalBillerNumberAppend,
		userId : user_id,
		DatDate : tmpDatDate,
		SingleNumber : tmpTxtSingleNumber,
		Warehouse : tmpTxtWarehouse,
		SingleBill : tmpValue
	};
	var responseData = AjaxOperation(data, "", true, "/CentralizedPreparation/MergeBillNumber")
	if(!responseData.state)
	{
		playerAudio("NG");
		mui.alert(responseData.data.message);
		return;
	}
	playerAudio("OK");
	SetTableValue(responseData);
	tmpMergeBill = responseData.data.data.MergeBill;
}

//取消
function CancelPreparation(){
	var rows = $('#mergeDetailed').datagrid('getSelections');    
    if (rows.length <= 0) {
    	mui.alert('请选择勾选单号再进行取消合并操作~');
    	return;
    }
	//DAF002 DAF015	SyncKey
	var totalBillerNumberCancel = "";	//需要取消的单号
	
	for (var i = 0, j = rows.length; i < j; i++) {
		if(rows[i]["SyncKey"] == null){
			mui.alert('单号【' + rows[i]["DAF002"] + "】未合并，无需取消，请去掉勾选后再操作~");
			return;			
		}else{
			totalBillerNumberCancel += rows[i]["DAF002"] + ",";
		}
   }
	
	Cancel(totalBillerNumberCancel, 'N');
	
//	//需要取消操作
//	//用户ID
//	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
//	var user_id = currentSession.user_id;
////	var user_id = "admin";
//	var data = {
//		spname: 'JT_APP_CentralizedPreparationCancel',
//		_sp_TotalBillerNumberCancel : totalBillerNumberCancel,
//		_sp_SingleNumber : tmpTxtSingleNumber,
//		_sp_Warehouse : tmpTxtWarehouse,
//		_sp_LoginID : user_id,
//		_sp_Mac : Mac.address(),
//		returnvalue: '1'
//	};
//	var responseData = AjaxOperation(data, "", true, "/b/esp")
//	if(!responseData.state) {
//		playerAudio("NG");
//		mui.alert(responseData.data.message);
//		return;
//	}
//
//	playerAudio("OK");
//	mui.toast("取消成功~");
}

//取消
function Cancel(totalBillerNumberCancel,Mac){
	//用户ID
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "admin";
	var data = {
		spname: 'JT_APP_CentralizedPreparationCancel',
		_sp_TotalBillerNumberCancel : totalBillerNumberCancel,
		_sp_SingleNumber : tmpTxtSingleNumber,
		_sp_Warehouse : tmpTxtWarehouse,
		_sp_LoginID : user_id,
		_sp_Mac : Mac,
		returnvalue: '1'
	};
	var responseData = AjaxOperation(data, "", true, "/b/esp")
	if(!responseData.state) {
		playerAudio("NG");
		if("取消合并" == responseData.data.message.substring(0,4)){
			var btnArray = ['否', '是'];
			mui.confirm(responseData.data.message, '警告', btnArray, function(e) {
				if(e.index == 1) {
					Cancel(totalBillerNumberCancel,'Y');
					return;
				}
				mui.toast("已返回~");	
			});
			return;
		}
		mui.alert(responseData.data.message);
		return;
	}

	playerAudio("OK");
	mui.toast("取消成功~");
}

/**
 * {获取日期}
 */
function DateInit() {
	var dateTime = GetSysDateTime();
	CurdateTime = dateTime;
	//	var dateStr = dateTime["sys_date"].replace(/-/g, "/") + " " + dateTime["sys_time"];
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	var hours = DateTemp.getHours(); //获取当前小时数(0-23) 
	if(hours <= 7) {
		var t = billDate.getTime() - 1000 * 60 * 60 * 24;
		DateTemp = new Date(t);
	}
	billDate = formatDate(DateTemp);
}

/**
 * {选择交易日期}
 */
function ChangeDate(e) {
	var result = mui("#datDate")[0];
	var picker = new mui.DtPicker({
		type: 'date'
	});
	picker.show(function(rs) { //选择了一个库位
		result.value = rs.text;
		//		result.value = "2018-08-15";
		picker.dispose();
		billDate = result.value;
	});
};