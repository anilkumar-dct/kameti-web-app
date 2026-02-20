import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from '../../common/entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async generateOtp(email: string): Promise<string> {
    // Remove old OTPs for this email
    await this.otpModel.deleteMany({ email });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store new OTP
    await this.otpModel.create({
      email,
      otp,
    });

    return otp;
  }

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

    // Set as verified instead of deleting immediately
    await this.otpModel.updateOne({ _id: storedOtp._id }, { isVerified: true });

    return true;
  }

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

    // Delete OTP after it has been consumed for password reset
    await this.otpModel.deleteOne({ _id: verifiedOtp._id });
  }
}
