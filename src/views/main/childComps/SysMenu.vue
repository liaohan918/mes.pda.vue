<template>
	<div id="SysMenu">
		<el-row :gutter="5">
			<el-col v-for="item in sysMenu" :key="item.PRA001" :xl="2" :lg="3" :md="4" :sm="6" :xs="12">
				<div class="grid-content" @click="itemClick(item)">
					<image-item-link class="grid-content-item" 
					:iconName="'#' + item.PRA001" :text="item.PRA003" :value="item.PRA001"/>
				</div>
			</el-col>
		</el-row>
	</div>
</template>
<script>
	import ImageItemLink from 'components/content/imageItemLink/ImageItemLink.vue'
	import Main from 'network/main/main.js'
	
	export default {
		name: "SysMenu",
		props:{
			
		},
		components:{
			ImageItemLink
		},
		data() {
			return {
				sysMenu: {}
			}
		},
		watch:{
			"$store.state.sysMenu"(){
				this.sysMenu = this.$store.state.sysMenu
			}
		},
		methods: {
			itemClick(value){
				Main.getExeMenu(value.PRA001,this.$store.state.userInfo.userId)
					.then(result=>{
						this.$router.push({
							name: "ExeMenu",
							params: {
								sysMenu: value,
								exeMenu: result.data
							}
						})						
					}).catch(error=>{
						this.$message.error("进入二级目录失败：" + JSON.stringify(error))
					})
			}
		},
		mounted() {
			
		}
	}
</script>
<style scoped>	

	.grid-content {
	    background: #f7f7f7;
	    border-radius: 4px;
	    min-height: 36px;
		margin-top: 5px;
		min-height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.grid-content-item{
		
	}
</style>
