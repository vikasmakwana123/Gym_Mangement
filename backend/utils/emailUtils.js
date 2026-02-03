/**
 * Email utility for sending membership notifications
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send membership expiry notification email
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} packageType - The membership package type
 * @returns {Promise} Email send result
 */
export const sendMembershipExpiryEmail = async (email, name, packageType) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "⏰ Your Gym Membership Has Expired - Renewal Required",
    html: `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background-color: white; }
            .message { margin: 15px 0; font-size: 16px; }
            .action-button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Membership Expired</h1>
            </div>
            <div class="content">
              <p class="message">Hi <strong>${name}</strong>,</p>
              
              <p class="message">
                We noticed that your gym membership (${packageType}) has expired on <strong>${new Date().toLocaleDateString()}</strong>.
              </p>
              
              <p class="message">
                To continue enjoying our premium gym facilities and services, please renew your membership at your earliest convenience.
              </p>
              
              <p class="message">
                <strong>What happens next?</strong><br>
                Your membership access will be restricted until you renew your subscription.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" class="action-button">Renew Membership</a>
              </div>
              
              <p class="message" style="margin-top: 30px; color: #666;">
                If you have any questions or need assistance, please don't hesitate to contact us.
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Gym Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Expiry email sent to ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send membership renewal reminder email (before expiry)
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} packageType - The membership package type
 * @param {number} daysRemaining - Days remaining before expiry
 * @returns {Promise} Email send result
 */
export const sendReminderEmail = async (email, name, packageType, daysRemaining) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `⏱️ Your Gym Membership Expires in ${daysRemaining} Days - Renew Now`,
    html: `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background-color: white; }
            .message { margin: 15px 0; font-size: 16px; }
            .action-button { display: inline-block; background-color: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Membership Renewal Reminder</h1>
            </div>
            <div class="content">
              <p class="message">Hi <strong>${name}</strong>,</p>
              
              <p class="message">
                Your gym membership (${packageType}) will expire in <strong>${daysRemaining} days</strong>!
              </p>
              
              <p class="message">
                Don't miss out on uninterrupted access to our gym facilities. Renew your membership now to avoid any service interruption.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" class="action-button">Renew Your Membership</a>
              </div>
              
              <p class="message" style="margin-top: 30px; color: #666;">
                Have questions? Contact our support team for assistance.
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Gym Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending reminder email to ${email}:`, error);
    throw error;
  }
};

export default { sendMembershipExpiryEmail, sendReminderEmail };
