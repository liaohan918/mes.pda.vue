/**
 * 退货--岳志鹏
 */
var userid;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
	
	$('#dg1').datagrid({
			height: $(window).height() - $("#form").height() - 35,
			onLoadSuccess: function(data) {
				mui('#dg1-sum')[0].innerHTML =
					(!data || data.rows.length <= 0) ? '0' : data.total;
			}
		}
		//{ data: GetData() } //初始化数据
	).datagrid('clientPaging', GetData);
	$('#dg2').datagrid({
		height: $(window).height() - $("#form").height() - 35,
		onLoadSuccess: function(data) {
			mui('#dg2-sum')[0].innerHTML =
				(!data || data.rows.length <= 0) ? '0' : data.total;
		}
	})
});

var userPicker = new mui.PopPicker();
var materialId = "";
var BillType="";//单据类型
var jsonData;
var waitySendQty = "";

$(function() {
	//tab选项卡改变事件
	$('#tabsid').tabs({
		onSelect: function(title, index) {
			if(title == "扫描条码") {
				$('#txtBarCode').focus();
			}
		}
	});
});

$(function() {
	//获取单号
	GetBillNoList()
});

/**
 * {选择单号}
 */
document.getElementById("refresh").addEventListener("click",
	function(e) {
		userPicker.show(function(items) {
			$('#billNo').val(items[0]['value']);
			$('#dg1').datagrid('loadData', []);
			$('#dg2').datagrid('loadData', []);
			if($('#billNo').val()!=""){
				GetData();
			}
		});
	});

function GetData() {
	//以下才是以后要的实际操作
	$('#dg1').datagrid('loadData', GetMaterialData());
};

function GetMaterialData() {
	var dgData = {};
	$.ajax({
		url: app.API_URL_HEADER + "/PURDKA/GetMaterialData", //获取数据:调用webApi服务路径
		data: {
			paging: true, //是否分页
			pageSize: $('#dg1').datagrid('options').pageSize, //页容量
			pageNumber: $('#dg1').datagrid('options').pageNumber, //初始化页码
			keys: 'DKB002', //分页主键
			DKB001: $("#billNo").val(), //语句查询参数3 ：jquery
			IsWW: IsOutProcess
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 0) {
				var rows = [];
				$.each(data.data.tbData, function(index, item) { //遍历，整理数据
					rows.push({ //将行数据添加(push)到rows对象
						DKB003: item['DKB003'],
						DKB006: item['DKB006'],
						DKB007: item['DKB007'],
						DKB004: item['DKB004'],
						DKB005: item['DKB005']
					});
				});
				dgData.rows = rows;
				dgData.sumDataNo = data.data.sum;
				materialId = rows[0]["DKB003"];
				BillType=data.data.BillType;
				GetKuWeiData(materialId);
			} else {
				mui.alert(data.message);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
	return dgData;
}

function GetKuWeiData(materialId) {
	$.ajax({
		url: app.API_URL_HEADER + "/PURDKA/GetKuWeiData", //获取数据:调用webApi服务路径
		data: {
			materialId: materialId, //语句查询参数3 ：jquery
			BillType:BillType
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			$.each(dt, function(index, item) { //遍历，整理数据
				rows.push({ //将行数据添加(push)到rows对象
					DAB002: item['DAB002'],
					DAB003: item['DAB003']
				});
			});
			$('#dg2').datagrid('loadData', rows);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

/**
 * {物料明细变化选中行}
 */
$('#dg1').datagrid({
	onSelect: function(index, value) {
		var materialId = value["DKB003"];
		GetKuWeiData(materialId);
	}
});

/**
 * 单号回车事件
 */
document.getElementById('billNo').addEventListener('keydown', function(e) {
	if (e.keyCode != 13) return;
	if(document.getElementById('billNo').value=='') return;
	$('#dg1').datagrid('loadData', []);
	$('#dg2').datagrid('loadData', []);
	if($('#billNo').val()!=""){
		GetData();
	}
	//ReflishInfo();
});

/**
 * 日期回车事件
 */
document.getElementById('ruKuDate').addEventListener('keydown', function(e) {
	if (e.keyCode != 13) return;
	GetBillNoList();
});

/**
 * {扫描条码事件}
 */
document.getElementById("txtBarCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		var billNo = mui("#billNo")[0].value;
		if(billNo.trim() == "") {
			playerAudio("NG");
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请先选择单号");
			return false;
		}
		if(barCode.trim() == "") {
			playerAudio("NG");
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请扫码条码");
			return false;
		}
		if(mui("#quXiao")[0].checked){
			var flag=confirm('是否确定取消退货！');
			if(flag==false)
				return;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/PURDKA/GetBarInfo",
			data: {
				barCode: barCode,
				billNo: billNo,
				userid: userid,
				billtype:BillType,
				quXiao:mui("#quXiao")[0].checked
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					mui("#barCodeInfo")[0].value = data.data.info;
					playerAudio("OK");
					//mui.alert("退货成功");
					if(mui("#quXiao")[0].checked)
						mui.toast("取消退货成功！");
					else
						mui.toast("退货成功！");
					$('#dg1').datagrid('loadData', GetMaterialData());
					$("#txtBarCode").focus().val('');
				} else {
					waitySendQty=data.data;
					if(waitySendQty==''){
						waitySendQty=0;
						playerAudio("NG");
						mui.alert(data.message);
						$("#txtBarCode").val("");
						$("#txtBarCode").focus();
					}
					else{
						playerAudio("NG");
						mui.alert(data.message);
					}
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		return true;
	});
	
/*
 * 选择时间
 */
function ClickDate(){
	
  var a = $("#ruKuDate");
  var dtPicker = new mui.DtPicker(
	{
	    type: "date",//设置日历初始视图模式 
        beginDate: new Date(2019, 01, 01),//设置开始日期 
	    endDate: new Date(3099, 03, 01),//设置结束日期 
	}
  )
  dtPicker.show(function (e) { 
      $("#ruKuDate").val(e.y.text + "-" + e.m.text + "-" + e.d.text);
      $("#billNo").val("");
      $("#billNo").focus();
      GetBillNoList()
  });
};

function GetBillNoList(){
	$.ajax({
		url: app.API_URL_HEADER + "/PURDKA/GetBillNo",
		data: {
			date:$("#ruKuDate").val(),
			IsWW:IsOutProcess
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			jsonData=dt;
			var rows = [];
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//条码拆分
function SplitBarcode(e) {

	var tmpTiaoMa = mui('#txtBarCode')[0].value;
	if(tmpTiaoMa == "") {
		playerAudio("NG");
		mui.alert("请先扫描条码，再拆分操作~")
		return;
	}

	if(waitySendQty == "") {
		playerAudio("NG");
		mui.alert("无待发数量，不需要拆分操作~")
		return;
	}

	//跳转界面
	var extras = {
		BarCode: mui('#txtBarCode')[0].value,
		waitySendQty: waitySendQty
	};
	newpage(e, extras);
	mui('#txtBarCode')[0].value='';
}
