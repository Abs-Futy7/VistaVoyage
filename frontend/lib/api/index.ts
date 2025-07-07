// Export all services and utilities
export { apiClient, tokenManager } from './client';
export { API_CONFIG } from './config';
export * from './types';

// Services
export { authService } from './services/auth';
export { packageService } from './services/packages';
export { bookingService } from './services/bookings';
export { adminService } from './services/admin';
export { blogService } from './services/blog';
export { destinationService } from './services/destinations';
export { offerService } from './services/offers';
export { tripTypeService } from './services/tripTypes';
export { promoCodeService } from './services/promocode';

// Diagnostics
export { ConnectionTester, runDiagnostics } from './diagnostics';
