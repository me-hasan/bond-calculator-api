import { HttpException, HttpStatus } from '@nestjs/common';

export class BondCalculationException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) {
    super(
      {
        statusCode: status,
        message,
        error: 'Bond Calculation Error',
      },
      status,
    );
  }
}

export class InvalidBondDataException extends BondCalculationException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class BondNotFoundException extends BondCalculationException {
  constructor(identifier: string) {
    super(`Bond with identifier "${identifier}" not found`, HttpStatus.NOT_FOUND);
  }
}
