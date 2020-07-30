var shadeDiv = "<div id='PageLoadingTip' style='position: absolute; z-index: 1000; top: 0px; left: 0px; width: 100%; height: 100%; background: gray; text-align: center;'>	<h1 style='top: 48%; position: relative; color: white;'>页面加载中···</h1>	</div>"

document.write(shadeDiv);
function _PageLoadingTip_Closes() {
	$("#PageLoadingTip").fadeOut("normal", function() {
		$(this).remove();
	});
}

var _pageloding_pc;

$.parser.onComplete = function() {
	if(_pageloding_pc)
		clearTimeout(_pageloding_pc);
	_pageloding_pc = setTimeout(_PageLoadingTip_Closes, 200);
}