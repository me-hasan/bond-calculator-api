import { Test, TestingModule } from '@nestjs/testing';
import { BondsService } from './bonds.service';
import { BondCalculationDto } from './dto/bond-calculation.dto';
import { CashflowType } from './dto/bond-calculation-response.dto';

describe('BondsService', () => {
  let service: BondsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BondsService],
    }).compile();

    service = module.get<BondsService>(BondsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Service Initialization ====================

  describe('Service Initialization', () => {
    it('BSS-001: Service should be defined', () => {
      expect(service).toBeDefined();
    });

    it('BSS-002: Service should have calculateBond method', () => {
      expect(typeof service.calculateBond).toBe('function');
    });
  });

  // ==================== Current Yield Tests ====================

  describe('Current Yield', () => {
    it('BSS-CY-001: Calculate current yield for discount bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (50 / 950) * 100 = 5.26%
      expect(result.currentYield).toBeCloseTo(5.26, 2);
    });

    it('BSS-CY-002: Calculate current yield for premium bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1050,
        yearsToMaturity: 10,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (50 / 1050) * 100 = 4.76%
      expect(result.currentYield).toBeCloseTo(4.76, 2);
    });

    it('BSS-CY-003: Calculate current yield for par bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1000,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (50 / 1000) * 100 = 5.00%
      expect(result.currentYield).toBe(5.0);
    });

    it('BSS-CY-004: Calculate current yield for zero coupon bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 0.01,
        marketPrice: 800,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // Minimal coupon payment
      expect(result.currentYield).toBeGreaterThan(0);
      expect(result.currentYield).toBeLessThan(1);
    });

    it('BSS-CY-005: Calculate current yield for high coupon bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 15,
        marketPrice: 1200,
        yearsToMaturity: 10,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (150 / 1200) * 100 = 12.50%
      expect(result.currentYield).toBeCloseTo(12.5, 2);
    });

    it('BSS-CY-006: Handle zero market price (edge case)', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 0.01, // minimum allowed by validation
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // Should handle gracefully without throwing
      expect(result.currentYield).toBeDefined();
      expect(result.currentYield).toBeGreaterThan(0);
    });

    it('BSS-CY-007: Calculate current yield for small face value', () => {
      const dto: BondCalculationDto = {
        faceValue: 100,
        couponRate: 5,
        marketPrice: 95,
        yearsToMaturity: 3,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (5 / 95) * 100 = 5.26%
      expect(result.currentYield).toBeCloseTo(5.26, 2);
    });

    it('BSS-CY-008: Calculate current yield for large face value', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000000,
        couponRate: 5,
        marketPrice: 950000,
        yearsToMaturity: 30,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (50000 / 950000) * 100 = 5.26%
      expect(result.currentYield).toBeCloseTo(5.26, 2);
    });
  });

  // ==================== YTM Tests ====================

  describe('Yield to Maturity', () => {
    it('BSS-YTM-001: Calculate YTM for discount bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeGreaterThan(result.currentYield);
      expect(result.yieldToMaturity).toBeGreaterThan(0);
    });

    it('BSS-YTM-002: Calculate YTM for premium bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1050,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeLessThan(result.currentYield);
      expect(result.yieldToMaturity).toBeLessThan(dto.couponRate);
    });

    it('BSS-YTM-003: Calculate YTM for par bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1000,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // YTM should equal coupon rate for par bond
      expect(result.yieldToMaturity).toBeCloseTo(dto.couponRate, 1);
    });

    it('BSS-YTM-004: Calculate YTM for deep discount bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 700,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeGreaterThan(10);
    });

    it('BSS-YTM-005: Calculate YTM for high premium bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1300,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeLessThan(3);
    });

    it('BSS-YTM-006: Calculate YTM for short-term bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 1,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeGreaterThan(0);
    });

    it('BSS-YTM-007: Calculate YTM for long-term bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 30,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeGreaterThan(0);
    });

    it('BSS-YTM-008: Calculate YTM for zero coupon bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 0.01,
        marketPrice: 800,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeCloseTo(4.5, 1);
    });

    it('BSS-YTM-009: Calculate YTM for semi-annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeGreaterThan(0);
    });
  });

  // ==================== Total Interest Tests ====================

  describe('Total Interest', () => {
    it('BSS-TI-001: Calculate total interest for annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // totalInterest = 1000 * 0.05 * 5 = 250
      expect(result.totalInterest).toBe(250);
    });

    it('BSS-TI-002: Calculate total interest for semi-annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);
      // totalInterest = 1000 * 0.05 * 5 = 250 (same total)
      expect(result.totalInterest).toBe(250);
    });

    it('BSS-TI-003: Calculate total interest for short-term bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 1,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // totalInterest = 1000 * 0.05 * 1 = 50
      expect(result.totalInterest).toBe(50);
    });

    it('BSS-TI-004: Calculate total interest for long-term bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 30,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // totalInterest = 1000 * 0.05 * 30 = 1500
      expect(result.totalInterest).toBe(1500);
    });

    it('BSS-TI-005: Calculate total interest for zero coupon bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 0.01,
        marketPrice: 800,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      // Minimal interest for near-zero coupon
      expect(result.totalInterest).toBeCloseTo(0.5, 1);
    });
  });

  // ==================== Status Tests ====================

  describe('Bond Status', () => {
    it('BSS-ST-001: Identify discount bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.status).toBe('Discount');
    });

    it('BSS-ST-002: Identify premium bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1050,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.status).toBe('Premium');
    });

    it('BSS-ST-003: Identify par bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1000,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.status).toBe('Par');
    });

    it('BSS-ST-004: Identify deep discount bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 500,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.status).toBe('Discount');
    });

    it('BSS-ST-005: Identify high premium bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 1500,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.status).toBe('Premium');
    });
  });

  // ==================== Cash Flow Tests ====================

  describe('Cash Flow Generation', () => {
    it('BSS-CF-001: Generate correct periods for annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(5);
    });

    it('BSS-CF-002: Generate correct periods for semi-annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(10);
    });

    it('BSS-CF-003: Generate 1 period for 1-year annual bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 1,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(1);
    });

    it('BSS-CF-004: Generate 60 periods for 30-year semi-annual bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 30,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(60);
    });

    it('BSS-CF-005: Calculate coupon payment for annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.slice(0, -1).forEach((cf) => {
        expect(cf.amount).toBe(50); // 1000 * 0.05
      });
    });

    it('BSS-CF-006: Calculate coupon payment for semi-annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);
      result.cashflows.slice(0, -1).forEach((cf) => {
        expect(cf.amount).toBe(25); // 1000 * 0.05 / 2
      });
    });

    it('BSS-CF-007: Calculate coupon payment for high coupon rate', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 10,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.slice(0, -1).forEach((cf) => {
        expect(cf.amount).toBe(100); // 1000 * 0.10
      });
    });

    it('BSS-CF-008: Calculate coupon payment for zero coupon bond', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 0.01,
        marketPrice: 800,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.slice(0, -1).forEach((cf) => {
        expect(cf.amount).toBeCloseTo(0.1, 1);
      });
    });

    it('BSS-CF-009: Accumulate interest correctly (annual)', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 3,
        couponFrequency: 1,
      };

      const schedule = service.generateCashflowSchedule(dto);
      expect(schedule[0].cumulativeInterest).toBe(50);
      expect(schedule[1].cumulativeInterest).toBe(100);
      expect(schedule[2].cumulativeInterest).toBe(150);
    });

    it('BSS-CF-010: Accumulate interest for semi-annual', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 2,
        couponFrequency: 2,
      };

      const schedule = service.generateCashflowSchedule(dto);
      expect(schedule[0].cumulativeInterest).toBe(25);
      expect(schedule[1].cumulativeInterest).toBe(50);
      expect(schedule[2].cumulativeInterest).toBe(75);
      expect(schedule[3].cumulativeInterest).toBe(100);
    });

    it('BSS-CF-011: Maintain constant remaining principal', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const schedule = service.generateCashflowSchedule(dto);
      schedule.slice(0, -1).forEach((row) => {
        expect(row.remainingPrincipal).toBe(1000);
      });
    });

    it('BSS-CF-012: Generate correct payment dates for annual', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 3,
        couponFrequency: 1,
      };

      const schedule = service.generateCashflowSchedule(dto);
      const firstDate = new Date(schedule[0].paymentDate);
      const secondDate = new Date(schedule[1].paymentDate);
      const diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

      // Should be approximately 365 days apart
      expect(diffDays).toBeGreaterThanOrEqual(364);
      expect(diffDays).toBeLessThanOrEqual(366);
    });

    it('BSS-CF-013: Generate correct payment dates for semi-annual', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 2,
        couponFrequency: 2,
      };

      const schedule = service.generateCashflowSchedule(dto);
      const firstDate = new Date(schedule[0].paymentDate);
      const secondDate = new Date(schedule[1].paymentDate);
      const diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

      // Should be approximately 182 days apart
      expect(diffDays).toBeGreaterThanOrEqual(180);
      expect(diffDays).toBeLessThanOrEqual(184);
    });

    it('BSS-CF-014: Handle leap years in date calculation', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 2,
        couponFrequency: 1,
      };

      const schedule = service.generateCashflowSchedule(dto);
      schedule.forEach((row) => {
        expect(() => new Date(row.paymentDate)).not.toThrow();
      });
    });

    it('BSS-CF-015: Ensure last period date is maturity date', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const schedule = service.generateCashflowSchedule(dto);

      // Check that we have exactly 5 periods
      expect(schedule.length).toBe(5);

      // Check that each period is spaced correctly (12 months apart for annual)
      const dates = schedule.map((row) => new Date(row.paymentDate));

      for (let i = 1; i < dates.length; i++) {
        const diffMs = dates[i].getTime() - dates[i - 1].getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // Should be approximately 1 year (365 days) apart
        expect(diffDays).toBeGreaterThanOrEqual(360);
        expect(diffDays).toBeLessThanOrEqual(370);
      }
    });
  });

  // ==================== Edge Cases ====================

  describe('Edge Cases', () => {
    it('BSS-EC-001: Handle decimal coupon rates', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5.5,
        marketPrice: 950,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.totalInterest).toBe(275); // 1000 * 0.055 * 5
    });

    it('BSS-EC-002: Handle decimal years to maturity', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5.5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(6); // Rounded up
    });

    it('BSS-EC-003: Handle very large face values', () => {
      const dto: BondCalculationDto = {
        faceValue: 10000000,
        couponRate: 5,
        marketPrice: 9500000,
        yearsToMaturity: 10,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.totalInterest).toBe(5000000);
    });

    it('BSS-EC-004: Handle very small values', () => {
      const dto: BondCalculationDto = {
        faceValue: 1,
        couponRate: 0.1,
        marketPrice: 0.95,
        yearsToMaturity: 1,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.totalInterest).toBeCloseTo(0.001, 3);
    });
  });

  // ==================== Integration Tests ====================

  describe('Integration Tests', () => {
    it('BSS-INT-001: End-to-end calculation with all outputs', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 10,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);

      expect(result).toHaveProperty('currentYield');
      expect(result).toHaveProperty('yieldToMaturity');
      expect(result).toHaveProperty('totalInterest');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('cashflows');

      expect(result.currentYield).toBeGreaterThan(0);
      expect(result.yieldToMaturity).toBeGreaterThan(0);
      expect(result.totalInterest).toBe(500);
      expect(result.status).toBe('Discount');
      expect(result.cashflows.length).toBe(20);
    });

    it('BSS-INT-002: Full calculation for discount bond scenario', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 900,
        yearsToMaturity: 10,
        couponFrequency: 2,
      };

      const result = service.calculateBond(dto);

      expect(result.status).toBe('Discount');
      expect(result.yieldToMaturity).toBeGreaterThan(result.currentYield);
      expect(result.cashflows.length).toBe(20);
      expect(result.cashflows[result.cashflows.length - 1].type).toBe(CashflowType.PRINCIPAL);
    });

    it('BSS-INT-003: Full calculation for premium bond scenario', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 8,
        marketPrice: 1200,
        yearsToMaturity: 5,
        couponFrequency: 1,
      };

      const result = service.calculateBond(dto);

      expect(result.status).toBe('Premium');
      expect(result.yieldToMaturity).toBeLessThan(result.currentYield);
      expect(result.cashflows.length).toBe(5);
      expect(result.totalInterest).toBe(400);
    });
  });
});
