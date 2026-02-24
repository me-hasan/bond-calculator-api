import {
  IsNumber,
  IsDate,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CashflowRowDto {
  @IsNumber()
  period: number;

  @IsDateString()
  paymentDate: string;

  @IsNumber()
  couponPayment: number;

  @IsNumber()
  cumulativeInterest: number;

  @IsNumber()
  remainingPrincipal: number;
}
