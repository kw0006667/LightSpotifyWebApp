// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios'
import Cookies from 'cookies';
import { DiffieHellmanGroup } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const cookies = new Cookies(req, res);
    const access_token = cookies.get('access_token');
    axios.get('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': 'Bearer ' + access_token },
    })
    .then(response => {
      if (response.status === 401) {
        res.redirect('/api/refresh_token');
      }

      if (response.status === 200) {
        res.status(200).json(response.data);
      }
    });
}
