import {
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsIn,
  IsOptional,
} from 'class-validator';

export class BondCalculationDto {
  @IsNumber({}, { message: 'Face value must be a number' })
  @IsPositive()
  @Min(1, { message: 'Face value must be at least 1' })
  faceValue: number;

  @IsNumber({}, { message: 'Coupon rate must be a number' })
  @IsPositive()
  @Min(0.01, { message: 'Coupon rate must be at least 0.01%' })
  @Max(100, { message: 'Coupon rate cannot exceed 100%' })
  couponRate: number;

  @IsNumber({}, { message: 'Market price must be a number' })
  @IsPositive()
  @Min(0.01, { message: 'Market price must be at least 0.01' })
  marketPrice: number;

  @IsNumber({}, { message: 'Years to maturity must be a number' })
  @IsPositive()
  @Min(0.1, { message: 'Years to maturity must be at least 0.1' })
  @Max(100, { message: 'Years to maturity cannot exceed 100 years' })
  yearsToMaturity: number;

  @IsNumber({}, { message: 'Coupon frequency must be a number' })
  @IsIn([1, 2, 4, 12], {
    message: 'Coupon frequency must be 1 (annual), 2 (semi-annual), 4 (quarterly), or 12 (monthly)',
  })
  couponFrequency: number;

  @IsOptional()
  @IsNumber({}, { message: 'Yield to maturity must be a number' })
  @IsPositive()
  @Min(0.01, { message: 'Yield to maturity must be at least 0.01%' })
  @Max(100, { message: 'Yield to maturity cannot exceed 100%' })
  yieldToMaturity?: number;
}
