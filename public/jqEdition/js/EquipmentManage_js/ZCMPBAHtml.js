//单据选择器
var billPicker;
//设备状态选择器
var equipmentStatusPicker;
//工序选择器
var gongXuPicker;
//部门选择器
var deptPicker;
//产线选择器
var linePicker;
//客户选择器
var custPicker;

$(function(){
	
	
});


mui.plusReady(function() {
	app.init();	
	
	//设置tabs属性
	$('#tabsid').tabs({
		height: $(window).height() - $("#infos").height(),
		justified: true,
		tabHeight: 30,
		narrow: true,
		pill: true
	});
	$('#dataGrid1').datagrid({
		height: $(window).height() - $("#infos").height()-35
	});
	//批量设置表格属性
	$('.easyui-datagrid').datagrid({
		striped: true,
		rownumbers: true,
		singleSelect: true,
		pageSize: 10,
		sortable: false
	});
});

$(function(){
	//需等页面DOM节点加载完才可以初始化
	billPicker = new mui.PopPicker();
	equipmentStatusPicker = new mui.PopPicker();
	gongXuPicker = new mui.PopPicker();
	deptPicker = new mui.PopPicker();
	linePicker = new mui.PopPicker();
	custPicker = new mui.PopPicker();
	//默认盘点单号焦点
	$("#edtPBA002").focus();		
	//加载未审核盘点单
	getUnAuditBillList();
	//获得设备状态
	getEquipmentStatusList();
	//获得工序选项
	getGongXuList();
	//获得部门选项
	getDeptList();
	//获得产线选项
	getLineList();
	//获得客户选项
	getCustList();
	//选择盘点单号
	$('#edtPBA002').click(function() {
		billPicker.show(function(items) {
			$('#edtPBA005').val(items[0]['text']);
			$('#edtPBA002').val(items[0]['value']);
		});
	});
	//设备状态点击事件
	$('#edtPBB027').click(function() {
		equipmentStatusPicker.show(function(items) {
			$('#edtPBB027').val(items[0]['text']);
			$('#edtPBB027').attr('data-value',items[0]['value']);
		});
//		mui('#dialog').popover('toggle');
	});
	//工序编号点击事件
	$('#edtPBB018').click(function(){
		gongXuPicker.show(function(items){
			$('#edtPBB018').val(items[0]['text']);
			$('#edtPBB018').attr('data-value',items[0]['value']);
		});
	});
	//部门编号点击事件
	$('#edtPBB016').click(function(){
		deptPicker.show(function(items){
			$('#edtPBB016').val(items[0]['text']);
			$('#edtPBB016').attr('data-value',items[0]['value']);
		});
	});
	//产线点击事件
	$('#edtPBB017').click(function(){
		linePicker.show(function(items){
			$('#edtPBB017').val(items[0]['text']);
			$('#edtPBB017').attr('data-value',items[0]['value']);
		})
	});
	//客户编号点击事件
	$('#edtPBB015').click(function(){
		custPicker.show(function(items){
			$('#edtPBB015').val(items[0]['text']);
			$('#edtPBB015').attr('data-value',items[0]['value']);
		})
	});	
	//盘点单回车事件
	$('#edtPBA002').keydown(function(e){
		if(e.keyCode != 13) return; 
		var billNo = $("#edtPBA002").val();
		if(billNo == '') {
			mui.toast('请先选择盘点单号！')
			$('#edtPBA002').val('').focus();
			return;
		}
		getBillDetail(billNo);
	})
	//设备编码回车事件
	$('#edtPBB004').keydown(function(e){
		if(e.keyCode != 13) return; 
		var billNo = $("#edtPBA002").val();
		if(billNo == '') {
			mui.toast('请先选择盘点单号！')
			$('#edtPBA002').val('').focus();
			return;
		}
		var equipNo = $('#edtPBB004').val();
		if(equipNo == ''){
			mui.toast('请扫描设备编码！')
			$('#edtPBB004').val('').focus();
			return;
		}		
		getEquipmentDetail(equipNo);		
	});
	//根据盘点状态变更背景色，Y:已盘-绿色。N:未盘-黄色
	$('#dataGrid1').datagrid({
		rowStyler: function(index, row) {
			if(row.status == 'Y') {
				return 'background-color:Green;font-weight:bold;';
			} 
			else{
				return 'background-color:Yellow;font-weight:bold;';
			}
		}
	})
})

//重置表单
function formReset(){
  document.getElementById("form").reset()
}

var tempBillNo = '';//选择的盘点单号,用于判断是否选择了盘点单

//获得设备盘点单信息
function getBillDetail(billNo){
	$.ajax({
		url:app.API_URL_HEADER + "/ZCMPBA/getBillDetail",
		data:{
			billNo : billNo
		},
		success:function(resdata){			
			if(resdata.status == 1){
				tempBillNo = '';
				return;
			}
			tempBillNo = billNo;
			$('#dataGrid1').datagrid('loadData', resdata.data);
			$('#dataGrid1-sum')[0].innerHTML = resdata.data.length;
		},
		error:function(xhr,type,errorThrown){
			tempBillNo = '';
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获得未审核盘点单
function getUnAuditBillList(){
	$.ajax({
		url:app.API_URL_HEADER + "/ZCMPBA/getUnAuditBillList",
		data : {},
		success : function(resdata){
			if(resdata.status == 1){
				return;
			}
			dt = $.parseJSON(resdata.data);
			billPicker.setData(dt);
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获得设备状态选项
function getEquipmentStatusList(){
	var values = [
		{"value":"正常","text":"正常"},
		{"value":"封存","text":"封存"},
		{"value":"保养","text":"保养"},
		{"value":"送修","text":"送修"},
		{"value":"不良","text":"不良"},
		{"value":"报废","text":"报废"},
	];
	equipmentStatusPicker.setData(values);
}

//获得工序选项集合
function getGongXuList(){
	$.ajax({
		type:"get",
		url:app.API_URL_HEADER + "/ZCMPBA/getGongXuList",
		data : {},
		async:true,
		success:function(resdata){
			if(resdata.status == 1){
				return;
			}
			dt = $.parseJSON(resdata.data);
			gongXuPicker.setData(dt);
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
        
//获取部门选项
function getDeptList(){
	$.ajax({
		type:"get",
		url:app.API_URL_HEADER + "/ZCMPBA/getDeptList",
		async:true,
		data:{},
		success:function(resdata){
			if(resdata.status == 1){
				return;
			}
			dt = $.parseJSON(resdata.data);
			deptPicker.setData(dt);
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获得产线选项
function getLineList(){
	$.ajax({
		type:"get",
		url:app.API_URL_HEADER + "/ZCMPBA/getLineList",
		async:true,
		data:{},
		success:function(resdata){
			if(resdata.status == 1){
				return;
			}
			dt = $.parseJSON(resdata.data);
			linePicker.setData(dt);
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获得客户选项
function getCustList(){
	$.ajax({
		type:"get",
		url:app.API_URL_HEADER + "/ZCMPBA/getCustList",
		async:true,
		data:{},
		success:function(resdata){
			if(resdata.status == 1){
				return;
			}
			dt = $.parseJSON(resdata.data);
			custPicker.setData(dt);
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//根据设备编码获得其他相关信息
function getEquipmentDetail(equipNo){
	$.ajax({
		type:"get",
		url:app.API_URL_HEADER + "/ZCMPBA/getEquipmentDetail",
		async:true,
		data:{
			equipNo:equipNo
		},
		success:function(resdata){
			if(resdata.status == 1){
				playerAudio('NG');
				alert(resdata.message);
				formReset();
				return;
			}
			playerAudio('OK');
			//是否为该盘点单需要盘点的设备
			var exists = existsEquipNo(equipNo);
			if(!exists){
				mui.confirm('该设备不在盘点范围内，是否继续？', '', ['返回','继续'], function(e) {
		        if (e.index != 1) {
		        	formReset();
					return;
		        }
		   		})
			}
			$('#edtPBB005').val(resdata.data.PBB005);//设备名称
			$('#edtPBB006').val(resdata.data.PBB006);//设备型号
			$('#edtPBB027').val(resdata.data.PBB027);//设备状态
			$('#edtPBB018').val(resdata.data.PBB018);//工序编码
			$('#edtPBB016').val(resdata.data.PBB016);//部门编码
			$('#edtPBB017').val(resdata.data.PBB017);//产线编码
			$('#edtPBB015').val(resdata.data.PBB015);//客户编号
			$('#edtPBB027').focus();
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
};

//提交表单
function commit(){
	var billNo = $('#edtPBA002').val();//盘点单号
	if(billNo == '' || tempBillNo == ''){
		playerAudio('NG');
		mui.toast("请选择盘点单号");
		return;
	}
	var equipNo = $('#edtPBB004').val();//设备编码
	if(equipNo == ''){
		playerAudio('NG');
		mui.toast('请扫描设备编码');
		return;
	}
	var equipStatus = $('#edtPBB027').attr('data-value');//设备状态
	if(equipStatus == '' || equipStatus == undefined){
		playerAudio('NG');
		mui.toast('请选择设备状态');
		return;
	}
	var gongXuNo = $('#edtPBB018').attr('data-value');//工序编码
	if(gongXuNo == '' || gongXuNo == undefined){
		gongXuNo = '';
//		playerAudio('NG');
//		mui.toast('请选择工序编码');
//		return;
	}
	var deptNo = $('#edtPBB016').attr('data-value');//部门编码
	if(deptNo == '' || deptNo == undefined){
		deptNo = '';
//		playerAudio('NG');
//		mui.toast('请选择部门编码');
//		return;
	}
	var lineNo = $('#edtPBB017').attr('data-value');//产线编码
	if(lineNo == '' || lineNo == undefined){
		lineNo = '';
//		playerAudio('NG');
//		mui.toast('请选择产线编码');
//		return;
	}
	var custNo = $('#edtPBB015').attr('data-value');//客户编码
	if(custNo == '' || custNo == undefined){
		custNo = '';
//		playerAudio('NG');
//		mui.toast('请选择客户编码');
//		return;
	}
	var place = $('#edtPBB019').val();//放置地点
	
	$.ajax({
		type:"get",
		url:app.API_URL_HEADER + "/ZCMPBA/commit",
		async:true,
		data:{
			billNo : billNo,
			equipNo : equipNo,
			equipStatus : equipStatus,
			gongXuNo : gongXuNo,
			deptNo : deptNo,
			lineNo : lineNo,
			custNo : custNo,
			place : place
		},
		success:function(resdata){
			if(resdata.status == 1){
				playerAudio('NG');
				alert(resdata.message);
				return;
			}
			playerAudio('OK');
			$('#dataGrid1').datagrid('loadData', resdata.data);
			$('#dataGrid1-sum')[0].innerHTML = resdata.data.length;
			formReset();
		},
		error:function(xhr, type, errorThrown){
			alert("提交失败:" + JSON.stringify(errorThrown));
		}
	});
}

//设备编号是否存在盘点明细中
function existsEquipNo(equipNo){
	var rows = $('#dataGrid1').datagrid('getRows');
	var exists = rows.some(function(elem,index,arr){
		return elem.PBB004 = equipNo;
	});
	return exists;
}

