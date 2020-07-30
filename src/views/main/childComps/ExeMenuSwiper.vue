<template>
    <div id="ExeMenuSwiper">
		<swiper ref="mySwiper" :options="swiperOptions">
			<swiper-slide v-for="(item,index) in groups" :key="index">
				<div class="swiper-content">
					<div class="sub-title">
						<el-badge slot="item-text" :value="item.data.length" class="item">
							<div>{{item.text}}</div>
						</el-badge>	
					</div>				
					<el-row :gutter="5">
						<el-col v-for="(sub,index) in item.data" :key="index" :xl="1" :lg="2" :md="2" :sm="3" :xs="6">
							<div class="grid-content" @click="itemClick(sub)">
								<image-item-link class="grid-content-item" 
								:iconName="'#' + sub.PRB016" :text="sub.PRB003" :value="sub.PRB002"/>
							</div>
						</el-col>
					</el-row>
				</div>
			</swiper-slide>
			<div class="swiper-pagination" slot="pagination"></div>
		</swiper>		
    </div>
</template>
<script>
	import {
		Swiper,
		SwiperSlide,
		directive
	} from 'vue-awesome-swiper'
	import 'swiper/css/swiper.css'
	import ImageItemLink from 'components/content/imageItemLink/ImageItemLink.vue'
	import {openMuiWindow} from "common/util.js"
	
	export default {
		name: "ExeMenuSwiper",
		components: {			
			Swiper,
			SwiperSlide,
			ImageItemLink
		},
		directives: {
			swiper: directive
		},
		data() {
			return {
				swiperOptions: {
					pagination: {
						el: '.swiper-pagination'
					},
					antoplay: false
				},
				groups: []
			}
		},
		computed: {
			swiper() {
				return this.$refs.mySwiper.$swiper
			}
		},
		methods:{
			itemClick(value){
				console.log("通过事件总线跨组件传值")
				//事件总线pageExeItemClick
				this.$bus.$emit('pageExeItemClick', value)				
				const fileNameStartIndex = this.$parent.sysMenu.PRA009.lastIndexOf('/')
				const basePath = this.$parent.sysMenu.PRA009.substring(0, fileNameStartIndex)
				console.log("当前根路径:" + basePath)
				const pageType = value.PRB009.indexOf(".vue") != -1 ? "component" : "html"
				if(pageType == "component"){
					this.$router.push({
						name: "Page",
						params: {
							pageType: pageType,
							path: value.PRB009,
							basePath: basePath,
							pageId: value.PRB001,
							pageTitle: value.PRB003
						}
					})
				}else{
					const pageUrl = `jqEdition/${basePath}/${value.PRB009}`
					//用mui来打开新的页面,这样就会又新的webView
					openMuiWindow(value.PRB001, pageUrl, value.PRB003, {})
				}				
			}
		},
		mounted() {
			this.groups = this.$route.params.groups
		}
}
</script>
<style scoped>
	.swiper-wrapper{
		position: absolute;
		height: 100%;
	}
	
	.swiper-slide{
		overflow: hidden;
		position: relative;
		bottom: 0px;
	}
	
	.swiper-content{
		height: calc(100vh - 44px); 
		padding: 10px 5px;
	}
	
	.sub-title{
		height: 30px;
		text-align:center;
		line-height: 30px;
		font-size: 15px;
	}
	
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
	
	.swiper-pagination{
		position: fixed;
		bottom: 30px;
	}
</style>
