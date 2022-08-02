import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import refreshAccessToken from './refresh-access-token';

let requestToken: string;

const axiosInstance = axios.create();

const refreshAuthLogic = (failedRequest: any) =>
    refreshAccessToken().then(tokenRefreshResponse => {
        failedRequest.response.config.headers.Authorization = `Bearer ${tokenRefreshResponse.access_token}`;
        requestToken = tokenRefreshResponse.access_token;
        return Promise.resolve();
    });

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic);

axiosInstance.interceptors.request.use(async request => {
    if (!requestToken) {
        const res = await refreshAccessToken();
        requestToken = await res.access_token;
        if (request.headers) {
                request.headers.Authorization = `Bearer ${requestToken}`; 
        }

        return request;
        // refreshAccessToken().then(tokenRefreshResponse => {
        //     requestToken = tokenRefreshResponse.access_token;
        //     if (request.headers) {
        //         request.headers.Authorization = `Bearer ${requestToken}`; 
        //     }
        //     return request;
        // });
    } else {
        if (request.headers) {
            request.headers.Authorization = `Bearer ${requestToken}`; 
        }
        return request;
    }
});

export default axiosInstance;