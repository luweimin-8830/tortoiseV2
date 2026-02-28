<template>
	<view class="my-container">
		<view :style="{ height: topBarHeight + 'px' }"></view>
		<view class="section-container">
			<!-- 标题 -->
			<text class="section-title">个人中心</text>
			<!-- 卡片容器 -->
			<view class="card-box">
				<view class="menu-item" hover-class="item-hover" @click="handleNav('user')">
					<view class="left-content">
						<uni-icons type="person" size="22" color="#6CC42C" class="menu-icon"></uni-icons>
						<text class="menu-text">基本信息</text>
					</view>
					<uni-icons type="right" size="16" color="#8BA989"></uni-icons>
				</view>
				<!-- 分割线 -->
				<view class="divider"></view>
				<view class="menu-item" hover-class="item-hover" @click="handleNav('tag')">
					<view class="left-content">
						<uni-icons type="list" size="22" color="#6CC42C" class="menu-icon"></uni-icons>
						<text class="menu-text">标签管理</text>
					</view>
					<uni-icons type="right" size="16" color="#8BA989"></uni-icons>
				</view>
			</view>
		</view>

		<view class="section-container">
			<!-- 标题 -->
			<text class="section-title">系统设置</text>
			<!-- 卡片容器 -->
			<view class="card-box">
				<picker mode="time" :value="remindTime" @change="handleTimeChange">
					<view class="menu-item" hover-class="item-hover">
						<view class="left-content">
							<uni-icons type="notification" size="22" color="#6CC42C" class="menu-icon"></uni-icons>
							<text class="menu-text">每日提醒</text>
						</view>
						<view class="right-content">
							<text class="time-text">{{ remindTime }}</text>
							<uni-icons type="right" size="16" color="#8BA989"></uni-icons>
						</view>
					</view>
				</picker>
			</view>
		</view>

		<view class="section-container">
			<!-- 标题 -->
			<text class="section-title">帮助与反馈</text>
			<!-- 卡片容器 -->
			<view class="card-box">
				<view class="menu-item" hover-class="item-hover" @click="handleNav('manual')">
					<view class="left-content">
						<uni-icons type="help" size="22" color="#6CC42C" class="menu-icon"></uni-icons>
						<text class="menu-text">养护指南</text>
					</view>
					<uni-icons type="right" size="16" color="#8BA989"></uni-icons>
				</view>
				<!-- 分割线 -->
				<view class="divider"></view>
				<button class="contact-btn" open-type="contact" hover-class="item-hover">
					<view class="menu-item">
						<view class="left-content">
							<uni-icons type="chat" size="22" color="#6CC42C" class="menu-icon"></uni-icons>
							<text class="menu-text">联系客服</text>
						</view>
						<uni-icons type="right" size="16" color="#8BA989"></uni-icons>
					</view>
				</button>
				<!-- 分割线 -->
				<view class="divider"></view>
				<view class="menu-item" hover-class="item-hover" @click="handleNav('about')">
					<view class="left-content">
						<uni-icons type="info" size="22" color="#6CC42C" class="menu-icon"></uni-icons>
						<text class="menu-text">关于本页</text>
					</view>
					<uni-icons type="right" size="16" color="#8BA989"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { callApi } from '@/util/util.js';

	export default {
		name: 'my',
		data() {
			return {
				topBarHeight: 0,
				remindTime: '08:00'
			}
		},
		methods: {
			async loadUserData() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.remindTime) {
					this.remindTime = userInfo.remindTime;
				}
			},
			async handleTimeChange(e) {
				const newTime = e.detail.value;
				this.remindTime = newTime;

				try {
					uni.showLoading({ title: '保存中...' });
					await callApi('updateUser', {
						remindTime: newTime
					});

					// 更新本地存储
					const userInfo = uni.getStorageSync('userInfo') || {};
					userInfo.remindTime = newTime;
					uni.setStorageSync('userInfo', userInfo);

					uni.showToast({ title: '设置已更新', icon: 'success' });
					// #ifdef MP-WEIXIN
					wx.vibrateShort({ type: "medium" });
					// #endif
				} catch (error) {
					console.error('更新提醒时间失败:', error);
					uni.showToast({ title: '更新失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			},
			handleNav(type) {
				console.log('点击了:', type);
				// #ifdef MP-WEIXIN
				wx.vibrateShort({ type: "medium" });
				// #endif
				
				// 对应路由处理
				if (type === 'tag') {
					uni.navigateTo({ url: '/pages/tagEdit/tagEdit' })
				} else if (type === 'manual') {
					// uni.navigateTo({ url: '/pages/manual/manual' })
				}
			}
		},
		created() {
			// 从 App 获取全局导航栏高度
			const app = getApp();
			if (app && app.globalData && app.globalData.topBarHeight) {
				this.topBarHeight = app.globalData.topBarHeight;
			}
			this.loadUserData();
		}
	}
</script>

<style scoped lang="scss">
	/* 容器整体样式 */
	.section-container {
		padding: 0 16px;
		margin-bottom: 20px;
	}

	/* 标题样式 */
	.section-title {
		font-size: 14px;
		color: #566C44;
		font-weight: 500;
		margin-bottom: 8px;
		margin-left: 4px;
		display: block;
	}

	/* 卡片主体样式 */
	.card-box {
		background-color: rgba(255, 255, 255, 0.55);
		border-radius: 16px;
		padding: 4px 16px;
		overflow: hidden;
	}

	/* 单个菜单项 */
	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 0;
		background-color: transparent;
	}

	/* 点击时的按压效果 */
	.item-hover {
		opacity: 0.7;
	}

	/* 左侧图标和文字的容器 */
	.left-content {
		display: flex;
		align-items: center;
	}

	/* 图标微调 */
	.menu-icon {
		margin-right: 10px;
		display: flex;
		align-items: center;
	}

	/* 文字样式 */
	.menu-text {
		font-size: 15px;
		color: #2F3E25;
		font-weight: 400;
	}

	.right-content {
		display: flex;
		align-items: center;
	}

	.time-text {
		font-size: 14px;
		color: #6CC42C;
		margin-right: 4px;
	}

	/* 分割线 */
	.divider {
		height: 1px;
		background-color: rgba(0, 0, 0, 0.05);
		width: 100%;
		margin-left: 32px;
	}

	/* 客服按钮重置样式 */
	.contact-btn {
		width: 100%;
		background: transparent;
		padding: 0;
		margin: 0;
		line-height: inherit;
		text-align: left;
		border: none;
		border-radius: 0;
		display: block;

		&::after {
			border: none;
		}
	}
</style>
