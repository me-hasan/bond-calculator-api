import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BondCalculationDto } from './bond-calculation.dto';

/**
 * Bond Calculation DTO Test Suite
 *
 * Test Coverage:
 * - DTO Validation - Valid Input (BD-001)
 * - DTO Validation - Missing Fields (BD-002 to BD-006)
 * - DTO Validation - Negative/Zero Values (BD-007 to BD-014)
 * - DTO Validation - Invalid Frequency (BD-015 to BD-017)
 * - DTO Validation - Type Mismatch (BD-018 to BD-019)
 * - DTO Validation - Float/Boundary Values (BD-020 to BD-027)
 * - DTO Validation - Null/Empty Values (BD-028 to BD-029)
 */

describe('BondCalculationDto Validation', () => {
  // Valid test data fixture
  const validDto = {
    faceValue: 1000,
    couponRate: 5,
    marketPrice: 950,
    yearsToMaturity: 5,
    couponFrequency: 2,
  };

  /**
   * Helper function to validate DTO and return errors
   */
  async function validateDto(dto: any): Promise<any[]> {
    const dtoInstance = plainToInstance(BondCalculationDto, dto);
    return validate(dtoInstance);
  }

  /**
   * Helper function to check if validation has errors for specific property
   */
  function hasErrorsForProperty(errors: any[], property: string): boolean {
    return errors.some((error) => error.property === property);
  }

  describe('DTO Validation - Valid Input', () => {
    /**
     * BD-001: Accept all valid inputs
     */
    it('BD-001: should accept all valid inputs with no validation errors', async () => {
      const errors = await validateDto(validDto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-001.1: Should accept valid DTO with optional yieldToMaturity
     */
    it('BD-001.1: should accept valid DTO with optional yieldToMaturity', async () => {
      const dtoWithYtm = {
        ...validDto,
        yieldToMaturity: 4.5,
      };

      const errors = await validateDto(dtoWithYtm);

      expect(errors.length).toBe(0);
    });
  });

  describe('DTO Validation - Missing Fields', () => {
    /**
     * BD-002: Reject missing face value
     */
    it('BD-002: should reject DTO with missing faceValue', async () => {
      const { faceValue, ...dtoWithoutFv } = validDto;

      const errors = await validateDto(dtoWithoutFv);

      expect(errors.length).toBeGreaterThan(0);
      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });

    /**
     * BD-003: Reject missing coupon rate
     */
    it('BD-003: should reject DTO with missing couponRate', async () => {
      const { couponRate, ...dtoWithoutCr } = validDto;

      const errors = await validateDto(dtoWithoutCr);

      expect(errors.length).toBeGreaterThan(0);
      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
    });

    /**
     * BD-004: Reject missing market price
     */
    it('BD-004: should reject DTO with missing marketPrice', async () => {
      const { marketPrice, ...dtoWithoutMp } = validDto;

      const errors = await validateDto(dtoWithoutMp);

      expect(errors.length).toBeGreaterThan(0);
      expect(hasErrorsForProperty(errors, 'marketPrice')).toBe(true);
    });

    /**
     * BD-005: Reject missing years
     */
    it('BD-005: should reject DTO with missing yearsToMaturity', async () => {
      const { yearsToMaturity, ...dtoWithoutY } = validDto;

      const errors = await validateDto(dtoWithoutY);

      expect(errors.length).toBeGreaterThan(0);
      expect(hasErrorsForProperty(errors, 'yearsToMaturity')).toBe(true);
    });

    /**
     * BD-006: Reject missing frequency
     */
    it('BD-006: should reject DTO with missing couponFrequency', async () => {
      const { couponFrequency, ...dtoWithoutFreq } = validDto;

      const errors = await validateDto(dtoWithoutFreq);

      expect(errors.length).toBeGreaterThan(0);
      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });
  });

  describe('DTO Validation - Negative/Zero Values', () => {
    /**
     * BD-007: Reject negative face value
     */
    it('BD-007: should reject negative faceValue', async () => {
      const dto = { ...validDto, faceValue: -1000 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
      const faceValueErrors = errors.filter((e) => e.property === 'faceValue');
      expect(faceValueErrors.length).toBeGreaterThan(0);

      const constraints = faceValueErrors[0].constraints;
      expect(constraints).toBeDefined();
      expect(constraints.isPositive || constraints.min).toBeDefined();
    });

    /**
     * BD-008: Reject zero face value
     */
    it('BD-008: should reject zero faceValue', async () => {
      const dto = { ...validDto, faceValue: 0 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });

    /**
     * BD-009: Reject negative coupon rate
     */
    it('BD-009: should reject negative couponRate', async () => {
      const dto = { ...validDto, couponRate: -5 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
    });

    /**
     * BD-010: Reject coupon rate above 100
     */
    it('BD-010: should reject couponRate above 100', async () => {
      const dto = { ...validDto, couponRate: 150 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
      const couponRateErrors = errors.filter((e) => e.property === 'couponRate');
      expect(couponRateErrors[0].constraints.max).toBeDefined();
    });

    /**
     * BD-011: Reject negative market price
     */
    it('BD-011: should reject negative marketPrice', async () => {
      const dto = { ...validDto, marketPrice: -950 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'marketPrice')).toBe(true);
    });

    /**
     * BD-012: Reject zero market price
     */
    it('BD-012: should reject zero marketPrice', async () => {
      const dto = { ...validDto, marketPrice: 0 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'marketPrice')).toBe(true);
    });

    /**
     * BD-013: Reject negative years
     */
    it('BD-013: should reject negative yearsToMaturity', async () => {
      const dto = { ...validDto, yearsToMaturity: -5 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yearsToMaturity')).toBe(true);
    });

    /**
     * BD-014: Reject zero years
     */
    it('BD-014: should reject zero yearsToMaturity', async () => {
      const dto = { ...validDto, yearsToMaturity: 0 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yearsToMaturity')).toBe(true);
    });
  });

  describe('DTO Validation - Invalid Frequency', () => {
    /**
     * BD-015: Reject invalid frequency
     */
    it('BD-015: should reject string frequency value', async () => {
      const dto = { ...validDto, couponFrequency: 'quarterly' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-015.1: Reject frequency not in [1, 2, 4, 12]
     */
    it('BD-015.1: should reject frequency value of 3', async () => {
      const dto = { ...validDto, couponFrequency: 3 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
      const freqErrors = errors.filter((e) => e.property === 'couponFrequency');
      expect(freqErrors[0].constraints.isIn).toBeDefined();
    });

    /**
     * BD-015.2: Reject frequency value of 0
     */
    it('BD-015.2: should reject frequency value of 0', async () => {
      const dto = { ...validDto, couponFrequency: 0 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-015.3: Reject frequency value of 5
     */
    it('BD-015.3: should reject frequency value of 5', async () => {
      const dto = { ...validDto, couponFrequency: 5 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-015.4: Reject frequency value of 6
     */
    it('BD-015.4: should reject frequency value of 6', async () => {
      const dto = { ...validDto, couponFrequency: 6 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-016: Lowercase frequency (N/A - frequency is numeric, not string)
     */
    it('BD-016: should reject non-numeric frequency', async () => {
      // Since frequency is a number field, "annual" string would be rejected
      const dto = { ...validDto, couponFrequency: 'annual' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-017: Uppercase frequency (N/A - frequency is numeric, not string)
     */
    it('BD-017: should reject non-numeric uppercase frequency', async () => {
      // Since frequency is a number field, "ANNUAL" string would be rejected
      const dto = { ...validDto, couponFrequency: 'ANNUAL' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });
  });

  describe('DTO Validation - Type Mismatch', () => {
    /**
     * BD-018: Reject string face value
     */
    it('BD-018: should reject string faceValue', async () => {
      const dto = { ...validDto, faceValue: '1000' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
      const fvErrors = errors.filter((e) => e.property === 'faceValue');
      expect(fvErrors[0].constraints.isNumber).toBeDefined();
    });

    /**
     * BD-019: Reject string coupon rate
     */
    it('BD-019: should reject string couponRate', async () => {
      const dto = { ...validDto, couponRate: '5%' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
    });
  });

  describe('DTO Validation - Float/Boundary Values', () => {
    /**
     * BD-020: Accept float face value
     */
    it('BD-020: should accept float faceValue', async () => {
      const dto = { ...validDto, faceValue: 1000.50 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-021: Accept float coupon rate
     */
    it('BD-021: should accept float couponRate', async () => {
      const dto = { ...validDto, couponRate: 5.5 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-022: Accept float years
     */
    it('BD-022: should accept float yearsToMaturity', async () => {
      const dto = { ...validDto, yearsToMaturity: 5.5 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-023: Accept minimum face value
     */
    it('BD-023: should accept minimum faceValue of 1', async () => {
      const dto = { ...validDto, faceValue: 1 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-024: Accept large face value
     */
    it('BD-024: should accept large faceValue', async () => {
      const dto = { ...validDto, faceValue: 999999999 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-025: Accept minimum coupon rate (0.01)
     * Note: The DTO has min 0.01, not 0
     */
    it('BD-025: should accept minimum couponRate of 0.01', async () => {
      const dto = { ...validDto, couponRate: 0.01 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-025.1: Reject coupon rate below 0.01
     */
    it('BD-025.1: should reject couponRate below 0.01', async () => {
      const dto = { ...validDto, couponRate: 0.001 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
    });

    /**
     * BD-026: Accept boundary coupon rate (100)
     */
    it('BD-026: should accept maximum couponRate of 100', async () => {
      const dto = { ...validDto, couponRate: 100 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-027: Reject coupon rate just above 100
     */
    it('BD-027: should reject couponRate just above 100', async () => {
      const dto = { ...validDto, couponRate: 100.01 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
    });

    /**
     * BD-027.1: Accept boundary years (0.1)
     */
    it('BD-027.1: should accept minimum yearsToMaturity of 0.1', async () => {
      const dto = { ...validDto, yearsToMaturity: 0.1 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-027.2: Reject years below 0.1
     */
    it('BD-027.2: should reject yearsToMaturity below 0.1', async () => {
      const dto = { ...validDto, yearsToMaturity: 0.01 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yearsToMaturity')).toBe(true);
    });

    /**
     * BD-027.3: Accept boundary years (100)
     */
    it('BD-027.3: should accept maximum yearsToMaturity of 100', async () => {
      const dto = { ...validDto, yearsToMaturity: 100 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-027.4: Reject years above 100
     */
    it('BD-027.4: should reject yearsToMaturity above 100', async () => {
      const dto = { ...validDto, yearsToMaturity: 100.1 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yearsToMaturity')).toBe(true);
    });
  });

  describe('DTO Validation - Null/Empty Values', () => {
    /**
     * BD-028: Reject null values
     */
    it('BD-028: should reject null faceValue', async () => {
      const dto = { ...validDto, faceValue: null };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });

    /**
     * BD-028.1: Reject null couponRate
     */
    it('BD-028.1: should reject null couponRate', async () => {
      const dto = { ...validDto, couponRate: null };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponRate')).toBe(true);
    });

    /**
     * BD-028.2: Reject null marketPrice
     */
    it('BD-028.2: should reject null marketPrice', async () => {
      const dto = { ...validDto, marketPrice: null };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'marketPrice')).toBe(true);
    });

    /**
     * BD-028.3: Reject null yearsToMaturity
     */
    it('BD-028.3: should reject null yearsToMaturity', async () => {
      const dto = { ...validDto, yearsToMaturity: null };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yearsToMaturity')).toBe(true);
    });

    /**
     * BD-028.4: Reject null couponFrequency
     */
    it('BD-028.4: should reject null couponFrequency', async () => {
      const dto = { ...validDto, couponFrequency: null };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-029: Reject empty string for frequency
     */
    it('BD-029: should reject empty string for couponFrequency', async () => {
      const dto = { ...validDto, couponFrequency: '' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'couponFrequency')).toBe(true);
    });

    /**
     * BD-029.1: Reject empty string for faceValue
     */
    it('BD-029.1: should reject empty string for faceValue', async () => {
      const dto = { ...validDto, faceValue: '' as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });
  });

  describe('DTO Validation - Valid Frequencies', () => {
    /**
     * BD-FREQ-001: Accept frequency of 1 (annual)
     */
    it('BD-FREQ-001: should accept frequency of 1 (annual)', async () => {
      const dto = { ...validDto, couponFrequency: 1 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-FREQ-002: Accept frequency of 2 (semi-annual)
     */
    it('BD-FREQ-002: should accept frequency of 2 (semi-annual)', async () => {
      const dto = { ...validDto, couponFrequency: 2 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-FREQ-003: Accept frequency of 4 (quarterly)
     */
    it('BD-FREQ-003: should accept frequency of 4 (quarterly)', async () => {
      const dto = { ...validDto, couponFrequency: 4 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-FREQ-004: Accept frequency of 12 (monthly)
     */
    it('BD-FREQ-004: should accept frequency of 12 (monthly)', async () => {
      const dto = { ...validDto, couponFrequency: 12 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('DTO Validation - Yield to Maturity (Optional Field)', () => {
    /**
     * BD-YTM-001: Accept missing yieldToMaturity (it's optional)
     */
    it('BD-YTM-001: should accept missing yieldToMaturity', async () => {
      const dto = { ...validDto };

      // Don't include yieldToMaturity
      delete (dto as any).yieldToMaturity;

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-YTM-002: Accept valid yieldToMaturity
     */
    it('BD-YTM-002: should accept valid yieldToMaturity', async () => {
      const dto = { ...validDto, yieldToMaturity: 4.5 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-YTM-003: Reject negative yieldToMaturity
     */
    it('BD-YTM-003: should reject negative yieldToMaturity', async () => {
      const dto = { ...validDto, yieldToMaturity: -1 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yieldToMaturity')).toBe(true);
    });

    /**
     * BD-YTM-004: Reject yieldToMaturity above 100
     */
    it('BD-YTM-004: should reject yieldToMaturity above 100', async () => {
      const dto = { ...validDto, yieldToMaturity: 101 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yieldToMaturity')).toBe(true);
    });

    /**
     * BD-YTM-005: Reject yieldToMaturity below 0.01
     */
    it('BD-YTM-005: should reject yieldToMaturity below 0.01', async () => {
      const dto = { ...validDto, yieldToMaturity: 0 };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'yieldToMaturity')).toBe(true);
    });
  });

  describe('DTO Validation - Edge Cases', () => {
    /**
     * BD-EDGE-001: Accept decimal market price
     */
    it('BD-EDGE-001: should accept decimal marketPrice', async () => {
      const dto = { ...validDto, marketPrice: 950.75 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-EDGE-002: Accept very small positive faceValue
     */
    it('BD-EDGE-002: should accept very small positive faceValue', async () => {
      const dto = { ...validDto, faceValue: 1.01 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-EDGE-003: Accept very small positive marketPrice
     */
    it('BD-EDGE-003: should accept very small positive marketPrice', async () => {
      const dto = { ...validDto, marketPrice: 0.01 };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });

    /**
     * BD-EDGE-004: Reject undefined for required fields
     */
    it('BD-EDGE-004: should reject undefined faceValue', async () => {
      const dto = { ...validDto, faceValue: undefined };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });

    /**
     * BD-EDGE-005: Accept undefined for optional yieldToMaturity
     */
    it('BD-EDGE-005: should accept undefined for optional yieldToMaturity', async () => {
      const dto = { ...validDto, yieldToMaturity: undefined };

      const errors = await validateDto(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('DTO Validation - Type Transformation', () => {
    /**
     * BD-TYPE-001: plainToInstance does not auto-transform strings without @Type decorator
     * This test documents the current behavior - strings remain strings and fail validation
     */
    it('BD-TYPE-001: should keep string as string (no @Type decorator on DTO)', async () => {
      const dto = { ...validDto, faceValue: '1000' };

      const dtoInstance = plainToInstance(BondCalculationDto, dto);
      // Without @Type() decorator, plainToInstance keeps the type as-is
      expect(typeof dtoInstance.faceValue).toBe('string');

      // Validation should fail because it's a string, not a number
      const errors = await validateDto(dto);
      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });

    /**
     * BD-TYPE-002: Should handle boolean to number conversion attempt
     */
    it('BD-TYPE-002: should reject boolean for faceValue', async () => {
      const dto = { ...validDto, faceValue: true as any };

      const errors = await validateDto(dto);

      expect(hasErrorsForProperty(errors, 'faceValue')).toBe(true);
    });
  });

  describe('DTO Validation - Multiple Errors', () => {
    /**
     * BD-MULT-001: Should report multiple validation errors
     */
    it('BD-MULT-001: should report multiple validation errors at once', async () => {
      const invalidDto = {
        faceValue: -1000,
        couponRate: -5,
        marketPrice: 0,
        yearsToMaturity: -1,
        couponFrequency: 99,
      };

      const errors = await validateDto(invalidDto);

      expect(errors.length).toBeGreaterThan(1);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('faceValue');
      expect(properties).toContain('couponRate');
      expect(properties).toContain('marketPrice');
      expect(properties).toContain('yearsToMaturity');
      expect(properties).toContain('couponFrequency');
    });

    /**
     * BD-MULT-002: Should report specific constraint messages
     */
    it('BD-MULT-002: should include specific constraint messages', async () => {
      const dto = { ...validDto, faceValue: -1000 };

      const errors = await validateDto(dto);
      const faceValueError = errors.find((e) => e.property === 'faceValue');

      expect(faceValueError).toBeDefined();
      expect(faceValueError.constraints).toBeDefined();

      // Check for isPositive constraint
      if (faceValueError.constraints.isPositive) {
        expect(faceValueError.constraints.isPositive).toBeDefined();
      }
    });
  });
});
