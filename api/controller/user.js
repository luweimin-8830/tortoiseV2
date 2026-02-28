const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('userInfo')

module.exports = (app) => {
    app.router('getUserInfo', async (ctx) => {
        const { OPENID } = cloud.getWXContext()
        if (!OPENID) {
            ctx.body = { error: '未获取到OPENID' }
            return
        }

        const { data } = await userCollection.where({ openid: OPENID }).get()

        if (data.length === 0) {
            await userCollection.add({
                openid: OPENID,
                created: db.serverDate(),
                lastLogin: db.serverDate(),
            })
        } else {
            const targetId = data[0]._id
            if (targetId) {
                await userCollection.doc(targetId).update({
                    data: { lastLogin: db.serverDate() }
                })
            }
        }

        ctx.body = { OPENID }
    })
}