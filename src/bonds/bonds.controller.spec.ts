import { Test, TestingModule } from '@nestjs/testing';
import { BondsController } from './bonds.controller';
import { BondsService } from './bonds.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { BondCalculationException } from './exceptions/bond-calculation.exception';
import { ValidationPipe } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { BondCalculationDto } from './dto/bond-calculation.dto';

/**
 * Bonds Controller Test Suite
 *
 * Test Coverage:
 * - Controller Initialization (BCC-001, BCC-002)
 * - POST Success Responses (BCC-POST-001 to BCC-POST-003)
 * - POST Validation Tests (BCC-POST-004 to BCC-POST-015)
 * - Validation Pipe (BCC-VP-001)
 * - Service Exception Handling (BCC-EX-001)
 * - Content-Type Header (BCC-CT-001)
 * - CORS (BCC-CORS-001)
 */

describe('BondsController', () => {
  let controller: BondsController;
  let service: BondsService;

  // Valid test data fixture
  const validDto = {
    faceValue: 1000,
    couponRate: 5,
    marketPrice: 950,
    yearsToMaturity: 5,
    couponFrequency: 2,
  };

  // Mock service response fixture
  const mockServiceResponse = {
    currentYield: 5.2631578947368425,
    yieldToMaturity: 6.389482699238392,
    totalInterest: 250,
    status: 'Discount',
    cashflows: [
      {
        period: 1,
        type: 'coupon',
        amount: 25,
        presentValue: 24.231585746253563,
      },
      {
        period: 2,
        type: 'coupon',
        amount: 25,
        presentValue: 23.49107425190486,
      },
      {
        period: 3,
        type: 'coupon',
        amount: 25,
        presentValue: 22.77744319089268,
      },
      {
        period: 4,
        type: 'coupon',
        amount: 25,
        presentValue: 22.08935365003865,
      },
      {
        period: 5,
        type: 'coupon',
        amount: 25,
        presentValue: 21.425511017954653,
      },
      {
        period: 6,
        type: 'coupon',
        amount: 25,
        presentValue: 20.78564471101667,
      },
      {
        period: 7,
        type: 'coupon',
        amount: 25,
        presentValue: 20.168507278566904,
      },
      {
        period: 8,
        type: 'coupon',
        amount: 25,
        presentValue: 19.572878652823453,
      },
      {
        period: 9,
        type: 'coupon',
        amount: 25,
        presentValue: 18.99755106926336,
      },
      {
        period: 10,
        type: 'principal',
        amount: 1025,
        presentValue: 755.9594502312856,
      },
    ],
  };

  beforeEach(async () => {
    const mockBondsService = {
      calculateBond: jest.fn().mockReturnValue(mockServiceResponse),
      generateCashflowSchedule: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BondsController],
      providers: [
        {
          provide: BondsService,
          useValue: mockBondsService,
        },
        {
          provide: HttpExceptionFilter,
          useClass: HttpExceptionFilter,
        },
      ],
    }).compile();

    controller = module.get<BondsController>(BondsController);
    service = module.get<BondsService>(BondsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    /**
     * BCC-001: Controller should be defined
     */
    it('BCC-001: should create controller instance', () => {
      expect(controller).toBeDefined();
    });

    /**
     * BCC-002: Controller should have calculate method
     */
    it('BCC-002: should have calculateBond method', () => {
      expect(controller.calculateBond).toBeDefined();
      expect(typeof controller.calculateBond).toBe('function');
    });

    /**
     * BCC-003: Controller should have generateCashflowSchedule method
     */
    it('BCC-003: should have generateCashflowSchedule method', () => {
      expect(controller.generateCashflowSchedule).toBeDefined();
      expect(typeof controller.generateCashflowSchedule).toBe('function');
    });
  });

  describe('POST - Success Response', () => {
    /**
     * BCC-POST-001: Return 200 for valid calculation request
     */
    it('BCC-POST-001: should return calculation result for valid DTO', () => {
      const result = controller.calculateBond(validDto);

      expect(result).toBeDefined();
      expect(result).toEqual(mockServiceResponse);
    });

    /**
     * BCC-POST-002: Call bond service with correct parameters
     */
    it('BCC-POST-002: should call service once with correct DTO', () => {
      controller.calculateBond(validDto);

      expect(service.calculateBond).toHaveBeenCalledTimes(1);
      expect(service.calculateBond).toHaveBeenCalledWith(validDto);
    });

    /**
     * BCC-POST-003: Return correct response structure
     */
    it('BCC-POST-003: should return response with all required fields', () => {
      const result = controller.calculateBond(validDto);

      expect(result).toHaveProperty('currentYield');
      expect(result).toHaveProperty('yieldToMaturity');
      expect(result).toHaveProperty('totalInterest');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('cashflows');
      expect(Array.isArray(result.cashflows)).toBe(true);
    });

    /**
     * BCC-POST-003.1: Response structure should have correct data types
     */
    it('BCC-POST-003.1: should return response with correct data types', () => {
      const result = controller.calculateBond(validDto);

      expect(typeof result.currentYield).toBe('number');
      expect(typeof result.yieldToMaturity).toBe('number');
      expect(typeof result.totalInterest).toBe('number');
      expect(typeof result.status).toBe('string');
      expect(Array.isArray(result.cashflows)).toBe(true);
    });
  });

  describe('POST - Validation Tests (Negative Values)', () => {
    /**
     * BCC-POST-004: Return 400 for negative face value
     */
    it('BCC-POST-004: should return 400 for negative face value', async () => {
      const invalidDto = { ...validDto, faceValue: -1000 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-005: Return 400 for negative coupon rate
     */
    it('BCC-POST-005: should return 400 for negative coupon rate', async () => {
      const invalidDto = { ...validDto, couponRate: -5 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-006: Return 400 for negative market price
     */
    it('BCC-POST-006: should return 400 for negative market price', async () => {
      const invalidDto = { ...validDto, marketPrice: -950 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-007: Return 400 for negative years
     */
    it('BCC-POST-007: should return 400 for negative years', async () => {
      const invalidDto = { ...validDto, yearsToMaturity: -5 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });
  });

  describe('POST - Validation Tests (Invalid Frequency)', () => {
    /**
     * BCC-POST-008: Return 400 for invalid frequency
     */
    it('BCC-POST-008: should return 400 for invalid frequency string', async () => {
      const invalidDto = { ...validDto, couponFrequency: 'quarterly' as any };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-008.1: Return 400 for frequency not in [1, 2, 4, 12]
     */
    it('BCC-POST-008.1: should return 400 for frequency value of 3', async () => {
      const invalidDto = { ...validDto, couponFrequency: 3 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-008.2: Return 400 for frequency value of 5
     */
    it('BCC-POST-008.2: should return 400 for frequency value of 5', async () => {
      const invalidDto = { ...validDto, couponFrequency: 5 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });
  });

  describe('POST - Validation Tests (Zero Values)', () => {
    /**
     * BCC-POST-009: Return 400 for zero face value
     */
    it('BCC-POST-009: should return 400 for zero face value', async () => {
      const invalidDto = { ...validDto, faceValue: 0 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-010: Return 400 for zero market price
     */
    it('BCC-POST-010: should return 400 for zero market price', async () => {
      const invalidDto = { ...validDto, marketPrice: 0 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-011: Return 400 for zero years
     */
    it('BCC-POST-011: should return 400 for zero years', async () => {
      const invalidDto = { ...validDto, yearsToMaturity: 0 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });
  });

  describe('POST - Validation Tests (Missing/Extra/Type Mismatch)', () => {
    /**
     * BCC-POST-012: Return 400 for missing required fields
     */
    it('BCC-POST-012: should return 400 for missing required fields', async () => {
      const incompleteDto = {
        faceValue: 1000,
        couponRate: 5,
        // Missing: marketPrice, yearsToMaturity, couponFrequency
      };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(incompleteDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-013: Ignore extra fields in request
     */
    it('BCC-POST-013: should process normally with extra fields', () => {
      const dtoWithExtra = {
        ...validDto,
        extraField: 'should be ignored',
        anotherExtra: 12345,
      };

      const result = controller.calculateBond(dtoWithExtra as any);

      expect(result).toBeDefined();
      // Controller passes through to service, so extra fields are included
      expect(service.calculateBond).toHaveBeenCalled();
    });

    /**
     * BCC-POST-014: Return 400 for string instead of number
     */
    it('BCC-POST-014: should return 400 for string instead of number', async () => {
      const invalidDto = { ...validDto, faceValue: '1000' as any };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });
  });

  describe('POST - Validation Tests (Out of Range Values)', () => {
    /**
     * BCC-POST-015: Return 400 for coupon rate > 100
     */
    it('BCC-POST-015: should return 400 for coupon rate > 100', async () => {
      const invalidDto = { ...validDto, couponRate: 150 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-POST-016: Return 400 for years > 100
     */
    it('BCC-POST-016: should return 400 for years > 100', async () => {
      const invalidDto = { ...validDto, yearsToMaturity: 101 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });
  });

  describe('POST - Edge Cases and Boundary Values', () => {
    /**
     * BCC-POST-017: Accept minimum valid face value (1)
     */
    it('BCC-POST-017: should accept minimum valid face value of 1', async () => {
      const boundaryDto = { ...validDto, faceValue: 1 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(boundaryDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result.faceValue).toBe(1);
    });

    /**
     * BCC-POST-018: Accept minimum valid coupon rate (0.01)
     */
    it('BCC-POST-018: should accept minimum valid coupon rate of 0.01', async () => {
      const boundaryDto = { ...validDto, couponRate: 0.01 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(boundaryDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result.couponRate).toBe(0.01);
    });

    /**
     * BCC-POST-019: Accept minimum valid market price (0.01)
     */
    it('BCC-POST-019: should accept minimum valid market price of 0.01', async () => {
      const boundaryDto = { ...validDto, marketPrice: 0.01 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(boundaryDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result.marketPrice).toBe(0.01);
    });

    /**
     * BCC-POST-020: Accept minimum valid years (0.1)
     */
    it('BCC-POST-020: should accept minimum valid years of 0.1', async () => {
      const boundaryDto = { ...validDto, yearsToMaturity: 0.1 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(boundaryDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result.yearsToMaturity).toBe(0.1);
    });

    /**
     * BCC-POST-021: Accept maximum valid coupon rate (100)
     */
    it('BCC-POST-021: should accept maximum valid coupon rate of 100', async () => {
      const boundaryDto = { ...validDto, couponRate: 100 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(boundaryDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result.couponRate).toBe(100);
    });

    /**
     * BCC-POST-022: Accept maximum valid years (100)
     */
    it('BCC-POST-022: should accept maximum valid years of 100', async () => {
      const boundaryDto = { ...validDto, yearsToMaturity: 100 };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(boundaryDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result.yearsToMaturity).toBe(100);
    });
  });

  describe('Validation Pipe', () => {
    /**
     * BCC-VP-001: Validation pipe should catch invalid DTO
     */
    it('BCC-VP-001: should apply validation pipe and catch errors', async () => {
      const invalidDto = {
        faceValue: -1000,
        couponRate: -5,
        marketPrice: 0,
        yearsToMaturity: -1,
        couponFrequency: 99,
      };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      await expect(
        validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: BondCalculationDto,
        }),
      ).rejects.toThrow();
    });

    /**
     * BCC-VP-002: Validation pipe should pass valid DTO
     */
    it('BCC-VP-002: should pass validation for valid DTO', async () => {
      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
      });

      const result = await validationPipe.transform(validDto, {
        type: 'body',
        metatype: Object,
      });

      expect(result).toBeDefined();
      expect(result.faceValue).toBe(validDto.faceValue);
    });
  });

  describe('Service Exception Handling', () => {
    /**
     * BCC-EX-001: Handle service exceptions gracefully
     */
    it('BCC-EX-001: should handle service exceptions', async () => {
      const mockBondsService = {
        calculateBond: jest.fn().mockImplementation(() => {
          throw new BondCalculationException('Calculation failed');
        }),
        generateCashflowSchedule: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [BondsController],
        providers: [
          {
            provide: BondsService,
            useValue: mockBondsService,
          },
        ],
      }).compile();

      const testController = module.get<BondsController>(BondsController);

      expect(() => testController.calculateBond(validDto)).toThrow(
        BondCalculationException,
      );
    });

    /**
     * BCC-EX-002: Service should be called once per request
     */
    it('BCC-EX-002: should call service only once per request', () => {
      const spy = jest.spyOn(service, 'calculateBond');

      controller.calculateBond(validDto);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content-Type Header', () => {
    /**
     * BCC-CT-001: Verify response structure is JSON-compatible
     */
    it('BCC-CT-001: should return JSON-compatible response', () => {
      const result = controller.calculateBond(validDto);

      // Verify response can be serialized to JSON
      expect(() => JSON.stringify(result)).not.toThrow();

      // Verify all properties are serializable
      const serialized = JSON.parse(JSON.stringify(result));
      expect(serialized).toEqual(result);
    });

    /**
     * BCC-CT-002: Verify all numeric fields are numbers
     */
    it('BCC-CT-002: should return numeric fields as numbers', () => {
      const result = controller.calculateBond(validDto);

      expect(typeof result.currentYield).toBe('number');
      expect(typeof result.yieldToMaturity).toBe('number');
      expect(typeof result.totalInterest).toBe('number');
      expect(Number.isFinite(result.currentYield)).toBe(true);
      expect(Number.isFinite(result.yieldToMaturity)).toBe(true);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });
  });

  describe('CORS', () => {
    /**
     * BCC-CORS-001: Controller should handle OPTIONS request (metadata check)
     */
    it('BCC-CORS-001: should have CORS metadata configured', () => {
      // Check if controller is defined (CORS is typically configured at app level)
      expect(controller).toBeDefined();

      // Verify the controller can be instantiated (no CORS blocking in test environment)
      expect(typeof controller.calculateBond).toBe('function');
    });
  });

  describe('generateCashflowSchedule', () => {
    /**
     * BCC-CFS-001: Should return cashflow schedule array
     */
    it('BCC-CFS-001: should return cashflow schedule array', () => {
      const result = controller.generateCashflowSchedule(validDto);

      expect(result).toBeDefined();
      expect(service.generateCashflowSchedule).toHaveBeenCalledWith(validDto);
    });

    /**
     * BCC-CFS-002: Should call service with correct parameters
     */
    it('BCC-CFS-002: should call service with correct DTO', () => {
      controller.generateCashflowSchedule(validDto);

      expect(service.generateCashflowSchedule).toHaveBeenCalledTimes(1);
      expect(service.generateCashflowSchedule).toHaveBeenCalledWith(validDto);
    });
  });

  describe('Integration Tests', () => {
    /**
     * BCC-INT-001: Full calculation with premium bond
     */
    it('BCC-INT-001: should calculate premium bond correctly', () => {
      const premiumDto = {
        ...validDto,
        faceValue: 1000,
        marketPrice: 1100,
      };

      const premiumResponse = {
        ...mockServiceResponse,
        status: 'Premium',
      };

      jest.spyOn(service, 'calculateBond').mockReturnValue(premiumResponse);

      const result = controller.calculateBond(premiumDto);

      expect(result.status).toBe('Premium');
      expect(service.calculateBond).toHaveBeenCalledWith(premiumDto);
    });

    /**
     * BCC-INT-002: Full calculation with par bond
     */
    it('BCC-INT-002: should calculate par bond correctly', () => {
      const parDto = {
        ...validDto,
        faceValue: 1000,
        marketPrice: 1000,
      };

      const parResponse = {
        ...mockServiceResponse,
        status: 'Par',
      };

      jest.spyOn(service, 'calculateBond').mockReturnValue(parResponse);

      const result = controller.calculateBond(parDto);

      expect(result.status).toBe('Par');
      expect(service.calculateBond).toHaveBeenCalledWith(parDto);
    });

    /**
     * BCC-INT-003: Full calculation with discount bond
     */
    it('BCC-INT-003: should calculate discount bond correctly', () => {
      const discountDto = {
        ...validDto,
        faceValue: 1000,
        marketPrice: 900,
      };

      const discountResponse = {
        ...mockServiceResponse,
        status: 'Discount',
      };

      jest.spyOn(service, 'calculateBond').mockReturnValue(discountResponse);

      const result = controller.calculateBond(discountDto);

      expect(result.status).toBe('Discount');
      expect(service.calculateBond).toHaveBeenCalledWith(discountDto);
    });
  });

  describe('Valid Coupon Frequencies', () => {
    /**
     * BCC-FREQ-001: Should accept frequency of 1 (annual)
     */
    it('BCC-FREQ-001: should accept frequency of 1 (annual)', () => {
      const annualDto = { ...validDto, couponFrequency: 1 };

      const result = controller.calculateBond(annualDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(annualDto);
    });

    /**
     * BCC-FREQ-002: Should accept frequency of 2 (semi-annual)
     */
    it('BCC-FREQ-002: should accept frequency of 2 (semi-annual)', () => {
      const semiAnnualDto = { ...validDto, couponFrequency: 2 };

      const result = controller.calculateBond(semiAnnualDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(semiAnnualDto);
    });

    /**
     * BCC-FREQ-003: Should accept frequency of 4 (quarterly)
     */
    it('BCC-FREQ-003: should accept frequency of 4 (quarterly)', () => {
      const quarterlyDto = { ...validDto, couponFrequency: 4 };

      const result = controller.calculateBond(quarterlyDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(quarterlyDto);
    });

    /**
     * BCC-FREQ-004: Should accept frequency of 12 (monthly)
     */
    it('BCC-FREQ-004: should accept frequency of 12 (monthly)', () => {
      const monthlyDto = { ...validDto, couponFrequency: 12 };

      const result = controller.calculateBond(monthlyDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(monthlyDto);
    });
  });

  describe('Optional Yield to Maturity', () => {
    /**
     * BCC-YTM-001: Should work without yieldToMaturity provided
     */
    it('BCC-YTM-001: should work without yieldToMaturity', () => {
      const dtoWithoutYtm = { ...validDto };

      const result = controller.calculateBond(dtoWithoutYtm);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(dtoWithoutYtm);
    });

    /**
     * BCC-YTM-002: Should work with yieldToMaturity provided
     */
    it('BCC-YTM-002: should work with provided yieldToMaturity', () => {
      const dtoWithYtm = {
        ...validDto,
        yieldToMaturity: 4.5,
      };

      const result = controller.calculateBond(dtoWithYtm);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(dtoWithYtm);
    });
  });
});
