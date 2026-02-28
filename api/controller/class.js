const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

module.exports = (app) => {
    // 新增或更新分组
    app.router('saveClass', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        
        // 确保从正确的层级获取参数
        const title = event.title || (ctx.event && ctx.event.title);
        const _id = event._id || (ctx.event && ctx.event._id);

        if (!openId || !title) {
            ctx.body = { data: '参数错误', event: event }
            return
        }

        if (_id) {
            await db.collection('Classification').doc(_id).update({ 
                data: {
                    title: title
                } 
            })
            ctx.body = { data: '更新成功' }
        } else {
            // 获取当前最大排序值，新分类排在最后
            const countRes = await db.collection('Classification').where({ openId }).count()
            await db.collection('Classification').add({
                data: {
                    title: title,
                    openId: openId,
                    sortOrder: countRes.total || 0,
                    createdAt: new Date()
                }
            })
            ctx.body = { data: '新增成功' }
        }
    })

    // 获取分组列表
    app.router('getClass', async (ctx) => {
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        if (!openId) {
            ctx.body = { data: [], error: '参数错误' }
            return
        }
        // 按 sortOrder 升序排列
        const res = await db.collection('Classification')
            .where({ openId })
            .orderBy('sortOrder', 'asc')
            .orderBy('createdAt', 'desc')
            .get()
        ctx.body = { data: res.data }
    })

    // 批量更新排序
    app.router('updateClassOrder', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        const list = event.list || [] 

        if (!openId || !Array.isArray(list)) {
            ctx.body = { data: '参数错误' }
            return
        }

        try {
            const tasks = list.map(item => {
                return db.collection('Classification').doc(item._id).update({
                    data: {
                        sortOrder: item.sortOrder
                    }
                })
            })
            await Promise.all(tasks)
            ctx.body = { data: '排序更新成功' }
        } catch (error) {
            console.error('批量更新排序失败:', error)
            ctx.body = { error: '排序失败' }
        }
    })

    // 删除分组
    app.router('deleteClass', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        const { _id, title } = event
        if (!openId || !_id) {
            ctx.body = { data: '参数错误' }
            return
        }
        try {
            await db.collection('Classification').doc(_id).remove()
            await db.collection('petInformation').where({ openId, Classification: title }).update({ Classification: null })
            ctx.body = { data: '删除成功' }
        } catch (error) {
            console.error(error)
            ctx.body = { error: '删除失败' }
        }
    })
}
