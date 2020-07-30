var userid;
var FDA001 = "";
var bool = false;
mui.init();
mui.plusReady(function() {
//	app.init();
    var self = plus.webview.currentWebview();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
	$("#txtOldFeederCode").focus();
	$("#txtOldFeederCode").val('');
	$("#txtNewFeederCode").val('');
	$("#OnlyCheck").prop("checked",false);
	
});
$(function(){
	//1.扫描旧飞达条码
	$('#txtOldFeederCode').keydown(function(e){
		if(e.keyCode != '13')
		    return;
		var oldFeederCode = $('#txtOldFeederCode').val();
		if(null == oldFeederCode || "" == oldFeederCode){
			playerAudio('NG');
			mui.alert("请先扫描旧飞达编码！");
			return;
		}
		
		var data = {
			oldFeederCode : oldFeederCode
		};
		var result =
		AjaxOperation(data, "扫描旧飞达条码", true, "/SMTFDAChange/GetOldFeeder");
		if(!result.state){
			playerAudio('NG');
			$("#txtOldFeederCode").val('');
			return;
		}
		FDA001 = result.data.message;//工单单号
		$('#info').val(result.data.data);
		$("#txtNewFeederCode").focus();
		
	});
	
	$('#txtNewFeederCode').keydown(function(e){
		if(e.keyCode != '13')
		    return;
		var oldFeederCode = $('#txtOldFeederCode').val();
		var newFeederCode = $('#txtNewFeederCode').val();
		if(!bool){//没有勾选'仅核对位置'
			if(null == oldFeederCode || "" == oldFeederCode){
				playerAudio('NG');
				mui.alert("请先扫描旧飞达编码！");
				return;
			}
			if(null == newFeederCode || "" == newFeederCode){
				playerAudio('NG');
				mui.alert("请先扫描新飞达编码！");
				return;
			}
			var data = {
				oldFeederCode : oldFeederCode,
				newFeederCode : newFeederCode
			};
			var result =
			AjaxOperation(data, "扫描新飞达条码", true, "/SMTFDAChange/GetNewFeeder");
			if(!result.state){
				playerAudio('NG');
				return;
			}
        }else{
			//仅核对位置
			var data = {
				newFeederCode : newFeederCode
			};
			var result =
			AjaxOperation(data, "仅核对位置", true, "/SMTFDAChange/OnlyCheckStation");
			if(!result.state){
				playerAudio('NG');
				return;
			}
		}
        playerAudio('OK');
        mui.toast("更换完成，请核对");
        newpage(this, {});
		//window.location.href = "CheckPositionHtml.html";//该方法跳转，播放声音会有问题
	});
	
	//仅核对物料的位置，使用场景如下：
	// 已经完成了飞达更换，但没有完成站位核对就离开了界面，故使用此功能，扫描新飞达条码直接进入核对界面
	$("#OnlyCheck").change(function(){
		bool = mui("#OnlyCheck")[0].checked;
		if(bool){
			$("#txtOldFeederCode").attr("readonly", "readonly");
			$("#txtOldFeederCode").css("background-color","#777777");
			$("#txtNewFeederCode").removeAttr("readonly").select().focus();
		}
		else{
			$("#txtOldFeederCode").css("background-color","");
			$("#txtOldFeederCode").removeAttr("readonly").select().focus();
		}
	});
});