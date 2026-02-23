import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../../config/config.service';

/**
 * Service to handle email operations.
 */
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.smtpHost,
      port: this.configService.smtpPort,
      secure: this.configService.smtpSecure,
      auth: {
        user: this.configService.smtpUser,
        pass: this.configService.smtpPassword,
      },
    });
  }

  /**
   * Sends an OTP with context.
   * @param email - Recipient email address
   * @param otp - The 6-digit OTP code
   * @param subject - Email subject
   * @param message - Email message body
   */
  async sendOtp(
    email: string,
    otp: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"Kameti App" <${this.configService.smtpUser}>`,
      to: email,
      subject: subject,
      text: `${message} ${otp}. It will expire in 2 minutes.`,
      html: `<p>${message} <b>${otp}</b>. It will expire in 2 minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP sent to ${email} for ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}`, error);
      throw error;
    }
  }
}
