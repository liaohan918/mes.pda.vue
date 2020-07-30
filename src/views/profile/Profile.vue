<template>
    <div id="Main">
		<nav-bar>
			<div class="title" slot="center"><b>{{title}}</b></div>
		</nav-bar>
		<router-view/>
    </div>
</template>
<script>
	import NavBar from 'components/common/navbar/NavBar.vue'

	export default {
		name: "Main",
		components:{
			NavBar
		},
		data() {
			return {
				title: this.$store.state.userInfo.companyName
			}
		},
		methods:{
			plusReady(){
				
			}
		},
		mounted() {
		}
	}
</script>
<style scoped>
</style>
