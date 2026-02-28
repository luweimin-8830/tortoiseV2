<template>
    <view class="container">
        <nav-bar></nav-bar>
        <!-- 头部占位 -->
        <view class="nav-placeholder" :style="{ height: topBarHeight + 'px' }">
            <view class="page-title"
                :style="{ top: menuButtonInfo.top + 'px', lineHeight: menuButtonInfo.height + 'px' }">爱宠详情</view>
        </view>

        <!-- 🌟 新增：右上角操作按钮 (悬浮在导航栏之上) -->
        <!-- topBarHeight 是状态栏高度，我们需要往下一点点 -->
        <view class="top-actions" :style="{ top: (topBarHeight + 8) + 'px' }">
            <view class="action-btn icon-only" @click="handleNotification">
                <uni-icons type="notification" size="20" color="#566C44"></uni-icons>
            </view>
            <view class="action-btn icon-only" @click="handleShareTimeline">
                <uni-icons type="pyq" size="20" color="#566C44"></uni-icons>
            </view>
            <button class="action-btn icon-only share-btn" open-type="share" @tap="handleShareClick">
                <uni-icons type="upload" size="20" color="#566C44"></uni-icons>
            </button>
            <view class="action-btn pill-btn" @click="goEdit">
                <text>编辑</text>
            </view>
            <!-- <view class="action-btn pill-btn wither-btn" @click="handleDeath">
				<text>归档</text>
			</view> -->
        </view>

        <!-- 占位符 -->
        <view :style="{ height: topBarHeight + 44 + 'px' }"></view>

        <view class="main-content">
            <!-- 宠物基本信息卡片 -->
            <view class="pet-header-card">
                <!-- 上半部分：左图右文 -->
                <view class="card-top">
                    <!-- 左侧图片 -->
                    <image class="pet-avatar" :src="pet.photo || '/static/logo.png'" mode="aspectFill"
                        @click="previewCover"></image>

                    <!-- 右侧信息 -->
                    <view class="pet-info">
                        <view class="name-row">
                            <text class="pet-name">{{ pet.name }}</text>
                            <uni-icons v-if="pet.sex === 1" type="person-filled" size="18" color="#4A90E2"></uni-icons>
                            <uni-icons v-if="pet.sex === 2" type="person-filled" size="18" color="#FF69B4"></uni-icons>
                        </view>
                        <text class="pet-desc">{{ pet.desc || '暂无描述...' }}</text>

                        <!-- 标签列表 (如果有) -->
                        <!-- <view class="tag-list">
							<view class="tag-item" v-for="(tag, index) in pet.tags" :key="index">
								<text>{{ tag.name }}</text>
							</view>
						</view> -->
                    </view>
                </view>

                <!-- 分割线 -->
                <view class="card-divider"></view>

                <!-- 下半部分：统计数据 -->
                <view class="stats-row">
                    <view class="stat-item">
                        <text class="stat-val">{{ pet.birthday || '--' }}</text>
                        <text class="stat-label">到家日期</text>
                    </view>
                    <view class="vertical-line"></view>
                    <view class="stat-item">
                        <text class="stat-val">{{ pet.length || '0' }} cm</text>
                        <text class="stat-label">背甲长度</text>
                    </view>
                    <view class="vertical-line"></view>
                    <view class="stat-item">
                        <text class="stat-val">{{ pet.weight || '0' }} g</text>
                        <text class="stat-label">体重</text>
                    </view>
                </view>
            </view>

            <!-- 日常护理 (横向滚动) -->
            <!-- <view class="section-container">
				<view class="section-header">
					<text class="section-title">日常护理</text>
				</view>
				<scroll-view scroll-x class="care-scroll-view" :show-scrollbar="false">
					<view class="care-list">
						<view class="care-item" v-for="(item, index) in careActions" :key="index"
							@click="handleCare(item)">
							<view class="care-icon-box" :style="{ backgroundColor: item.color }">
								<view class="iconfont" :class="item.icon" style="font-size: 28px; color: #333;" v-if="item.icon"></view>
								<image v-else :src="item.img" class="care-img"></image>
							</view>
							<text class="care-name">{{ item.name }}</text>
						</view>
					</view>
				</scroll-view>
			</view> -->

            <!-- 宠物日志 -->
            <view class="log-section">
                <view class="section-header">
                    <view class="header-left">
                        <uni-icons type="compose" size="20" color="#566C44"></uni-icons>
                        <text class="section-title" style="margin-left: 6px;">成长日志</text>
                    </view>
                    <view class="header-right">
                        <text class="edit-btn" @click="isManageMode = !isManageMode">{{ isManageMode ? '完成' : '编辑'
                            }}</text>
                        <uni-icons type="plusempty" size="24" color="#566C44" style="margin-left: 15px;"
                            @click="goAddLog"></uni-icons>
                    </view>
                </view>
                <!-- 日志列表 -->
                <scroll-view scroll-y class="log-scroll-inner" :enable-back-to-top="true">
                    <view class="log-list">
                        <view v-for="(group, gIndex) in logList" :key="gIndex" class="log-group">
                            <text class="log-date-header">{{ group.dateStr }}</text>
                            <view v-for="(log, lIndex) in group.items" :key="lIndex" class="log-item"
                                @click="goEditLog(log)">
                                <view class="log-time-col">
                                    <text class="log-time">{{ log.time }}</text>
                                    <text class="log-date-mini">{{ log.dateMini }}</text>
                                </view>
                                <view class="log-timeline">
                                    <view class="dot"></view>
                                    <view class="line" v-if="lIndex !== group.items.length - 1"></view>
                                </view>
                                <view class="log-content-box">
                                    <view class="log-tag pill"
                                        :style="{ backgroundColor: log.color + '33' || '#D6EAF8' }">
                                        <view class="iconfont" :class="log.icon || 'uni-icons-compose'"
                                            style="font-size: 16px;" :style="{ color: log.color || '#4A90E2' }"></view>
                                        <text class="log-text">{{ log.actionName }}</text>
                                    </view>
                                    <view class="log-content" v-if="log.content">{{ log.content }}</view>

                                    <!-- 图片展示 -->
                                    <view class="log-images" v-if="log.images && log.images.length > 0">
                                        <image v-for="(img, iIndex) in log.images" :key="iIndex" :src="img.url"
                                            mode="aspectFill" class="log-img"
                                            @click.stop="previewLogImages(log.images, iIndex)"></image>
                                    </view>
                                </view>

                                <!-- 管理模式下的删除按钮 -->
                                <view class="delete-icon" v-if="isManageMode" @click.stop="handleDeleteLog(log.id)">
                                    <uni-icons type="minus-filled" size="20" color="#dd524d"></uni-icons>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view style="height: 100px;"></view>
                </scroll-view>
            </view>
        </view>
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
            petId: 0,
            pet: {
                name: '',
                photo: '',
                length: '',
                weight: '',
                desc: '',
                sex: 0,
                birthday: ''
            },
            careActions: [
                { name: '喂食', icon: 'uni-icons-gift-filled', color: '#FFB74D', type: 'feed' },
                { name: '换水', icon: 'uni-icons-refresh-filled', color: '#4FC3F7', type: 'water' },
                { name: '晒背', icon: 'uni-icons-sun-filled', color: '#FFD54F', type: 'sun' }
            ],
            logList: [],
            isManageMode: false
        }
    },
    onLoad(options) {
        const systemInfo = uni.getSystemInfoSync();
        // #ifdef MP-WEIXIN
        const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        this.menuButtonInfo = menuButtonInfo;
        this.topBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
        // #endif

        // #ifndef MP-WEIXIN
        this.topBarHeight = systemInfo.statusBarHeight + 44;
        this.menuButtonInfo = { top: systemInfo.statusBarHeight + 6, height: 32 };
        // #endif

        if (options && options.id) {
            this.petId = options.id;
            this.getPetDetail()
        }
    },
    methods: {
        async getPetDetail() {
            if (!this.petId) return
            uni.showLoading({ title: '加载中...' })
            try {
                // 确保传递参数时，_id 是顶层属性，或者是正确的嵌套结构
                // 根据后端逻辑 const { _id } = event，前端 callApi 应该直接传对象
                const res = await callApi('getPetDetail', { _id: this.petId })
                uni.hideLoading()
                // {
                //  "$url": "getPetDetail",
                // "_id": "614937966872393505271a385835a4ee"
                // }
                if (res && res.code === 0 && res.data) {
                    this.pet = res.data
                    // 格式化日期显示
                    if (this.pet.birthday) {
                        const date = new Date(this.pet.birthday)
                        const year = date.getFullYear()
                        const month = (date.getMonth() + 1).toString().padStart(2, '0')
                        const day = date.getDate().toString().padStart(2, '0')
                        this.pet.birthday = `${year}-${month}-${day}`
                    }
                } else {
                    // 统一错误处理
                    const errorMsg = res.error || '获取详情失败'
                    const suggestion = res.suggestion ? `\n${res.suggestion}` : ''

                    uni.showModal({
                        title: '提示',
                        content: errorMsg + suggestion,
                        showCancel: false,
                        confirmText: '返回',
                        success: (modalRes) => {
                            if (modalRes.confirm) {
                                // 如果是404或严重错误，建议返回上一页
                                if (res.code === 404 || res.code === -1001) {
                                    uni.navigateBack()
                                }
                            }
                        }
                    })
                }
            } catch (e) {
                uni.hideLoading()
                console.error(e)
                uni.showToast({ title: '网络请求失败，请检查网络', icon: 'none' })
            }
        },
        // 供外部调用刷新
        refresh() {
            this.getPetDetail();
        },
        goEdit() {
            uni.navigateTo({
                url: `/pages/petEdit/petEdit?id=${this.petId}&type=edit`
            });
        },
        handleNotification() {
            uni.showToast({ title: '订阅提醒功能开发中', icon: 'none' });
        },
        handleShareTimeline() {
            uni.showToast({ title: '点击右上角菜单分享', icon: 'none' });
        },
        handleShareClick() {
            console.log('点击分享');
        },
        previewCover() {
            if (this.pet.photo) {
                uni.previewImage({
                    urls: [this.pet.photo]
                });
            }
        },
        goAddLog() {
            uni.showToast({ title: '添加日志功能开发中', icon: 'none' });
        },
        goEditLog(log) {
            if (this.isManageMode) return;
            console.log('编辑日志', log);
        },
        handleDeleteLog(id) {
            console.log('删除日志', id);
        },
        previewLogImages(images, index) {
            const urls = images.map(img => img.url);
            uni.previewImage({
                current: index,
                urls: urls
            });
        }
    }
}
</script>

<style scoped lang="scss">
.container {
    font-size: 1rem;
    height: 100vh;
    background-color: #DBE9B2;
    /* 保持全局背景色 */
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

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 🌟 右上角悬浮按钮组 */
.top-actions {
    position: fixed;
    right: 16px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 12px;
}

.action-btn {
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(5px);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.icon-only {
    width: 36px;
    height: 36px;
    border-radius: 50%;
}

.share-btn {
    padding: 0;
    margin: 0;
    line-height: 1;
    background-color: rgba(255, 255, 255, 0.5);

    &::after {
        border: none;
    }
}

.pill-btn {
    padding: 6px 16px;
    height: 36px;
    box-sizing: border-box;

    text {
        font-size: 14px;
        font-weight: 500;
        color: #333;
    }
}

/* 🌟 宠物头部卡片 */
.pet-header-card {
    margin: 10px 16px;
    padding: 20px 15px;
    background-color: rgba(255, 255, 255, 0.55);
    border-radius: 24px;
    box-shadow: 0 8px 20px rgba(107, 136, 87, 0.08);
}

/* 上半部分：左图右文 */
.card-top {
    display: flex;
    margin-bottom: 20px;
}

.pet-avatar {
    width: 100px;
    height: 100px;
    border-radius: 16px;
    margin-right: 16px;
    background-color: #eee;
    flex-shrink: 0;
}

.pet-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 2px;
    padding-bottom: 2px;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.pet-name {
    font-size: 20px;
    font-weight: bold;
    color: #2F3E25;
}

.pet-desc {
    font-size: 13px;
    color: #888;
    line-height: 1.4;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

/* 分割线 */
.card-divider {
    height: 1px;
    background-color: #f0f0f0;
    margin-bottom: 16px;
    width: 100%;
}

/* 下半部分：统计数据 */
.stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-val {
            font-size: 15px;
            font-weight: bold;
            color: #2F3E25;
            margin-bottom: 4px;
            white-space: nowrap;
        }

        .stat-label {
            font-size: 11px;
            color: #888;
            white-space: nowrap;
        }
    }

    .vertical-line {
        width: 1px;
        height: 24px;
        background-color: #eee;
    }
}

/* 日常护理 */
.section-container {
    margin: 24px 0;
    padding-left: 16px;
}

.section-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-right: 16px;
}

.header-left {
    display: flex;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
    margin-left: auto;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-right: auto;
}

.care-scroll-view {
    width: 100%;
    white-space: nowrap;
    height: 160rpx;
}

.care-list {
    display: inline-flex;
    padding-right: 60rpx;
    height: 100%;
}

.care-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    width: 120rpx;
    flex-shrink: 0;
}

.care-icon-box {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.care-name {
    font-size: 11px;
    color: #666;
    text-align: center;
    width: 100%;
}

/* 日志部分 */
.log-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 16px;
    overflow: hidden;
    margin-top: 24px;
}

.log-scroll-inner {
    flex: 1;
    height: 0;
}

.edit-btn {
    font-size: 14px;
    color: #888;
}

.log-list {
    margin-top: 10px;
}

.log-group {
    margin-bottom: 20px;
}

.log-date-header {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 16px;
    display: block;
}

.log-item {
    display: flex;
    position: relative;
    padding-bottom: 20px;
}

.log-time-col {
    width: 50px;
    text-align: right;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
}

.log-time {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.log-date-mini {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
}

.log-timeline {
    width: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.dot {
    width: 10px;
    height: 10px;
    background-color: #6B8857;
    border-radius: 50%;
    z-index: 1;
    margin-top: 6px;
}

.line {
    flex: 1;
    width: 1px;
    background-color: #eee;
    margin-top: 4px;
}

.log-content-box {
    flex: 1;
    padding-left: 10px;
    padding-top: 2px;
}

.log-tag {
    display: inline-flex;
    align-items: center;
    background-color: #D6EAF8;
    padding: 4px 10px;
    border-radius: 20px;
    gap: 6px;
    margin-bottom: 6px;
}

.log-content {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 8px;
    word-break: break-all;
}

.log-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.log-img {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
}

.log-text {
    font-size: 13px;
    color: #333;
}

.delete-icon {
    padding: 10px;
}
</style>
