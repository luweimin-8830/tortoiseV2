<template>
	<view class="container">
		<nav-bar></nav-bar>
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

				<!-- 5. 标签选择 (多选) -->
				<view class="section-label">
					<uni-icons type="tag-filled" size="18" color="#566C44"></uni-icons>
					<text class="label-text">分类标签 (可多选)</text>
				</view>
				<view class="tags-group">
					<view v-for="tag in allTags" :key="tag._id" 
						class="tag-badge" 
						:class="{ 'active': isTagSelected(tag.title) }"
						@click="toggleTag(tag.title)">
						<text>{{ tag.title }}</text>
					</view>
					<view class="tag-badge manage-btn" @click="goToTagEdit">
						<uni-icons type="gear-filled" size="14" color="#566C44"></uni-icons>
						<text style="margin-left: 4px;">管理</text>
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
	import navBar from '@/components/navBar.vue'
	import { callApi } from '@/util/util.js'
	export default {
		components: {
			navBar
		},
		data() {
			return {
				topBarHeight: 44, // 默认值，会被 onLoad 覆盖
				menuButtonInfo: { top: 20, height: 32 }, // 默认值
				paddingX: 20,
				
				focusedField: '', // 当前聚焦的字段
				
				allTags: [], // 所有可选标签
				uploadProgress: 0, // 上传进度 0-100
				isUploading: false, // 是否正在上传
				isEdit: false, // 是否为编辑模式
				
				pet: {
					_id: '',
					name: '',
					cover: '',
					length: '',
					weight: '',
					desc: '',
					sex: 0,
					birthday: '',
					classification: [], // 修改为数组
					variety: ''
				}
			}
		},
		onLoad(options) {
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
			
			// 处理页面参数
			if (options.id) {
				// 编辑模式：传入 ID
				this.isEdit = true;
				this.getPetDetail(options.id);
			} else if (options.item) {
				// 编辑模式：传入对象字符串 (兼容旧逻辑)
				this.isEdit = true;
				try {
					const item = JSON.parse(decodeURIComponent(options.item));
					this.initPetData(item);
				} catch (e) {
					console.error('解析参数失败', e);
				}
			} else if (options.classification) {
				// 新增模式，接收分类
				this.pet.classification = [options.classification];
			}

			// 获取所有标签
			this.getAllTags();
			// 监听标签管理页面的刷新
			uni.$on('refreshHome', this.getAllTags);
		},
		onUnload() {
			uni.$off('refreshHome', this.getAllTags);
		},
		methods: {
			// 初始化宠物数据
			initPetData(item) {
				this.pet = {
					_id: item._id,
					name: item.name || '',
					cover: item.photo || '', // 映射 photo -> cover
					length: item.length || '',
					weight: item.weight || '',
					desc: item.content || '', // 映射 content -> desc
					sex: Number(item.sex) || 0,
					birthday: this.formatDate(item.birthday),
					// 兼容处理：将数据库的字符串转为数组
					classification: item.Classification ? (Array.isArray(item.Classification) ? item.Classification : item.Classification.split(',').filter(v => v)) : [],
					variety: item.variety || ''
				};
			},
			
			// 格式化日期
			formatDate(dateStr) {
				if (!dateStr) return '';
				if (typeof dateStr === 'string') {
					if (dateStr.includes('T')) return dateStr.split('T')[0];
					return dateStr;
				}
				// 如果是 Date 对象 (虽然云函数通常返回 JSON 字符串)
				if (dateStr instanceof Date) {
					try {
						const year = dateStr.getFullYear();
						const month = (dateStr.getMonth() + 1).toString().padStart(2, '0');
						const day = dateStr.getDate().toString().padStart(2, '0');
						return `${year}-${month}-${day}`;
					} catch(e) { return '' }
				}
				return '';
			},
			
			// 获取宠物详情
			async getPetDetail(id) {
				uni.showLoading({ title: '加载中...' });
				try {
					const res = await callApi('getPetDetail', { _id: id });
					uni.hideLoading();
					if (res && res.code === 0 && res.data) {
						this.initPetData(res.data);
					} else {
						uni.showToast({ title: res.error || '获取信息失败', icon: 'none' });
					}
				} catch (e) {
					uni.hideLoading();
					console.error('获取详情异常:', e);
					uni.showToast({ title: '网络异常', icon: 'none' });
				}
			},

			cancel() {
				uni.navigateBack();
			},
			async save() {
				if (this.isUploading) {
					uni.showToast({ title: '图片上传中，请稍后', icon: 'none' });
					return;
				}
				
				if (!this.pet.name.trim()) {
					uni.showToast({ title: '请输入爱宠名称', icon: 'none' });
					return;
				}
				
				uni.showLoading({ title: '保存中...', mask: true });
				
				try {
					const data = {
						flag: this.isEdit ? 1 : 0, // 1:更新, 0:新增
						_id: this.pet._id,
						name: this.pet.name.trim(),
						photo: this.pet.cover,
						length: this.pet.length,
						weight: this.pet.weight,
						content: this.pet.desc,
						sex: this.pet.sex,
						birthday: this.pet.birthday,
						Classification: Array.isArray(this.pet.classification) ? this.pet.classification.join(',') : this.pet.classification,
						variety: this.pet.variety
					};
					
					const res = await callApi('savePet', data);
					uni.hideLoading();
					
					if (res && (res.code === 0 || res.id)) {
						uni.showToast({ title: '保存成功', icon: 'success' });
						
						setTimeout(() => {
							// 尝试刷新上一页
							const pages = getCurrentPages();
							if (pages.length > 1) {
								const prevPage = pages[pages.length - 2];
								if (prevPage.$vm && prevPage.$vm.refresh) {
									prevPage.$vm.refresh();
								} else if (prevPage.refresh) {
									prevPage.refresh();
								}
							}
							uni.$emit('refreshHome'); // 触发全局刷新
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({ title: res.error || '保存失败', icon: 'none' });
					}
				} catch (e) {
					uni.hideLoading();
					console.error('保存异常:', e);
					uni.showToast({ title: '网络异常', icon: 'none' });
				}
			},
			/**
			 * 优化后的图片上传流程
			 * 1. 选择 -> 裁剪 -> 获取信息 -> 校验大小
			 * 2. 查重 (秒传)
			 * 3. 正常上传 (带进度)
			 * 4. 保存元数据
			 */
			async uploadImage() {
				// #ifdef MP-WEIXIN
				if (this.isUploading) return;
				
				try {
					// 1. 选择并裁剪图片
					const tempFilePath = await this.chooseImage();
					const croppedPath = await this.cropImage(tempFilePath);
					
					// 2. 获取文件信息并校验
					const { hash, size } = await this.getFileInfo(croppedPath);
					const MAX_SIZE = 2 * 1024 * 1024; // 2MB
					
					if (size > MAX_SIZE) {
						uni.showToast({ title: '图片不能超过2MB', icon: 'none' });
						return;
					}
					
					this.isUploading = true;
					this.uploadProgress = 0;
					
					// 3. 检查秒传
					const existsFileID = await this.checkImageExists(hash);
					if (existsFileID) {
						this.pet.cover = existsFileID;
						this.uploadProgress = 100;
						this.isUploading = false;
						uni.showToast({ title: '上传成功', icon: 'success' });
						return;
					}
					
					// 4. 上传到云存储
					const fileID = await this.uploadToCloud(croppedPath);
					
					// 5. 保存图片元数据
					await this.saveImageMeta(hash, fileID, size);
					
					this.pet.cover = fileID;
					this.uploadProgress = 100;
					uni.showToast({ title: '上传成功', icon: 'success' });
					
				} catch (e) {
					console.error('上传流程异常:', e);
					if (e.message !== 'cancel') {
						uni.showToast({ title: e.message || '上传失败', icon: 'none' });
					}
				} finally {
					setTimeout(() => {
						this.isUploading = false;
					}, 500);
				}
				// #endif
				
				// #ifndef MP-WEIXIN
				uni.showToast({ title: '请在微信小程序中操作', icon: 'none' });
				// #endif
			},
			
			// --- 辅助方法 ---
			
			// 选择图片
			chooseImage() {
				return new Promise((resolve, reject) => {
					uni.chooseMedia({
						count: 1,
						mediaType: ['image'],
						sourceType: ['album', 'camera'],
						success: (res) => resolve(res.tempFiles[0].tempFilePath),
						fail: (err) => {
							if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
								reject(new Error('cancel'));
							} else {
								reject(new Error('选择图片失败'));
							}
						}
					});
				});
			},
			
			// 裁剪图片
			cropImage(src) {
				return new Promise((resolve, reject) => {
					wx.cropImage({
						src: src,
						cropScale: '1:1',
						success: (res) => resolve(res.tempFilePath),
						fail: () => reject(new Error('cancel')) // 裁剪取消视为取消操作
					});
				});
			},
			
			// 获取文件信息 (Hash & Size)
			getFileInfo(filePath) {
				return new Promise((resolve, reject) => {
					const fs = wx.getFileSystemManager();
					fs.getFileInfo({
						filePath,
						success: (res) => resolve({ hash: res.digest, size: res.size }),
						fail: (err) => reject(new Error('读取文件信息失败'))
					});
				});
			},
			
			// 检查是否已存在 (秒传)
			async checkImageExists(hash) {
				try {
					const res = await callApi('checkImage', { hash }, { showLoading: false });
					if (res && res.code === 0 && res.data && res.data.fileID) {
						return res.data.fileID;
					}
				} catch (e) {
					console.error('秒传检查失败', e);
					// 检查失败不阻断流程，继续走普通上传
				}
				return null;
			},
			
			// 上传到云存储 (带进度)
			async uploadToCloud(filePath) {
				// 获取 openid 生成路径
				let openid = uni.getStorageSync('user_openid') || 'temp_user';
				// 如果没有缓存openid，尝试获取一次 (非阻塞，获取不到用temp)
				if (openid === 'temp_user') {
					try {
						const userRes = await callApi('getUserInfo', {}, { showLoading: false });
						if (userRes && userRes.OPENID) {
							openid = userRes.OPENID;
							uni.setStorageSync('user_openid', openid);
						}
					} catch(e) {}
				}
				
				const ext = filePath.split('.').pop() || 'jpg';
				const timestamp = Math.floor(Date.now() / 1000);
				const randomStr = Math.floor(Math.random() * 9000 + 1000).toString();
				const cloudPath = `${openid}/${timestamp}${randomStr}.${ext}`;
				
				return new Promise((resolve, reject) => {
					const uploadTask = wx.cloud.uploadFile({
						cloudPath,
						filePath,
						success: (res) => {
							if (res.fileID) resolve(res.fileID);
							else reject(new Error('上传未返回fileID'));
						},
						fail: (err) => reject(new Error('云存储上传失败: ' + err.errMsg))
					});
					
					// 监听进度
					uploadTask.onProgressUpdate((res) => {
						this.uploadProgress = res.progress;
					});
				});
			},
			
			// 保存图片元数据
			async saveImageMeta(hash, fileID, size) {
				try {
					await callApi('saveImage', {
						hash,
						fileID,
						name: fileID, // 也可以存 cloudPath
						size
					}, { showLoading: false });
				} catch (e) {
					console.error('保存图片信息失败', e);
					// 元数据保存失败不影响图片使用，仅打印日志
				}
			},
			// --- 标签操作 ---
			// 切换标签选择
			toggleTag(title) {
				if (!Array.isArray(this.pet.classification)) {
					this.pet.classification = [];
				}
				const index = this.pet.classification.indexOf(title);
				if (index > -1) {
					this.pet.classification.splice(index, 1);
				} else {
					this.pet.classification.push(title);
				}
			},
			// 判断标签是否选中
			isTagSelected(title) {
				return this.pet.classification && Array.isArray(this.pet.classification) && this.pet.classification.includes(title);
			},
			// 获取所有分类
			async getAllTags() {
				try {
					const res = await callApi('getClass');
					if (res && res.data) {
						this.allTags = res.data;
					}
				} catch (e) {
					console.error('获取标签列表失败', e);
				}
			},
			// 跳转到标签管理
			goToTagEdit() {
				uni.navigateTo({
					url: '/pages/tagEdit/tagEdit'
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
	
	.upload-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		backdrop-filter: blur(2px);
	}
	
	.progress-text {
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
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

	/* 标签选择样式 */
	.tags-group {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 30rpx;
		margin-top: 10rpx;
	}

	.tag-badge {
		padding: 12rpx 28rpx;
		background-color: rgba(255, 255, 255, 0.55);
		border-radius: 40rpx;
		font-size: 26rpx;
		color: #566C44;
		border: 2rpx solid transparent;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;

		&.active {
			background-color: #6CC42C;
			color: #fff;
			border-color: rgba(255, 255, 255, 0.2);
			font-weight: bold;
			box-shadow: 0 4rpx 10rpx rgba(108, 196, 44, 0.3);
		}

		&:active {
			opacity: 0.8;
			transform: scale(0.95);
		}
	}

	.manage-btn {
		background-color: rgba(255, 255, 255, 0.3);
		border: 2rpx dashed rgba(86, 108, 68, 0.3);
		color: #566C44;
	}

	/* 穿透修改 uni-easyinput */
	::v-deep .uni-easyinput__content {
		background-color: transparent !important;
		border: none !important;
		min-height: auto !important;
	}
</style>
