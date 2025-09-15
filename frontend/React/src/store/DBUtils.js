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
        throw new Error("No token found");
    }
    try{
        const resp = await fetch(`${BASE_URL}${endpoints}`, {
            ...option,
            headers : {
                ...(option.headers || {}),
                ...(authRequired ? authHeaders() : {}),

            },
        })
        if([401,403].includes(resp.status)){
            localStorage.removeItem("token");
            return{
                error : resp.status===401 ? "Unauthorized" : "Forbidden",
                status : resp.status,
            };

        }
        if(resp.status=== 400){
            const json = await resp.json().catch(()=>null);
            return {
                error : json?.message || "Bad Request",
                status : resp.status,
                details : json,
            };
        }
        return await resp.json();

    }catch(error){
        console.error("API Fetch Error:", error);
        return { error : "Network error or server is unreachable."};
    }
};


//===========================API function ===================================
export const login = (username,password) =>{
    return apiFetch("/api/auth/login",{
        authRequired : false,
        option : {method :"POST",
        headers : {
            "Content-Type" : "application/json", },
        body : JSON.stringify({username,password}),
    }});
}

export const signup = (name,password,email) =>{
    return apiFetch("/api/auth/signup",{
        authRequired : false,
        option : {method :"POST",
        headers : {
            "Content-Type" : "application/json", },
        body : JSON.stringify({name,password,email}),
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
