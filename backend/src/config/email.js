const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset your password',

        text: `
You requested a password reset.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.
        `,

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Reset your password</h2>

                <p>
                    You requested a password reset for your account.
                </p>

                <p>
                    Click the button below to choose a new password:
                </p>

                <p>
                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 10px 18px;
                            background: #333;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in 15 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>
            </div>
        `,
    });
};

module.exports = {
    sendPasswordResetEmail,
};