const nodemailer = require("nodemailer");

// sendEmail will use real SMTP when EMAIL_HOST/EMAIL_USER/EMAIL_PASS are set.
// Otherwise it falls back to an Ethereal test account and logs a preview URL.
let lastPreviewUrl = null;

const sendEmail = async ({ to, subject, text, html }) => {
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    let transporter;
    let isTest = false;

    if (host && user && pass) {
        transporter = nodemailer.createTransport({
            host,
            port,
            secure: port == 465,
            auth: { user, pass },
        });
    } else {
        // create Ethereal test account
        isTest = true;
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.warn("EMAIL_* not set — using Ethereal test account. Check preview URL in server logs.");
    }

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || user || "no-reply@example.com",
        to,
        subject,
        text,
        html,
    });

    if (isTest) {
        const preview = nodemailer.getTestMessageUrl(info);
        lastPreviewUrl = preview;
        console.log("Ethereal preview URL:", preview);
        return { preview };
    }

    // clear preview when using real SMTP
    lastPreviewUrl = null;
    return { messageId: info.messageId };
};

const getLastPreviewUrl = () => lastPreviewUrl;

module.exports = { sendEmail, getLastPreviewUrl };
