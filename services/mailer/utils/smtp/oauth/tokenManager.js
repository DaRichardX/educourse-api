const axios = require('axios');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');

const clientId = process.env.APPLE_EWS_CLIENT_ID;
const tokenPath = process.env.EWS_REFRESH_TOKEN_PATH;

let tokenCache = {
  access_token: null,
  refresh_token: null,
  expires_at: 0,
};

function loadTokenFile() {
  if (fs.existsSync(tokenPath)) {
    const raw = fs.readFileSync(tokenPath, 'utf-8');
    tokenCache = JSON.parse(raw);
    
  }
}

function saveTokenFile() {
  fs.writeFileSync(tokenPath, JSON.stringify(tokenCache, null, 2), 'utf-8');
}

async function refreshAccessToken() {
  const payload = {
    client_id: clientId,
    scope: 'offline_access https://outlook.office.com/EWS.AccessAsUser.All',
    grant_type: 'refresh_token',
    refresh_token: tokenCache.refresh_token,
  };

  const res = await axios.post(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    qs.stringify(payload),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  tokenCache.access_token = res.data.access_token;
  tokenCache.refresh_token = res.data.refresh_token; // Will be new each time
  tokenCache.expires_at = Date.now() + res.data.expires_in * 1000;

  saveTokenFile();
  return tokenCache.access_token;
}

async function getAccessToken() {
  if (!tokenCache.access_token || Date.now() >= tokenCache.expires_at) {
    console.log(`[OAuth] 🔄 Access token expired. Fetching new token...`);
    const newToken = await refreshAccessToken(); // Your logic here
    console.log(`[OAuth] ✅ New access token fetched. Expires in ${Math.round((newToken.expires_at - Date.now()) / 1000)} seconds.`);
    return tokenCache.access_token;
  } else {
    console.log(`[OAuth] 🟢 Access token still valid. Expires in ${Math.round((tokenCache.expires_at - Date.now()) / 1000)} seconds.`);
    return tokenCache.access_token;
  }
}

// init on module load
loadTokenFile();

module.exports = {
  getAccessToken,
};
