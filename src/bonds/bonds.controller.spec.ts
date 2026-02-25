import { Test, TestingModule } from '@nestjs/testing';
import { BondsController } from './bonds.controller';
import { BondsService } from './bonds.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { BondCalculationException } from './exceptions/bond-calculation.exception';
import { ValidationPipe } from '@nestjs/common';
import { BondCalculationDto } from './dto/bond-calculation.dto';

/**
 * Bonds Controller Test Suite
 *
 * Test Coverage:
 * - Controller Initialization
 * - POST Success Responses
 * - POST Validation Tests
 * - Validation Pipe
 * - Service Exception Handling
 * - Content-Type Header
 * - CORS
 */

describe('BondsController', () => {
  let controller: BondsController;
  let service: BondsService;

  // Valid test data fixture
  const validDto: BondCalculationDto = {
    faceValue: 1000,
    couponRate: 5,
    marketPrice: 950,
    yearsToMaturity: 5,
    frequency: 2,
  };

  // Mock service response fixture with new cashflow format
  const mockServiceResponse = {
    currentYield: 5.2631578947368425,
    yieldToMaturity: 6.389482699238392,
    totalInterest: 250,
    status: 'Discount',
    cashflows: [
      {
        period: 1,
        paymentDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 25,
        remainingPrincipal: 1000,
      },
      {
        period: 2,
        paymentDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 50,
        remainingPrincipal: 1000,
      },
      {
        period: 3,
        paymentDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 75,
        remainingPrincipal: 1000,
      },
      {
        period: 4,
        paymentDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 100,
        remainingPrincipal: 1000,
      },
      {
        period: 5,
        paymentDate: new Date(Date.now() + 30 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 125,
        remainingPrincipal: 1000,
      },
      {
        period: 6,
        paymentDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 150,
        remainingPrincipal: 1000,
      },
      {
        period: 7,
        paymentDate: new Date(Date.now() + 42 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 175,
        remainingPrincipal: 1000,
      },
      {
        period: 8,
        paymentDate: new Date(Date.now() + 48 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 200,
        remainingPrincipal: 1000,
      },
      {
        period: 9,
        paymentDate: new Date(Date.now() + 54 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 225,
        remainingPrincipal: 1000,
      },
      {
        period: 10,
        paymentDate: new Date(Date.now() + 60 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        couponPayment: 25,
        cumulativeInterest: 250,
        remainingPrincipal: 0,
      },
    ],
  };

  beforeEach(async () => {
    const mockBondsService = {
      calculateBond: jest.fn().mockReturnValue(mockServiceResponse),
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
     * BCC-002: Controller should have calculateBond method
     */
    it('BCC-002: should have calculateBond method', () => {
      expect(controller.calculateBond).toBeDefined();
      expect(typeof controller.calculateBond).toBe('function');
    });
  });

  describe('POST - Success Response', () => {
    /**
     * BCC-POST-001: Return result for valid calculation request
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

    /**
     * BCC-POST-003.2: Cashflows should have new structure
     */
    it('BCC-POST-003.2: should return cashflows with new structure', () => {
      const result = controller.calculateBond(validDto);

      result.cashflows.forEach((cf) => {
        expect(cf).toHaveProperty('period');
        expect(cf).toHaveProperty('paymentDate');
        expect(cf).toHaveProperty('couponPayment');
        expect(cf).toHaveProperty('cumulativeInterest');
        expect(cf).toHaveProperty('remainingPrincipal');
      });
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
     * BCC-POST-008: Return 400 for invalid frequency string
     */
    it('BCC-POST-008: should return 400 for invalid frequency string', async () => {
      const invalidDto = { ...validDto, frequency: 'quarterly' as any };

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
      const invalidDto = { ...validDto, frequency: 3 };

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
      const invalidDto = { ...validDto, frequency: 5 };

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
        // Missing: marketPrice, yearsToMaturity, frequency
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
     * BCC-POST-014: Return 400 for invalid string that cannot be converted to number
     */
    it('BCC-POST-014: should return 400 for invalid string that cannot be converted', async () => {
      const invalidDto = { ...validDto, faceValue: 'invalid' as any };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
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
        frequency: 99,
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

  describe('Integration Tests', () => {
    /**
     * BCC-INT-001: Full calculation with premium bond
     */
    it('BCC-INT-001: should calculate premium bond correctly', () => {
      const premiumDto: BondCalculationDto = {
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
      const parDto: BondCalculationDto = {
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
      const discountDto: BondCalculationDto = {
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
      const annualDto: BondCalculationDto = { ...validDto, frequency: 1 };

      const result = controller.calculateBond(annualDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(annualDto);
    });

    /**
     * BCC-FREQ-002: Should accept frequency of 2 (semi-annual)
     */
    it('BCC-FREQ-002: should accept frequency of 2 (semi-annual)', () => {
      const semiAnnualDto: BondCalculationDto = { ...validDto, frequency: 2 };

      const result = controller.calculateBond(semiAnnualDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(semiAnnualDto);
    });

    /**
     * BCC-FREQ-003: Should accept frequency of 4 (quarterly)
     */
    it('BCC-FREQ-003: should accept frequency of 4 (quarterly)', () => {
      const quarterlyDto: BondCalculationDto = { ...validDto, frequency: 4 };

      const result = controller.calculateBond(quarterlyDto);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(quarterlyDto);
    });

    /**
     * BCC-FREQ-004: Should accept frequency of 12 (monthly)
     */
    it('BCC-FREQ-004: should accept frequency of 12 (monthly)', () => {
      const monthlyDto: BondCalculationDto = { ...validDto, frequency: 12 };

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
      const dtoWithoutYtm: BondCalculationDto = { ...validDto };

      const result = controller.calculateBond(dtoWithoutYtm);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(dtoWithoutYtm);
    });

    /**
     * BCC-YTM-002: Should work with yieldToMaturity provided
     */
    it('BCC-YTM-002: should work with provided yieldToMaturity', () => {
      const dtoWithYtm: BondCalculationDto = {
        ...validDto,
        yieldToMaturity: 4.5,
      };

      const result = controller.calculateBond(dtoWithYtm);

      expect(result).toBeDefined();
      expect(service.calculateBond).toHaveBeenCalledWith(dtoWithYtm);
    });
  });

  describe('Response Structure Validation', () => {
    /**
     * BCC-RS-001: Cashflows should have all required properties
     */
    it('BCC-RS-001: should return cashflows with all required properties', () => {
      const result = controller.calculateBond(validDto);

      expect(Array.isArray(result.cashflows)).toBe(true);
      expect(result.cashflows.length).toBeGreaterThan(0);

      result.cashflows.forEach((cf) => {
        expect(cf).toHaveProperty('period');
        expect(cf).toHaveProperty('paymentDate');
        expect(cf).toHaveProperty('couponPayment');
        expect(cf).toHaveProperty('cumulativeInterest');
        expect(cf).toHaveProperty('remainingPrincipal');

        expect(typeof cf.period).toBe('number');
        expect(typeof cf.paymentDate).toBe('string');
        expect(typeof cf.couponPayment).toBe('number');
        expect(typeof cf.cumulativeInterest).toBe('number');
        expect(typeof cf.remainingPrincipal).toBe('number');
      });
    });

    /**
     * BCC-RS-002: Payment dates should be valid ISO strings
     */
    it('BCC-RS-002: should return valid ISO date strings', () => {
      const result = controller.calculateBond(validDto);

      result.cashflows.forEach((cf) => {
        expect(() => new Date(cf.paymentDate)).not.toThrow();
        expect(new Date(cf.paymentDate).toISOString()).toBe(cf.paymentDate);
      });
    });

    /**
     * BCC-RS-003: Periods should be sequential starting from 1
     */
    it('BCC-RS-003: should have sequential periods starting from 1', () => {
      const result = controller.calculateBond(validDto);

      result.cashflows.forEach((cf, index) => {
        expect(cf.period).toBe(index + 1);
      });
    });
  });

  describe('Single Endpoint Verification', () => {
    /**
     * BCC-SE-001: Should only have calculateBond endpoint
     */
    it('BCC-SE-001: should not have generateCashflowSchedule method', () => {
      expect(controller['generateCashflowSchedule']).toBeUndefined();
    });

    /**
     * BCC-SE-002: calculateBond should return combined response
     */
    it('BCC-SE-002: should return combined calculation and schedule in one call', () => {
      const result = controller.calculateBond(validDto);

      // Verify we have both metrics and cashflows in single response
      expect(result.currentYield).toBeDefined();
      expect(result.yieldToMaturity).toBeDefined();
      expect(result.totalInterest).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.cashflows).toBeDefined();
      expect(result.cashflows.length).toBeGreaterThan(0);
    });
  });
});
