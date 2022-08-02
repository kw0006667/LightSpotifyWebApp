const refreshAccessToken = async () => {
    const res = await fetch('http://localhost:3000/api/refresh_token_api');
    return res.json();
}

export default refreshAccessToken;