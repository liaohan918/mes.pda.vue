export default {
	
	//保存配置
	function saveConfig(key, value){
		plus.localStorage.setItem(key, JSON.stringify(value));
	}
	
	//加载配置
	function loadConfig(key,defaultValue){
		let value = plus.localStorage.getItem(key)
		if(value){
			return value
		}
		else{
			saveConfig(key, defaultValue)
			return defaultValue
		}
	}
}