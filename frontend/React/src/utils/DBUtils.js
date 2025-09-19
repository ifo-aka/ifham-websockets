const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

// Generic fetch wrapper
const apiFetch = async (endpoints, { authRequired = false, option = {} }) => {
  const token = getToken();
  if (!token && authRequired) {
    return {
      success: false,
      message: "no token found",
      data: null,
    };
  }
  try {
    let resp = await fetch(`${BASE_URL}${endpoints}`, {
      ...option,
      headers: {
        ...(option.headers || {}),
        ...(authRequired ? authHeaders() : {}),
      },
    });

    // If 401 Unauthorized, try refresh
    if (resp.status === 401 && authRequired) {
      const refreshResp = await refreshToken();
      if (
        refreshResp &&
        refreshResp.success &&
        refreshResp.data &&
        refreshResp.data.token
      ) {
        localStorage.setItem("token", refreshResp.data.token);
        resp = await fetch(`${BASE_URL}${endpoints}`, {
          ...option,
          headers: {
            ...(option.headers || {}),
            ...authHeaders(),
          },
        });
        if (resp.status === 401) {
          return {
            success: false,
            message: "Unauthorized after refresh",
            data: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Unauthorized, refresh failed",
          data: null,
        };
      }
    }

    if (resp.status === 403) {
      return {
        success: false,
        message: "Forbidden",
        data: null,
      };
    }
    if (resp.status === 400) {
      const json = await resp.json().catch(() => null);
      return json;
    }
    const json = await resp.json();
    console.log(json)
    return json;
  } catch (error) {
    console.error("API Fetch Error:", error);
    return {
      success: false,
      message: "Network error or server is unreachable.",
      data: null,
    };
  }
};

// =========================== AUTH APIs ===========================
export const checkPhoneNumber = (phoneNumber) => {
  return apiFetch(`/api/user/check-phone?phone=${phoneNumber}`, {
    authRequired: true,
    option: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });
};

export const login = ({ username, password }) => {
  return apiFetch("/api/auth/login", {
    authRequired: false,
    option: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
  });
};

export const signup = (userData) => {
  return apiFetch("/api/auth/signUp", {
    authRequired: false,
    option: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    },
  });
};

export const refreshToken = () => {
  return apiFetch("/api/auth/refresh", {
    authRequired: true,
    option: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
};

// =========================== CONTACT APIs ===========================
// Get all contacts for logged-in user
export const getContacts = (userId) => {
  return apiFetch(`/api/user/${userId}/contacts`, {
    authRequired: true,
    option: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });
};

// Add a new contact
export const addContact = (contactData,userId) => {
    console.log(contactData,userId)
  return apiFetch(`/api/user/${userId}/contacts`, {
    authRequired: true,
    option: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData),
    },
  });
};

// Delete a contact by ID
export const deleteContact = (contactId) => {
  return apiFetch(`/api/contacts/${contactId}`, {
    authRequired: true,
    option: { method: "DELETE" },
  });
};
