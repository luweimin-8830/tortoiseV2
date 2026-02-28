const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const imageCollection = db.collection('image')

module.exports = (app) => {
    // 检查图片是否存在
    app.router('checkImage', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { hash } = event
        
        if (!hash) {
            ctx.body = { code: -1, error: '缺少hash参数' }
            return
        }

        try {
            const res = await imageCollection.where({ hash }).limit(1).get()
            if (res.data.length > 0) {
                ctx.body = { 
                    code: 0, 
                    data: res.data[0], 
                    msg: '图片已存在' 
                }
            } else {
                ctx.body = { 
                    code: 0, 
                    data: null, 
                    msg: '图片不存在' 
                }
            }
        } catch (e) {
            console.error('[checkImage] Error:', e)
            ctx.body = { code: -1, error: '查询失败' }
        }
    })

    // 保存图片信息
    app.router('saveImage', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { hash, fileID, name } = event
        const { OPENID } = cloud.getWXContext()

        if (!hash || !fileID) {
            ctx.body = { code: -1, error: '缺少必要参数' }
            return
        }

        try {
            // 再次检查是否存在，避免并发重复
            const countRes = await imageCollection.where({ hash }).count()
            
            if (countRes.total > 0) {
                // 更新时间
                await imageCollection.where({ hash }).update({
                    data: {
                        updateTime: db.serverDate()
                    }
                })
                ctx.body = { code: 0, msg: '更新成功' }
            } else {
                // 新增
                await imageCollection.add({
                    data: {
                        hash,
                        fileID,
                        name: name || '',
                        uploadTime: db.serverDate(),
                        updateTime: db.serverDate(),
                        uploader: OPENID
                    }
                })
                ctx.body = { code: 0, msg: '保存成功' }
            }
        } catch (e) {
            console.error('[saveImage] Error:', e)
            ctx.body = { code: -1, error: '保存失败' }
        }
    })
}
