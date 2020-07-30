/*
作者：黄邦文
时间：2018-09-04
描述：初盘盘点
 */
mui.init();
var isNewBarcode = "N"
var isScanningBarcode = "N" //是否盘点过数据
var MBarcode = "" //选择的主条码里的明细条码
var OldKW = '' //旧库位
var KuQu = '' //库区
var DAB018 = '' //主条码标识
var MainKuQu = '' //主条码库区

mui.plusReady(function(e){
	$('#dg').datagrid({height:$(window).height()- $('#infos').height()-80});
	$('#dg02').datagrid({height:$(window).height()- $('#infos').height()-80});
	//$("#item2").height($(window).height() - $('#infos').height() + 20);
});

$(function() {
	//---------------------------整体信息处理----------------------------------------------
	//设置条码信息页的高度
	// $("#item2").height($(window).height() - $('#infos').height() + 20);

	//tab选项卡改变事件
	//点击条码信息时把焦点定焦到条码框,点击盘点信息时如果isScanningBarcode是Y，则获取盘点明细的数据
	$('#tabsid').tabs({
		onSelect: function(title, index) {
			if(title == "盘点信息") {
				if(isScanningBarcode === "Y") {
					huoquData();
					isScanningBarcode = "N";
				}
			}
			if(title == "单个条码") {
				setTimeout(function() {
					SetInputFoucs("#txtBarcode");
				}, 500);
			}
			if(title == "主条码") {
				setTimeout(function() {
					SetInputFoucs("#txtMainBarcode");
				}, 500);
			}
		}
	});
	//---------------------------整体信息处理end----------------------------------------------

	//---------------------------盘点信息处理----------------------------------------------
	var userPicker = new mui.PopPicker();
	//获取未完成的盘点单号
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetNoFinishPDDanHao',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
			if(resdata.message == "N") {
				$('#tabsid').tabs('close', "主条码");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择盘点单号
	$('#txtPDDanHao').click(function() {
		userPicker.show(function(items) {
			$('#txtPDMSG').val(items[0]['text']);
			$('#txtPDDanHao').val(items[0]['value']);
			huoquData();
			//返回 false 可以阻止选择框的关闭
			//return false;
		});

	});
	$('#dg').datagrid().datagrid('clientPaging');

	$('#dg').datagrid({
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			var WLBM = rowData.WLBM; //物料编码
			//$("#head2").text("物料编码:" + WLBM);
			GetKuWeiMsg(WLBM);
		},
	});
	//根据盘点数据改变表格颜色
	$('#dg').datagrid({
		height: $(window).height() - $('#infos').height() - 85,
		rowStyler: function(index, row) {
			if(row.NoPanShu == 0) {
				return 'background-color:Green;font-weight:bold;'; //
			} else if(row.YP > 0) {
				return 'background-color:Yellow;font-weight:bold;'; //
			}
		},
		onLoadSuccess: function(data) {
			var rows = $('#dg').prev().find('div.datagrid-body').find('tr');
			if(data.total != 0)
				for(var i = 0; i < rows.length; i++) {
					if(rows[i].cells[3].innerText > 0) {
						rows[i].cells[0].style.cssText = 'background-color:Orange;font-weight:bold;';
					}
				}
		}
	}).datagrid('clientPaging', GetData);

	//设置库位明细的高度
	$('#dg02').datagrid({
		height: $(window).height() - $('#infos').height() - 85,
	}).datagrid('clientPaging', GetData);
	//---------------------------盘点信息处理end----------------------------------------------	
	//---------------------------单个条码处理----------------------------------------------
	//扫描条码的处理
	$('#txtBarcode').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		if($("#txtPDDanHao").val() == '') {
			mui.toast('请先选择盘点单号！')
			$('#txtBarcode').val('').focus();
			return;
		}
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			playerAudio("NG");
			alert("条码输入不能为空", {
				verticalAlign: 'center'
			});
			return false;
		}

		$.ajax({
			url: app.API_URL_HEADER + '/PanDian/GetTiaoMaMSG',
			data: {
				PDHao: $('#txtPDDanHao').val(),
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
						if(dt1[0]["CKBM"] == "WDJ") {
							mui.toast('此条码还未入库，请先入库再盘点！');
							playerAudio("NG");
							$('#txtBarcode').focus().val('');
						}
						else {
							if(dt1[0]["TAD018"] == "N" ||
								((dt1[0]["TAD018"] == "Y" || (dt1[0]["TAD018"] == "X" && dt1[0]["CPSL"] > 0)) && confirm("条码[" + barCode + "]已盘点，是否重盘？")) ||
								((dt1[0]["TAD018"] == "X") && confirm("条码[" + barCode + "]为新条码，是否盘点？"))) {
								isNewBarcode = dt1[0]["isNewBarcode"];
								$('#txtWLBM').val(dt1[0]["WLBM"]);
								$('#txtCKBM').val(dt1[0]["CKBM"]);
								$('#txtKWBM').val(dt1[0]["KWBM"]);
								$('#txtKHBM').val(dt1[0]["KHBM"]);
								$('#txtZMSL').val(dt1[0]["ZMSL"]);
								$('#txtPDSL').val(dt1[0]["ZMSL"]);
								OldKW = dt1[0]["KWBM"];
								DAB018 = dt1[0]["DAB018"];
								KuQu = dt1[0]["KQBM"];
								$('#txtPDSL').focus();
								document.getElementById("txtPDSL").select();
								$("#head2").text("物料编码:" + dt1[0]["WLBM"]);
							} else {
								playerAudio("NG");
								$('#txtBarcode').focus().val('');
							}
						}

					} else {
						playerAudio("NG");
						mui.toast('无此条码，请验证！');
						$('#txtBarcode').focus().val('');
					}
				} else {
					playerAudio("NG");
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
	//更换库位
	$('#txtKWBM').keydown(function(e) {
		if(e.keyCode != 13) return;
		if(DAB018 != '' && OldKW != $('#txtKWBM').val()) {
			if(confirm('此条码已绑定主条码，一旦变更库位将解绑，是否继续?')) {
				GetKWInfo();
			}
		} else {
			GetKWInfo();
		}

	});
	//更新盘点数据
	$('#txtPDSL').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		//更新初盘数据
		UpdatePD();
	});

	$('#btn_ok').click(function() {
		//更新初盘数据
		UpdatePD();
	});

	$('#btn_clear').click(function() {
		ClearData();
	});
	//----------------------------------单个条码处理end----------------------------

	//----------------------------------主条码处理----------------------------
	//设置主条码明细的高度
	$('#dgMainTMMX').datagrid({
		height: $(window).height() - $('#MainMsg').height() - $('#MainBtn').height() - 255,
	});
	$('#dgMainTMMX').datagrid({
		rowStyler: function(index, row) {
			if(row.PDSL > 0) {
				return 'background-color:Green;font-weight:bold;'; //
			}
			//else if(row.PDSL == 0) {
			//				return 'background-color:White;font-weight:bold;'; //
			//			}
		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			MBarcode = rowData.TM; //主条码里的单条码
			var MBarcodeSL = rowData.PDSL == 0 ? rowData.ZMSL : rowData.PDSL; //主条码里的单条码数量
			$("#txtMainPDSL").val(MBarcodeSL).select();
		}
	});

	//扫描主条码的处理
	$('#txtMainBarcode').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		if($("#txtPDDanHao").val() == '') {
			mui.toast('请先选择盘点单号！')
			$('#txtMainBarcode').val('').focus();
			return;
		}

		GetMainData();
	});
	//更换库位
	$('#txtMainKWBM').keydown(function(e) {
		if(e.keyCode != 13) return;
		GetMainKWInfo();
	});
	//更新盘点数据
	$('#txtMainPDSL').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		//更新初盘数据
		UpdateMainPD('Y');
	});

	$('#btn_MainOK').click(function() {
		//更新初盘数据
		UpdateMainPD('N');
	});

	$('#btn_MainClear').click(function() {
		ClearMainData();
	});
	//----------------------------------主条码处理end----------------------------

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
						GetData(true, pageSize, pageNum, 'WLBM');
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
	GetData(true, ps, pn, 'WLBM');
};

function GetKWInfo() {
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetKWInfo', //获取数据:调用webApi服务路径
		data: {
			NewKW: $("#txtKWBM").val()
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(res) { //成功后操作，返回行集合(data)
			//console.log(JSON.stringify(data)); //在控制台输出日志
			if(res.status == 0) {
				data = $.parseJSON(res.data);
				if(data.length > 0) {
					playerAudio("OK");
					$("#txtCKBM").val(data[0]['BAB002']);
					KuQu = data[0]['BAB003'];
					$('#txtPDSL').focus();
					$('#txtPDSL').select();
				} else {
					playerAudio("NG");
					mui.toast('库位不存在，请扫描货架上的库位条码！');
					$('#txtKWBM').val('').focus();
				}
			} else {
				playerAudio("NG");
				mui.toast('扫描库位出错:' + res.message);
				$('#txtKWBM').val('').focus();
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
			$('#txtKWBM').val('').focus();
		}
	});
}

function GetMainKWInfo() {
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetKWInfo', //获取数据:调用webApi服务路径
		data: {
			NewKW: $("#txtMainKWBM").val()
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(res) { //成功后操作，返回行集合(data)
			//console.log(JSON.stringify(data)); //在控制台输出日志
			if(res.status == 0) {
				data = $.parseJSON(res.data);
				if(data.length > 0) {
					playerAudio("OK");
					$("#txtMainCKBM").val(data[0]['BAB002']);
					KuQu = data[0]['BAB003'];
					$('#txtMainPDSL').select();
				} else {
					playerAudio("NG");
					mui.toast('库位不存在，请扫描货架上的库位条码！');
					$('#txtMainKWBM').val('').focus();
				}
			} else {
				playerAudio("NG");
				mui.toast('扫描库位出错:' + res.message);
				$('#txtMainKWBM').val('').focus();
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
			$('#txtMainKWBM').val('').focus();
		}
	});
}
/**
 * 通过ajax获取页面数据
 */
function GetData(paging, pageSize, pageNumber, keys) {
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetDataByPDDanHao', //获取数据:调用webApi服务路径
		data: {
			PDDanHao: $("#txtPDDanHao").val()
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(res) { //成功后操作，返回行集合(data)
			//console.log(JSON.stringify(data)); //在控制台输出日志
			data = $.parseJSON(res.data);
			$('#dg').datagrid('loadData', data); //给表格设置数据源(rows)
			$('#pd-sum').html(data.length);
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//更新盘点数据
function UpdatePD() {
	var pddh = $('#txtPDDanHao').val();
	var barcode = $('#txtBarcode').val();
	var pdsl = $('#txtPDSL').val();
	var newKW = $('#txtKWBM').val();
	if(newKW == '') {
		playerAudio("NG");
		alert('请扫描新库位！');
		$('#txtKWBM').focus();
		return;
	}
	if(pdsl.trim() == "") {
		playerAudio("NG");
		alert("初盘数量输入不能为空");
		$('#txtPDSL').focus();
		return;
	}
	if(pddh == '') {
		playerAudio("NG");
		alert('请选择要初盘的盘单号！');
		return;
	}
	if(barcode == '') {
		playerAudio("NG");
		alert('请扫描条码！');
		$('#txtBarcode').focus();
		return;
	}
	var user_id = app.userid;
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/UpdateChuPan',
		data: {
			PDDH: pddh,
			isNew: isNewBarcode,
			Barcode: barcode,
			PDSL: pdsl,
			NewCK: $('#txtCKBM').val(),
			NewKQ: KuQu,
			NewKW: newKW,
			LoginUser: user_id
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			playerAudio("OK");
			console.log(JSON.stringify(resdata));
			isScanningBarcode = "Y";
			$('#txtBarcode').focus().val('');
			ClearData();
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//更新主条码盘点数据
function UpdateMainPD(isSingle) {
	var pddh = $('#txtPDDanHao').val();
	var barcode = isSingle == "Y" ? MBarcode : $('#txtMainBarcode').val();
	var pdsl = $('#txtMainPDSL').val();
	var NewMainKW = $('#txtMainKWBM').val();
	var NewMainCK = $('#txtMainCKBM').val();
	if(NewMainKW.trim() == "") {
		playerAudio("NG");
		alert("库位不能为空");
		$('#txtMainKWBM').focus();
		return;
	}
	if(pdsl.trim() == "" && isSingle == "Y") {
		playerAudio("NG");
		alert("初盘数量输入不能为空");
		$('#txtMainPDSL').focus();
		return;
	}
	if(pddh == '') {
		playerAudio("NG");
		alert('请选择要初盘的盘单号！');
		return;
	}
	if(barcode == '') {
		playerAudio("NG");
		if(isSingle == "Y")
			alert('请选择要盘点的条码！');
		else
			alert('请扫描盘点的主条码！');
		return;
	}
	var user_id = app.userid;
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/UpdateChuPanMain',
		data: {
			isSingle: isSingle,
			PDDH: pddh,
			isNew: isNewBarcode,
			Barcode: barcode,
			PDSL: pdsl,
			NewMainCKBM: NewMainCK,
			NewMainKQBM: MainKuQu,
			NewMainKWBM: NewMainKW,
			LoginUser: user_id
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			playerAudio("OK");
			console.log(JSON.stringify(resdata));
			if(isSingle == "N")
				ClearMainData()
			else
				GetMainData();
			isScanningBarcode = "Y";

		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function ClearData() {
	$('#txtBarcode').val('');
	$('#txtWLBM').val('');
	$('#txtCKBM').val('');
	$('#txtKWBM').val('');
	$('#txtKHBM').val('');
	$('#txtZMSL').val('');
	$('#txtPDSL').val('');
}

function ClearMainData() {
	MBarcode = "";
	$('#txtMainBarcode').val('');
	$('#txtMainWLBM').val('');
	$('#txtMainCKBM').val('');
	$('#txtMainKWBM').val('');
	$('#txtMainTMSL').val('');
	$('#txtMainZMSL').val('');
	$('#txtMainPDSL').val('');
	$('#dgMainTMMX').datagrid('loadData', []);
	$('#txtMainBarcode').focus();
}

function GetKuWeiMsg(WLBM) {
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetKuWeiMsgByWLBM',
		data: {
			WLBM: WLBM
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			$('#dg02').datagrid('loadData', dt);
			$('#kw-sum').html(dt.length);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function GetMainData() {
	var barCode = $("#txtMainBarcode").val().trim().toUpperCase();
	if(barCode.trim() == "") {
		playerAudio("NG");
		alert("条码输入不能为空", {
			verticalAlign: 'center'
		});
		$("#txtMainBarcode").focus();
		return false;
	}

	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetMainTiaoMaMSG',
		data: {
			PDHao: $('#txtPDDanHao').val(),
			MainTiaoMa: barCode
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if(res.status == 0) {
				var dt1 = $.parseJSON(res.data);
				var dt2 = $.parseJSON(res.message);
				if(dt1.length > 0) {
					if(dt1[0]["TAD018"] == "N" || ((dt1[0]["TAD018"] == "Y") && confirm("条码[" + barCode + "]已盘点，是否重盘？")) || ((dt1[0]["TAD018"] == "X") && confirm("条码[" + barCode + "]为新条码，是否盘点？"))) {
						isNewBarcode = dt1[0]["isNewBarcode"];
						$('#txtMainWLBM').val(dt1[0]["WLBM"]);
						$('#txtMainCKBM').val(dt1[0]["CKBM"]);
						$('#txtMainKWBM').val(dt1[0]["KWBM"]);
						$('#txtMainZMSL').val(dt1[0]["ZMSL"]);
						$('#txtMainTMSL').val(dt1[0]["CNT"]);
						MainKuQu = dt1[0]["KQBM"];
						$('#dgMainTMMX').datagrid('loadData', dt2);
						MBarcode = "";
					} else {
						playerAudio("NG");
						ClearMainData();
					}
				} else {
					playerAudio("NG");
					mui.toast('无此条码，请验证！');
					ClearMainData();
				}
			} else {
				playerAudio("NG");
				ClearMainData();
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}