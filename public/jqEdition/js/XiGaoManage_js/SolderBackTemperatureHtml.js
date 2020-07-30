/*
作者：黄邦文
时间：2018-09-25
描述：锡膏回温
 */
mui.init();

$(function() {
	var userPicker = new mui.PopPicker();
	//获取仓库
	$.ajax({
		url: app.API_URL_HEADER + '/XiGao/GetCKBM',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPicker.setData(dt);
			playerAudio('OK');
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG')
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择仓库
	$('#txtCKBM').click(function() {
		userPicker.show(function(items) {
			$('#txtCKMC').val(items[0]['text']);
			$('#txtCKBM').val(items[0]['value']);
			huoquData();
			//返回 false 可以阻止选择框的关闭
			//return false;
		});

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
		if($('#txtCKBM').val() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			playerAudio('NG');
			alert("请先选择仓库", {
				verticalAlign: 'center'
			});
			$('#tabsid').tabs('select', 0);
			$('#txtCKBM').focus();
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + '/XiGao/GetHuiWenBarcodeMsg',
//			url: "http://localhost:27611/api" + '/XiGao/GetHuiWenBarcodeMsg',
			data: {
				CKBM: $('#txtCKBM').val(),
				TiaoMa: barCode
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				//console.log(JSON.stringify(res));
				//mui("#info")[0].value = data.data;
				if(res.status == 0) {
					var dt1 = $.parseJSON(res.data);
					if(dt1.length > 0) {
						playerAudio('OK');
						if(dt1[0]["IsFIFO"] == "Y" ||
							(dt1[0]["IsFIFO"] == "N" &&
								confirm("条码[" + barCode + "]违反先进先出原则，是否继续？"))) {
							var msg = "条码：" + dt1[0]["DAB001"] + "\n";
							msg = msg + "仓库编码：" + dt1[0]["DAB002"] + "\n";
							msg = msg + "库位：" + dt1[0]["DAB003"] + "\n";
							msg = msg + "数量：" + dt1[0]["DAB006"] + "\n";
							msg = msg + "物料编码：" + dt1[0]["DAB020"] + "\n";
							msg = msg + "规格：" + dt1[0]["DAB008"] + "\n";
							msg = msg + "来料日期：" + dt1[0]["DAB028"] + "\n";
							msg = msg + "最大回温次数：" + dt1[0]["MBB007"] + "次\n";
							msg = msg + "需回温时间：" + dt1[0]["MBB008"] + "(小时)\n";
							$('#info').val(msg);
						} else {
							$('#info').val('');
							$('#txtBarcode').val('').focus();
						}
					} else {
						mui.toast(res.message);
						$('#info').val('');
						$('#txtBarcode').val('').focus();
					}
				} else {
					playerAudio('NG');
					mui.toast(res.message);
					$('#txtBarcode').val('').focus();
					$('#info').val('');
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio('NG');
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});

	$('#btn_ok').click(function() {
		//更新回温数据
		UpdateHuiWen();
	});

	$('#btn_clear').click(function() {
		ClearData();
	});
	//根据回温数据改变表格颜色
	$('#dg').datagrid({
		height: $(window).height() - $('#infos').height() - 52,
		//		rowStyler: function(index, row) {
		//			if(row.NoPanShu == 0) {
		//				return 'background-color:Green;font-weight:bold;'; //
		//			} else if(row.YP > 0) {
		//				return 'background-color:Yellow;font-weight:bold;'; //
		//			}
		//		}
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
						GetData(true, pageSize, pageNum, 'DAB001');
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
	GetData(true, ps, pn, 'DAB001');
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
		url: app.API_URL_HEADER + '/XiGao/GetXiGaoBarcodeByCKBM', //获取数据:调用webApi服务路径
		data: {
			paging: paging, //是否分页
			pageSize: pageSize, //页容量
			pageNumber: pageNumber, //初始化页码
			keys: keys, //分页主键
			CKBM: $("#txtCKBM").val() //语句查询参数3 ：jquery
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
					Barcode: item['DAB001'],
					WLBM: item['DAB020'],
					KC: item['DAB006'],
					LLRQ: item['DAB028'],
					WLMC: item['DAB021'],
					WLGG: item['DAB008'],
					KW: item['DAB003']
				});
			});
			sumDataNo = data.sum;
			$('#dg').datagrid('loadData', rows); //给表格设置数据源(rows)
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio('NG');
			//console.log(errorThrown);
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//更新回温数据
function UpdateHuiWen() {
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
		url: app.API_URL_HEADER + '/XiGao/UpdateHuiWen',
		data: {
			CKBM: $('#txtCKBM').val(),
			Barcode: barcode,
			LoginUser: user_id
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			ClearData();
			$('#txtBarcode').focus();
			huoquData();
			playerAudio('OK');
			mui.toast('锡膏回温成功!');
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