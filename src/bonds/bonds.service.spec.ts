import { Test, TestingModule } from '@nestjs/testing';
import { BondsService } from './bonds.service';
import { BondCalculationDto } from './dto/bond-calculation.dto';

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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (150 / 1200) * 100 = 12.50%
      expect(result.currentYield).toBeCloseTo(12.5, 2);
    });

    it('BSS-CY-006: Calculate current yield for small face value', () => {
      const dto: BondCalculationDto = {
        faceValue: 100,
        couponRate: 5,
        marketPrice: 95,
        yearsToMaturity: 3,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      // currentYield = (5 / 95) * 100 = 5.26%
      expect(result.currentYield).toBeCloseTo(5.26, 2);
    });

    it('BSS-CY-007: Calculate current yield for large face value', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000000,
        couponRate: 5,
        marketPrice: 950000,
        yearsToMaturity: 30,
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBeLessThan(3);
    });

    it('BSS-YTM-006: Use provided YTM when given', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
        yieldToMaturity: 7.5,
      };

      const result = service.calculateBond(dto);
      expect(result.yieldToMaturity).toBe(7.5);
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
        frequency: 1,
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
        frequency: 2,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.status).toBe('Premium');
    });
  });

  // ==================== Cash Flow Schedule Tests ====================

  describe('Cashflow Schedule Generation', () => {
    it('BSS-CF-001: Generate correct periods for annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
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
        frequency: 2,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(10);
    });

    it('BSS-CF-003: Generate correct periods for quarterly coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 4,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows.length).toBe(20);
    });

    it('BSS-CF-004: Generate correct periods for monthly coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 12,
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
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.forEach((cf) => {
        expect(cf.couponPayment).toBe(50); // 1000 * 0.05
      });
    });

    it('BSS-CF-006: Calculate coupon payment for semi-annual coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 2,
      };

      const result = service.calculateBond(dto);
      result.cashflows.forEach((cf) => {
        expect(cf.couponPayment).toBe(25); // 1000 * 0.05 / 2
      });
    });

    it('BSS-CF-007: Calculate coupon payment for high coupon rate', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 10,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.forEach((cf) => {
        expect(cf.couponPayment).toBe(100); // 1000 * 0.10
      });
    });

    it('BSS-CF-008: Accumulate interest correctly (annual)', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 3,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows[0].cumulativeInterest).toBe(50);
      expect(result.cashflows[1].cumulativeInterest).toBe(100);
      expect(result.cashflows[2].cumulativeInterest).toBe(150);
    });

    it('BSS-CF-009: Accumulate interest for semi-annual', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 2,
        frequency: 2,
      };

      const result = service.calculateBond(dto);
      expect(result.cashflows[0].cumulativeInterest).toBe(25);
      expect(result.cashflows[1].cumulativeInterest).toBe(50);
      expect(result.cashflows[2].cumulativeInterest).toBe(75);
      expect(result.cashflows[3].cumulativeInterest).toBe(100);
    });

    it('BSS-CF-010: Maintain constant remaining principal until final period', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.slice(0, -1).forEach((cf) => {
        expect(cf.remainingPrincipal).toBe(1000);
      });
      expect(result.cashflows[result.cashflows.length - 1].remainingPrincipal).toBe(0);
    });

    it('BSS-CF-011: Generate correct payment dates for annual', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 3,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      const firstDate = new Date(result.cashflows[0].paymentDate);
      const secondDate = new Date(result.cashflows[1].paymentDate);
      const diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

      // Should be approximately 365 days apart
      expect(diffDays).toBeGreaterThanOrEqual(364);
      expect(diffDays).toBeLessThanOrEqual(366);
    });

    it('BSS-CF-012: Generate correct payment dates for semi-annual', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 2,
        frequency: 2,
      };

      const result = service.calculateBond(dto);
      const firstDate = new Date(result.cashflows[0].paymentDate);
      const secondDate = new Date(result.cashflows[1].paymentDate);
      const diffDays = Math.abs((secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

      // Should be approximately 182 days apart
      expect(diffDays).toBeGreaterThanOrEqual(180);
      expect(diffDays).toBeLessThanOrEqual(184);
    });

    it('BSS-CF-013: All cashflows should have required properties', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      result.cashflows.forEach((cf, index) => {
        expect(cf).toHaveProperty('period');
        expect(cf).toHaveProperty('paymentDate');
        expect(cf).toHaveProperty('couponPayment');
        expect(cf).toHaveProperty('cumulativeInterest');
        expect(cf).toHaveProperty('remainingPrincipal');
        expect(cf.period).toBe(index + 1);
      });
    });

    it('BSS-CF-014: Final cashflow should have zero remaining principal', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      const finalCashflow = result.cashflows[result.cashflows.length - 1];
      expect(finalCashflow.remainingPrincipal).toBe(0);
    });

    it('BSS-CF-015: Cumulative interest should match total interest', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);
      const finalCashflow = result.cashflows[result.cashflows.length - 1];
      expect(finalCashflow.cumulativeInterest).toBe(result.totalInterest);
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 1,
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
        frequency: 2,
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
        frequency: 2,
      };

      const result = service.calculateBond(dto);

      expect(result.status).toBe('Discount');
      expect(result.yieldToMaturity).toBeGreaterThan(result.currentYield);
      expect(result.cashflows.length).toBe(20);
    });

    it('BSS-INT-003: Full calculation for premium bond scenario', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 8,
        marketPrice: 1200,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);

      expect(result.status).toBe('Premium');
      expect(result.yieldToMaturity).toBeLessThan(result.currentYield);
      expect(result.cashflows.length).toBe(5);
      expect(result.totalInterest).toBe(400);
    });

    it('BSS-INT-004: Example from requirements - 5 year bond with 5% coupon', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);

      // Verify expected values from requirements
      expect(result.currentYield).toBeCloseTo(5.26, 2);
      // YTM approximation formula: ((50 + (1000-950)/5) / ((1000+950)/2)) * 100 = 6.15%
      expect(result.yieldToMaturity).toBeCloseTo(6.15, 2);
      expect(result.totalInterest).toBe(250);
      expect(result.status).toBe('Discount');
      expect(result.cashflows.length).toBe(5);

      // Verify cashflow structure
      result.cashflows.forEach((cf, index) => {
        expect(cf.period).toBe(index + 1);
        expect(cf.couponPayment).toBe(50);
        expect(cf.remainingPrincipal).toBe(index === 4 ? 0 : 1000);
        expect(new Date(cf.paymentDate)).toBeInstanceOf(Date);
      });
    });
  });

  // ==================== Response Structure Tests ====================

  describe('Response Structure', () => {
    it('BSS-RS-001: Response should have correct structure', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);

      expect(result).toMatchObject({
        currentYield: expect.any(Number),
        yieldToMaturity: expect.any(Number),
        totalInterest: expect.any(Number),
        status: expect.any(String),
        cashflows: expect.any(Array),
      });
    });

    it('BSS-RS-002: Cashflow items should have correct structure', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);

      result.cashflows.forEach((cf) => {
        expect(cf).toMatchObject({
          period: expect.any(Number),
          paymentDate: expect.any(String),
          couponPayment: expect.any(Number),
          cumulativeInterest: expect.any(Number),
          remainingPrincipal: expect.any(Number),
        });
      });
    });

    it('BSS-RS-003: Payment dates should be valid ISO dates', () => {
      const dto: BondCalculationDto = {
        faceValue: 1000,
        couponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 5,
        frequency: 1,
      };

      const result = service.calculateBond(dto);

      result.cashflows.forEach((cf) => {
        expect(() => new Date(cf.paymentDate)).not.toThrow();
        expect(new Date(cf.paymentDate).toISOString()).toBe(cf.paymentDate);
      });
    });
  });
});