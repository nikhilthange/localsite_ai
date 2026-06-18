import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import config from '../../../config';
import { Logger } from '../../../core/logging/Logger';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initialize(): void {
    if (config.email.provider === 'sendgrid') {
      sgMail.setApiKey(config.email.sendgridApiKey);
    } else {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.pass,
        },
      });
    }
  }

  static async send(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    const from = options.from || config.email.from;

    try {
      if (config.email.provider === 'sendgrid') {
        await sgMail.send({ to: options.to, from, subject: options.subject, html: options.html });
      } else {
        await this.transporter.sendMail({ from, to: options.to, subject: options.subject, html: options.html });
      }
      Logger.info('Email sent', { to: options.to, subject: options.subject });
    } catch (err) {
      Logger.error('Email send failed', { to: options.to, subject: options.subject, error: (err as Error).message });
      throw err;
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to LocalSite AI</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 16px;">Your AI-Powered Business Launch Platform</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #333;">Hi ${name},</p>
          <p style="font-size: 14px; color: #666; line-height: 1.6;">Welcome to LocalSite AI! Your account has been created successfully. You can now:</p>
          <ul style="font-size: 14px; color: #666; line-height: 2;">
            <li>Create your AI-powered website</li>
            <li>Generate custom logos and brand identity</li>
            <li>Track business growth with AI insights</li>
            <li>Capture leads and manage customers</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.client.url}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Get Started</a>
          </div>
        </div>
      </div>`;
    await this.send({ to: email, subject: 'Welcome to LocalSite AI!', html });
  }

  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const link = config.client.url + '/verify-email?token=' + token;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="color: #666;">Click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px;">Verify Email</a>
        </div>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>`;
    await this.send({ to: email, subject: 'Verify your email - LocalSite AI', html });
  }

  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = config.client.url + '/reset-password?token=' + token;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #666;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`;
    await this.send({ to: email, subject: 'Reset your password - LocalSite AI', html });
  }

  static async sendPaymentReceipt(data: { email: string; name: string; amount: number; plan: string }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Receipt</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for your payment of $${data.amount} for the ${data.plan} plan.</p>
      </div>`;
    await this.send({ to: data.email, subject: 'Payment Receipt - LocalSite AI', html });
  }

  static async sendWeeklyReport(data: { email: string; name: string; reportUrl: string; scores: any }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Weekly Business Report</h1>
          <p style="color: rgba(255,255,255,0.9);">Your AI-powered weekly analysis is ready</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="color: #333;">Hi ${data.name},</p>
          <p style="color: #666;">Your weekly business growth report is ready. View detailed insights, scores, and AI recommendations.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.reportUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Report</a>
          </div>
        </div>
      </div>`;
    await this.send({ to: data.email, subject: 'Your Weekly Business Report - LocalSite AI', html });
  }
}
