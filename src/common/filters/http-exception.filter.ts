import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the full exception for debugging
    this.logger.error(`[EXCEPTION] URL: ${request.url}`);
    this.logger.error(`[EXCEPTION] Method: ${request.method}`);
    this.logger.error(`[EXCEPTION] Body: ${JSON.stringify(request.body)}`);
    this.logger.error(`[EXCEPTION] Exception: ${exception instanceof Error ? exception.message : String(exception)}`);

    if (exception instanceof Error && exception.stack) {
      this.logger.error(`[EXCEPTION] Stack: ${exception.stack}`);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || message;
        errors = responseObj.errors;

        // Handle custom validation error format from exception factory
        if (responseObj.message === 'Validation failed' && responseObj.errors) {
          status = HttpStatus.BAD_REQUEST;
          message = 'Validation failed';
          errors = responseObj.errors;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Handle validation errors
    if (status === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
      errors = message;
      message = 'Validation failed';
    }

    this.logger.error(`[EXCEPTION] Returning status ${status}, message: ${message}, errors: ${JSON.stringify(errors)}`);

    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
