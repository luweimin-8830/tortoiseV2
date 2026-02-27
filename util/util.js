/**
 * 封装微信云开发云函数调用
 * @param {String} url - tcb-router 的路由地址，例如 'user/login'
 * @param {Object} data - 请求参数
 * @param {Object} options - 额外配置（例如是否显示 loading）
 * @returns {Promise<any>}
 */
export const callApi = async (url, data = {}, options = {}) => {
	const { showLoading = true, loadingText = '加载中...' } = options;

	if (showLoading) {
		uni.showLoading({
			title: loadingText,
			mask: true
		});
	}

	try {
		// 调用云函数 'api'，对应后端入口 api/index.js
		const res = await wx.cloud.callFunction({
			name: 'api',
			data: {
				$url: url, // tcb-router 路由参数
				...data
			}
		});

		if (showLoading) {
			uni.hideLoading();
		}

		// 返回云函数的 result，具体根据后端的返回结构可以进一步在此处做拦截器
		return res.result;
	} catch (error) {
		if (showLoading) {
			uni.hideLoading();
		}
		
		uni.showToast({
			title: '请求失败，请稍后重试',
			icon: 'none'
		});
		
		console.error(`云函数调用失败 [${url}]:`, error);
		throw error;
	}
};

export default {
	callApi
};