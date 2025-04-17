const express = require('express');
const { User, Email_Verification } = require('../models');
const { v4: uuidV4 } = require('uuid');
const bcrypt = require('bcrypt');
const sendVerificationEmail = require('../utils/email');
const ApiResponse = require('../utils/ApiResponse');
const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

router.post('/email/availability', async (req, res) => {
    const email = req.query.email || req.body.email;

    if (!email) {
        return res.status(400).json(ApiResponse.error('이메일이 필요합니다.'));
    } else if (!emailRegex.test(email)) {
        return res.status(400).json(ApiResponse.error('유효한 이메일 형식이 아닙니다.'));
    }

    try {
        const user = await User.findOne({
            where: { email }
        });
        if (user) {
            return res.status(200).json(ApiResponse.success('이미 사용 중인 이메일입니다.', { available: false }));
        } else {
            return res.status(200).json(ApiResponse.success('사용 가능한 이메일입니다.', { available: true }));
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json(ApiResponse.error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    }
});

// 회원가입
router.post('/', async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json(ApiResponse.error('지원하지 않는 Content-Type 입니다.'));
    }

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json(ApiResponse.error('요청 형식이 잘못되었습니다.'));
    }

    const { email, password } = req.body;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json(ApiResponse.error('유효한 이메일 형식이 아닙니다.'));
    }

    if (typeof email !== 'string') {
        return res.status(400).json(ApiResponse.error('이메일은 문자열이어야 합니다.'));
    }

    const exUser = await User.findOne({
        where: {
            email: req.body.email,
        }
    });

    if (exUser && exUser.isEmailVerified === false) {
        return res.status(400).json(ApiResponse.error('인증을 완료해주세요.'));
    } else if (exUser) {
        return res.status(403).json(ApiResponse.error('이미 사용 중인 이메일입니다.'));
    }

    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json(ApiResponse.error('비밀번호는 8~16자이며, 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.'));
    }

    if (typeof password !== 'string') {
        return res.status(400).json(ApiResponse.error('비밀번호는 문자열이어야 합니다.'));
    }

    if (password.length < 8) {
        return res.status(400).json(ApiResponse.error('비밀번호는 최소 8자 이상이어야 합니다.'));
    }

    // 비밀번호가 100자를 초과하는지 확인
    if (password.length > 100) {
        return res.status(400).json(ApiResponse.error('비밀번호는 100자 이하입니다.'));
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 13);
        const token = uuidV4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const user = await User.create({
            email: email,
            password: hashedPassword,
            nickname: req.body.nickname,
            isEmailVerified: false
        });

        await Email_Verification.create({
            token: token,
            expiresAt: expiresAt,
            UserId: user.id
        });

        await sendVerificationEmail(email, token);

        return res.status(200).json(ApiResponse.success('회원가입이 완료되었습니다. 인증 이메일을 확인해주세요.'));
    } catch (e) {
        console.error(e);
        if (e.name === 'SequelizeValidationError') {
            return res.status(400).json(ApiResponse.error(e.errors[0].message));
        }
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json(ApiResponse.error('이미 사용 중인 이메일입니다.'));
        }
        return res.status(500).json(ApiResponse.error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    }
});

router.get('/email/verifications', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json(ApiResponse.error('토큰이 없습니다.'));
    }

    try {
        const record = await Email_Verification.findOne({
            where: { token },
            include: [User]
        });


        if (!record || record.dataValues.verified) {
            return res.status(404).json(ApiResponse.error('유효하지 않은 토큰입니다.'));
        }

        // 인증 처리
        record.verified = true;
        await record.save();

        return res.status(200).json(ApiResponse.success('이메일 인증이 완료되었습니다.'));
    } catch (err) {
        console.error(err);
        return res.status(500).json(ApiResponse.error('서버 오류가 발생했습니다.'));
    }
});


module.exports = router;