const express = require('express');
const cors = require('cors');
const passportConfig = require('./passport');
const userRouter = require('./routes/user.js');
const authRouter = require('./routes/auth.js');
const postRouter = require('./routes/post.js');
const db = require('./models');
const app = express();

db.sequelize.sync()
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch(console.error);

passportConfig();

app.use(cors({
    origin: '*',
    credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);

app.get('/', (req, res) => {
    res.send('hello express');
})

app.listen(8080, () => {
    console.log('서버 8080 포트 실행 중');
});