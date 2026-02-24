import { Controller, Post, Body, HttpCode, HttpStatus, UseFilters } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { BondCalculationDto } from './dto/bond-calculation.dto';
import { BondCalculationResponseDto } from './dto/bond-calculation-response.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('bond')
@UseFilters(HttpExceptionFilter)
export class BondsController {
  constructor(private readonly bondsService: BondsService) {}

  /**
   * Calculate bond metrics including current yield, YTM, total interest, and cashflows
   * POST /bond/calculate
   *
   * @param dto Bond calculation parameters
   * @returns Bond calculation results
   *
   * Status codes:
   * - 200 OK: Successful calculation
   * - 400 BAD_REQUEST: Validation errors in request body
   * - 422 UNPROCESSABLE_ENTITY: Business logic errors (invalid calculations)
   * - 500 INTERNAL_SERVER_ERROR: Unexpected server errors
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  calculateBond(
    @Body() dto: BondCalculationDto,
  ): BondCalculationResponseDto {
    return this.bondsService.calculateBond(dto);
  }

  /**
   * Generate detailed cashflow schedule
   * POST /bond/cashflow-schedule
   *
   * @param dto Bond calculation parameters
   * @returns Detailed cashflow schedule with dates
   */
  @Post('cashflow-schedule')
  @HttpCode(HttpStatus.OK)
  generateCashflowSchedule(@Body() dto: BondCalculationDto) {
    return this.bondsService.generateCashflowSchedule(dto);
  }
}
