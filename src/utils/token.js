import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_SALT = "secretKey";
export const REFRESH_TOKEN_SALT = "refreshSecretKey";

export function generateAuthTokens(payload, withRefreshToken = true) {
  let accessToken = jwt.sign({ payload }, ACCESS_TOKEN_SALT, {
    expiresIn: "50s"
  });
  let refreshToken = jwt.sign({ payload }, REFRESH_TOKEN_SALT);

  if (!withRefreshToken) {
    return accessToken;
  } else {
    return {
      access: accessToken,
      refresh: refreshToken
    };
  }
}

export function verifyAccessToken(jwtToken) {
  return jwt.verify(jwtToken, ACCESS_TOKEN_SALT);
}

export function verifyRefreshToken(jwtToken) {
  return jwt.verify(jwtToken, REFRESH_TOKEN_SALT);
}
