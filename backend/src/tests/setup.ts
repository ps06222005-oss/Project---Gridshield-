/**
 * tests/setup.ts — Global test setup.
 * Sets NODE_ENV=test so rate limiters are disabled.
 */
process.env.NODE_ENV = 'test';
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'test-project';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gridshield_test';

