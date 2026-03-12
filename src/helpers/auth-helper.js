import { appConfig } from "./config";
import { logError } from "./logger";

export const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');

  let authHeader = {
    "Content-Type": "application/json",
  };

  if (token) {
    authHeader["Authorization"] = `Bearer ${token}`;
  }

  return authHeader;
};

export const parseJWT = (token) => {
  if (typeof token !== "string" || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch {
    return null;
  }
};

export const getIsTokenValid = (token) => {
  if (!token) return false;

  const decodedToken = parseJWT(token);
  if (!decodedToken) return false;

  const jwtExpireTimeStamp = decodedToken.exp;
  if (!jwtExpireTimeStamp) return false;

  const jwtExpireDateTime = new Date(jwtExpireTimeStamp * 1000);
  return jwtExpireDateTime > new Date();
};

export const getIsUserAuthorized = (role, targetPath) => {
  if (!role || !targetPath) return false;

  const userRight = appConfig.userRightsOnRoutes?.find((item) =>
    item.urlRegex.test(targetPath)
  );

  if (!userRight) return false;

  return userRight.roles.includes(role);
};
