//现场拆料模块
$(function(){
	console.log("123");
	//设置tabs属性
	$('#tabsid').tabs({
		height: $(window).height() - $("#head").height(),
		justified: true,
		tabHeight: 30,
		narrow: true,
		pill: true
	});
	$('#dataGrid1').datagrid({
		height: $(window).height() - $("#head").height()-35
	});
	//批量设置表格属性
	$('.easyui-datagrid').datagrid({
		striped: true,
		rownumbers: true,
		singleSelect: true,
		pageSize: 10,
		sortable: false
	});
	//扫描生产指令
	$('#edtDAF015').keydown(function(e){
		if(e.keyCode != 13) return;
		var DAF015 = $('#edtDAF015').val();//生产指令号
		if(DAF015.trim() == ""){
			mui.toast("请扫描生产指令");
			playerAudio('NG');
			return;
		}
		getWOMDAHDetail(DAF015);
	});
	//拆分
	$('#btnSplit').click(function(){
		var workBillNo = $('#edtDAF015').val();//生产指令号
		if(workBillNo.trim() == ""){
			mui.toast("请扫描生产指令");
			$('#edtDAF015').focus();
			playerAudio('NG');
			return;
		}
		var barCode = $('#edtDAH005').val();//条码
		if(barCode.trim()==""){
			mui.toast("请扫描条码")
			$('#edtDAH005').focus();
			playerAudio('NG');
			return;
		}
		if(!existsBarCode(barCode)){
			mui.toast("该条码不在发料明细中,请重新扫描")
			$('#edtDAH005').focus();
			$('#edtDAH005').val('');
			playerAudio('NG');
			return;			
		}
		var splitBarCodeNum = $('#edtSplitNum').val();//条码拆分数量
		if(splitBarCodeNum.trim() == "" || splitBarCodeNum <= 0){
			mui.toast("拆分数量不能小于等于0");
			$('#edtSplitNum').val("");
			$('#edtSplitNum').focus();
			playerAudio('NG');
			return;
		}
		if(!/^\d+$/.test(splitBarCodeNum)){
		 	mui.toast("拆分数量必须为整数");
		 	$('#edtSplitNum').val("");
			$('#edtSplitNum').focus();
			playerAudio('NG');
			return;
		}
		
		updateWOMDAH(workBillNo,barCode,splitBarCodeNum);
	});
});

function updateWOMDAH(workBillNo,barCode,splitBarCodeNum){
	$.ajax({
		type:"post",
		data:{
			workBillNo : workBillNo,
			barCode : barCode,
			splitBarCodeNum : splitBarCodeNum
		},
		url:app.API_URL_HEADER + "/OnlineDismantling/updateWOMDAH",
		success:function(resdata){
			if(resdata.status == 1){
				mui.toast(resdata.message);				
				playerAudio("NG");
				return;
			}
			$('#dataGrid1').datagrid('loadData', resdata.data);
			$('#dataGrid1-sum').innerHTML = resdata.data.length;
			playerAudio("OK");
		},
		error:function(xhr,type,errorThrown){
			mui.toast("获取数据异常：" + JSON.stringify(errorThrown));
			playerAudio("NG");
		}
	});
}

//获得配料单
function getWOMDAHDetail(workBillNo){
	$.ajax({
		type:"post",
		data:{
			workBillNo : workBillNo
		},
		url:app.API_URL_HEADER + "/OnlineDismantling/getWOMDAHDetail",
		success:function(resdata){
			if(resdata.status == 1){
				mui.toast(resdata.Message);
				playerAudio("NG");
				return;
			}
			$('#dataGrid1').datagrid('loadData', resdata.data);
			$('#dataGrid1-sum')[0].innerHTML = resdata.data.length;
			playerAudio("OK");
		},
		error:function(xhr,type,errorThrown){
			mui.toast("获取数据异常：" + JSON.stringify(errorThrown));
			playerAudio("NG");
		}
	});
}

//发料明细中是否存在条码
function existsBarCode(barCode){
	var rows = $('#dataGrid1').datagrid('getRows');
	var exists = rows.some(function(elem,index,arr){
		return elem.DAH005 == barCode;
	});
	return exists;
}