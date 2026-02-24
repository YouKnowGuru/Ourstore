import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testEmail() {
    console.log('--- Email Configuration Test ---');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('Port:', process.env.EMAIL_PORT || 587);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Error: EMAIL_USER or EMAIL_PASSWORD not found in .env.local');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Test Email from Our Store',
            text: 'If you are reading this, your email configuration is correct!',
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error: any) {
        console.error('❌ Email test failed:');
        if (error.code === 'EAUTH') {
            console.error('AUTHENTICATION ERROR: The username or password was rejected.');
            console.error('Recommendation: If using Gmail, ensure you are using an "App Password", not your regular account password.');
            console.error('Link: https://myaccount.google.com/apppasswords');
        }
        console.error('Full error details:', error);
    }
}

testEmail();
