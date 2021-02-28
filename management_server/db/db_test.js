// 测试连接数据库
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/management', { useNewUrlParser: true, useUnifiedTopology: true })
const conn = mongoose.connection
conn.on('connected', function() {
    console.log('数据库连接成功。')
})
