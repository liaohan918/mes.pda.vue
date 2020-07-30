//作者：吴冰荣
//时间：2018-09-06
//描述：取消配料
mui.plusReady(function(e){
	$('#gridDAH020').datagrid({
				height: $(window).height() - $("#form").height() - 20
			});
});

$(function() {
	$('#txtDAH020').focus();
	
		//$('#gridDAH020').datagrid().datagrid('clientPaging');
	$('#gridDAH020').datagrid().datagrid('clientPaging', GetData);
	//扫描工单条码回车
	$('#txtDAH020').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpTxtDAH020 = mui('#txtDAH020')[0].value;
			if(tmpTxtDAH020 == "") {
				playerAudio("NG");
				alert("指令单号不能为空！")
				return;
			}
			$('#gridDAH020').datagrid('loadData', GetData());
			playerAudio("OK");
		}
	});

});

/**
 * 获取条码明细数据
 */
function GetData() {
	var dgData = {};
	var data = {
		txtDAH020: mui('#txtDAH020')[0].value,
		PageSize: $('#gridDAH020').datagrid('options').pageSize,
		PageIndex　: 　$('#gridDAH020').datagrid('options').pageNumber,
		KeyField　: "DAH001"
	};
	//使用common AjaxOperation（）
	var responseData =
		AjaxOperation(data, "", true, "/WOMDAHBack/TxtDAH020KeyPress")
	if(responseData.state) {
		dgData.rows = responseData.data.data.DetailedData;
		dgData.sumDataNo = responseData.data.data.TotalCount;
//		$('#labHint').text('条码数量:' + responseData.data.data.TotalCount);
		$('#dgWOMDAH-sum').text(responseData.data.data.TotalCount);
	}
	return dgData;
}

/**
 * 确认事件
 */
function BtnConfirmClick() {
	var tmptxtDAH020 = mui('#txtDAH020')[0].value;
	if(tmptxtDAH020 == "") {
		playerAudio("NG");
		alert("请扫描要取消备料的工单单号");
		return;
	}
//	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
//	var user_id = currentSession.login.usersyersysid;
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//	var user_id = "G90567";
	$.ajax({
		url: app.API_URL_HEADER + "/WOMDAHBack/BtnConfirmClick",
		data: {
			txtDAH020: mui('#txtDAH020')[0].value,
			_sp_TuiLiaoNoType: "5601",
			_sp_Barcode: "",
			_sp_Auditor: user_id
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				playerAudio("NG");
				alert("警告：" + data.message);
				return;
			}
			$('#txtDAH020').val("");
//			$('#labHint').text('条码数量:');
			$('#gridDAH020').datagrid('loadData',{total:0,rows:[]});
			playerAudio("OK");
			mui.toast(data.message);
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}
