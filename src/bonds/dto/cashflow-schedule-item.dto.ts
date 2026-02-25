import { IsNumber, IsDateString } from 'class-validator';

/**
 * DTO for a single cashflow schedule item
 * Represents one period in the bond's cashflow schedule
 */
export class CashflowScheduleItemDto {
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