import nodemailer from 'nodemailer';
import path from 'path';

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

export const sendEmail = async (to: string, subject: string, html: string, attachments: object[] = []) => {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
    const info = await transporter.sendMail({
      from: `"Our Store Bhutan" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
        ...attachments,
      ],
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Email error:', err);
    return { success: false, error: err.message };
  }
};

const getEmailTemplate = (content: string, title = 'Our Store Bhutan') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);">
              <tr style="background-color: #1a1a2e;">
                <td style="padding: 40px 30px; text-align: center;">
                  <img src="cid:logo" alt="Our Store Bhutan" style="width: 120px; height: auto; margin-bottom: 10px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Our Store Bhutan</h1>
                  <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 700; color: #FF6B35; text-transform: uppercase; letter-spacing: 2px;">Elevating Tech with Heart</p>
                </td>
              </tr>
              ${content}
              <tr>
                <td style="background: #1a1a2e; padding: 30px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px; font-weight: 600;">Our Store Bhutan</p>
                  <p style="margin: 0 0 15px 0; color: #a0a0a0; font-size: 14px;">Your trusted online shopping destination</p>
                  <p style="margin: 0; color: #808080; font-size: 12px;">
                    📧 tsirang@ourstore.tech<br>
                    📱 Contact us for any assistance
                  </p>
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
                    <p style="margin: 0; color: #666; font-size: 11px;">
                      Copyright &copy; [2022-2026] ourstore.tech. All rights reserved.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const sendOTPEmail = async (email: string, otp: string, purpose = 'verification') => {
  const subject = purpose === 'password-reset' ? 'Password Reset OTP' : 'Email Verification';
  const isPasswordReset = purpose === 'password-reset';

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #FF6B35 0%, #8B2635 100%); padding: 50px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">${isPasswordReset ? '🔐' : '✉️'}</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
          ${isPasswordReset ? 'Password Reset' : 'Verify Your Email'}
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 50px 40px;">
        <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          ${isPasswordReset ? 'Reset Your Password' : 'Welcome to Our Store! 🎉'}
        </h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          ${isPasswordReset
      ? 'We received a request to reset your password. Use the verification code below to proceed:'
      : 'Thank you for signing up! Please use the verification code below to confirm your email address:'}
        </p>
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 3px dashed #FF6B35; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Verification Code</p>
          <div style="font-size: 42px; font-weight: 800; color: #8B2635; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </div>
        </div>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
            ⏱️ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong> for security reasons.
          </p>
        </div>
        <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          If you didn't request this code, please ignore this email.
        </p>
      </td>
    </tr>
  `;

  return await sendEmail(email, subject, getEmailTemplate(content, subject));
};

export const sendOrderConfirmation = async (email: string, order: { orderNumber: string; createdAt: Date; total: number; orderStatus?: string }) => {
  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Order Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with us</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 50px 40px;">
        <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Your order is confirmed! 🛍️</h2>
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #dee2e6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;"><span style="color: #6c757d; font-size: 14px;">Order Number</span></td>
              <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #dee2e6;"><span style="color: #1a1a2e; font-size: 16px; font-weight: 700;">${order.orderNumber}</span></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;"><span style="color: #6c757d; font-size: 14px;">Order Date</span></td>
              <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #dee2e6;"><span style="color: #1a1a2e; font-size: 16px; font-weight: 600;">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><span style="color: #6c757d; font-size: 14px;">Total Amount</span></td>
              <td style="padding: 12px 0; text-align: right;"><span style="color: #10b981; font-size: 24px; font-weight: 800;">Nu. ${order.total.toFixed(2)}</span></td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #8B2635 100%); color: white; padding: 12px 30px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            📦 ${order.orderStatus || 'Processing'}
          </span>
        </div>
      </td>
    </tr>
  `;

  return await sendEmail(email, `Order Confirmation - ${order.orderNumber}`, getEmailTemplate(content, 'Order Confirmed'));
};

export const sendOrderStatusUpdate = async (email: string, order: any) => {
  const statusConfig: Record<string, { color: string; emoji: string; gradient: string }> = {
    Processing: { color: '#3b82f6', emoji: '⚙️', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    Shipped: { color: '#8b5cf6', emoji: '🚚', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
    Delivered: { color: '#10b981', emoji: '✅', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    Cancelled: { color: '#ef4444', emoji: '❌', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  };

  const status = order.orderStatus || 'Processing';
  const config = statusConfig[status] || statusConfig['Processing'];

  let content = `
    <tr>
      <td style="background: ${config.gradient}; padding: 50px 30px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 10px;">${config.emoji}</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Order ${status}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your order status has been updated</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 50px 40px;">
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #dee2e6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;"><span style="color: #6c757d; font-size: 14px;">Order Number</span></td>
              <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #dee2e6;"><span style="color: #1a1a2e; font-size: 16px; font-weight: 700;">${order.orderNumber}</span></td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><span style="color: #6c757d; font-size: 14px;">Current Status</span></td>
              <td style="padding: 12px 0; text-align: right;"><span style="display: inline-block; background: ${config.color}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">${config.emoji} ${status}</span></td>
            </tr>
            ${order.trackingNumber ? `<tr><td style="padding: 12px 0;"><span style="color: #6c757d; font-size: 14px;">Tracking Number</span></td><td style="padding: 12px 0; text-align: right;"><span style="color: #1a1a2e; font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace;">${order.trackingNumber}</span></td></tr>` : ''}
          </table>
        </div>
      </td>
    </tr>
  `;

  if (status === 'Shipped') {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <div style="font-weight: 600; color: #1a1a2e;">${item.title || (item.productId?.title)}</div>
          <div style="font-size: 12px; color: #666;">Qty: ${item.quantity} × Nu. ${item.price.toFixed(2)}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #eee; font-weight: 700; color: #1a1a2e;">
          Nu. ${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    content += `
      <tr>
        <td style="padding: 0 40px 50px 40px;">
          <h3 style="color: #1a1a2e; font-size: 18px; font-weight: 700; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35; display: inline-block;">Order Invoice</h3>
          
          <div style="background: #ffffff; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="text-align: left; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: 10px;">Item Details</th>
                  <th style="padding-bottom: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 15px 0 5px 0; text-align: right; color: #666; font-size: 14px;">Subtotal</td>
                  <td style="padding: 15px 0 5px 0; text-align: right; color: #1a1a2e; font-weight: 600;">Nu. ${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; text-align: right; color: #666; font-size: 14px;">Shipping Fee</td>
                  <td style="padding: 5px 0; text-align: right; color: #1a1a2e; font-weight: 600;">Nu. ${order.shippingFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; text-align: right; color: #1a1a2e; font-weight: 800; font-size: 18px;">Total Paid</td>
                  <td style="padding: 15px 0; text-align: right; color: #FF6B35; font-weight: 900; font-size: 22px;">Nu. ${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #fdf2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #FF6B35;">
            <h4 style="margin: 0 0 10px 0; color: #8B2635; font-size: 14px; text-transform: uppercase;">Delivery Address</h4>
            <div style="color: #4a4a4a; font-size: 14px; line-height: 1.5;">
              <strong>${order.shippingAddress.fullName}</strong><br>
              ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `<br>${order.shippingAddress.addressLine2}` : ''}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.dzongkhag}<br>
              Phone: ${order.shippingAddress.phone}
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  return await sendEmail(email, `Order Update - ${order.orderNumber}`, getEmailTemplate(content, `Order ${status}`));
};
