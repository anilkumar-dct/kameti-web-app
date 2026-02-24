import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from '../../../common/entities/otp.entity';
import { OtpType } from '../enums/otp-type';

/**
 * Service to manage OTP (One-Time Password) lifecycle.
 */
@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  /**
   * Generates a new 6-digit OTP for a given email and type.
   * Deletes any existing OTPs of the SAME type for the same email.
   * @param email - User's email address
   * @param type - Purpose of the OTP
   * @returns The generated 6-digit OTP string
   */
  async generateOtp(email: string, type: OtpType): Promise<string> {
    // Remove old OTPs of the same type for this email to prevent confusion
    await this.otpModel.deleteMany({ email, type });

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the new OTP in the database
    await this.otpModel.create({
      email,
      otp,
      type,
    });

    return otp;
  }

  /**
   * Verifies an OTP provided by the user for a specific type.
   * Marks the OTP as verified if valid.
   * @param email - User's email address
   * @param otp - The OTP string provided by the user
   * @param type - Expected purpose of the OTP
   * @returns Promise<boolean> true if verification is successful
   * @throws BadRequestException if OTP is invalid or expired
   */
  async verifyOtp(email: string, otp: string, type: OtpType): Promise<boolean> {
    const storedOtp = await this.otpModel.findOne({
      email,
      type,
      isVerified: false,
    });

    if (!storedOtp) {
      throw new BadRequestException(
        'OTP expired or not found. Please generate a new OTP.',
      );
    }

    if (storedOtp.otp !== otp) {
      throw new BadRequestException('Invalid OTP.');
    }

    // Mark as verified
    await this.otpModel.updateOne({ _id: storedOtp._id }, { isVerified: true });

    return true;
  }

  /**
   * Validates if an email has a verified OTP of a specific type and consumes (deletes) it.
   * @param email - User's email address
   * @param type - Purpose of the OTP
   * @throws BadRequestException if no verified OTP is found
   */
  async consumeOtp(email: string, type: OtpType): Promise<void> {
    const verifiedOtp = await this.otpModel.findOne({
      email,
      type,
      isVerified: true,
    });

    console.log(verifiedOtp);
    if (!verifiedOtp) {
      throw new BadRequestException(
        `Please verify your OTP first for ${type.toLowerCase()}.`,
      );
    }

    // Delete OTP once it's used
    await this.otpModel.deleteOne({ _id: verifiedOtp._id });
  }
}
