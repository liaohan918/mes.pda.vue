import {playerAudio} from "common/util.js"

const mixinPlus = {
	methods:{
		playerAudio
	},
	mounted () {
		// plus是否已初始化，如果没有则监听“plusready"事件  
		if (window.plus) {
			this.plusReady()
		} else {
			document.addEventListener('plusready', ()=>{
				this.plusReady()
			}, false) // 
		}
	}
}

export default mixinPlus