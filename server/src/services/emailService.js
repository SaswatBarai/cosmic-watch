import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

export const sendRiskAlert = async (userEmail, username, asteroid) => {
  const mailOptions = {
    from: `"Cosmic Watch DSN" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🚨 CRITICAL ALERT: Asteroid ${asteroid.name} Approaching`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: white; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ff4d4d; border-bottom: 2px solid #ff4d4d; padding-bottom: 10px;">⚠️ Hazardous Approach Detected</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Our Deep Space Network has detected an object matching your risk criteria:</p>
        
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #38bdf8;">☄️ ${asteroid.name}</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Risk Score:</strong> <span style="color: #ff4d4d;">${asteroid.riskScore}/100</span></li>
            <li><strong>Velocity:</strong> ${parseFloat(asteroid.velocity).toLocaleString()} km/h</li>
            <li><strong>Miss Distance:</strong> ${parseFloat(asteroid.distance).toLocaleString()} km</li>
            <li><strong>Diameter:</strong> ${asteroid.diameter} m</li>
          </ul>
        </div>

        <p style="font-size: 12px; color: #94a3b8;">
          You received this email because your Alert Threshold is set to <strong>Risk Score > ${asteroid.riskScore}</strong>.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5173/dashboard" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Live Telemetry</a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};


export const sendOTPEmail = async (userEmail, username, otp) => {
  const mailOptions = {
    from: `"Perilux Security" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🔒 Your Password Reset Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: white; padding: 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 15px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 50%; margin-bottom: 15px;">
            <span style="font-size: 40px;">🔐</span>
          </div>
          <h2 style="color: #a855f7; margin: 0;">Password Reset Request</h2>
        </div>
        
        <p>Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your Perilux account password. Use the code below to proceed:</p>
        
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #7c3aed;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Your Reset Code</p>
          <h1 style="margin: 0; color: #a855f7; font-size: 48px; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b;">Valid for 10 minutes</p>
        </div>

        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 13px; color: #fbbf24;">⚠️ <strong>Security Notice:</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">If you didn't request this, ignore this email. Your password remains unchanged.</p>
        </div>

        <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b;">
          © ${new Date().getFullYear()} Perilux · Asteroid Tracking System
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ OTP email failed:', error);
    return false;
  }
};