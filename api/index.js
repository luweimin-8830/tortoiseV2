const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const cloudbase = require("@cloudbase/node-sdk")
const userRouter = require('./controller/user')
const petRouter = require('./controller/pet')
const classRouter = require('./controller/class')
const recordRouter = require('./controller/record')
const imageRouter = require('./controller/image')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const cbApp = cloudbase.init({
    env: "cloud1-5gi2oim70d96d538"
})
const db = cbApp.database()

exports.main = async (event, context) => {
    if (event.Type === 'Timer' || event.triggerName === 'keep-warm') {
        return { msg: 'I am warm now!' }
    }
    const app = new TcbRouter({ event })

    userRouter(app)
    petRouter(app)
    classRouter(app)
    recordRouter(app)
    imageRouter(app)

    return app.serve()
}