const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_EMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: '이메일 인증 요청',
        text: `아래 링크를 누르면 인증이 완료 됩니다. 인증 링크는 1시간 후에 만료됩니다.\n http://localhost:8080/users/verifications/?token=${token}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`${email} 주소로 인증 메일 전송 성공`);
    } catch (error) {
        console.error('이메일 전송 실패: ', error);
    }
}

module.exports = sendVerificationEmail;