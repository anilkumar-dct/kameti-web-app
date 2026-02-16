import { PartialType } from "@nestjs/mapped-types";
import { AuthSignDto } from "src/modules/auth/dto/auth-sign.dto";

export class AdminUpdateDto extends PartialType(AuthSignDto) {

}