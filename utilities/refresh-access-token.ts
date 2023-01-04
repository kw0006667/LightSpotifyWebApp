const refreshAccessToken = async () => {
    const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "";
    const res = await fetch(hostUrl + '/api/refresh_token_api');
    return res.json();
}

export default refreshAccessToken;