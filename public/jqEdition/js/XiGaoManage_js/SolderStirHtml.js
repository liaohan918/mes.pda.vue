/*
作者：黄邦文
时间：2018-09-25
描述：锡膏搅拌
 */
mui.init();

$(function() {
	$('#btn_Refresh').click(function() {
		huoquData();
	});

	$('#dg').datagrid().datagrid('clientPaging');
	//扫描条码的处理
	$('#txtBarcode').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			playerAudio('NG');
			alert("条码输入不能为空", {
				verticalAlign: 'center'
			});
			return false;
		}

		$.ajax({
			url: app.API_URL_HEADER + '/XiGao/GetJiaoBanBarcodeMsg',
// 			url: "http://localhost:27611/api" + '/XiGao/GetJiaoBanBarcodeMsg',
			data: {
				Barcode: barCode
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				//console.log(JSON.stringify(res));
				//mui("#info")[0].value = data.data;
				if(res.status == 0) {
					var dt1 = $.parseJSON(res.data);
					if(dt1.length > 0) {
						if(dt1[0]["YiTime"] >= dt1[0]["XuTime"] ) {
							playerAudio('OK');
							var msg = "条码：" + dt1[0]["Barcode"] + "\n";							
							msg = msg + "数量：" + dt1[0]["KC"] + "\n";
							msg = msg + "物料编码：" + dt1[0]["WLBM"] + "\n";
							msg = msg + "物料名称：" + dt1[0]["WLMC"] + "\n";
							msg = msg + "规格：" + dt1[0]["WLGG"] + "\n";
							msg = msg + "开始回温时间：" + dt1[0]["KaiShiTime"] + "\n";
							msg = msg + "已回温时间(小时)：" + dt1[0]["YiTime"] + "\n";
							msg = msg + "需回温时间(小时)：" + dt1[0]["XuTime"] + "\n";
							$('#info').val(msg);
						} else {
							playerAudio('NG');
							mui.alert("回温时间不足，不能进行搅拌");
							$('#info').val('');
							$('#txtBarcode').val('').focus();
						}
					} else {
						playerAudio('NG');
						mui.alert(res.message);
						$('#info').val('');
						$('#txtBarcode').val('').focus();
					}
				} else {
					playerAudio('NG');
					mui.alert(res.message);
					$('#txtBarcode').val('').focus();
					$('#info').val('');
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});

	$('#btn_ok').click(function() {
		//更新搅拌数据
		UpdateJiaoBan();
	});

	$('#btn_clear').click(function() {
		ClearData();
	});
	//根据回温数据改变表格颜色
	$('#dg').datagrid({
		height: $(window).height() - $('#infos').height() - 105,
		rowStyler: function(index, row) {
			if(row.YiTime>row.XuTime) {
				return 'background-color:Green;font-weight:bold;'; //
			}
			else
			{
				return 'background-color:Red;font-weight:bold;';
			}
		}
	}).datagrid('clientPaging', GetData);
});

var sumDataNo = 0; //总行数量
(function($) {
	//pagerFilter方法是在page onSelectPage 事件之后执行,即页签改变之后
	function pagerFilter(data) {
		if($.isArray(data)) { // is array
			data = {
				total: sumDataNo, //后期：这里存放从webAPI接口传过来的总数量
				rows: data //这个data 就是表格的数据集合
			}
		}
		return data; //不用再进行整理剔除不再范围内的行数据
	}

	var loadDataMethod = $.fn.datagrid.methods.loadData;
	$.extend($.fn.datagrid.methods, {
		clientPaging: function(jq) {
			return jq.each(function() {
				var dg = $(this);
				var state = dg.data('datagrid');
				var opts = state.options;
				opts.loadFilter = pagerFilter;
				var onBeforeLoad = opts.onBeforeLoad;
				opts.onBeforeLoad = function(param) {
					state.allRows = null;
					return onBeforeLoad.call(this, param);
				}
				var pager = dg.datagrid('getPager');
				pager.pagination({
					howPageList: false,
					buttons: [],
					onSelectPage: function(pageNum, pageSize) {
						opts.pageNumber = pageNum;
						opts.pageSize = pageSize;
						pager.pagination('refresh', {
							pageNumber: pageNum,
							pageSize: pageSize
						});
						GetData(true, pageSize, pageNum, 'Barcode');
					},
					onBeforeRefresh: function() {
						return true;
					}
				});
				$(this).datagrid('loadData', state.data);
				if(opts.url) {
					$(this).datagrid('reload');
				}
			});
		},
		loadData: function(jq, data) {
			jq.each(function() {
				$(this).data('datagrid').allRows = null;
			});
			return loadDataMethod.call($.fn.datagrid.methods, jq, data);
		},
		getAllRows: function(jq) {
			return jq.data('datagrid').allRows;
		}
	})
})(jQuery);

/**
 * 获取数据点击事件
 * 第一次查询，默认第一页，然后获取页容量，通过ajax把第一批数据查询显示在界面
 */
function huoquData() {
	//以下才是以后要的实际操作
	var ps = $('#dg').datagrid('options').pageSize; //页容量
	var pn = $('#dg').datagrid('options').pageNumber; //初始化页码
	GetData(true, ps, pn, 'Barcode');
};

/**
 * 通过ajax获取页面数据
 * @param {是否分页} paging
 * @param {页容量} pageSize
 * @param {页码} pageNumber
 * @param {分页主键} keys
 */
function GetData(paging, pageSize, pageNumber, keys) {
	$.ajax({
		url: app.API_URL_HEADER + '/XiGao/GetHuiWenXiGao', //获取数据:调用webApi服务路径
//		url: "http://localhost:27611/api" + '/XiGao/GetHuiWenXiGao', 
		data: {
			paging: paging, //是否分页
			pageSize: pageSize, //页容量
			pageNumber: pageNumber, //初始化页码
			keys: keys
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			playerAudio('OK');
			//console.log(JSON.stringify(data)); //在控制台输出日志
			data = $.parseJSON(data);
			var rows = [];
			$.each(data.tbData, function(index, item) { //遍历，整理数据
				rows.push({ //将行数据添加(push)到rows对象
					Barcode: item['Barcode'],
					WLBM: item['WLBM'],
					KC: item['KC'],
					KaiShiTime: item['KaiShiTime'],
					YiTime: item['YiTime'],
					XuTime: item['XuTime'],
					WLMC: item['WLMC'],
					WLGG: item['WLGG'],
					PAA002:item['PAA002']
				});
			});
			sumDataNo = data.sum;
			$('#dg').datagrid('loadData', rows); //给表格设置数据源(rows)
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//更新搅拌数据
function UpdateJiaoBan() {
	var info = $('#info').val();
	var barcode = $('#txtBarcode').val();
	if(info == '') {
		playerAudio('NG');
		alert('请扫描条码！');
		$('#txtBarcode').focus();
		return;
	}
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
//var user_id ='noid';
	$.ajax({
		url: app.API_URL_HEADER + '/XiGao/UpdateJiaoBan',
//		url: "http://localhost:27611/api" + '/XiGao/UpdateJiaoBan',
		data: {
			Barcode: barcode,
			LoginUser: user_id
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			playerAudio('OK');
			console.log(JSON.stringify(resdata));
			ClearData();
			$('#txtBarcode').focus();
			huoquData();
			mui.toast('锡膏搅拌成功!');
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function ClearData() {
	$('#info').val('');
	$('#txtBarcode').val('').focus();

}