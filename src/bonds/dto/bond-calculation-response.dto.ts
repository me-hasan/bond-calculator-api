import { IsNumber, IsArray, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum CashflowType {
  COUPON = 'coupon',
  PRINCIPAL = 'principal',
}

export class Cashflow {
  @IsNumber()
  period: number;

  @IsString()
  @IsEnum(CashflowType)
  type: CashflowType;

  @IsNumber()
  amount: number;

  @IsNumber()
  presentValue: number;
}

export class BondCalculationResponseDto {
  @IsNumber()
  currentYield: number;

  @IsNumber()
  yieldToMaturity: number;

  @IsNumber()
  totalInterest: number;

  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Cashflow)
  cashflows: Cashflow[];
}
