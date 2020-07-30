/*
作者：胡丁文
时间： 
描述：指令投入
 */
var tbOrder = null;//工单列表 
var table = null;//layui table选择器
var form = null;//layuiform选择器
var curPars = null;//当前传入工序
var curOrder = null;//当前选中工单
var curOrderDetail = null;//当前选中工单条码明细
$(function() { 
	//SetLine(); 
	//EventLine();
	 //初始赋值
   //常规用法
  
	EventBarCode();//条码回车
	layui.use(['table','form', 'element', 'layer'], function() {
		table = layui.table;
		form = layui.form; 
		//工单选择事件
		EventOrder(); 
		//传入值搜索
		var pars = GetParameters();
		if(pars!=null){
			curPars= pars;
			$("#strWorkStep").text(curPars.workStepName);
			$("#strWorker").text(curPars.worker); 
			$("#txtLine").val(pars.line); 
		}else{
			console.log("没有找到传入参数,请重新进入");
		}  
		//表格填充 
		table.render({
			elem: '#test',
			data: [],
			cellMinWidth: 80, //全局定义常规单元格的最小宽度，layui 2.2.1 新增  
			limit:999999,
			cols: [
				[{
					field: 'QAB002',
					width: 230,
					title: '产品条码'
				}, {
					field: 'QAB006',
					width: 150,
					title: '产品型号'
				}, {
					field: 'QAB015',
					width: 180,
					title: '投入时间'
				}, {
					field: 'QAB014',
					width: 100,
					title: '操作者'
				}]
			]
		});
		 form.on('submit(go)', function(data){ 
					return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。 
		}); 
	}); 
	
}); //jquery
function GetParameters(){
	//传入值搜索
	var name,value;
	var obj = {};
	var str=location.href; //取得整个地址栏
	var num=str.indexOf("?")
	if(num==-1)
	return null;
	str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
	var arr=str.split("&"); //各个参数放到数组里 
	for(var i=0;i < arr.length;i++){
		num=arr[i].indexOf("=");
		if(num>0){
			 name=arr[i].substring(0,num);
			 value=arr[i].substr(num+1);
			 obj[name] = decodeURI(value);
		}
	}
	console.log(obj);
	GetOrder(obj.line);
	return obj;
}
function GetOrder(line){
	//获取工单
	$.ajax({
		url: app.API_URL_HEADER + '/IQCPBA/GetOrdersByLine?line=' + line,
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			$('#txtOrder').html("");
			$('#txtOrder').append(new Option("请选择", ""));
		
			tbOrder = $.parseJSON(resdata.data);
			$.each(tbOrder, function(index, item) {
				$('#txtOrder').append(new Option(item.text, item.value)); // 下拉菜单里添加元素 
				layui.form.render("select");
			});
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	}); 
}
//生产指令选择事件
function EventOrder(){ 
	form.on('select(txtOrder)', function(data) {
		var line = data.value;
		if (line == "") { 
			layer.open({
				title: '提示',
				content: '你还没有选择工单'
			});
		}
		var orderNo = data.value;
		var stepId = curPars.workStepNo;
		$.each(tbOrder, function(index, item) {
			if(item.DAA001==orderNo){ 
				curOrder = item;
				$("#txtPdName").val(item.DAA015);
				$("#txtPdCount").val(item.DAA027);
				//工单投入明细查询 
				$.post(app.API_URL_HEADER + '/IQCPBA/GetOrderInputCountAndBarCode?orderId='+orderNo+'&stepId='+stepId,
				{}, function(result) {
					console.log(result);
					if (result.status == 0) { 
						var d = JSON.parse(result.data);
						curOrderDetail = d;
						if(curOrderDetail.length){ 
							$("#txtPdInputCount").val(curOrderDetail[0]["InputCount"]);  
						}else{
							$("#txtPdInputCount").val("0");  
						}
						 
						table.reload('test',{
						  data : curOrderDetail
						}); 
					} else {
						 
						layer.open({
							title: '提示',
							content: result.message
						});
					}
					$("#txtBarCode").focus();
				}, "json")
				return;
			}
		});
	});
}
function EventBarCode(){ 
	$("#txtBarCode").keypress(function(event){
		if(event.keyCode ==13){
				var barcode = $(this).val();
				if(barcode!=""){
					GetBarCode(barcode);
				}else{
					layer.open({
						title: '提示',
						content: '请先扫描条码'
					});
				}
				$("#txtBarCode").val("");
				$("#txtBarCode").focus();
		}
	});
}
function GetBarCode(barcode){
	var obj = {};
	obj["barcode"] = barcode;
	obj["stepId"] = curPars.workStepNo;
	obj["orderId"] = curOrder.DAA001; 
	obj["stepName"] = curPars.workStepName;
	obj["lineId"] = curPars.line;
	obj["devId"] = curPars.dev;
	obj["workerId"] =  curPars.worker;
	$.post(app.API_URL_HEADER + '/IQCPBA/OrderInputByBarCode',
	JSON.stringify(obj), function(result) { 
		if (result.status == 0) {
			//投入成功,返回data就是投入成功的数量
			$("#txtPdInputCount").val(Number($("#txtPdInputCount").val())+Number(result.data));
			curOrderDetail.push({"QAB002":barcode,"QAB006":curOrder.DAA015,"QAB015":new Date(),"QAB014":curPars.worker});
			table.reload('test',{
			  data : curOrderDetail
			}); 
		} else { 
			layer.open({
				title: '提示',
				content: result.message
			});
		}
	}, "json")
}
//产线选择事件
function EventLine(){
	form.on('select(txtLine)', function(data) {
		//获取产线指定的工单
		var line = data.value;
		if (line == "") {
			return;
			layer.open({
				title: '提示',
				content: '你还没有选择产线'
			});
		}
		//获取工单
		$.ajax({
			url: app.API_URL_HEADER + '/IQCPBA/GetOrdersByLine?line=' + line,
			data: {},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				$('#txtOrder').html("");
				$('#txtOrder').append(new Option("请选择", ""));
	
				tbOrder = $.parseJSON(resdata.data);
				$.each(tbOrder, function(index, item) {
					$('#txtOrder').append(new Option(item.text, item.value)); // 下拉菜单里添加元素 
					layui.form.render("select");
				});
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		}); 
	});
}
function SetLine() {
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			$.each(dt, function(index, item) {
				$('#txtLine').append(new Option(item.text, item.value)); // 下拉菜单里添加元素
				layui.form.render("select");
			});
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function GetTime() {
	//获取系统日期
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
}
//检查数据是否录完整
function CheckData() {
	if ($('#txtBillNo').val() == '') {
		playerAudio('NG');
		mui.toast('单据号不能为空！');
		$('#txtBillNo').focus();
		return false;
	}
	if ($('#txtCheckTime').val() == '') {
		playerAudio('NG');
		mui.toast('日期不能为空！');
		$('#txtCheckTime').focus();
		return false;
	}
	return true;
}
