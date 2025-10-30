import { IsInt, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}

export class CheckOutDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}

export class BackupAttendanceDto {
  @IsInt()
  @IsOptional()
  year?: number;
}
