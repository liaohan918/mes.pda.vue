<template>
    <div id="Test1">
		<div>测试组件1</div>
    </div>
</template>
<script>
	import mixinPlus from "mixins/mixinPlus.js"	
		
	export default {
		name: "Test1",
		mixins:[mixinPlus],
		data() {
			return {
		
			}
		},
		methods:{
			plusReady(){
				this.playerAudio("OK")
			}
		},
		mounted() {
		}
	}
</script>
<style scoped>
</style>
