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
	var sumDataNo = 0; //总行数量
	var loadDataMethod = $.fn.datagrid.methods.loadData;
	var deleteRowMethod = $.fn.datagrid.methods.deleteRow;
	$.extend($.fn.datagrid.methods, {
		clientPaging: function(jq, GetData) {
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
					onSelectPage: function(pageNum, pageSize) {
						opts.pageNumber = pageNum;
						opts.pageSize = pageSize;
						pager.pagination('refresh', {
							pageNumber: pageNum,
							pageSize: pageSize
						});
						var dgData = GetData(dg, pageNum, pageSize);
						dg.datagrid('loadData', dgData);
						dg.datagrid('selectRow', 0);
					}
					//,
					//onBeforeRefresh: function() {
					//	return true;
					//}
					//,
					//onRefresh:function(pageNumber, pageSize){
					//	dg.datagrid('loadData', GetData());
					//	mui.toast("刷新后~");
					//}
					//,
					//onChangePageSize:function(pageSize){
					//	mui.toast("选择~");
					//	dg.datagrid('selectRow', 0);
					//}
				});
				$(this).datagrid('loadData', state.data);
				if(opts.url) {
					$(this).datagrid('reload');
				}
			});
		},
		loadData: function(jq, data) {
			if(!data)
				return;
			jq.each(function() {
				$(this).data('datagrid').allRows = null;
			});
			if(data.sumDataNo) {
				sumDataNo = data.sumDataNo;
				return loadDataMethod.call($.fn.datagrid.methods, jq, data.rows);
			} else {
				return loadDataMethod.call($.fn.datagrid.methods, jq, data);
			}
		},
		deleteRow: function(jq, index) {
			return jq.each(function() {
				var row = $(this).datagrid('getRows')[index];
				deleteRowMethod.call($.fn.datagrid.methods, $(this), index);
				var state = $(this).data('datagrid');
				if(state.options.loadFilter == pagerFilter) {
					for(var i = 0; i < state.allRows.length; i++) {
						if(state.allRows[i] == row) {
							state.allRows.splice(i, 1);
							break;
						}
					}
					$(this).datagrid('loadData', state.allRows);
				}
			});
		},
		getAllRows: function(jq) {
			return jq.data('datagrid').allRows;
		}
		//		,
		//		onLoadSuccess: function(jq) {
		//			$(this).datagrid('autoSizeColumn');
		//		}
	});
	//分页
	//				$.extend($.fn.pagination.defaults, {
	//					onBeforeRefresh: function() {
	//						alert("相背");
	//						return true;
	//					},
	//					onChangePageSize:function(pageSize){
	//						
	//					}
	//				});

})(jQuery);