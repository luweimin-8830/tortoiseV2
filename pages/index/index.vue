<template>
	<view class="page-container">
		<!-- 页面内容区域 -->
		<view class="content">
			<view v-if="currentTab === 0" class="full-height">
				<home></home>
			</view>
			<view v-if="currentTab === 1" class="padded-content">记录内容</view>
			<view v-if="currentTab === 3" class="padded-content">日历内容</view>
			<view v-if="currentTab === 4" class="padded-content">我的内容</view>
		</view>

		<!-- 自定义底部 TabBar -->
		<view class="custom-tabbar">
			<!-- 首页 -->
			<view class="tab-item" @click="switchTab(0)">
				<uni-icons type="home" :size="26" :color="currentTab === 0 ? '#65B028' : '#999'"></uni-icons>
				<text :class="['tab-text', currentTab === 0 ? 'active' : '']">首页</text>
			</view>

			<!-- 记录 -->
			<view class="tab-item" @click="switchTab(1)">
				<uni-icons type="list" :size="26" :color="currentTab === 1 ? '#65B028' : '#999'"></uni-icons>
				<text :class="['tab-text', currentTab === 1 ? 'active' : '']">记录</text>
			</view>

			<!-- 中间凸起的加号按钮 -->
			<view class="tab-item center-item" @click="onAddClick">
				<view class="plus-btn-wrapper">
					<view class="plus-btn">
						<uni-icons type="plusempty" size="24" color="#ffffff"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 日历 -->
			<view class="tab-item" @click="switchTab(3)">
				<uni-icons type="calendar" :size="26" :color="currentTab === 3 ? '#65B028' : '#999'"></uni-icons>
				<text :class="['tab-text', currentTab === 3 ? 'active' : '']">日历</text>
			</view>

			<!-- 我的 -->
			<view class="tab-item" @click="switchTab(4)">
				<uni-icons type="person" :size="26" :color="currentTab === 4 ? '#65B028' : '#999'"></uni-icons>
				<text :class="['tab-text', currentTab === 4 ? 'active' : '']">我的</text>
			</view>
		</view>
	</view>
</template>

<script>
	import home from '@/components/home.vue'

	export default {
		components: {
			home
		},
		data() {
			return {
				currentTab: 0
			}
		},
		methods: {
			switchTab(index) {
				this.currentTab = index;
			},
			onAddClick() {
				uni.navigateTo({
					url: '/pages/petEdit/petEdit'
				});
			}
		}
	}
</script>

<style lang="scss">
	.page-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		/* 确保内容区域不被底部 TabBar 遮挡，或者让子元素自己处理 */
		/* 这里选择让子元素自己处理高度，或者给 content 加 padding-bottom */
		/* 由于 home 组件自己计算了高度减去 60px，所以这里不需要 padding-bottom */
	}
	
	.full-height {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	
	.padded-content {
		padding: 20px;
		/* 其他页面如果内容多，可能需要这里加上 padding-bottom 以防被 tabbar 遮挡 */
		padding-bottom: calc(60px + env(safe-area-inset-bottom) + 20px);
	}

	.custom-tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60px;
		background-color: #ffffff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.06);
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 999;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.tab-text {
		font-size: 11px;
		color: #999;
		margin-top: 4px;

		&.active {
			color: #65B028; /* 使用项目主题色深绿 */
			font-weight: bold;
		}
	}

	.center-item {
		position: relative;
	}

	.plus-btn-wrapper {
		position: absolute;
		top: -30px;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background-color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.05);
	}

	.plus-btn {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background-color: #6CC42C; /* 主绿 */
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 2px 5px rgba(108, 196, 44, 0.4);
	}
</style>