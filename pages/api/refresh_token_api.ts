import Cookies from "cookies";
import { access } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import request from "request";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let refresh_token = req.cookies.refresh_token;
  if (!refresh_token) {
    res.redirect("/api/login");
  }

  let client_id = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
  let client_secret = process.env.NEXT_PUBLIC_CLIENT_SECRET ?? "";

  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      // res.send({
      //   'access_token': access_token
      // });
      let date = new Date();
      date = new Date(date.setHours(date.getHours() + 1));
      const cookies = new Cookies(req, res);
      cookies.set("access_token", access_token);
      cookies.set("refresh_token", refresh_token);

      res.send({access_token: access_token});
    } else {
        console.error(error);
    }
  });
}
