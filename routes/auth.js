const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Email_Verification } = require('../models');
const ApiResponse = require("../utils/ApiResponse");

const router = express.Router();
const secret = `${process.env.JWT_SECRET}`;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { email },
            include: [Email_Verification]
        });

        if (!user) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        }

        if (!user.Email_Verification.dataValues.verified) {
            return res.status(401).json({ message: '인증을 완료해주세요.' })
        }

        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        return res.status(200).json(ApiResponse.success('로그인 성공', { token }));
    } catch (e) {
        console.error(e);
        return res.json(ApiResponse.error(e.message));
    }
});

module.exports = router;