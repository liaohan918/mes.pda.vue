/***********************************
 *   	作者：G98138 LF             *
 *  	时间：2018-12-12            *
 *   	描述：工治具收集                                              *
 **********************************/

/**
 * 窗口初始化
 */
$(function() {
	//获取钢网类型下拉项
	var gzjType = GetGZJType();
	for(var i = 0; i < gzjType.length; i++) {
		if(gzjType[i]["MJA004"] == '1'){
		    $("#gwType").append("<option value='" + i + "'>" + gzjType[i]["MJA001"] + "</option>");
		}
		else{
		    $("#fdType").append("<option value='" + i + "'>" + gzjType[i]["MJA001"] + "</option>");
		}
	}
	//库位条码扫描
	$("#KuWeiCode").keydown(function(e) {
		if(e.keyCode != 13)
		    return;
		if($("#KuWeiCode").val().trim() == "") {
			//playerAudio("NG");
			return false;
		}
		//如果没选择型号
		if($("#gwType").val() == -1) {
			//playerAudio("NG");
			mui.alert("请先选择钢网型号！");
			return false;
		}
		//查找库位是否存在
		var isExit = GetINVBAB();
		if(!isExit) {
			//playerAudio("NG");
//			alert("库位条码：" + $("#KuWeiCode").val() + "不存在！");
			$("#KuWeiCode").val("");
			//$("#KuWeiCode").focus();
			return false;
		}
		$("#GangWangCode").focus();
	});
	//扫码钢网条码
	$("#GangWangCode").keydown(function(e) {
		if(e.keyCode != 13)
		    return;
		//如果没选择型号
		if($("#gwType").val() == -1) {
			//playerAudio("NG");
			alert("请先选择钢网型号！");
			return false;
		}
		if($("#KuWeiCode").val().trim() == "") {
			//playerAudio("NG");
			mui.alert("请先扫描库位条码！");
			$("#KuWeiCode").focus();
			return false;
		}
		if($("#GangWangCode").val().trim() == "") {
			//playerAudio("NG");
			$("#GangWangCode").focus();
			return false;
		}
		//插入钢网条码
		var isSave = SaveSMTMZJ_GW();
		if(!isSave){
			//playerAudio("NG");
			mui.alert("新增失败！");
		}else{
			//playerAudio("OK");
			$("#info1").val("新增钢网:【" + $("#GangWangCode").val() +"】成功！");
			$("#KuWeiCode").val("").focus();
		}
		$("#GangWangCode").val("") ;
	});
	/**
	 * 
	 */
	$("#fdCode").keydown(function(e){
		if(e.keyCode != 13)
		    return;
		//如果没选择型号
		if($("#fdType").val() == -1) {
			//playerAudio("NG");
			mui.alert("请先选择飞达型号！");
			return false;
		}
		if($("#fdCode").val() == ""){
			//playerAudio("NG");
			mui.alert("请先输入飞达条码！");
			return false;
		}
		//SaveSMTMZJ_FD
		//插入飞达条码
		var isSave = SaveSMTMZJ_FD();
		if(!isSave){
			//playerAudio("NG");
			mui.alert("新增失败！");
		}else{
			//playerAudio("OK");
			$("#info2").val("新增飞达:【" + $("#fdCode").val() +"】成功！");
		}
		$("#fdCode").val("").focus();
	});
})

/**
 * 获取钢网型号下拉项
 */
function GetGZJType() {
	var responseData =
		AjaxOperation({}, "获取钢网型号下拉选项", true, "/GZJSJA/GetGZJType")
	if(!responseData.state)
		return [];
	return responseData.data.data;
}

/**
 * 查找库位是否存在
 */
function GetINVBAB() {
	var KuWeiCode = $("#KuWeiCode").val();
	var data = {
		KuWeiCode: KuWeiCode
	};
	var responseData =
		AjaxOperation(data, "库位查找", true, "/GZJSJA/GetINVBAB");
	if(!responseData.state)
		return false;
	return true;
}

/**
 * 保存钢网
 */
function SaveSMTMZJ_GW(){
	var gwType = $("#gwType").find("option:selected").text();//型号
    var KuWeiCode = $("#KuWeiCode").val();
	var GangWangCode = $("#GangWangCode").val();
	var data = {
		gwType:gwType,
		KuWeiCode:KuWeiCode,
		GangWangCode:GangWangCode
	};
	var responseData =
		AjaxOperation(data, "保存钢网", true, "/GZJSJA/SaveSMTMZJ_GW");
		if(!responseData.state)
		return false;
	return true;
}

/**
 * 保存飞达
 */
function SaveSMTMZJ_FD(){
	var fdType = $("#fdType").find("option:selected").text();//型号
    var fdCode = $("#fdCode").val();
    var data = {
		fdType:fdType,
		fdCode:fdCode,
	};
	var responseData =
		AjaxOperation(data, "保存飞达", true, "/GZJSJA/SaveSMTMZJ_FD");
		if(!responseData.state)
		return false;
	return true;
}
