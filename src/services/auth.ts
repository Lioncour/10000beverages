const REDIRECT_URI = import.meta.env.MODE === 'production'
    ? 'https://www.10000beverages.com/oauth2callback'
    : 'http://localhost:5173/oauth2callback'; 