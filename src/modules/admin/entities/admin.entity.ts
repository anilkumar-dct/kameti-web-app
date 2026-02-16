import { Prop, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { SchemaFactory } from "@nestjs/mongoose";

export type AdminDocument = HydratedDocument<Admin>;
@Schema({ timestamps: true })
export class Admin {

  @Prop({ required: true, alias: 'user_name' })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);