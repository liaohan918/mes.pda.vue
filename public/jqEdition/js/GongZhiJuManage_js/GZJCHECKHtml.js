/**
 * 作者：G98138 黎锋
 * 日期：2018-09-07
 * 描述：工治具领用
 */
/**
 * 初始化，默认焦点
 */
var WOMPicker;
$(function(){
	mui("#Barcode")[0].focus();
	$("#gzjType").val('1-钢网');
	
	//获取待校验指令数据
	getWOMList();
	
	$("#DAA001").click(function(e){
		WOMBillNo_Click(); 
		mui("#Barcode")[0].focus();
	});
	
	$('#Barcode').keydown(function(e){
		if(e.keyCode != 13)
			return;
		ScanBarCode_Check();	
		
	})
});

function getWOMList(){
	WOMPicker = new mui.PopPicker(); //声明对象
	$("#tb2").datagrid("loadData", []);
	mui('#dgScanList-sum')[0].innerHTML = '0';
	$.ajax({
			url:app.API_URL_HEADER + "/GZJUSE/GetWOMList",
//	url: "http://localhost:27611/api/GZJUSE/GetWOMList",
	data: {},
	DataType: "json",
	Type: "post",
	async: false,
	success: function(data) {
		console.log(JSON.stringify(data));
		if(status == 1)
		{
			playerAudio('NG');
			mui.alert(data.message);
			return false;
		}
		var dt = data.data;
		WOMPicker.setData(dt); //设置数据源
		
	},
	error: function(xhr, type, errorThrow) {
		alert("获取数据异常：" + JSON.stringify(errorThrow));
		return;
	}
});
}
	
	
function WOMBillNo_Click(){
	WOMPicker.show(function(items) {
			var arrs = items[0]["text"].split('/'); //截取工单
			$("#DAA001").val(arrs[0]);
			$("#lineId").val(arrs[1]);
			getNoCheckList();
		});
		
}

/**
 *根据指令、线别、工治具类型获取待校验的工治具列表 
 */
function getNoCheckList(DAA001, lineId,GZJType) {
	$.ajax({
			url:app.API_URL_HEADER + "/GZJUSE/GetNoCheckList",
//		url: "http://localhost:27611/api/GZJUSE/GetNoCheckList",
		data: {
			DAA001: $('#DAA001').val() ,
			lineId:$('#lineId').val() ,
			GZJType: $('#gzjType').val() ,
		},
		DataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 1){
				playerAudio('NG');
				mui.alert(data.message);
				$("#tb1").datagrid("loadData", []);
				return false
			}
			playerAudio('OK');
			//数量标签
			$("#tb1").datagrid("loadData", data.data);
			$("#dgGZJList-sum")[0].innerHTML = data.data.length;
		},
		error: function(xhr, type, errorThrow) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrow));
		}
	});
};
/**
 * 工治具类型点选处理
 */
function GetGZJType() {
	if($("#DAA001").val() == ""){
		mui.alert("请先选择指令！");
		return;
	}
	var userPicker = new mui.PopPicker();//声明对象
	$.ajax({
		url:app.API_URL_HEADER + "/GZJUSE/GetGZJType",
//      url:"http://localhost:27611/api/GZJUSE/GetGZJType",
 		data:{},
		DataType:"json",
		Type:"post",
		async:false,
		success:function(data){
		console.log(JSON.stringify(data));
		var dt =  data.data;
		userPicker.setData(dt);//设置数据源
		userPicker.show(function(items){
			$("#gzjType").val(items[0]["text"]);
			getNoCheckList($("#DAA001").val(),$("#lineId").val(),items[0]["value"]);
			});
		mui("#Barcode")[0].focus();
		},
		error:function(xhr,type,errorThrow){
			mui.alert("获取数据异常：" + JSON.stringify(errorThrow));
		}
	});
};
/**
 * 扫描工治具条码处理
 */
function ScanBarCode_Check(){
	if(event.keyCode == 13){
		if($("#Barcode").val() == ""){
			playerAudio("NG");
			mui.alert("请先扫描条码！");
			return false;
		}
		if($("#DAA001").val() == ""){
			playerAudio("NG");
			mui.alert("请先选择指令！");
			return false;
		}
		if(CheckFinsh()){
			return false;
		}
		//用户ID
        var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		var user_id = currentSession.user_id;
//		var user_id = "admin";//暂时写死，测试
		$.ajax({
			url:app.API_URL_HEADER + "/GZJUSE/ScanBarCode_Check",
//          url:"http://localhost:27611/api/GZJUSE/ScanBarCode_Check",
			data:{
				GZJType:$("#gzjType").val(),//工治具类型
				DAA001:$("#DAA001").val(),//指令单号
				lineId:$("#lineId").val(),//线别
				MZJ001:$("#Barcode").val(),//工治具条码
				user_id:user_id,
			},
			DataType:"json",
		    type:"post",
		    async:false,
            success:function(data){
        	    console.log(JSON.stringify(data));
        	    if(data.status == 1){
        	    	playerAudio('NG');
        	    	$("#Barcode").focus();
        	    	document.getElementById("Barcode").select();
        	    	mui.alert(data.message);
        	    	return false;
        	    }
        	    playerAudio("OK");
        	    $("#tb2").datagrid("appendRow",{
        	    	USE003:data.data[0].Table[0]["USE003"],
        	    	USE002:data.data[0].Table[0]["USE001"],
        	    });
        	    //数量标签自增
        	    var dgScanList_sum = parseInt(document.getElementById("dgScanList-sum").innerHTML);
          	    $("#dgScanList-sum")[0].innerHTML = dgScanList_sum + 1;
        	    if(CheckFinsh()){
        	    	return false;
        	    }
            },
            error:function(xhr,type,errorThrow){
            	playerAudio('NG');
				mui.alert("获取数据异常：" + JSON.stringify(errorThrow));
		    }
		});
	}
};
/**
 *检查是否已经完成校验 
 * 注意 ：
 *    1.重复扫描条码，提示该条码已校验
 *    2.再次打开窗口，可以扫描校验过的条码。但不更新数据库
 */
function CheckFinsh(){
	var len1 = $("#tb1").datagrid("getRows").length;
	var len2 = $("#tb2").datagrid("getRows").length;
	if(len1 == len2){//暂时先这样判断
		mui.toast("该工单工治具校验完成已完成!");
		$("#Barcode").val("");
		return true;
	}else{
		return false;
	}
};