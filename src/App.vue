<template>
  <div id="app">
		<keep-alive>
		  <router-view v-if="$route.meta.keepAlive">
		    <!-- 这里是会被缓存的视图组件，比如 SysMenu！ -->
		  </router-view>
		</keep-alive>
		
		<router-view v-if="!$route.meta.keepAlive">
		  <!-- 这里是不被缓存的视图组件，比如 ExeMenu！ -->
		</router-view>
		<main-tab-bar v-show="!this.$route.meta.hideMainTabBar"></main-tab-bar>
  </div>
</template>

<script>
	import MainTabBar from 'components/content/maintabbar/MainTabBar.vue'
	
	export default{
		name: "App",
		components: {
			MainTabBar
		}
	}
</script>

<style scoped>
	@import '~@/assets/css/base.css';
</style>
