<template>
    <div id="ImageItemLink" class="item-content" @click="itemClick">
		<div class="item-content-image">
			<slot name="icon">
				<svg class="iconfont-icon" aria-hidden="true">
					<use :xlink:href="iconName"></use>
				</svg>
			</slot>
		</div>
		<div class="item-content-text">
			<slot name="text"><div>{{text}}</div></slot>
		</div>		
    </div>
</template>
<script>
export default {
	name: "ImageItemLink",
	props:{
		url: {
			type: String,
			default: "/Main"
		},
		//子系统名称
		iconName:{
			type: String,
			default: "#APP01"
		},
		text: {
			type: String,
			default: "默认名称"
		},
		value: "" //子系统名称
	},
   	data() {
		return {
			
		}
   	},
	methods:{
		itemClick(){
			this.$emit("itemClick", this.value)
		}
	},
	mounted() {
   	}
}
</script>
<style scoped>
	.iconfont-icon {
		width: 2em;
		height: 2em;
		vertical-align: -0.15em;
		fill: currentColor;
		overflow: hidden;
		min-height:45px;
	}
	
	.item-content{
		display: flex;
		display: -webkit-flex;
		align-items:center;
		width: 100%;
		height: 100%;
		justify-content:center;
		flex-direction:column;
	}
	
	.item-content-text{
		font-size: 13px;
	}
</style>
