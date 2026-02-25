import { Injectable, Logger } from '@nestjs/common';
import { BondCalculationDto } from './dto/bond-calculation.dto';
import { BondCalculationResponseDto } from './dto/bond-calculation-response.dto';
import { CashflowScheduleItemDto } from './dto/cashflow-schedule-item.dto';

@Injectable()
export class BondsService {
  private readonly logger = new Logger(BondsService.name);

  /**
   * Calculate bond metrics including current yield, YTM, total interest, status, and detailed cashflow schedule
   * @param dto Bond calculation parameters
   * @returns Bond calculation results with detailed cashflow schedule
   */
  calculateBond(dto: BondCalculationDto): BondCalculationResponseDto {
    this.logger.log(`[calculateBond] Starting calculation with DTO: ${JSON.stringify(dto)}`);

    const {
      faceValue,
      couponRate,
      marketPrice,
      yearsToMaturity,
      frequency,
      yieldToMaturity: providedYtm,
    } = dto;

    this.logger.log(`[calculateBond] Extracted values - faceValue: ${faceValue}, couponRate: ${couponRate}, marketPrice: ${marketPrice}, yearsToMaturity: ${yearsToMaturity}, frequency: ${frequency}`);

    // Calculate periodic values
    const periodicCouponRate = couponRate / 100 / frequency;
    const couponPayment = faceValue * periodicCouponRate;
    const totalPeriods = Math.ceil(yearsToMaturity * frequency);
    const annualCoupon = couponPayment * frequency;

    this.logger.log(`[calculateBond] Calculated - periodicCouponRate: ${periodicCouponRate}, couponPayment: ${couponPayment}, totalPeriods: ${totalPeriods}`);

    // Calculate Current Yield: (annualCoupon / marketPrice) * 100
    const currentYield = (annualCoupon / marketPrice) * 100;
    this.logger.log(`[calculateBond] Current yield: ${currentYield}`);

    // Calculate YTM (if not provided)
    const yieldToMaturity = providedYtm
      ? providedYtm
      : this.calculateYTM(marketPrice, faceValue, couponRate, yearsToMaturity, frequency);

    this.logger.log(`[calculateBond] Yield to maturity: ${yieldToMaturity}`);

    // Calculate total interest: annualCoupon * yearsToMaturity
    const totalInterest = annualCoupon * yearsToMaturity;

    // Determine bond status: Premium, Discount, or Par
    const status = marketPrice > faceValue ? 'Premium' : marketPrice < faceValue ? 'Discount' : 'Par';
    this.logger.log(`[calculateBond] Bond status: ${status}, Total interest: ${totalInterest}`);

    // Generate detailed cashflow schedule
    const cashflows = this.generateCashflowSchedule(
      faceValue,
      couponPayment,
      totalPeriods,
      frequency,
    );

    this.logger.log(`[calculateBond] Generated ${cashflows.length} cashflow schedule items`);

    const result: BondCalculationResponseDto = {
      currentYield,
      yieldToMaturity,
      totalInterest,
      status,
      cashflows,
    };

    this.logger.log(`[calculateBond] Calculation complete.`);

    return result;
  }

  /**
   * Calculate Yield to Maturity using approximation formula
   * YTM = ((annualCoupon + (faceValue - marketPrice) / years) / ((faceValue + marketPrice) / 2)) * 100
   */
  private calculateYTM(
    price: number,
    faceValue: number,
    couponRate: number,
    years: number,
    _frequency: number,
  ): number {
    const annualCoupon = (faceValue * couponRate / 100);

    // Approximation formula
    const ytm = ((annualCoupon + (faceValue - price) / years) / ((faceValue + price) / 2)) * 100;

    return ytm;
  }

  /**
   * Generate detailed cashflow schedule
   * - Correct number of periods based on frequency (annual × 1, semi-annual × 2, quarterly × 4, monthly × 12)
   * - Coupon payments per period
   * - Accumulated interest across periods
   * - Payment dates based on frequency
   * - Constant remaining principal until maturity
   */
  private generateCashflowSchedule(
    faceValue: number,
    couponPayment: number,
    totalPeriods: number,
    frequency: number,
  ): CashflowScheduleItemDto[] {
    const cashflows: CashflowScheduleItemDto[] = [];
    const startDate = new Date();

    // Calculate months per period based on frequency
    const monthsPerPeriod = 12 / frequency;

    let cumulativeInterest = 0;

    for (let period = 1; period <= totalPeriods; period++) {
      // Accumulate interest (coupon payments)
      cumulativeInterest += couponPayment;

      // Generate payment date based on period and frequency
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + Math.floor(monthsPerPeriod * period));

      // Remaining principal stays constant until final period
      const remainingPrincipal = period === totalPeriods ? 0 : faceValue;

      cashflows.push({
        period,
        paymentDate: paymentDate.toISOString(),
        couponPayment,
        cumulativeInterest,
        remainingPrincipal,
      });
    }

    return cashflows;
  }
}
