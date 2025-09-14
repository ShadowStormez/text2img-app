// text2img-app/server/src/config/googleAuth.js

import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL;

const oAuth2Client = new OAuth2Client({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

// ✅ EXPORT USING ESM SYNTAX (NOT COMMONJS)
export { oAuth2Client };
export const getClientId = () => CLIENT_ID;