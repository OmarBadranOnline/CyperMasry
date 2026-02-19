/**
 * Global API Configuration
 * 
 * In development: Uses http://localhost:5000
 * In production: Uses VITE_API_URL from environment variables (Netlify)
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
