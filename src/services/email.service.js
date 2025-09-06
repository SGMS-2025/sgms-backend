const nodemailer = require('nodemailer');
const { createAppError } = require('../common/error');
const { ERROR_MESSAGES } = require('../utils/constants');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Always use real SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('❌ SMTP configuration error:', error);
      } else {
        logger.info('✅ SMTP server is ready to take our messages');
      }
    });
  }

  async sendOTPEmail(email, otpCode, fullName = 'User') {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sgms.com',
        to: email,
        subject: 'SGMS - Xác thực đăng ký tài khoản',
        html: this.generateOTPEmailTemplate(fullName, otpCode),
        text: this.generateOTPEmailText(fullName, otpCode),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('✅ OTP email sent successfully', {
        to: email,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('❌ Failed to send OTP email:', error);
      throw createAppError.internalServerError(ERROR_MESSAGES.EMAIL_SEND_FAILED);
    }
  }

  generateOTPEmailTemplate(fullName, otpCode) {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực đăng ký - SGMS</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .otp-code {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏋️‍♂️ SGMS</div>
            <h1>Xác thực đăng ký tài khoản</h1>
          </div>
          
          <p>Xin chào <strong>${fullName}</strong>,</p>
          
          <p>Cảm ơn bạn đã đăng ký tài khoản tại SGMS (Smart Gym Management System).</p>
          
          <p>Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP sau:</p>
          
          <div class="otp-code">${otpCode}</div>
          
          <div class="warning">
            <strong>⚠️ Lưu ý quan trọng:</strong>
            <ul>
              <li>Mã OTP này có hiệu lực trong <strong>10 phút</strong></li>
              <li>Không chia sẻ mã này với bất kỳ ai</li>
              <li>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này</li>
            </ul>
          </div>
          
          <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi.</p>
          
          <div class="footer">
            <p>Trân trọng,<br>Đội ngũ SGMS</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateOTPEmailText(fullName, otpCode) {
    return `
SGMS - Xác thực đăng ký tài khoản

Xin chào ${fullName},

Cảm ơn bạn đã đăng ký tài khoản tại SGMS (Smart Gym Management System).

Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP sau:

${otpCode}

Lưu ý quan trọng:
- Mã OTP này có hiệu lực trong 10 phút
- Không chia sẻ mã này với bất kỳ ai
- Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này

Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ SGMS

Email này được gửi tự động, vui lòng không trả lời.
    `;
  }

  async sendWelcomeEmail(email, fullName) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sgms.com',
        to: email,
        subject: 'Chào mừng đến với SGMS!',
        html: this.generateWelcomeEmailTemplate(fullName),
        text: this.generateWelcomeEmailText(fullName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('✅ Welcome email sent successfully', {
        to: email,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('❌ Failed to send welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }

  async sendPasswordResetOTP(email, otpCode, userEmail) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sgms.com',
        to: email,
        subject: 'SGMS - Đặt lại mật khẩu',
        html: this.generatePasswordResetEmailTemplate(userEmail, otpCode),
        text: this.generatePasswordResetEmailText(userEmail, otpCode),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('✅ Password reset OTP email sent successfully', {
        to: email,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('❌ Failed to send password reset OTP email:', error);
      throw createAppError.internalServerError(ERROR_MESSAGES.EMAIL_SEND_FAILED);
    }
  }

  generateWelcomeEmailTemplate(fullName) {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng đến với SGMS</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .success {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏋️‍♂️ SGMS</div>
            <h1>Chào mừng đến với SGMS!</h1>
          </div>
          
          <div class="success">
            <strong>🎉 Chúc mừng!</strong> Tài khoản của bạn đã được tạo thành công.
          </div>
          
          <p>Xin chào <strong>${fullName}</strong>,</p>
          
          <p>Chào mừng bạn đến với SGMS (Smart Gym Management System) - hệ thống quản lý phòng gym thông minh!</p>
          
          <p>Với tài khoản của bạn, bạn có thể:</p>
          <ul>
            <li>Đặt lịch tập luyện</li>
            <li>Theo dõi tiến độ tập luyện</li>
            <li>Quản lý thông tin cá nhân</li>
            <li>Và nhiều tính năng khác...</li>
          </ul>
          
          <p>Hãy bắt đầu hành trình fitness của bạn ngay hôm nay!</p>
          
          <div class="footer">
            <p>Trân trọng,<br>Đội ngũ SGMS</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeEmailText(fullName) {
    return `
Chào mừng đến với SGMS!

🎉 Chúc mừng! Tài khoản của bạn đã được tạo thành công.

Xin chào ${fullName},

Chào mừng bạn đến với SGMS (Smart Gym Management System) - hệ thống quản lý phòng gym thông minh!

Với tài khoản của bạn, bạn có thể:
- Đặt lịch tập luyện
- Theo dõi tiến độ tập luyện
- Quản lý thông tin cá nhân
- Và nhiều tính năng khác...

Hãy bắt đầu hành trình fitness của bạn ngay hôm nay!

Trân trọng,
Đội ngũ SGMS

Email này được gửi tự động, vui lòng không trả lời.
    `;
  }

  generatePasswordResetEmailTemplate(userEmail, otpCode) {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu - SGMS</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
          }
          .otp-code {
            background-color: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏋️‍♂️ SGMS</div>
            <h1>Đặt lại mật khẩu</h1>
          </div>
          
          <p>Xin chào,</p>
          
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${userEmail}</strong>.</p>
          
          <p>Để đặt lại mật khẩu, vui lòng sử dụng mã OTP sau:</p>
          
          <div class="otp-code">${otpCode}</div>
          
          <div class="warning">
            <strong>⚠️ Lưu ý quan trọng:</strong>
            <ul>
              <li>Mã OTP này có hiệu lực trong <strong>10 phút</strong></li>
              <li>Không chia sẻ mã này với bất kỳ ai</li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              <li>Tài khoản của bạn vẫn an toàn</li>
            </ul>
          </div>
          
          <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi.</p>
          
          <div class="footer">
            <p>Trân trọng,<br>Đội ngũ SGMS</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailText(userEmail, otpCode) {
    return `
SGMS - Đặt lại mật khẩu

Xin chào,

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ${userEmail}.

Để đặt lại mật khẩu, vui lòng sử dụng mã OTP sau:

${otpCode}

Lưu ý quan trọng:
- Mã OTP này có hiệu lực trong 10 phút
- Không chia sẻ mã này với bất kỳ ai
- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này
- Tài khoản của bạn vẫn an toàn

Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ SGMS

Email này được gửi tự động, vui lòng không trả lời.
    `;
  }
}

module.exports = new EmailService();
