/**
 * 临时发料--岳志鹏
 */
var sumDataNo = 0; //总行数量
var userid;

mui.plusReady(function() {
	mui("#workOrder")[0].focus();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id; 
	//userid = "admin"; 
});

$(function() {
	$('#dg').datagrid({
		height: $(window).height() - $("#form").height()-35
		}
	).datagrid('clientPaging', GetData);
});

//add by HCW 20200317
mui.plusReady(function() {
	$('#tabsid').tabs({
		height: $(window).height() - $("#form").height()-35
	});
});

$(function() {
		$('#dg').datagrid({
		rowStyler: function(index, row) {
				return 'background-color:Green;font-weight:bold;';//
			}
		});
		
		$('#fg').datagrid({
		rowStyler: function(index, row) {
				return 'background-color:Red;font-weight:bold;';//
		}
		});
});


$(function() {
	$('#fg').datagrid({
		height: $(window).height() - $("#form").height()-35
		}
	);
	
$('#tabsid').tabs({
	tools: [{
		iconCls: 'icon-reload',
		handler: function() {	
			if($("#workOrder").val() != '')
			{
	 			ScanfworkOrder();
	 		}	
	 		mui("#barCode")[0].focus();
		}
	}]
	});
	
});



/**
 * 通过ajax获取页面数据
 * @param {是否分页} paging
 * @param {页容量} pageSize
 * @param {页码} pageNumber
 * @param {分页主键} keys
 */
function GetData() {
	var dgData = {};
	$.ajax({
		url: app.API_URL_HEADER + "/TempSend/GetWOMDAHData",
		data: {
			paging: true, //是否分页
			pageSize: $('#dg').datagrid('options').pageSize, //页容量
			pageNumber: $('#dg').datagrid('options').pageNumber, //初始化页码
			keys: 'DAH003', //分页主键
			DHA020: mui("#workOrder")[0].value, //语句查询参数1：MUI
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 0) {
				var rows = [];
				$.each(data.data.tbData, function(index, item) { //遍历，整理数据
					rows.push({ //将行数据添加(push)到rows对象
						tm: item['tm'],
						wlbm: item['wlbm'],
						sl: item['sl'],
						wlmc: item['wlmc'],
						BeiLiaoTime: item['BeiLiaoTime']
					});
				});
				dgData.rows = rows;
				dgData.sumDataNo = data.data.sum;
//				$('#dg').datagrid('loadData', rows); //给表格设置数据源(rows)
				mui("#barCode")[0].value = "";
			} else {
				mui.alert(data.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	return dgData;
}

//返回未发明细

/**
 * {扫描工单事件}
 */

function ScanfworkOrder()
{
	
	$.ajax({
			url: app.API_URL_HEADER + '/TempSend/ScanfworkOrder',
			data:{
					workOrder:$("#workOrder").val() //指令单号
				},
			DataType:"json",
			type:"post",
			async:false,
			//timeout:15000,
			success:function(data){
					//console.log(JSON.stringify(data));
 				if(data.status == 1){
 					playerAudio("NG");
 					$("#workOrder").focus();
 					$("#workOrder").val("");
 					mui.alert(data.message);//错误信息弹框
 					return;
 				}
 				else
 				{
 					$("#barCode").focus();
 					$('#dg').datagrid('loadData', GetData());
 					$('#fg').datagrid('loadData', data.data.tbData);
 					playerAudio("OK");
 				}
				},
				error: function(xhr, type, errorThrown) 
				{
	 				alert("获取数据异常：" + JSON.stringify(errorThrown));
	 				return;
	 			}
		 });
	
}

//document.getElementById("workOrder").addEventListener("keydown",
//	function(e) {
//		if(e.keyCode != 13)
//			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
//		var workOrder = this.value.trim().toUpperCase();
//		if(workOrder.trim() == "") {
//			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
//			mui.alert("工单不能为空");
//			//playerAudio("NG");
//			$("#workOrder").focus();
//			return false;
//		}
//		//GetData(true, ps, pn, 'DAH003');
//		$('#dg').datagrid('loadData', GetData());
//		$("#barCode").focus();
//		return true;
//});

/**
 * {扫描条码事件}
 */
document.getElementById("barCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		var workOrder = mui("#workOrder")[0].value;
		var checkBox = mui("#chkbox")[0].checked;
		var flag = false; //执行存储过程的标志
		if(workOrder.trim() == "") {
			mui.alert("请先扫描工单号");
			playerAudio("NG");
			return false;
		}
		if(barCode.trim() == "") {
			mui.alert("条码不能为空");
			playerAudio("NG");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER+'/TempSend/GetBarCode',
			data: {
				barCode: barCode,
				workOrder :workOrder
					},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 1) 
				{
					$("#barCode")[0].focus();
					$("#barCode").val("");
					mui.alert(data.message);
					playerAudio("NG");
					return;
				}
				else 
				{
					playerAudio("OK");
					$('#dg').datagrid('loadData', GetData());//已发明细
					$("#barCode")[0].focus();
					if($("#chkbox").prop("checked") == true)
					mui.toast("删除成功");
					else
					mui.toast("发料成功");
					flag = true;
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		
		if(flag)
		{
			//var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var d = mui("#chkbox")[0].checked;
			var data = d ? {
				spname: "WMS_Delete_TempWOMDAH", //按当前日期获得最大编号
				returnvalue: 0,
				_sp_Barcode: barCode,
				_sp_GongDanHao: workOrder
				
			} : {
				spname: "WMS_Create_TempWOMDAH", //按当前日期获得最大编号
				returnvalue: 0,
				_sp_Barcode: barCode,
				_sp_GongDanHao: workOrder,
				_sp_CreateRen: "admin"//userid
				//userid:currentSession.user_id = document.getElementById("emp_no").value,
			};
			var responseData =
			AjaxOperation(data, "获取条码信息异常", true, app.API_METHOD_ESP);
			//console.log(JSON.stringify(responseData));
	
			if(!responseData.state) {
				playerAudio("OK");
				$("#barCode").focus().val('');
				//			$("#barCode").focus();
				return;
			}
			$('#dg').datagrid('loadData', GetData());
			return true;
		}
	});