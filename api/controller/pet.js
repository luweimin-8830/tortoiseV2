const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const petCollection = db.collection('petInformation')
const operationCollection = db.collection('operation')
const growthRecordCollection = db.collection('growthRecord')

module.exports = (app) => {
    // 获取宠物列表
    app.router('getPetList', async (ctx) => {
      const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        const { title } = event
        if (!openId) {
            ctx.body = { data: [], error: '参数错误' }
            return
        }

        const query = { openId, status: 1 }
        if (title) query.Classification = title

        const res = await petCollection.where(query).get()
        const now = Date.now()

        if (res.data.length > 0) {
            for (let i = 0; i < res.data.length; i++) {
                const item = res.data[i]
                const timeDiff = Math.abs(now - item.birthday)
                const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                item.days = dayDiff
                item.water = 0
                item.shi = 0

                const waterList = await operationCollection.where({ openId, petId: item._id, operation: '换水' })
                    .orderBy('operationDate', 'desc').limit(1).get()
                const feedList = await operationCollection.where({ openId, petId: item._id, operation: '喂食' })
                    .orderBy('operationDate', 'desc').limit(1).get()

                if (waterList.data.length > 0) {
                    const time = Math.abs(now - waterList.data[0].operationDate)
                    const day = Math.ceil(time / (1000 * 60 * 60 * 24))
                    item.water = day - 1
                }
                if (feedList.data.length > 0) {
                    const time = Math.abs(now - feedList.data[0].operationDate)
                    const day = Math.ceil(time / (1000 * 60 * 60 * 24))
                    item.shi = day - 1
                }
            }
        }

        ctx.body = res
    })

    // 新增或更新宠物
    app.router('savePet', async (ctx) => {
      const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { OPENID } = cloud.getWXContext()
        const openId = OPENID
        
        // 校验必填字段
        if (!event.name) {
            ctx.body = { error: '名称不能为空', code: -1 }
            return
        }

        const today = new Date().toISOString().split('T')[0] // 默认今天
        if (event.flag == 0) {
            // 新增逻辑
            try {
                const addRes = await petCollection.add({
                    data: {
                        openId: openId,
                        weight: parseFloat(event.weight) || 0,
                        length: parseFloat(event.length) || 0,
                        name: event.name,
                        variety: event.variety || '',
                        sex: event.sex || 0,
                        Classification: event.Classification || '',
                        feedCycle: null,
                        content: event.content || '',
                        birthday: new Date(event.birthday || today),
                        photo: event.photo || '',
                        status: 1,
                        createTime: new Date()
                    }
                })

                // 仅在新建时插入一条成长记录
                if (addRes._id) {
                    await growthRecordCollection.add({
                        data: {
                            openId: openId,
                            petId: addRes._id,
                            weight: parseFloat(event.weight) || 0,
                            length: parseFloat(event.length) || 0,
                            createdAt: new Date(),
                            image: event.photo || '',
                            recordDate: new Date()
                        }
                    })
                }
                ctx.body = { data: '新建成功', id: addRes._id, code: 0 }
            } catch (err) {
                console.error(err)
                ctx.body = { error: '新建失败', code: -1 }
            }
        } else if (event._id && event.flag == 1) {
            // 更新逻辑
            try {
                await petCollection.doc(event._id).update({
                    data: {
                        weight: parseFloat(event.weight) || 0,
                        length: parseFloat(event.length) || 0,
                        name: event.name,
                        variety: event.variety || '',
                        sex: event.sex || 0,
                        Classification: event.Classification || '',
                        feedCycle: null,
                        content: event.content || '',
                        birthday: new Date(event.birthday || today),
                        photo: event.photo || ''
                    }
                })
                // 更新时不再插入成长记录
                ctx.body = { data: '更新成功', code: 0 }
            } catch (err) {
                console.error(err)
                ctx.body = { error: '更新失败', code: -1 }
            }
        } else {
            ctx.body = { error: '参数错误', code: -1 }
        }
    })

    // 删除宠物
    app.router('deletePet', async (ctx) => {
      const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        const { _id } = event
        if (_id) {
            try {
                const res = await petCollection.doc(_id).remove()
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

    // 获取宠物详情
    app.router('getPetDetail', async (ctx) => {
        // ctx.event 包含前端传来的所有参数，通常是 { $url: '...', ...data }
        // 注意：如果前端 callApi 的实现是将数据包裹在 data 字段中，则需调整解构方式
        // 假设 ctx.event 直接就是参数对象
        console.log('CTX内容:', ctx)
        const event = (ctx._req && ctx._req.event) ? ctx._req.event : (ctx.event || ctx);
        let _id = event._id
        
        // 兼容某些框架或调用方式将参数放在 data 字段的情况
        if (!_id && event.data && event.data._id) {
            _id = event.data._id
        }

        // 1. 参数校验
        if (!_id) {
            ctx.body = { 
                code: -1001, 
                error: '参数错误：缺少必要的宠物ID', 
                suggestion: '请确保在请求中传入了有效的 _id 参数' 
            }
            return
        }

        try {
            const res = await petCollection.doc(_id).get()
            const pet = res.data

            // 计算陪伴天数
            if (pet.birthday) {
                const now = Date.now()
                const birthday = new Date(pet.birthday).getTime()
                const timeDiff = Math.abs(now - birthday)
                const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                pet.days = dayDiff
            }
            
            ctx.body = { data: pet, code: 0, msg: '获取成功' }
        } catch (e) {
            console.error('[getPetDetail] Error:', e)
            
            // 区分错误类型：文档不存在
            // 云开发数据库 doc().get() 若找不到记录通常会抛出错误
            if (e.errCode === -1 || (e.errMsg && e.errMsg.includes('document.get:fail')) || (e.message && e.message.includes('document not exist'))) {
                 ctx.body = { 
                    code: 404, 
                    error: '未找到该宠物信息', 
                    suggestion: '该宠物可能已被删除，请返回列表刷新重试' 
                }
            } else {
                ctx.body = { 
                    code: -500, 
                    error: '系统异常：获取详情失败', 
                    suggestion: '请稍后重试或联系管理员' 
                }
            }
        }
    })
}
