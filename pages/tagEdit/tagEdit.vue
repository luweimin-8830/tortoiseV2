<template>
    <view class="page-wrapper">
        <nav-bar />
        <view :style="{ height: topBarHeight + 'px' }"></view>

        <scroll-view scroll-y class="main-scroll" :show-scrollbar="false" :enhanced="true">
            <view class="page-container">
                <!-- 1. 创建新分类区域 -->
                <view class="section" v-if="!isSorting">
                    <text class="section-title">创建新分类</text>
                    <view class="card-box input-card">
                        <input class="input-field" type="text" v-model="newTagName" placeholder="输入分类名称"
                            placeholder-class="placeholder-style" />
                        <view class="add-btn" :class="{ 'disabled': !newTagName }" @click="handleAddTag">
                            <text class="btn-text">添加</text>
                        </view>
                    </view>
                </view>

                <!-- 2. 分类列表区域 -->
                <view class="section">
                    <view class="section-header">
                        <text class="section-title">可用分类</text>
                        <!-- 🌟 切换排序模式按钮 (暂不支持保存排序，仅UI展示) -->
                        <view class="sort-btn" @click="toggleSortMode">
                            <uni-icons :type="isSorting ? 'checkbox-filled' : 'list'" size="16"
                                :color="isSorting ? '#6CC42C' : '#666'"></uni-icons>
                            <text :class="{ 'active-text': isSorting }">{{ isSorting ? '完成' : '排序' }}</text>
                        </view>
                    </view>

                    <view class="card-box list-card" :class="{ 'sorting-mode': isSorting }">

                        <!-- 🌟 模式 A: 普通模式 (支持左滑删除) -->
                        <uni-swipe-action v-if="!isSorting">
                            <block v-for="(item, index) in tagsList" :key="item._id">
                                <uni-swipe-action-item :right-options="swipeOptions" @click="swipeClick($event, index)"
                                    :auto-close="true">
                                    <view class="list-item">
                                        <template v-if="item.isEditing">
                                            <view class="edit-container">
                                                <input class="edit-input" v-model="item.tempName" :focus="true"
                                                    @confirm="saveEdit(index)" />
                                                <view class="edit-actions">
                                                    <text class="edit-btn cancel"
                                                        @click.stop="cancelEdit(index)">取消</text>
                                                    <view class="edit-divider"></view>
                                                    <text class="edit-btn save" @click.stop="saveEdit(index)">保存</text>
                                                </view>
                                            </view>
                                        </template>
                                        <template v-else>
                                            <view class="left-info">
                                                <text class="tag-name">{{ item.title }}</text>
                                                <view class="icon-wrapper" @click.stop="startEdit(index)">
                                                    <uni-icons type="compose" size="18" color="#566C44"></uni-icons>
                                                </view>
                                            </view>
                                        </template>
                                    </view>
                                </uni-swipe-action-item>
                                <view v-if="index < tagsList.length - 1" class="divider"></view>
                            </block>
                        </uni-swipe-action>

                        <!-- 🌟 模式 B: 排序模式 (支持拖拽) -->
                        <movable-area v-else :style="{ height: areaHeight + 'px' }" class="sort-area">
                            <block v-for="(item, index) in tagsList" :key="item._id">
                                <movable-view class="sort-item" :y="item.y" direction="vertical" :damping="40"
                                    :disabled="false" @change="onDragChange($event, index)"
                                    @touchstart="onDragStart(index)" @touchend="onDragEnd"
                                    :style="{ zIndex: curDragIndex === index ? 99 : 1 }">
                                    <view class="list-item sort-inner">
                                        <view class="left-info">
                                            <uni-icons type="bars" size="20" color="#8BA989"
                                                class="drag-handle"></uni-icons>
                                            <text class="tag-name">{{ item.title }}</text>
                                        </view>
                                    </view>
                                    <view class="divider"></view>
                                </movable-view>
                            </block>
                        </movable-area>
                    </view>
                </view>

                <!-- 底部安全区域占位 -->
                <view class="safe-area-bottom"></view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import navBar from '@/components/navBar.vue'
import {
    callApi
} from '@/util/util.js'

// 每一行的高度 (54px 内容 + 1px 分割线)
const ROW_HEIGHT = 55;

export default {
    components: {
        navBar,
    },
    data() {
        return {
            newTagName: '',
            swipeOptions: [{
                text: '删除',
                style: {
                    backgroundColor: '#dd524d',
                    color: '#fff',
                    fontSize: '14px'
                }
            }],
            tagsList: [],
            topBarHeight: 0,

            // --- 排序相关数据 ---
            isSorting: false, // 是否处于排序模式
            areaHeight: 0, // 拖拽区域总高度
            curDragIndex: -1, // 当前正在拖拽的索引
            tempY: 0, // 记录当前拖拽的 Y 值
        }
    },
    methods: {
        async getTagsList() {
            uni.showLoading({
                title: '加载中...'
            });
            try {
                const res = await callApi('getClass');
                uni.hideLoading();
                if (res && res.data) {
                    this.tagsList = res.data.map((item, index) => {
                        return {
                            ...item,
                            y: index * ROW_HEIGHT,
                            isEditing: false,
                            tempName: ''
                        }
                    });
                    this.areaHeight = this.tagsList.length * ROW_HEIGHT;
                }
            } catch (error) {
                uni.hideLoading();
                console.error(error)
            }
        },

        // --- 排序核心逻辑 ---
        async toggleSortMode() {
            if (this.isSorting) {
                // 保存排序到后端
                const orderList = this.tagsList.map((item, index) => ({
                    _id: item._id,
                    sortOrder: index
                }));

                try {
                    await callApi('updateClassOrder', {
                        list: orderList
                    });
                    uni.showToast({
                        title: '排序已保存',
                        icon: 'success'
                    });
                } catch (error) {
                    console.error('保存排序失败:', error);
                }
                this.isSorting = false;
            } else {
                this.tagsList.forEach((item, index) => {
                    item.y = index * ROW_HEIGHT;
                });
                this.areaHeight = this.tagsList.length * ROW_HEIGHT;
                this.isSorting = true;
            }
        },

        onDragStart(index) {
            this.curDragIndex = index;
        },

        onDragChange(e, index) {
            if (e.detail.source === 'touch' && index === this.curDragIndex) {
                this.tempY = e.detail.y;
            }
        },

        onDragEnd() {
            if (this.curDragIndex === -1) return;
            let targetIndex = Math.round(this.tempY / ROW_HEIGHT);
            if (targetIndex < 0) targetIndex = 0;
            if (targetIndex > this.tagsList.length - 1) targetIndex = this.tagsList.length - 1;

            if (targetIndex !== this.curDragIndex) {
                const item = this.tagsList[this.curDragIndex];
                this.tagsList.splice(this.curDragIndex, 1);
                this.tagsList.splice(targetIndex, 0, item);
            }

            this.$nextTick(() => {
                this.tagsList.forEach((item, index) => {
                    item.y = index * ROW_HEIGHT;
                });
                this.curDragIndex = -1;
            });
        },

        async handleAddTag() {
            if (!this.newTagName.trim()) return;
            try {
                uni.showLoading({
                    title: '添加中...'
                });
                const res = await callApi('saveClass', {
                    title: this.newTagName
                });
                // {
                //     "$url": "saveClass"
                //     "title": "温箱1"
                // }
                
                uni.hideLoading();
                if (res) {
                    uni.showToast({
                        title: '添加成功',
                        icon: 'success'
                    });
                    this.newTagName = '';
                    this.getTagsList();
                }
            } catch (error) {
                uni.hideLoading();
                console.error(error)
            }
        },

        async swipeClick(e, index) {
            if (e.content.text === '删除') {
                uni.showModal({
                    title: '提示',
                    content: '确定删除该分类吗？关联的爱宠将变为未分类。',
                    success: async (res) => {
                        if (res.confirm) {
                            const item = this.tagsList[index];
                            try {
                                uni.showLoading({
                                    title: '删除中...'
                                });
                                await callApi('deleteClass', {
                                    _id: item._id,
                                    title: item.title
                                });
                                uni.hideLoading();
                                this.tagsList.splice(index, 1);
                                this.areaHeight = this.tagsList.length * ROW_HEIGHT;
                                uni.showToast({
                                    title: '删除成功',
                                    icon: 'success'
                                });
                            } catch (error) {
                                uni.hideLoading();
                                console.error(error);
                            }
                        }
                    }
                });
            }
        },

        startEdit(index) {
            this.tagsList.forEach(item => item.isEditing = false);
            const item = this.tagsList[index];
            item.tempName = item.title;
            item.isEditing = true;
        },

        cancelEdit(index) {
            this.tagsList[index].isEditing = false;
        },

        async saveEdit(index) {
            const item = this.tagsList[index];
            if (!item.tempName.trim()) return;
            const oldTitle = item.title;
            item.title = item.tempName;
            item.isEditing = false;
            try {
                uni.showLoading({
                    title: '保存中...'
                });
                await callApi('saveClass', {
                    _id: item._id,
                    title: item.title
                });
                uni.hideLoading();
                uni.showToast({
                    title: '修改成功',
                    icon: 'success'
                });
            } catch (error) {
                uni.hideLoading();
                item.title = oldTitle; // 回滚
                console.error(error);
            }
        }
    },
    onLoad() {
        const app = getApp();
        this.topBarHeight = app.globalData.topBarHeight || 0;
        this.getTagsList();
    },
}
</script>

<style scoped lang="scss">
.page-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #DBE9B2;
}

.main-scroll {
    flex: 1;
    overflow: hidden;
}

.page-container {
    padding: 20px 16px;
    box-sizing: border-box;
}

.safe-area-bottom {
    height: calc(30px + env(safe-area-inset-bottom));
}

.section-title {
    font-size: 14px;
    color: #566C44;
    font-weight: bold;
    margin-bottom: 10px;
    margin-left: 4px;
    display: block;
}

.card-box {
    background-color: rgba(255, 255, 255, 0.55);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
    transition: all 0.3s;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.sort-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    transition: all 0.2s;

    &:active {
        background-color: rgba(255, 255, 255, 0.8);
    }

    text {
        font-size: 13px;
        color: #666;
        line-height: 1;
    }
}

.active-text {
    color: #6CC42C !important;
    font-weight: bold;
}

.sort-area {
    width: 100%;
    background-color: transparent;
}

.sort-item {
    width: 100%;
    height: 55px;
    background-color: rgba(255, 255, 255, 0.55);
    z-index: 1;
}

.sort-item[style*="z-index: 99"] {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
    background-color: rgba(255, 255, 255, 0.9);
}

.sort-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    padding: 0 16px;
}

.drag-handle {
    margin-right: 12px;
}

.input-card {
    display: flex;
    align-items: center;
    padding: 6px 6px 6px 16px;
    height: 50px;
    box-sizing: border-box;
}

.input-field {
    flex: 1;
    font-size: 15px;
    color: #333;
    height: 100%;
}

.placeholder-style {
    color: #8BA989;
}

.add-btn {
    background-color: #6CC42C;
    padding: 6px 16px;
    border-radius: 14px;
    margin-left: 10px;

    &.disabled {
        opacity: 0.5;
    }
}

.btn-text {
    font-size: 13px;
    color: #fff;
    font-weight: 500;
}

.list-card {
    padding: 0;
}

.list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    padding: 0 16px;
    width: 100%;
    box-sizing: border-box;
    background-color: transparent;
}

.edit-container {
    display: flex;
    align-items: center;
    flex: 1;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    padding: 0 12px;
    height: 38px;
    margin-right: 12px;
    border: 1px solid rgba(86, 108, 68, 0.1);
}

.edit-input {
    flex: 1;
    font-size: 14px;
    color: #2F3E25;
}

.edit-actions {
    display: flex;
    align-items: center;
}

.edit-btn {
    font-size: 13px;
    padding: 6px 8px;
    transition: all 0.2s;

    &:active {
        opacity: 0.6;
    }

    &.cancel {
        color: #888;
    }

    &.save {
        color: #6CC42C;
        font-weight: bold;
    }
}

.edit-divider {
    width: 1px;
    height: 12px;
    background-color: rgba(0, 0, 0, 0.08);
}

.left-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.tag-name {
    font-size: 16px;
    color: #2F3E25;
    margin-right: 8px;
}

.icon-wrapper {
    padding: 4px;
    display: flex;
}

.divider {
    height: 1px;
    background-color: rgba(0, 0, 0, 0.05);
    width: 100%;
    margin-left: 16px;
}

::v-deep .uni-swipe_button-group {
    height: 100%;
}

::v-deep .uni-swipe {
    background-color: transparent !important;
}
</style>
