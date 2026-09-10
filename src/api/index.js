// src/api/index.js
// Export all API functions from a single entry point

export * from './technicians';
export * from './bookings';
export * from './clients';

// Default exports for convenience
export { default as techniciansApi } from './technicians';
export { default as bookingsApi } from './bookings';
export { default as clientsApi } from './clients';
