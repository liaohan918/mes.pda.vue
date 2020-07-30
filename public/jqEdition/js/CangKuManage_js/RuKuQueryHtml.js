mui.plusReady(function() {
	app.init();
	$('#dg1').datagrid({height: $(window).height() - $("#form").height() - 35})
	$('#dg2').datagrid({height: $(window).height() - $("#form").height() - 35})
});

$(function() {
	// $('#dg1').datagrid({height: $(window).height() - $("#form").height() - 35});
	// $('#dg2').datagrid({height: $(window).height() - $("#form").height() - 35});
	
	$('#dg1').datagrid({
		// height: $(window).height() - $("#form").height() - 35,
		onLoadSuccess: function(data) {
			mui('#dg1-sum')[0].innerHTML =
				(!data || data.rows.length <= 0) ? '0' : data.total;
		},
		onSelect: function(index, value) {
			if(!value)
				return;
			//alert(value["DHB001"]+" "+value["DHB002"]+" "+value["DHB003"]+" "+value["DHB011"]);
			dataGrid2Paging($("#barCode").val(),$("#ruKuDate").val(),
			value["DHB001"],value["DHB002"],value["DHB003"],value["DHB011"]);
		}
	})
	
	$('#dg2').datagrid({
		//height: $(window).height() - $("#form").height() - 35,
		onLoadSuccess: function(data) {
			mui('#dg2-sum')[0].innerHTML =
				(!data || data.rows.length <= 0) ? '0' : data.total;
		}
	})
});

/*
 * 选择时间
 */
function ClickDate(){
	var a = $("#ruKuDate");
	var dtPicker = new mui.DtPicker(
		{
		    type: "date",//设置日历初始视图模式 
	    beginDate: new Date(2019, 01, 01),//设置开始日期 
	    endDate: new Date(3099, 03, 01),//设置结束日期 
		}
	)
	dtPicker.show(function (e) { 
	    $("#ruKuDate").val(e.y.text + "-" + e.m.text + "-" + e.d.text);
	  	$("#barCode").val("");
	  	$("#barCode").focus();
	})
}

/**
   * {扫描条码事件}
   */
document.getElementById("barCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return;	
		if($("#barCode").val()==''){
			alert('条码不能为空！');
			playerAudio("NG");
			return;
		}
		dataGrid1Paging($("#barCode").val(),$("#ruKuDate").val());
		dataGrid2Paging($("#barCode").val(),$("#ruKuDate").val(),'','','','');
	}
)
	
//物料明细
function dataGrid1Paging(WLTM,Time){
	//更换成异步处理
	var data = {
		spname : "Query_PURDHB",
		_sp_DAB001: WLTM,
		_sp_DHB014: Time,
		returnvalue: '1'
	};
	Ajax.httpAsyncPost("/b/esp", data, function(data) {
		if(data.status == 1) {
			mui.alert(data.message);
			playerAudio("NG");
			return;
		}
		var dgData = {};
		dgData.rows = data.data;
		dgData.sumDataNo = data.data.length;
		mui('#dg1-sum')[0].innerHTML = data.data.length;
		$('#dg1').datagrid('loadData', dgData);
	});
}

//已扫列表分页
function dataGrid2Paging(WLTM,Time,DHB001,DHB002,DHB003,DHB011){
	//更换成异步处理
	var data = {
		spname : "Query_PURDHB1",
		_sp_DAB001: WLTM,
		_sp_DHB014: Time,
		_sp_DHB001: DHB001,
		_sp_DHB002: DHB002,
		_sp_DHB003: DHB003,
		_sp_DHB011: DHB011,
		returnvalue: '1'
	};
	Ajax.httpAsyncPost("/b/esp", data, function(data) {
		if(data.status == 1) {
			mui.alert(data.message);
			playerAudio("NG");
			return;
		}
		var dgData = {};
		dgData.rows = data.data;
		dgData.sumDataNo = data.data.length;
		mui('#dg2-sum')[0].innerHTML = data.data.length;
		$('#dg2').datagrid('loadData', dgData);
	});
	
}