

const BASE_URL = "http://localhost:8080";
const getToken=()=>localStorage.getItem("token")

const authHeaders =()=>{
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
};

// Generic fetch wrapper
const apiFetch = async ( endpoints, { authRequired = false, option ={} })=>{
    const token = getToken();
    if(!token  && authRequired ){
        return {
            success :false,
            message : "no token found",
            data: null,
        }
    }
    try{
        let resp = await fetch(`${BASE_URL}${endpoints}`, {
            ...option,
            headers : {
                ...(option.headers || {}),
                ...(authRequired ? authHeaders() : {}),
            },
        });
        // If 401 Unauthorized, try to refresh token and retry
        if(resp.status === 401 && authRequired){
            // Call refreshToken endpoint
            const refreshResp = await refreshToken();
            if(refreshResp && refreshResp.success && refreshResp.data && refreshResp.data.token){
                localStorage.setItem("token", refreshResp.data.token);
                // Retry original request with new token
                resp = await fetch(`${BASE_URL}${endpoints}`, {
                    ...option,
                    headers : {
                        ...(option.headers || {}),
                        ...authHeaders(),
                    },
                });
                if(resp.status === 401){
                    localStorage.removeItem("token");
                    return {
                        success: false,
                        message: "Unauthorized after refresh",
                        data: null,
                    };
                }
            }else{
                localStorage.removeItem("token");
                return {
                    success: false,
                    message: "Unauthorized, refresh failed",
                    data: null,
                };
            }
        }
        if(resp.status === 403){
            localStorage.removeItem("token");
            return {
                success: false,
                message: "Forbidden",
                data: null,
            };
        }
        if(resp.status === 400){
            const json = await resp.json().catch(()=>null);
            console.log(json)
            return json;
        }
        return await resp.json();
    }catch(error){
        console.error("API Fetch Error:", error);
        // Do NOT remove token on network/server error
        return { success: false, message: "Network error or server is unreachable.", data: null };
    }
};


//===========================API function ===================================
// Check if phone number exists
export const checkPhoneNumber = (phoneNumber) => {
    return apiFetch(`/api/user/check-phone?phone=${phoneNumber}`, {
        authRequired: true,
        option: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    });
};
export const login = ({username,password}) =>{
    return apiFetch("/api/auth/login",{
        authRequired : false,
        option : {method :"POST",
        headers : {
            "Content-Type" : "application/json", },
        body : JSON.stringify({username,password}),
    }});
}

export const signup = (userData) =>{
    return apiFetch("/api/auth/signUp",{
        authRequired : false,
        option : {method :"POST",
        headers : {
            "Content-Type" : "application/json", },
        body : JSON.stringify(userData),
    }});
}
export const refreshToken = () =>{
    return apiFetch("/api/auth/refresh",{
        authRequired : true,
        option : {method :"GET",
        headers : {
            "Content-Type" : "application/json", },
        }});
}
