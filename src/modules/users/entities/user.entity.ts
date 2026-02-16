import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true, alias: 'user_name' })
  userName: string;

  @Prop({ required: true, unique: true, alias: 'email' })
  email: string;

  @Prop({ type: [String], unique: true, default: [], alias: 'sub_emails' })
  subEmails: string[] ;

  @Prop({ required: false, alias: 'phone_number', unique: true })
  phoneNumber: string;

  @Prop({required: true, alias: 'trail_start_date', default: Date.now()})
  trailStartDate: Date;

  @Prop({required: true, alias: 'trail_end_date', default: Date.now() + 30 * 24 * 60 * 60 * 1000})
  trailEndDate: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);
