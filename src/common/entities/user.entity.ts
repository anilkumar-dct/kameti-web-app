import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true, alias: 'user_name' })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({
    type: String,
    required: false,
    alias: 'phone_number',
    default: null,
  })
  phoneNumber: string | null;

  @Prop({ type: Date, required: false, alias: 'trail_start_date', default: null })
  trailStartDate: Date | null;

  @Prop({ type: Date, required: false, alias: 'trail_end_date', default: null })
  trailEndDate: Date | null;

}

export const UserSchema = SchemaFactory.createForClass(User);
