import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";
import { resolve } from "path";
import request from "request";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    let code = req.query.code || null;
    let state = req.query.state || null;

    let client_id = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
    let client_secret = process.env.NEXT_PUBLIC_CLIENT_SECRET ?? "";

    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + new Buffer(client_id + ":" + client_secret).toString('base64')
        },
        json: true
    };

    if (state === null) {
        console.error('error');
    } else {
        request.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    console.log(body);
                    // res.status(200).json(body);
                    const cookies = new Cookies(req, res);
                    cookies.set('access_token', access_token);
                    cookies.set('refresh_token', refresh_token);
                    cookies.set('user', JSON.stringify(body));
                    res.redirect(307, '/');
                });
            } else {
                console.log(error);
                res.status(403).json(error);
            }
        });
    }
}