<template>
	<view class="home-container">
		<!-- 自定义导航栏区域 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<!-- 搜索框容器 -->
			<view class="search-wrapper" :style="{ height: menuButtonHeight + 'px', paddingRight: (windowWidth - menuButtonLeft + 10) + 'px' }">
				<uni-search-bar class="custom-search" radius="100" placeholder="搜索名称或标签" clearButton="auto" cancelButton="none" @confirm="search" />
			</view>
			
			<!-- 横向滚动标签 -->
			<view class="tag-scroll-container">
				<scroll-view scroll-x="true" class="tag-scroll-view" :show-scrollbar="false"
					:scroll-into-view="'tag-item-' + (currentTagIndex > 1 ? currentTagIndex - 1 : 0)"
					scroll-with-animation>
					<view class="tag-flex-box" id="tag-container">
						<view v-for="(item, index) in tagList" :key="item._id" :id="'tag-item-' + index"
							class="tag-item" :class="{ 'active': currentTagIndex === index }"
							@click="selectTag(index, item)">
							<text :id="'tag-text-' + index" class="tag-text">{{ item.title }}</text>
						</view>
						<view class="slider-bar" :style="sliderStyle"></view>
					</view>
				</scroll-view>
			</view>
		</view>

		<scroll-view scroll-y class="home-content">
			<view class="pet-list" v-if="petList.length > 0">
				<view class="pet-card" v-for="item in petList" :key="item._id" @click="gotoDetail(item)">
					<view class="pet-left">
						<!-- 头像 -->
						<image class="pet-avatar" :src="item.photo || '/static/logo.png'" mode="aspectFill"></image>
						<view class="pet-info">
							<!-- 名称 -->
							<text class="pet-name">{{ item.name }}</text>
							<!-- 体型数据 -->
							<view class="pet-specs" v-if="item.length || item.weight">
								<text class="spec-item" v-if="item.length">{{ item.length }}cm</text>
								<text class="spec-item" v-if="item.weight">{{ item.weight }}g</text>
							</view>
						</view>
					</view>
					<view class="pet-right">
						<!-- 陪伴天数 -->
						<text class="pet-days">已陪伴 {{ item.days }} 天</text>
					</view>
				</view>
			</view>
			
			<view class="empty-list" v-else>
				<text>暂无记录，快去添加你的爱宠吧~</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { callApi } from '@/util/util.js'

	export default {
		name: 'home',
		data() {
			return {
				topBarHeight: 0,
				statusBarHeight: 0,
				menuButtonHeight: 0,
				menuButtonLeft: 0,
				windowWidth: 0,
				
				// 标签相关
				tagList: [],
				currentTagIndex: 0,
				sliderLeft: 0,
				sliderWidth: 0,
				sliderTimer: null,
				
				// 宠物列表
				petList: [],
				searchKeyword: '',
			};
		},
		computed: {
			// 动态生成滑块样式
			sliderStyle() {
				return {
					transform: `translateX(${this.sliderLeft}px)`,
					width: `${this.sliderWidth}px`
				}
			}
		},
		created() {
			// 获取系统信息
			const systemInfo = uni.getSystemInfoSync();
			this.windowWidth = systemInfo.windowWidth;
			this.statusBarHeight = systemInfo.statusBarHeight;
			
			// 获取微信小程序胶囊按钮信息
			// #ifdef MP-WEIXIN
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			this.menuButtonHeight = menuButtonInfo.height;
			this.menuButtonLeft = menuButtonInfo.left;
			this.topBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
			// #endif
			
			// 兼容非小程序环境
			// #ifndef MP-WEIXIN
			this.menuButtonHeight = 32;
			this.menuButtonLeft = this.windowWidth - 100;
			this.topBarHeight = this.statusBarHeight + 44;
			// #endif
			
			Promise.all([
				this.getClassList(),
				this.getPetList()
			]);

			// 监听全局刷新事件
			uni.$on('refreshHome', this.refresh);
		},
		beforeUnmount() {
			// 移除监听
			uni.$off('refreshHome', this.refresh);
		},
		methods: {
			// 供外部调用刷新
			refresh() {
				this.getClassList();
				this.getPetList();
			},
			search(res) {
				this.searchKeyword = res.value || '';
				this.getPetList();
			},
			clearSearch() {
				this.searchKeyword = '';
				this.getPetList();
			},
			
			// 获取分类列表
			async getClassList() {
				try {
					const oldTagId = this.tagList[this.currentTagIndex]?._id;
					const res = await callApi('getClass');
					if (res && res.data) {
						// 添加“全部”选项
						this.tagList = [
							{ title: "全部", _id: 0 },
							...res.data
						];
						
						// 刷新后尝试保持之前的选择，如果找不到则回退到“全部”
						let newIndex = 0;
						if (oldTagId !== undefined && oldTagId !== 0) {
							const foundIndex = this.tagList.findIndex(t => t._id === oldTagId);
							if (foundIndex !== -1) newIndex = foundIndex;
						}
						this.currentTagIndex = newIndex;

						this.$nextTick(() => {
							setTimeout(() => {
								this.updateSliderPosition(this.currentTagIndex);
							}, 200);
						});
					}
				} catch (e) {
					console.error('获取分类失败', e);
				}
			},
			
			// 获取宠物列表
			async getPetList() {
				try {
					const currentTag = this.tagList[this.currentTagIndex];
					const params = {
						keyword: this.searchKeyword
					};
					
					// 如果当前选择的不是“全部”，则传递分类标题给后端
					if (currentTag && currentTag._id !== 0) {
						params.title = currentTag.title;
					}
					
					const res = await callApi('getPetList', params);
					if (res && res.data) {
						this.petList = res.data;
					}
				} catch (e) {
					console.error('获取宠物列表失败', e);
				}
			},
			
			gotoDetail(item) {
				uni.navigateTo({
					url: `/pages/petDetail/petDetail?id=${item._id}`
				})
			},
			
			selectTag(index, item) {
				if (this.currentTagIndex === index) return;
				
				this.currentTagIndex = index;
				// 根据标签重新获取宠物列表
				this.getPetList();
				
				// 滑块动画逻辑
				const query = uni.createSelectorQuery().in(this);
				query.select('#tag-container').boundingClientRect();
				query.select('#tag-text-' + index).boundingClientRect();
				query.exec((res) => {
					if (res[0] && res[1]) {
						const containerLeft = res[0].left;
						const currentTextLeft = res[1].left;
						const currentTextWidth = res[1].width;
						const ratio = 22 / 18;
						const finalWidth = currentTextWidth * ratio;
						const widthDiff = finalWidth - currentTextWidth;
						const finalLeft = (currentTextLeft - containerLeft) - (widthDiff / 2);

						this.$nextTick(() => {
							this.sliderWidth = finalWidth;
							this.sliderLeft = finalLeft;
						});

						if (this.sliderTimer) clearTimeout(this.sliderTimer);
						this.sliderTimer = setTimeout(() => {
							this.updateSliderPosition(index);
						}, 350);
					}
				});
			},

			updateSliderPosition(index) {
				const query = uni.createSelectorQuery().in(this);
				query.select('#tag-container').boundingClientRect();
				query.select('#tag-text-' + index).boundingClientRect();

				query.exec((res) => {
					if (res[0] && res[1]) {
						const containerLeft = res[0].left;
						const textLeft = res[1].left;
						const textWidth = res[1].width;

						this.sliderLeft = textLeft - containerLeft;
						this.sliderWidth = textWidth;
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.home-container {
		width: 100%;
		/* 减去底部 TabBar 的高度 (60px) 和安全区 */
		height: calc(100vh - 60px - env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: hidden;
	}

	.nav-bar {
		width: 100%;
		flex-shrink: 0;
		background-color: #DBE9B2; /* 与全局背景色保持一致 */
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		box-sizing: border-box;
	}

	.search-wrapper {
		width: 100%;
		padding-left: 15px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	/* 深度穿透修改 uni-search-bar 内部样式以完美适配胶囊高度 */
	.custom-search {
		width: 100%;
		height: 100%;
	}

	.custom-search ::v-deep .uni-searchbar {
		padding: 0 !important;
		height: 100% !important;
		background-color: transparent !important;
	}

	.custom-search ::v-deep .uni-searchbar__box {
		height: 100% !important;
		margin: 0 !important;
		border-radius: 100px !important;
		background-color: rgba(255, 255, 255, 0.7) !important;
		display: flex;
		align-items: center;
	}
	
	.custom-search ::v-deep .uni-searchbar__box-icon-search {
		padding: 0 8px;
	}

	.home-content {
		flex: 1;
		height: 0; /* 触发 scroll-view 在 flex 容器中的滚动 */
		background-color: transparent;
	}
	
	.pet-list {
		padding: 15px;
		padding-bottom: 20px;
	}

	.pet-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: rgba(255,255,255,0.5);
		border-radius: 12px;
		padding: 15px;
		margin-bottom: 15px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: all 0.2s;
	}
	
	.pet-card:active {
		transform: scale(0.98);
	}

	.pet-left {
		display: flex;
		align-items: center;
	}

	.pet-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background-color: #f0f0f0;
		margin-right: 15px;
		border: 1px solid #f5f5f5;
	}

	.pet-name {
		font-size: 16px;
		color: #333;
		font-weight: bold;
	}

	.pet-specs {
		display: flex;
		align-items: center;
		margin-top: 4px;
	}

	.spec-item {
		font-size: 12px;
		color: #888;
		margin-right: 8px;
	}

	.pet-right {
		display: flex;
		align-items: center;
	}

	.pet-days {
		font-size: 14px;
		color: #65B028; /* 主题深绿 */
		font-weight: 500;
	}
	
	.empty-list {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100px 0;
		color: #999;
		font-size: 14px;
	}

	/* 标签样式 */
	.tag-scroll-container {
		width: 100%;
		background-color: transparent;
		padding: 5px 0;
	}

	.tag-scroll-view {
		width: 100%;
		white-space: nowrap;
	}

	.tag-flex-box {
		display: flex;
		align-items: center;
		padding: 0 15px;
		position: relative;
	}

	.tag-item {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 8px;
		margin-right: 10px;
		font-size: 16px;
		color: #666;
		transition: all 0.3s;
	}

	.tag-item.active {
		color: #65B028; /* 深绿 */
		font-weight: bold;
		font-size: 18px;
	}

	/* 下划线动画样式 */
	.slider-bar {
		position: absolute;
		bottom: 8px;
		left: 0;
		height: 3px;
		background-color: #65B028; /* 深绿 */
		border-radius: 2px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1;
		pointer-events: none;
	}
</style>