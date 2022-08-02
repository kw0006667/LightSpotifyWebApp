import { NextApiRequest, NextApiResponse } from "next";

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
 function generateRandomString(length: number): string {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
     text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    var scope = 'user-read-private user-read-email playlist-read-private user-read-playback-state app-remote-control user-modify-playback-state user-read-currently-playing streaming user-read-playback-position user-read-recently-played user-top-read user-library-modify user-library-read user-follow-modify user-follow-read playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
    let state = generateRandomString(16);
    let client_id = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";

    let queryParameters = new URLSearchParams( {
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: 'http://localhost:3000/api/callback',
        state:state
    });

    res.redirect('https://accounts.spotify.com/authorize?' + queryParameters.toString());
}