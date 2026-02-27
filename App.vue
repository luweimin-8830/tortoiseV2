<script>
	import { callApi } from '@/util/util.js'
	export default {
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
			
			if (!wx.cloud) {
				console.error('请使用 2.2.3 或以上的基础库以使用云能力')
			} else {
				wx.cloud.init({
					env: 'cloud1-5gi2oim70d96d538',
					traceUser: true,
				})
				
				// 调用登录接口，获取openid并更新登录时间
				callApi('getUserInfo', {}, { showLoading: false }).then(res => {
					console.log('登录成功', res)
					if (res && res.OPENID) {
						uni.setStorageSync('OPENID', res.OPENID)
					}
				}).catch(err => {
					console.error('登录失败', err)
				})
			}

			// 获取手机信息
			const systemInfo = wx.getWindowInfo()
			this.globalData.windowWidth = systemInfo.windowWidth;
			this.globalData.windowHeight = systemInfo.windowHeight;
			const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
			const statusBarHeight = systemInfo.statusBarHeight
			const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height
			const barHeight = statusBarHeight + navBarHeight
			this.globalData.topBarHeight = barHeight
			const bottomSafeAreaHeight = systemInfo.screenHeight - systemInfo.safeArea.bottom
			this.globalData.bottomSafeAreaHeight = bottomSafeAreaHeight
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	// 设置整个项目的背景色
	page {
		background-color: #DBE9B2;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}

	// #DBE9B2
	// #C8E39A
	// #B0DB7B
	// #6CC42C
	// #65B028
</style>
