/**
 * @file api.js
 * @description Centralized API configuration for Politeknik Baja Tegal Attendance System.
 * Single source of truth for backend endpoints and network policies.
 */

export const DEFAULT_API_URL = "https://finger-be.pbjt.ac.id/api";
export const API_BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_API_URL;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    VERIFY_CODE: `${API_BASE_URL}/auth/verify-code`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  ATTENDANCE: {
    STREAM: `${API_BASE_URL}/device/stream`,
    PERSONAL_ME: `${API_BASE_URL}/personal/me`,
    PERSONAL_SUMMARY: `${API_BASE_URL}/personal/me/summary`,
  },
  PUSH: {
    SUBSCRIBE: `${API_BASE_URL}/push/subscribe`,
    VAPID_PUBLIC_KEY: `${API_BASE_URL}/push/vapid-public-key`,
  },
};
