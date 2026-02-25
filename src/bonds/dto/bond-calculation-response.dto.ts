import { IsNumber, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CashflowScheduleItemDto } from './cashflow-schedule-item.dto';

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
  @Type(() => CashflowScheduleItemDto)
  cashflows: CashflowScheduleItemDto[];
}
