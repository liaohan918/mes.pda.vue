/*
作者：胡丁文
时间： 
描述：指令投入
 */
var tbOrder = null;//工单列表
var table = null;//layui table选择器
var formSelects = null;//多选选择器
var form = null;//layuiform选择器
var curPars = null;//当前传入工序
var isCheckBarCode = false;//是否验证条码
var tbWOMQAC = null;//履历表包含WOMQAD
var tbWOMDAA = null;//工单信息
$(function() {
	layui.config({
        base: '../../lib/layui/extend/formSelects/' //此处路径请自行处理, 可以使用绝对路径
    }).extend({
        formSelects: 'formSelects-v4'
    });
	layui.use(['table','form', 'element', 'layer','jquery', 'formSelects'], function() {
		table = layui.table;
		form = layui.form;
		formSelects = layui.formSelects;
		EventBarCode();
		EventResult();
		//传入值搜索
		var pars = GetParameters();
		if(pars!=null){
			curPars= pars;
			$("#strWorkStep").text(curPars.workStepName);
			$("#strWorker").text(curPars.worker);   
			$("#txtDev").val(curPars.dev);
			
		}else{
			console.log("没有找到传入参数,请重新进入");
		} 
		//提交数据 
		form.on('submit(go)', function(data){  
					
					Submit();
					$("#txtBarCode").focus();
					return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。 
		}); 
		 form.verify({
		  notNull: function(value, item){
			  var reg = /\S/;  
			if(!reg.test(value)){ 
				  return '必填项不能为空';
			}
		  }  
		});  
		//表格填充 
		table.render({
			elem: '#test',
			data: [],
			cellMinWidth: 80, //全局定义常规单元格的最小宽度，layui 2.2.1 新增  
			limit:999999,
			cols: [
				[{
					field: 'QAC002',
					width: 230,
					title: '产品条码'
				}, {
					field: 'QAC008',
					width: 80,
					title: '工序'
				}, {
					field: 'QAC016',
					width: 100,
					title: '作业者'
				}, {
					field: 'QAC017',
					width: 180,
					title: '时间'
				}]
			]
		});
	});
	$("#txtBarCode").focus();
	
}); //jquery
//采集结果选择事件
function EventResult(){
	form.on('select(txtResult)', function(data) {
		var v = data.value;  
		if (v == "") { 
			layer.open({
				title: '提示',
				content: '请选择采集结果'
			});
		}else if(v=="NG"){
			$("#boxBad").css("display","block");
		}else{
			$("#boxBad").css("display","none");
		}
	});
}
//提交数据
function Submit(){
	try{
		if(isCheckBarCode){ 
			var obj = {};
			obj["barcode"] = $("#txtBarCode").val();
			obj["stepId"] = curPars.workStepNo; 
			obj["stepName"] = curPars.workStepName;
			obj["lineId"] = curPars.line;
			obj["devId"] = curPars.dev;
			obj["workerId"] = curPars.worker; 
			obj["state"] = $("#txtResult").val();
			obj["NGItems"] = $("#txtState").val(); 
			obj["badId"] = formSelects.value('selectsOne', 'valStr'); 
			obj["badName"] = formSelects.value('selectsOne', 'nameStr');  
			$.post(app.API_URL_HEADER + '/IQCPBA/StepInputByBarCodeCommit',
			JSON.stringify(obj), 
			function(result) { 
				if (result.status == 0) {
					tbWOMQAC.push({"QAC002":obj["barcode"],"QAC008":obj["stepName"],"QAC016":new Date(),"QAC017":obj["workerId"],});
					table.reload('test',{
					  data : tbWOMQAC
					});  
					$("#txtBarCode").val("");
					$("#txtBarCode").focus();
				} else { 
					layer.open({
						title: '提示',
						content: result.message
					});
				}
			}, "json")
		}else{
			layer.open({
				title: '提示',
				content: '请先扫描条码'
			});
		}
	}catch(e){
		console.log(e);
	}finally{
		isCheckBarCode = false;
	} 
}
//条码回车事件
function EventBarCode(){ 
	$("#txtBarCode").keyup(function(event){
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
	  }
});
}
function GetBarCode(barcode){
	var obj = {};
	obj["barcode"] = barcode;
	obj["stepId"] = curPars.workStepNo; 
	obj["stepName"] = curPars.workStepName;
	obj["lineId"] = curPars.line;
	obj["devId"] = curPars.dev;
	obj["workerId"] = curPars.worker;  
	$.post(app.API_URL_HEADER + '/IQCPBA/StepInputByBarCode',
	JSON.stringify(obj), 
	function(result) { 
		if (result.status == 0) {
			isCheckBarCode =true;
			var tb = JSON.parse(result.data);
			$("#txtPdCount").val(tb.tbWOMDAA[0]["DAA027"]);
			$("#txtPdInputCount").val(tb.tbWOMQAB[0]["QAB013"]);
			tbWOMDAA = tb.WOMDAA;
			var txt = "当前生产指令:"+tb.WOMDAA[0]["DAA001"]+"\r\n"+
					  "当前工单号:"+tb.WOMDAA[0]["DAA038"]+"\r\n"+
					  "产品编码:"+tb.WOMDAA[0]["DAA014"]+"\r\n"+
					  "产品名称:"+tb.WOMDAA[0]["DAA015"]+"\r\n"+
					  "产品规格:"+tb.WOMDAA[0]["DAA016"]+"\r\n"+
					  "产线:"+tb.WOMDAA[0]["DAA042"]+"\r\n"+
			$("#txtShow").append(txt);
			tbWOMQAC = tb.WOMQAC;
			$.each(tb.WOMQAD, function(index, item) {
				tbWOMQAC.push({"QAC002":item["QAD002"],"QAC008":item["QAD004"],"QAC016":item["QAD006"],"QAC017":item["QAD012"],});
			});
			table.reload('test',{
			  data : tbWOMQAC
			});  
		} else { 
			layer.open({
				title: '提示',
				content: result.message
			});
		}
	}, "json")
}
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
	return obj;
} 

function GetTime() {
	//获取系统日期
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
} 