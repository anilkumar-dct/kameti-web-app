import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({
    required: true,
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
    index: { expires: '0s' }, // TTL index: document expires at this date
  })
  expiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
