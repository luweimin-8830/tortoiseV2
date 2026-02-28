const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const growthCollection = db.collection('growthRecord')
const petCollection = db.collection('petInformation')

module.exports = (app) => {
    // 获取成长记录
    app.router('getGrowthRecord', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        const { petId } = event
        if (!openId || !petId) {
            ctx.body = { data: [], error: '参数错误' }
            return
        }
        const list = await growthCollection.where({ openId, petId }).orderBy('recordDate', 'desc').get()
        if (list.data.length > 0) {
            const fileIds = list.data.filter(i => i.image).map(i => i.image)
            if (fileIds.length > 0) {
                const tempRes = await cloud.getTempFileURL({ fileList: fileIds })
                const mapUrl = new Map()
                tempRes.fileList.forEach(f => mapUrl.set(f.fileID, f.tempFileURL))
                list.data.forEach(item => {
                    if (item.image && mapUrl.has(item.image)) {
                        item.image = mapUrl.get(item.image)
                    }
                })
            }
        }
        ctx.body = { data: list.data }
    })

    // 新增或更新成长记录
    app.router('saveGrowthRecord', async (ctx) => {
        const event = ctx.event || {}
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        const { petId, _id, weight, length, image } = event
        if (!openId || !petId) {
            ctx.body = { data: '参数错误' }
            return
        }

        if (_id) {
            await growthCollection.doc(_id).update({
                weight,
                length,
                image,
            })
        } else {
            await growthCollection.add({
                openId,
                petId,
                weight,
                length,
                image,
                recordDate: new Date()
            })
        }

        await petCollection.where({ openId, _id: petId }).update({
            weight,
            length,
        })

        ctx.body = { data: '更新成功' }
    })

    // 删除成长记录
    app.router('deleteGrowthRecord', async (ctx) => {
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { _id } = event
        if (_id) {
            try {
                const res = await growthCollection.doc(_id).remove()
                ctx.body = res
                return
            } catch (error) {
                console.error(error)
                ctx.body = { error: '删除失败' }
                return
            }
        }
        ctx.body = { data: '参数错误' }
    })
}
