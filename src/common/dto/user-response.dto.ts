import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  _id: string;

  @Expose()
  userName: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  phoneNumber?: string | null;

  @Expose()
  trailStartDate?: Date | null;

  @Expose()
  trailEndDate?: Date | null;
}
