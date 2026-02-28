<template>
	<view class="container">
		<nav-bar :title="isEdit ? '编辑日志' : '添加日志'"></nav-bar>
		<!-- 头部占位 -->
		<view class="nav-placeholder" :style="{ height: topBarHeight + 'px' }">
			<view class="page-title" :style="{ top: menuButtonInfo.top + 'px', lineHeight: menuButtonInfo.height + 'px' }">
				{{ isEdit ? '编辑日志' : '添加日志' }}
			</view>
		</view>

		<!-- 双按钮 (取消/保存) -->
		<view class="action-bar" :style="{ paddingTop: (topBarHeight + 10) + 'px', paddingLeft: paddingX + 'px', paddingRight: paddingX + 'px' }">
			<view class="btn-row">
				<view class="clean-btn" @click="cancel">
					<text>取消</text>
				</view>
				<view class="add-btn" @click="handleSave" :class="{ 'disabled': isSaving || isUploading }">
					<text>{{ isSaving ? '保存中...' : '保存' }}</text>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="content-scroll" :enhanced="true" :show-scrollbar="false">
			<view class="form-container">
				<!-- 1. 记录类型 -->
				<view class="section-label">
					<uni-icons type="list" size="18" color="#566C44"></uni-icons>
					<text class="label-text">记录类型</text>
				</view>
				<scroll-view scroll-x class="type-scroll" :show-scrollbar="false">
					<view class="type-list">
						<view v-for="(item, index) in careOptions" :key="index" 
							class="type-item" 
							:class="{ 'active': formData.actionType === item.type }"
							@click="formData.actionType = item.type">
							<view class="type-icon-box" :style="{ backgroundColor: formData.actionType === item.type ? item.color : 'rgba(255, 255, 255, 0.55)' }">
								<uni-icons :type="item.icon" size="24" :color="formData.actionType === item.type ? '#fff' : '#566C44'"></uni-icons>
							</view>
							<text class="type-name" :class="{ 'active-text': formData.actionType === item.type }">{{ item.name }}</text>
						</view>
					</view>
				</scroll-view>

				<!-- 2. 记录日期 -->
				<view class="section-label">
					<uni-icons type="calendar" size="18" color="#566C44"></uni-icons>
					<text class="label-text">记录日期</text>
				</view>
				<uni-datetime-picker type="date" v-model="formData.logTime" :border="false">
					<view class="form-item input-pill date-pill">
						<text>{{ formData.logTime }}</text>
					</view>
				</uni-datetime-picker>

				<!-- 3. 文字内容 -->
				<view class="section-label">
					<uni-icons type="compose" size="18" color="#566C44"></uni-icons>
					<text class="label-text">记录内容</text>
				</view>
				<view class="form-item textarea-box" :class="{ 'focused': focusedField === 'content' }">
					<uni-easyinput type="textarea" v-model="formData.content" :inputBorder="false"
						placeholder="记录下爱宠的点滴成长吧..." placeholderStyle="color:#8BA989; font-size:14px;" autoHeight
						@focus="focusedField = 'content'" @blur="focusedField = ''"></uni-easyinput>
				</view>

				<!-- 4. 图片上传 -->
				<view class="section-label">
					<uni-icons type="image" size="18" color="#566C44"></uni-icons>
					<text class="label-text">记录照片 (最多3张)</text>
				</view>
				<view class="image-grid">
					<view class="image-item" v-for="(img, index) in uploadImages" :key="index">
						<image :src="img.url" mode="aspectFill" @click="previewImage(index)"></image>
						<view class="delete-btn" @click="removeImage(index)">
							<uni-icons type="closeempty" size="12" color="#fff"></uni-icons>
						</view>
						<view class="upload-mask" v-if="img.isUploading">
							<text class="progress-text">{{ img.progress }}%</text>
						</view>
					</view>
					<view class="image-item add-btn" v-if="uploadImages.length < 3" @click="chooseImage">
						<uni-icons type="plusempty" size="30" color="#C8E39A"></uni-icons>
					</view>
				</view>
			</view>
			
			<view class="bottom-safe-area"></view>
		</scroll-view>
	</view>
</template>

<script>
	import navBar from '@/components/navBar.vue'
	import { callApi } from '@/util/util.js'

	export default {
		components: {
			navBar
		},
		data() {
			return {
				topBarHeight: 44,
				menuButtonInfo: { top: 20, height: 32 },
				paddingX: 20,
				focusedField: '',
				
				petId: '',
				isEdit: false,
				isSaving: false,
				isUploading: false,
				
				formData: {
					_id: '',
					actionType: 'record',
					logTime: '',
					content: ''
				},
				
				careOptions: [
					{ name: '成长日志', type: 'record', icon: 'compose', color: '#6CC42C' },
					{ name: '喂食', type: 'feed', icon: 'gift-filled', color: '#FFB74D' },
					{ name: '换水', type: 'water', icon: 'refresh-filled', color: '#4FC3F7' }
				],
				
				uploadImages: []
			}
		},
		onLoad(options) {
			// 适配导航栏
			const systemInfo = uni.getSystemInfoSync();
			// #ifdef MP-WEIXIN
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			this.menuButtonInfo = menuButtonInfo;
			this.topBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
			this.paddingX = systemInfo.windowWidth - menuButtonInfo.right;
			// #endif
			
			if (options.petId) {
				this.petId = options.petId;
			}
			
			if (options.id) {
				this.isEdit = true;
				this.getLogDetail(options.id);
			} else {
				// 设置默认日期
				const now = new Date();
				this.formData.logTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
			}
		},
		methods: {
			async getLogDetail(id) {
				uni.showLoading({ title: '加载中...' });
				try {
					const res = await callApi('getLogDetail', { _id: id });
					uni.hideLoading();
					if (res && res.code === 0 && res.data) {
						const data = res.data;
						this.formData._id = data._id;
						this.formData.actionType = data.actionType;
						this.formData.content = data.content;
						this.formData.logTime = data.logTime.split(' ')[0];
						if (data.images) {
							this.uploadImages = data.images.map(img => ({
								url: typeof img === 'string' ? img : img.url,
								fileID: typeof img === 'string' ? img : img.fileID,
								isOld: true
							}));
						}
					}
				} catch (e) {
					uni.hideLoading();
					console.error('获取详情失败', e);
				}
			},
			
			cancel() {
				uni.navigateBack();
			},
			
			async chooseImage() {
				if (this.isUploading) return;
				
				try {
					const res = await uni.chooseMedia({
						count: 3 - this.uploadImages.length,
						mediaType: ['image'],
						sourceType: ['album', 'camera']
					});
					
					const tempFiles = res.tempFiles;
					for (let file of tempFiles) {
						await this.processAndUpload(file.tempFilePath);
					}
				} catch (e) {
					console.error('选择图片失败', e);
				}
			},
			
			async processAndUpload(tempFilePath) {
				const fs = wx.getFileSystemManager();
				const fileInfo = await new Promise((resolve) => {
					fs.getFileInfo({
						filePath: tempFilePath,
						success: resolve,
						fail: () => resolve({ size: 0 })
					});
				});
				
				if (fileInfo.size > 2 * 1024 * 1024) {
					uni.showToast({ title: '图片不能超过2MB', icon: 'none' });
					return;
				}
				
				const imageObj = {
					url: tempFilePath,
					isUploading: true,
					progress: 0,
					fileID: ''
				};
				this.uploadImages.push(imageObj);
				this.isUploading = true;
				
				try {
					// 获取 openid 生成路径
					let openid = uni.getStorageSync('user_openid') || 'temp_user';
					const ext = tempFilePath.split('.').pop() || 'jpg';
					const cloudPath = `${openid}/logs/${Date.now()}-${Math.floor(Math.random()*1000)}.${ext}`;
					
					const uploadRes = await new Promise((resolve, reject) => {
						const task = wx.cloud.uploadFile({
							cloudPath,
							filePath: tempFilePath,
							success: resolve,
							fail: reject
						});
						task.onProgressUpdate((res) => {
							imageObj.progress = res.progress;
						});
					});
					
					imageObj.fileID = uploadRes.fileID;
					imageObj.url = uploadRes.fileID; // 使用云存储ID预览
					imageObj.isUploading = false;
				} catch (e) {
					console.error('上传失败', e);
					uni.showToast({ title: '上传失败', icon: 'none' });
					this.uploadImages = this.uploadImages.filter(item => item !== imageObj);
				} finally {
					this.checkUploadStatus();
				}
			},
			
			checkUploadStatus() {
				this.isUploading = this.uploadImages.some(img => img.isUploading);
			},
			
			removeImage(index) {
				this.uploadImages.splice(index, 1);
				this.checkUploadStatus();
			},
			
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.uploadImages.map(img => img.url)
				});
			},
			
			async handleSave() {
				if (this.isSaving || this.isUploading) return;
				
				if (!this.formData.content.trim() && this.uploadImages.length === 0) {
					uni.showToast({ title: '请输入内容或上传图片', icon: 'none' });
					return;
				}
				
				this.isSaving = true;
				uni.showLoading({ title: '保存中...', mask: true });
				
				try {
					const data = {
						_id: this.formData._id,
						petId: this.petId,
						actionType: this.formData.actionType,
						content: this.formData.content,
						logTime: this.formData.logTime,
						images: this.uploadImages.map(img => img.fileID || img.url),
						flag: this.isEdit ? 1 : 0
					};
					
					const res = await callApi('saveLog', data);
					uni.hideLoading();
					
					if (res && res.code === 0) {
						uni.showToast({ title: '保存成功', icon: 'success' });
						uni.$emit('refreshLog');
						setTimeout(() => uni.navigateBack(), 1500);
					} else {
						uni.showToast({ title: res.error || '保存失败', icon: 'none' });
					}
				} catch (e) {
					uni.hideLoading();
					console.error('保存异常', e);
					uni.showToast({ title: '网络异常', icon: 'none' });
				} finally {
					this.isSaving = false;
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	$focus-border-color: #566C44;
	$bg-color: #DBE9B2;
	$card-bg: rgba(255, 255, 255, 0.55);

	.container {
		font-size: 1rem;
		height: 100vh;
		background-color: $bg-color;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.nav-placeholder {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		background-color: $bg-color;
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
		
		&.disabled {
			opacity: 0.6;
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
		height: 0;
	}

	.form-container {
		padding: 20rpx 40rpx;
	}

	.section-label {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		margin-left: 10rpx;
		margin-top: 20rpx;

		.label-text {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
			margin-left: 10rpx;
		}
	}

	.type-scroll {
		width: 100%;
		white-space: nowrap;
		margin-bottom: 20rpx;
	}

	.type-list {
		display: inline-flex;
		padding: 10rpx 0;
	}

	.type-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 30rpx;
		width: 120rpx;
		
		.type-icon-box {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 12rpx;
			transition: all 0.3s;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
		}
		
		.type-name {
			font-size: 24rpx;
			color: #666;
			
			&.active-text {
				color: #566C44;
				font-weight: bold;
			}
		}
		
		&.active {
			.type-icon-box {
				transform: scale(1.1);
				box-shadow: 0 8rpx 16rpx rgba(108, 196, 44, 0.2);
			}
		}
	}

	.form-item {
		background-color: $card-bg;
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

	.date-pill {
		justify-content: center;
		color: #333;
		font-size: 30rpx;
		height: 100rpx;
	}

	.textarea-box {
		border-radius: 30rpx;
		padding: 20rpx 30rpx;
		min-height: 300rpx;
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}

	.image-item {
		width: 200rpx;
		height: 200rpx;
		border-radius: 20rpx;
		position: relative;
		overflow: hidden;
		background-color: $card-bg;
		
		image {
			width: 100%;
			height: 100%;
		}
		
		&.add-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			border: 4rpx dashed rgba(86, 108, 68, 0.2);
		}
		
		.delete-btn {
			position: absolute;
			right: 10rpx;
			top: 10rpx;
			width: 40rpx;
			height: 40rpx;
			background-color: rgba(0, 0, 0, 0.5);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 2;
		}
		
		.upload-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.4);
			display: flex;
			align-items: center;
			justify-content: center;
		}
		
		.progress-text {
			color: #fff;
			font-size: 24rpx;
		}
	}

	.bottom-safe-area {
		height: calc(100rpx + env(safe-area-inset-bottom));
		width: 100%;
	}

	::v-deep .uni-easyinput__content {
		background-color: transparent !important;
		border: none !important;
		min-height: auto !important;
	}
</style>
