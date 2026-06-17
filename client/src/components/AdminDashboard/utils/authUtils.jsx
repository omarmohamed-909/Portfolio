import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

export async function verifyJWTToken() {
  try {
    const response = await axios.get(`${Backend_Root_Url}/api/verify/jwt`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (response.data.access === true) {
      return { isAuthenticated: true, role: response.data.role || null };
    } else {
      return { isAuthenticated: false, role: null };
    }
  } catch (err) {
    if (err.response?.status === 401) {
      clearAllAuthCookies();
      return { isAuthenticated: false, role: null };
    } else if (err.response?.status === 403) {
      return { isAuthenticated: false, role: null };
    } else {
      return { isAuthenticated: false, role: null };
    }
  }
}

function clearAllAuthCookies() {
  const cookies = document.cookie.split(";");

  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

    const domain = window.location.hostname;
    if (domain.includes(".")) {
      const parentDomain = "." + domain.split(".").slice(-2).join(".");
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
    }
  });
}

export async function logout() {
  try {
    const response = await axios.post(
      `${Backend_Root_Url}/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    if (response.status === 200) {
      clearAllAuthCookies();
      window.location.href = "/";
      return true;
    } else {
      clearAllAuthCookies();
      window.location.href = "/";
      return false;
    }
  } catch (err) {
    clearAllAuthCookies();
    window.location.href = "/";
    return false;
  }
}

export { clearAllAuthCookies };
