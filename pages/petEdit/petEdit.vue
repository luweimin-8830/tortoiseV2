<template>
	<view class="container">
		<!-- 头部占位 (模拟自定义导航栏的高度) -->
		<view class="nav-placeholder" :style="{ height: topBarHeight + 'px' }">
			<view class="page-title" :style="{ top: menuButtonInfo.top + 'px', lineHeight: menuButtonInfo.height + 'px' }">添加爱宠</view>
		</view>

		<!-- 双按钮 (取消/保存) -->
		<view class="action-bar" :style="{ paddingTop: (topBarHeight + 10) + 'px', paddingLeft: paddingX + 'px', paddingRight: paddingX + 'px' }">
			<view class="btn-row">
				<view class="clean-btn" @click="cancel">
					<text>取消</text>
				</view>
				<view class="add-btn" @click="save">
					<text>保存</text>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="content-scroll">
			<!-- 图片上传 -->
			<view class="upload-section">
				<view class="avatar-wrapper" @click="uploadImage">
					<image class="pet-img" v-if="pet.cover" :src="pet.cover" mode="aspectFill" />
					<view class="placeholder-img" v-else>
						<uni-icons type="image" size="40" color="#C8E39A"></uni-icons>
					</view>
					<!-- 相机图标 -->
					<view class="camera-badge">
						<uni-icons type="camera-filled" size="18" color="#fff"></uni-icons>
					</view>
				</view>
			</view>

			<view class="form-container">
				<!-- 1. 名称 -->
				<view class="section-label">
					<text class="label-text">名称</text>
				</view>
				<view class="form-item input-pill" :class="{ 'focused': focusedField === 'name' }">
					<uni-easyinput v-model="pet.name" :inputBorder="false" :clearable="false" placeholder="输入爱宠名称"
						placeholderStyle="color:#8BA989; font-size:15px;" @focus="focusedField = 'name'"
						@blur="focusedField = ''"></uni-easyinput>
				</view>

				<!-- 2. 性别 & 到家日期 (并排) -->
				<view class="row-inputs">
					<view class="half-width">
						<view class="section-label">
							<text class="label-text">性别</text>
						</view>
						<view class="gender-box">
							<view class="gender-item" :class="{ active: pet.sex === 1 }" @click="pet.sex = 1">
								<text>公</text>
							</view>
							<view class="gender-item" :class="{ active: pet.sex === 2 }" @click="pet.sex = 2">
								<text>母</text>
							</view>
							<view class="gender-item" :class="{ active: pet.sex === 0 }" @click="pet.sex = 0">
								<text>不详</text>
							</view>
						</view>
					</view>
					
					<view class="half-width">
						<view class="section-label">
							<text class="label-text">到家日期</text>
						</view>
						<uni-datetime-picker type="date" v-model="pet.birthday" :border="false">
							<view class="form-item input-pill date-pill">
								<text v-if="pet.birthday">{{ pet.birthday }}</text>
								<text v-else style="color: #8BA989;">选择日期</text>
							</view>
						</uni-datetime-picker>
					</view>
				</view>

				<!-- 3. 背甲长度 & 体重 (并排) -->
				<view class="row-inputs">
					<view class="half-width">
						<view class="section-label">
							<text class="label-text">背甲长度 (cm)</text>
						</view>
						<view class="form-item input-pill" :class="{ 'focused': focusedField === 'length' }">
							<uni-easyinput type="digit" v-model="pet.length" :inputBorder="false" :clearable="false" placeholder="0.0"
								placeholderStyle="color:#8BA989; font-size:15px;" @focus="focusedField = 'length'"
								@blur="focusedField = ''"></uni-easyinput>
						</view>
					</view>
					
					<view class="half-width">
						<view class="section-label">
							<text class="label-text">体重 (g)</text>
						</view>
						<view class="form-item input-pill" :class="{ 'focused': focusedField === 'weight' }">
							<uni-easyinput type="digit" v-model="pet.weight" :inputBorder="false" :clearable="false" placeholder="0"
								placeholderStyle="color:#8BA989; font-size:15px;" @focus="focusedField = 'weight'"
								@blur="focusedField = ''"></uni-easyinput>
						</view>
					</view>
				</view>

				<!-- 4. 备注 -->
				<view class="section-label">
					<uni-icons type="compose" size="18" color="#566C44"></uni-icons>
					<text class="label-text">备注</text>
				</view>

				<view class="form-item textarea-box" :class="{ 'focused': focusedField === 'desc' }">
					<uni-easyinput type="textarea" v-model="pet.desc" :inputBorder="false"
						placeholder="记录爱宠的特征、习性..." placeholderStyle="color:#8BA989; font-size:14px;" autoHeight
						@focus="focusedField = 'desc'" @blur="focusedField = ''"></uni-easyinput>
				</view>
			</view>
			
			<!-- 底部占位，防止内容被遮挡 -->
			<view style="height: 50px;"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				topBarHeight: 44, // 默认值，会被 onLoad 覆盖
				menuButtonInfo: { top: 20, height: 32 }, // 默认值
				paddingX: 20,
				
				focusedField: '', // 当前聚焦的字段
				
				pet: {
					name: '',
					cover: '',
					length: '',
					weight: '',
					desc: '',
					sex: 0,
					birthday: ''
				}
			}
		},
		onLoad() {
			// 获取顶部导航栏高度信息，适配不同机型
			const systemInfo = uni.getSystemInfoSync();
			// #ifdef MP-WEIXIN
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			this.menuButtonInfo = menuButtonInfo;
			this.topBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
			this.paddingX = systemInfo.windowWidth - menuButtonInfo.right; // 对齐胶囊按钮
			// #endif
			
			// #ifndef MP-WEIXIN
			this.topBarHeight = systemInfo.statusBarHeight + 44;
			this.menuButtonInfo = { top: systemInfo.statusBarHeight + 6, height: 32 };
			// #endif
			//test
		},
		methods: {
			cancel() {
				uni.navigateBack();
			},
			save() {
				// 暂时只打印数据
				console.log('保存数据:', this.pet);
				uni.showToast({
					title: '样式预览模式',
					icon: 'none'
				});
			},
			uploadImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						this.pet.cover = res.tempFilePaths[0];
					}
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	$focus-border-color: #566C44;
	$bg-color: #E8F0E8;
	$text-color: #566C44;

	.container {
		font-size: 1rem;
		min-height: 100vh;
		background-color: #DBE9B2; /* 保持全局背景色 */
		display: flex;
		flex-direction: column;
	}

	.nav-placeholder {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		background-color: #DBE9B2;
	}

	.page-title {
		position: absolute;
		width: 100%;
		text-align: center;
		font-size: 17px;
		font-weight: bold;
		color: #333;
	}

	.action-bar {
		width: 100%;
		box-sizing: border-box;
		z-index: 10;
	}

	.btn-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.clean-btn,
	.add-btn {
		width: 42%; 
		height: 74rpx;
		background: rgba(255, 255, 255, 0.55);
		border-radius: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 28rpx;
		color: #333;

		&:active {
			transform: scale(0.96);
		}
	}
	
	.add-btn {
		background: #6CC42C;
		color: #fff;
		border: none;
	}

	.content-scroll {
		flex: 1;
		width: 100%;
	}

	.upload-section {
		display: flex;
		justify-content: center;
		margin-top: 40rpx;
		margin-bottom: 40rpx;
	}

	.avatar-wrapper {
		width: 240rpx;
		height: 240rpx;
		position: relative;
		border-radius: 50rpx;
		background-color: #E8F0E8;
		box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.08);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.pet-img {
		width: 100%;
		height: 100%;
		border-radius: 50rpx;
	}
	
	.placeholder-img {
		opacity: 0.5;
	}

	.camera-badge {
		position: absolute;
		bottom: 10rpx;
		right: 10rpx;
		width: 64rpx;
		height: 64rpx;
		background-color: #566C44;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
	}

	.form-container {
		padding: 0 40rpx;
	}

	.form-item {
		background-color: rgba(255, 255, 255, 0.55);
		margin-bottom: 30rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
	}

	.form-item.focused {
		border-color: $focus-border-color;
		background-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 4rpx 12rpx rgba(86, 108, 68, 0.15);
	}

	.input-pill {
		border-radius: 60rpx;
		padding: 10rpx 30rpx;
		display: flex;
		align-items: center;
		height: 100rpx;
	}
	
	.row-inputs {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}
	
	.half-width {
		flex: 1;
		/* 确保子元素不超出 */
		min-width: 0;
	}

	.gender-box {
		display: flex;
		justify-content: space-between;
		background-color: rgba(255, 255, 255, 0.55);
		border-radius: 60rpx;
		padding: 6rpx;
		height: 100rpx;
		box-sizing: border-box;
	}

	.gender-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50rpx;
		font-size: 28rpx;
		color: #566C44;
		transition: all 0.3s;
		
		&.active {
			background-color: #6CC42C;
			color: #fff;
			font-weight: bold;
			box-shadow: 0 2rpx 8rpx rgba(108, 196, 44, 0.3);
		}
	}

	.date-pill {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #333;
		font-size: 30rpx;
		/* 确保高度与其他输入框一致 */
		height: 100rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.section-label {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		margin-left: 10rpx;

		.label-text {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
			margin-left: 10rpx;
		}
	}

	.textarea-box {
		border-radius: 30rpx;
		padding: 20rpx 30rpx;
		min-height: 200rpx;
	}

	/* 穿透修改 uni-easyinput */
	::v-deep .uni-easyinput__content {
		background-color: transparent !important;
		border: none !important;
		min-height: auto !important;
	}
</style>
