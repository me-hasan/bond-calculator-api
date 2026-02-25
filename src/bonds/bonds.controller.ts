import { Controller, Post, Body, HttpCode, HttpStatus, UseFilters, Logger } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { BondCalculationDto } from './dto/bond-calculation.dto';
import { BondCalculationResponseDto } from './dto/bond-calculation-response.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('bond')
@UseFilters(HttpExceptionFilter)
export class BondsController {
  private readonly logger = new Logger(BondsController.name);

  constructor(private readonly bondsService: BondsService) {}

  /**
   * Calculate bond metrics including current yield, YTM, total interest, status, and detailed cashflow schedule
   * POST /bond/calculate
   *
   * @param dto Bond calculation parameters
   * @returns Bond calculation results with detailed cashflow schedule
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
    this.logger.log(`[calculateBond] Received request. DTO: ${JSON.stringify(dto)}`);

    try {
      const result = this.bondsService.calculateBond(dto);
      this.logger.log(`[calculateBond] Successfully calculated result`);
      return result;
    } catch (error) {
      this.logger.error(`[calculateBond] Error during calculation: ${error}`);
      throw error;
    }
  }
}
