import { Exclude, Expose } from "class-transformer";

@Exclude()
export class AdminResponseDto {

    @Expose()
    _id: object;

    @Expose()
    userName: string;

    @Expose()
    email: string;

}