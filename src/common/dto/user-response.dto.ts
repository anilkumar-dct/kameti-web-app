import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user', required: true })
  @Expose()
  _id: string;

  @ApiProperty({ description: 'The username of the user', required: true })
  @Expose()
  userName: string;

  @ApiProperty({ description: 'The email address of the user', required: true })
  @Expose()
  email: string;

  @ApiProperty({ description: 'The role assigned to the user', required: true })
  @Expose()
  role: string;

  @ApiProperty({
    description: 'The phone number of the user',
    required: false,
    nullable: true,
  })
  @Expose()
  phoneNumber?: string | null;

  @ApiProperty({
    description: 'The start date of the trial period',
    required: false,
    nullable: true,
  })
  @Expose()
  trailStartDate?: Date | null;

  @ApiProperty({
    description: 'The end date of the trial period',
    required: false,
    nullable: true,
  })
  @Expose()
  trailEndDate?: Date | null;
}
