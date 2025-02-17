const isProd = import.meta.env.MODE === 'production';
const REDIRECT_URI = isProd
    ? 'https://www.10000beverages.com/oauth2callback'
    : 'http://localhost:5173/oauth2callback'; 