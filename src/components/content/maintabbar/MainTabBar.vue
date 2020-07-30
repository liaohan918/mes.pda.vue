<template>
  <tab-bar>      
      <tab-bar-item path="/Main" >
		<img slot="item-icon" style="width: 24px;margin-top: 5px;" src="~assets/img/tabbar/home.svg" alt="">
		<img slot="item-icon-active" style="width: 24px;margin-top: 5px;" src="~assets/img/tabbar/home_active.svg" alt="">
        <el-badge slot="item-text" :value="sysNumber" class="item">
        	<div>首页</div>
        </el-badge>
      </tab-bar-item>
      <tab-bar-item path="/Profile" >
        <img slot="item-icon" src="~assets/img/tabbar/profile.svg" alt="">
        <img slot="item-icon-active" src="~assets/img/tabbar/profile_active.svg" alt="">
		<div slot="item-text">设置</div>
      </tab-bar-item>
    </tab-bar>
</template>

<script>

import TabBar from 'components/common/tabbar/TabBar.vue'
import TabBarItem from 'components/common/tabbar/TabBarItem'

export default {
    name:'MainTabBar',
    components:{
        TabBar,
        TabBarItem
    },
	data() {
		return {
			sysNumber: 0
		}	
	},
	watch:{
		"$store.state.sysMenu"(){
			console.log("系统结构变更")
			this.sysNumber = this.$store.state.sysMenu.length
		}
	}
}
</script>

<style scoped>
</style>