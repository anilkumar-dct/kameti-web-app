import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from '../../../common/entities/otp.entity';

/**
 * Service to manage OTP (One-Time Password) lifecycle.
 */
@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  /**
   * Generates a new 6-digit OTP for a given email.
   * Deletes any existing OTPs for the same email.
   * @param email - User's email address
   * @returns The generated 6-digit OTP string
   */
  async generateOtp(email: string): Promise<string> {
    // Remove old OTPs for this email to prevent confusion
    await this.otpModel.deleteMany({ email });

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the new OTP in the database
    await this.otpModel.create({
      email,
      otp,
    });

    return otp;
  }

  /**
   * Verifies an OTP provided by the user.
   * Marks the OTP as verified if valid.
   * @param email - User's email address
   * @param otp - The OTP string provided by the user
   * @returns Promise<boolean> true if verification is successful
   * @throws BadRequestException if OTP is invalid or expired
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.otpModel.findOne({ email });

    if (!storedOtp) {
      throw new BadRequestException(
        'OTP expired or not found. Please generate a new OTP.',
      );
    }

    if (storedOtp.otp !== otp) {
      throw new BadRequestException('Invalid OTP.');
    }

    // Mark as verified to allow password reset in the next step
    await this.otpModel.updateOne({ _id: storedOtp._id }, { isVerified: true });

    return true;
  }

  /**
   * Validates if an email has a verified OTP and consumes (deletes) it.
   * Used during the final password reset step.
   * @param email - User's email address
   * @throws BadRequestException if no verified OTP is found
   */
  async consumeOtp(email: string): Promise<void> {
    const verifiedOtp = await this.otpModel.findOne({
      email,
      isVerified: true,
    });

    if (!verifiedOtp) {
      throw new BadRequestException(
        'Please verify your OTP first before resetting the password.',
      );
    }

    // Delete OTP once it's used for its intended purpose
    await this.otpModel.deleteOne({ _id: verifiedOtp._id });
  }
}
