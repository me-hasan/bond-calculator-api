# Bond Calculator Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)
![License](https://img.shields.io/badge/License-UNLICENSED-orange)

*A production-grade RESTful API for financial bond calculations, built with enterprise-grade architecture and comprehensive test coverage.*

[Features](#-features) &bull; [Architecture](#-architecture) &bull; [API Documentation](#-api-documentation) &bull; [Testing](#-testing) &bull; [Project Structure](#-project-structure)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Financial Calculations](#-financial-calculations)
- [Validation Rules](#-validation-rules)
- [Error Handling](#-error-handling)
- [Code Quality](#-code-quality)
- [License](#-license)

---

## Overview

This is a **NestJS-based backend service** that provides a robust API for calculating bond metrics including Current Yield, Yield to Maturity (YTM), Total Interest, Bond Status (Premium/Discount/Par), and detailed Cashflow Schedules.

The application follows **enterprise-grade software engineering practices** including:

- **Clean Architecture** with separation of concerns
- **Comprehensive Unit Testing** with 108+ test cases
- **DTO Validation** using `class-validator` decorators
- **Exception Filtering** for consistent error responses
- **TypeScript** for type safety and better developer experience

---

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Current Yield Calculation** | `(Annual Coupon / Market Price) × 100` |
| **Yield to Maturity (YTM)** | Approximation formula with periodic adjustments |
| **Total Interest** | `Annual Coupon × Years to Maturity` |
| **Bond Status** | Automatic Premium/Discount/Par classification |
| **Cashflow Schedule** | Period-by-period payment breakdown with dates |
| **Multiple Frequencies** | Annual (1), Semi-Annual (2), Quarterly (4), Monthly (12) |

### Technical Highlights

- **108+ Unit Tests** covering controllers, services, and DTOs
- **Input Validation** with detailed error messages
- **RESTful API** design following HTTP standards
- **Type-Safe** TypeScript implementation
- **Modular Architecture** for scalability

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | NestJS | 11.0.1 |
| **Language** | TypeScript | 5.7.3 |
| **Runtime** | Node.js | 22.x |
| **Validation** | class-validator | 0.14.3 |
| **Transformation** | class-transformer | 0.5.1 |
| **Testing** | Jest | 30.0.0 |
| **HTTP Server** | Express | (via @nestjs/platform-express) |

---

## Architecture

### Design Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                        Controller Layer                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BondsController                                     │   │
│  │  - Request/Response handling                         │   │
│  │  - Route definition (@Post)                          │   │
│  │  - HTTP Exception Filter                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Service Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BondsService                                        │   │
│  │  - Business logic                                    │   │
│  │  - Financial calculations                            │   │
│  │  - Cashflow generation                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          Data Layer                          │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  DTOs            │  │  Exceptions                    │  │
│  │  - Validation     │  │  - Custom error classes        │  │
│  │  - Transformation │  │  - HTTP status codes           │  │
│  └──────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/
├── bonds/                    # Bonds Module
│   ├── bonds.controller.ts   # REST API endpoints
│   ├── bonds.service.ts      # Business logic
│   ├── bonds.module.ts       # Module definition
│   ├── dto/                  # Data Transfer Objects
│   │   ├── bond-calculation.dto.ts
│   │   ├── bond-calculation-response.dto.ts
│   │   └── cashflow-row.dto.ts
│   ├── exceptions/           # Custom exceptions
│   │   └── bond-calculation.exception.ts
│   ├── bonds.service.spec.ts     # Service unit tests (62 tests)
│   └── bonds.controller.spec.ts  # Controller unit tests (46 tests)
├── common/                   # Shared utilities
│   └── filters/
│       └── http-exception.filter.ts
└── main.ts                   # Application entry point
```

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Calculate Bond Metrics

```http
POST /bond/calculate
Content-Type: application/json
```

**Request Body:**
```json
{
  "faceValue": 1000,
  "couponRate": 5,
  "marketPrice": 950,
  "yearsToMaturity": 5,
  "couponFrequency": 2,
  "yieldToMaturity": 4.5
}
```

**Response (200 OK):**
```json
{
  "currentYield": 5.2631578947368425,
  "yieldToMaturity": 6.389482699238392,
  "totalInterest": 250,
  "status": "Discount",
  "cashflows": [
    {
      "period": 1,
      "type": "coupon",
      "amount": 25,
      "presentValue": 24.23
    },
    {
      "period": 10,
      "type": "principal",
      "amount": 1025,
      "presentValue": 755.96
    }
  ]
}
```

#### 2. Generate Cashflow Schedule

```http
POST /bond/cashflow-schedule
Content-Type: application/json
```

**Request Body:** Same as calculate endpoint

**Response (200 OK):**
```json
[
  {
    "period": 1,
    "paymentDate": "2025-05-24T00:00:00.000Z",
    "couponPayment": 25,
    "cumulativeInterest": 25,
    "remainingPrincipal": 1000
  }
]
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Successful calculation |
| 400 | Validation error (invalid input) |
| 422 | Business logic error (calculation failed) |
| 500 | Internal server error |

---

## Installation

### Prerequisites
- Node.js 22.x or higher
- npm 10.x or higher

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install
```

---

## Running the Application

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will start on **http://localhost:3000**

---

## Testing

### Test Coverage Overview

| Suite | Tests | Status |
|-------|-------|--------|
| Bonds Service | 62 | ✅ Passing |
| Bonds Controller | 46 | ✅ Passing |
| **Total** | **108** | **✅ All Passing** |

### Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run specific test suite
npm run test -- bonds.service.spec.ts
npm run test -- bonds.controller.spec.ts
npm run test -- bond-calculation.dto.spec.ts
```

### Test Categories

#### Service Tests (62 tests)
- Current yield calculations
- YTM calculations with approximation
- Total interest calculations
- Bond status determination (Premium/Discount/Par)
- Cashflow generation
- Edge cases and boundary values

#### Controller Tests (46 tests)
- Request/response handling
- DTO validation
- Error handling
- Service integration
- HTTP status codes

#### DTO Tests (62 tests)
- Field validation
- Type checking
- Boundary values
- Required vs optional fields
- Multiple error reporting

---

## Project Structure

```
backend/
├── src/
│   ├── bonds/                      # Bonds Module
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── bond-calculation.dto.ts
│   │   │   ├── bond-calculation.dto.spec.ts
│   │   │   ├── bond-calculation-response.dto.ts
│   │   │   └── cashflow-row.dto.ts
│   │   ├── exceptions/             # Custom Exceptions
│   │   │   └── bond-calculation.exception.ts
│   │   ├── bonds.controller.ts     # REST Controller
│   │   ├── bonds.controller.spec.ts
│   │   ├── bonds.service.ts        # Business Logic
│   │   ├── bonds.service.spec.ts
│   │   └── bonds.module.ts         # Module Definition
│   ├── common/                     # Shared Code
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts                     # Application Entry Point
├── test/                           # E2E Tests
│   └── jest-e2e.json
├── .eslintrc.json                  # ESLint Configuration
├── .prettierrc                     # Prettier Configuration
├── jest.config.js                  # Jest Configuration
├── nest-cli.json                   # NestJS CLI Configuration
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── README.md
```

---

## Financial Calculations

### Current Yield
```
Current Yield = (Annual Coupon Payment / Market Price) × 100
```

### Yield to Maturity (YTM)
```
YTM ≈ [(Annual Coupon + (Face Value - Market Price) / Years) /
       ((Face Value + Market Price) / 2)] × 100
```

### Total Interest
```
Total Interest = Annual Coupon × Years to Maturity
```

### Bond Status
- **Premium**: Market Price > Face Value
- **Discount**: Market Price < Face Value
- **Par**: Market Price = Face Value

### Cashflow Present Value
```
PV = Payment / (1 + Periodic YTM)^Period
```

---

## Validation Rules

### Request Validation

| Field | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| `faceValue` | number | 1 | - | Yes |
| `couponRate` | number | 0.01 | 100 | Yes |
| `marketPrice` | number | 0.01 | - | Yes |
| `yearsToMaturity` | number | 0.1 | 100 | Yes |
| `couponFrequency` | number | - | - | Yes |
| `yieldToMaturity` | number | 0.01 | 100 | No |

### Valid Coupon Frequencies
- `1` - Annual
- `2` - Semi-Annual
- `4` - Quarterly
- `12` - Monthly

---

## Error Handling

### Custom Exceptions

```typescript
// Base exception for bond calculation errors
class BondCalculationException extends HttpException

// Invalid input data (400)
class InvalidBondDataException extends BondCalculationException

// Bond not found (404)
class BondNotFoundException extends BondCalculationException
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": ["Face value must be at least 1"],
  "error": "Bad Request"
}
```

---

## Code Quality

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run format
```

### Build
```bash
# Build for production
npm run build
```

---

## License

**UNLICENSED**

---

<div align="center">

**Built with ❤️ using NestJS**

[Documentation](#-overview) &bull; [API Reference](#-api-documentation) &bull; [Testing Guide](#-testing)

</div>
