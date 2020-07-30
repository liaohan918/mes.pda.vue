/**
 * 作者：G98052 黄邦文
 * 时间：2019-11-19
 * 描述：其它入库 库位 绑定
 * 
 * 业务思路：
 * 1. 扫描条码
 *  1.1 非条码库存表的条码， 提示（ OK） *
 *	1.2 非待入库条码， 提示（ OK） *
 *	1.3 通过条码找到上一次该物料的库位， 作为推荐库位（ OK）
 *	注意： 如果勾选了“默认库位”， 且在上一次绑定的库位和当前界面显示的库位一致 ， 则直接绑定库位， 不需要再扫描库位 *

 * 2. 扫描库位条码 *
 *	2.1 非库位条码， 提示（ OK） *
 *	2.2 非该仓库的库位， 提示（ OK） *
 */

// 全局变量
var billNo = '';
var i = 0; //计算扫描条码数量
var WLBM = "";//物料编码
var matterTable = null;

//初始化，默认焦点
mui.plusReady(function(){
	$('#info').height($(window).height()- $("#row001").height() - $("#div001").height()- $("#div002").height() - 40);
	mui("#DAB001")[0].focus();
});		
$(function(){
	billNo= GetMaxBillNO("1201",GetSysDateTime());//调拨单号，只要不离开界面，单号不变
})

//数字拖动之后调整数字小图标位置
function onStopDrag(e) {
	var d = e.data;
	if(d.left < 0) {
		d.left = 0
	}
	if(d.top < 0) {
		d.top = 0
	}
	if(d.top + $(d.target).outerHeight() > $(d.parent).height()) {
		$("#dgWOMDAG-sum")[0].innerHTML = "0";
		$("#dgWOMDAG-sum").css("top", d.startTop + "px");
		$("#dgWOMDAG-sum").css("left", d.startLeft + "px");
		$("#dgWOMDAG-sum").css("position", "initial");
		i = 0;
	}
}
 //扫描条码处理方法
 function GetBarInfo() {
 	if(event.keyCode == 13) {
 		//如果未输入条码，跳出方法
 		if($("#DAB001").val() == "") {
 			return;
 		}
 		//用户ID
        var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
   		var user_id = currentSession.user_id;
   		
 		$.ajax({
 			url: app.API_URL_HEADER + "/WARBABQT/GetBarInfo",
 				
 			data: {
 				DAB001: $("#DAB001").val(),
 				check: $("#checkdefault").prop("checked") == true ? "1" : "0", //获取复选框是否被选中（true，false）
 				curStore: $("#MBA001").val() == null ? "" : $("#MBA001").val(), //当前库位
 				billNo:billNo,
 				logID: user_id,//Admin //先写死，便于调试
 				
 			},
 			DataType: "json",
 			type: "post",
 			async: false,
 			//timeout: 15000,
 			success: function(data) {
 				//console.log(JSON.stringify(data));
 				if(data.status != 0) {
					playerAudio("NG");
 					mui.alert(data.message,"","",function(){ 
 						mui("#DAB001")[0].focus();
						$("#DAB001").val("");
 					});			
 					return;
 				} else {
 					matterTable = data.data.matterTable;
                    $("#info").val("");//先清空一下数据源
 					$("#info").val(data.data.infos);//填入条码明细信息
 					//带出库位
 					if($("#MBA001").val().trim() == "")      
 					    $("#MBA001").val(data.data.lastStore);
 					document.getElementById("MBA001").focus();        			
        			document.getElementById("MBA001").select();
 					//如果服务器更新表成功，清空条码输入框
 					if(data.data.sp_state > 0) {
						playerAudio("OK");
 						$("#DAB001").val("");
 						$("#DAB001").focus();
 						if(WLBM == matterTable[0]["DAB020"])
						    $("#dgWOMDAG-sum")[0].innerHTML = ++i;
						else{
							i = 1;
						    $("#dgWOMDAG-sum")[0].innerHTML = i;
						    WLBM = matterTable[0]["DAB020"];
						}
 						mui.toast("入库完成！"); 
 					}
 				}
 			},
 			error: function(xhr, type, errorThrown) {
 				alert("获取数据异常：" + JSON.stringify(errorThrown));
 			}
 		});
 	}
 };
//扫描库位处理方法
function GetStore() {
	if(event.keyCode == 13) {
		//如果未输入条码，跳出方法
		if($("#DAB001").val() == "") {
			$("#DAB001").focus();
			playerAudio("NG");
			mui.toast("请先扫描物料条码!");
			$("#MBA001").val("");
			return;
		}
		//如果未扫描库位条码
		if($("#MBA001").val() == ""){
			playerAudio("NG");
			mui.toast("请先扫描库位条码!");
			mui("#MBA001")[0].focus();
			return;
		}
		document.getElementById("MBA001").select();
		$.ajax({
			url: app.API_URL_HEADER + "/WARBABQT/GetStore",
			data:{
				MBA001:$("#MBA001").val(),
				DAB001:$("#DAB001").val(),
				logID: app.userid,
				billNo:billNo,
			},
			DataType:"json",
			type:"post",
			async:false,
			//timeout:15000,
			success:function(data){
				//console.log(JSON.stringify(data));
 				if(data.status != 0){
 					mui.alert(data.message);//错误信息弹框
 					$("#MBA001")[0].focus();
 					$("#MBA001").val("");
 					return;
 				}
 				if(data.data<=0){
 					mui.alert(data.message);
 					return;
 				}else{
 					$("#DAB001").val("");
 					$("#DAB001")[0].focus();
 					$("#checkdefault").prop("checked", true);
 					if(WLBM == matterTable[0]["DAB020"])
					    $("#dgWOMDAG-sum")[0].innerHTML = ++i;
					else{
						WLBM = matterTable[0]["DAB020"];
						i = 1;
						$("#dgWOMDAG-sum")[0].innerHTML = i;
					}
 					playerAudio("OK");
 					mui.toast("入库成功！");
			   }
 			},
			error: function(xhr, type, errorThrown) {
				mui.toast("入库异常！");
 				alert("获取数据异常：" + JSON.stringify(errorThrown));
 				return;
 			}
		});
	}
}