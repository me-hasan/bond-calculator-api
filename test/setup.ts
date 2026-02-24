// Test setup file for Jest
// This file runs before all tests

// Import reflect-metadata for class-validator and class-transformer
import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for async operations
jest.setTimeout(10000);
