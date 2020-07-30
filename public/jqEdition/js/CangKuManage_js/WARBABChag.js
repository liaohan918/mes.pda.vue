mui.plusReady(function() {
	$('#info').height(
	$(window).height() -
	$("#row001").height() -
	$("#div001").height() -
	$("#div002").height()-3);
	app.init();
	//DataInit();
});

// var barCode = ""; //当前条码
// var stackCode = ""; //当前条码
var CurdateTime = ""; //当前时间
var billDate = ""; //单据日期
var billNo = ""; //条码品质，默认以扫描的第一个条码为准
var billType = "1203"; //单据类型
var WLBM = ""; //物料编码，已扫数量重置
var i = 0;

/**
 * {初始化数据}
 */
function DataInit() {
	var dateTime = GetSysDateTime();
	billDate = new Date(dateTime.replace(/-/g, "/"));
	mui("#tradingDate")[0].value = formatDate(billDate); //初始化交易日期  默认当天
	mui("#tradingDate")[0].READ_ONLY = true;
	billNo = GetMaxBillNO(billType, formatDate(billDate));
	console.log(billNo);
	mui("#materialCode")[0].focus(); //进入界面材料条码输入框获得焦点 
}

$(function() {
	DataInit();
})
var tempStore; //用来存储条码库位，判断是否调往同一库位
/**
 * {材料条码文本改变事件 查询子条码和数量}
 */
document.getElementById("materialCode").addEventListener("keydown",
	function(e) {
		if (e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		barCode = this.value.trim().toUpperCase();
		if (barCode.trim() == "") {
			playerAudio("NG");
			alert("物料条码不能为空", {
				verticalAlign: 'center'
			});

			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + '/WARBABChag/GetBarInfo',
			data: {
				DAB001: barCode,
			},
			dataType: "json",
			type: "post",
			success: function(data) {
				if (data.status == 1) {
					mui("#info")[0].value = data.data;
					playerAudio("NG");
					return;
				} else {
					console.log(JSON.stringify(data));
					mui("#info")[0].value = data.data.infos;
					tempStore = data.data.KW;

					mui("#storeCode")[0].value = "";
					mui("#storeCode")[0].focus();
					WLBM = data.data.WLBM;
					playerAudio("OK");
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
			}
		});
	})

/**
 * {仓库条码文本改变事件  保存库位变更结果}
 */
document.getElementById("storeCode").addEventListener("keydown",

	function(e) {
		if (e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		
		var barCode =$("#materialCode").val().toUpperCase();
		var store = $("#storeCode").val();
		
		if (barCode.trim() == "") {
			playerAudio("NG");
			mui.alert("条码输入不能为空", {
				verticalAlign: 'center'
			});
			return;
		}
		if (store == "") {
			playerAudio("NG");
			mui.alert("新库位不能为空！");
			$("#storeCode")[0].focus();
			return;
		}

		if (tempStore == store) {
			playerAudio("NG");
			mui.alert("不能调往同一库位！");
			$("#storeCode")[0].focus();
			$("#storeCode").val("");
			return;
		}

		$.ajax({
			url: app.API_URL_HEADER + '/WARBABChag/Execute',
			data: {
				DAB001: barCode,
				curStore: store, //当前库位
				billNo: billNo,
				logID: app.userid(),
				billdate: billDate.format("yyyy-MM-dd"),
				billtype: billType
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				results = data;
//				mui.toast(data.message);				
				if (data.status == 0) {
//					if (tempStore != $("#storeCode").val()) {
//						mui.toast("库位变更成功!");
//					}
					mui("#info")[0].value = data.message
					mui("#materialCode")[0].value = "";
					mui("#materialCode")[0].focus();
					$("#bardCode-count")[0].innerHTML = ++i;
					playerAudio("OK");
				} else {
					playerAudio("NG");
					mui.toast(data.message);
					$("#storeCode").val('').focus();
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
				mui.toast("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
