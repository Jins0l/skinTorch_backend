const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');

exports.isLoggedIn = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(ApiResponse.error('인증이 필요합니다.'))
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        console.error(e);
        return res.status(401).json(ApiResponse.error('유효하지 않은 토큰입니다.'));
    }
}