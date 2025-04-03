import Cookies from "js-cookie";

// Set authentication session (stores token and user in cookies)
export const setAuthSession = (token, user) => {
  Cookies.set("authToken", token, { expires: 7, secure: true, sameSite: "Strict" }); // Expires in 7 days
  Cookies.set("authUser", JSON.stringify(user), { expires: 7, secure: true, sameSite: "Strict" });
};

// Get auth token from cookies
export const getAuthToken = () => {
  return Cookies.get("authToken") || null;
};

// Get user details from cookies
export const getAuthUser = () => {
  const user = Cookies.get("authUser");
  return user ? JSON.parse(user) : null;
};

// Remove authentication session (Logout)
export const removeAuthSession = () => {
  Cookies.remove("authToken");
  Cookies.remove("authUser");
};
