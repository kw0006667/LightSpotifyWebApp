const refreshAccessToken = async () => {
    const res = await fetch('/api/refresh_token_api');
    return res.json();
}

export default refreshAccessToken;