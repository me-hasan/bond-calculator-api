import { Injectable } from '@nestjs/common';
import { BondCalculationDto } from './dto/bond-calculation.dto';
import { BondCalculationResponseDto, Cashflow, CashflowType } from './dto/bond-calculation-response.dto';
import { CashflowRowDto } from './dto/cashflow-row.dto';

@Injectable()
export class BondsService {
  /**
   * Calculate bond metrics including current yield, YTM, and cashflow schedule
   * @param dto Bond calculation parameters
   * @returns Bond calculation results with cashflows
   */
  calculateBond(dto: BondCalculationDto): BondCalculationResponseDto {
    const {
      faceValue,
      couponRate,
      marketPrice,
      yearsToMaturity,
      couponFrequency,
      yieldToMaturity: providedYtm,
    } = dto;

    // Calculate periodic values
    const periodicCouponRate = couponRate / 100 / couponFrequency;
    const couponPayment = faceValue * periodicCouponRate;
    const totalPeriods = Math.ceil(yearsToMaturity * couponFrequency);

    // Calculate Current Yield: (annualCoupon / marketPrice) * 100
    const annualCoupon = couponPayment * couponFrequency;
    const currentYield = (annualCoupon / marketPrice) * 100;

    // Calculate YTM (if not provided)
    const yieldToMaturity = providedYtm
      ? providedYtm / 100
      : this.calculateYTM(marketPrice, faceValue, couponRate, yearsToMaturity, couponFrequency);

    // Calculate total interest: annualCoupon * yearsToMaturity
    const totalInterest = annualCoupon * yearsToMaturity;

    // Determine bond status: Premium, Discount, or Par
    const status = marketPrice > faceValue ? 'Premium' : marketPrice < faceValue ? 'Discount' : 'Par';

    // Generate cashflows
    const cashflows = this.generateCashflows(
      faceValue,
      couponPayment,
      totalPeriods,
      yieldToMaturity / couponFrequency,
      couponFrequency,
    );

    return {
      currentYield,
      yieldToMaturity: yieldToMaturity * 100,
      totalInterest,
      status,
      cashflows,
    };
  }

  /**
   * Generate detailed cashflow schedule
   * - Correct number of periods based on frequency (annual × 1, semi-annual × 2, quarterly × 4, monthly × 12)
   * - Coupon payments per period
   * - Accumulated interest across periods
   * - Payment dates based on frequency
   * - Constant remaining principal until maturity
   */
  generateCashflowSchedule(dto: BondCalculationDto): CashflowRowDto[] {
    const {
      faceValue,
      couponRate,
      yearsToMaturity,
      couponFrequency,
    } = dto;

    // Calculate periodic values
    const periodicCouponRate = couponRate / 100 / couponFrequency;
    const couponPayment = faceValue * periodicCouponRate;
    const totalPeriods = Math.ceil(yearsToMaturity * couponFrequency);

    const cashflows: CashflowRowDto[] = [];
    const startDate = new Date();

    // Calculate months per period based on frequency
    const monthsPerPeriod = 12 / couponFrequency;

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

  /**
   * Calculate Yield to Maturity using approximation formula
   * YTM = ((annualCoupon + (faceValue - marketPrice) / years) / ((faceValue + marketPrice) / 2)) * 100
   */
  private calculateYTM(
    price: number,
    faceValue: number,
    couponRate: number,
    years: number,
    frequency: number,
  ): number {
    const annualCoupon = (faceValue * couponRate / 100);

    // Approximation formula
    const ytm = ((annualCoupon + (faceValue - price) / years) / ((faceValue + price) / 2)) * 100;

    return ytm / 100; // Return as decimal for consistency
  }

  /**
   * Generate cashflow array with present values
   */
  private generateCashflows(
    faceValue: number,
    couponPayment: number,
    totalPeriods: number,
    periodicYTM: number,
    couponFrequency: number,
  ): Cashflow[] {
    const cashflows: Cashflow[] = [];

    for (let period = 1; period <= totalPeriods; period++) {
      const isFinalPeriod = period === totalPeriods;

      // For final period, include principal repayment
      if (isFinalPeriod) {
        const amount = couponPayment + faceValue;
        const presentValue = amount / Math.pow(1 + periodicYTM, period);

        cashflows.push({
          period,
          type: CashflowType.PRINCIPAL,
          amount,
          presentValue,
        });
      } else {
        const presentValue = couponPayment / Math.pow(1 + periodicYTM, period);

        cashflows.push({
          period,
          type: CashflowType.COUPON,
          amount: couponPayment,
          presentValue,
        });
      }
    }

    return cashflows;
  }
}
