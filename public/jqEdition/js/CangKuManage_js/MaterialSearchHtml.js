var userPicker;

var billDate = ""; //单据日期
mui.plusReady(function() {

	$('#detailedList').datagrid({
		height: $(window).height() - 125,
		rowStyler: function(index, row) { //自定义行样式
			if(row.Cnt > 6) {
				return 'color:red;font-weight:bold;';
			}
		}
	});
	
	$('#sumList').datagrid({
		height: $(window).height() - 125
	});
	
	getInitData();
	
	//选择单号
	$('#ItemClass').click(function() {
		userPicker.show(function(items) {
			$('#ItemClass').val(items[0]['value']);
		});
	});
	
	
	
	/**
	 * 日期切换事件
	 */
	document.getElementById('datDate').addEventListener('tap',
		function(e) {
			ChangeDate(e);
		});
});

//初始化数据方法
function getInitData() {
	userPicker = new mui.PopPicker();	
	DateInit();
	$("#datDate").val(billDate)
	
	//设置类型选项
	var data = {};
	var responseData = AjaxOperation(data, "", true, "/MaterialSearch/GetItemClassInfo")
	if(!responseData.state)
	{
		mui.alert(responseData.data.message);
		return;
	}
	
	userPicker.setData(responseData.data.data);
	//赋值单号
	$('#ItemClass').val(responseData.data.data[0]['value']);	
}


//查询事件
function KeyPress() {
//	mui.toast('成功');
	var tepItemClass = $('#ItemClass').val();
	if(tepItemClass == ''){
		mui.alert("请选择仓库类型~");
		return;
	}

	var data = {
		date : $('#datDate').val(),
		ItemClass : $('#ItemClass').val()
	};
	var responseData = AjaxOperation(data, "", true, "/MaterialSearch/SearchKeyPress")
	if(!responseData.state)
	{
		playerAudio("NG");
		mui.alert(responseData.data.message);
		return;
	}
	
	//成功处理
	playerAudio("OK");
	$('#detailedList').datagrid('loadData', responseData.data.data.DetailedTable);
	$('#grid-sum').text(responseData.data.data.DetailedTable.length);
	
//	$('#sumList').datagrid('loadData', responseData.data.data.SumTable);
//	$('#grid-sum1').text(responseData.data.data.SumTable.length);
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
		picker.dispose();
		billDate = result.value;
	});
};