// API Configuration
// For Vercel deployment (same domain): use empty string or relative paths
// For local development: use localhost:5000
// For separate backend: use full backend URL

const isDevelopment = import.meta.env.DEV;
const configuredUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = configuredUrl !== undefined && configuredUrl !== '' 
  ? configuredUrl 
  : isDevelopment 
    ? 'http://localhost:5000' 
    : ''; // Empty string for same-domain deployment on Vercel

// Helper function to construct API endpoints
export const getApiUrl = (endpoint: string): string => {
  // If API_BASE_URL is empty (Vercel same-domain), just return the endpoint
  if (API_BASE_URL === '') {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
  
  // Otherwise, combine base URL with endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Example usage:
// const response = await fetch(getApiUrl('/api/builder/my-properties'), {...});
