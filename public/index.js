// const { axios } = require("./axios.min");
// require('./palylists');


// import { fetchUserPlaylists } from "./playlists";

var playerInstance = null;
var globalRequestConfig = null;

function init() {
    console.log('App initializing...');
    let oauthSource = document.getElementById('oauth-template');

    let login_button = document.getElementById('login');
    let loggedIn_status = document.getElementById('loggedin');

    let params = getHashParams();

    let access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert(`There was an error during the authentication: \n${error}`);
    } else {
        if (access_token) {
            if (oauthSource) {
                // oauthSource.innerHTML =
                // `
                // <h2>oAuth info</h2>
                // <dl class="dl-horizontal">
                //   <dt>Access token</dt><dd class="text-overflow">${access_token}</dd>
                //   <dt>Refresh token</dt><dd class="text-overflow">${refresh_token}</dd>
                // </dl>
                // `;
            }

            initWebPlayback(access_token);

            let requestConfig = {
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            };
            fetch('https://api.spotify.com/v1/me', requestConfig)
            .then(response => {
                switch (response.status) {
                    case 200:
                        return response.json();
                        break;
                    case 401:
                        location.assign('/refresh_token');
                        break;
                    default:
                        break;
                }
            })
            .then(data => {
                if (login_button) {
                    login_button.hidden = true;
                }
                if (loggedIn_status) {
                    loggedIn_status.hidden = false;
                }
                globalRequestConfig = Object.assign({}, requestConfig);
                // initWebPlayback(access_token);
                generateProfileDOMElements(data);
                // getAvailableDevices(requestConfig);
                initPlaylists(data.id, requestConfig);
                // initPlaybackStatus(data.id, requestConfig);
                // checkIfSpotifyWebPlaybackSDKIsAvailable(access_token);

            })
            .catch(reason => {
                console.log(`request error: \n${reason}`);
            });
        } else {
            if (login_button) {
                login_button.hidden = false;
                // login_button.hidden = true;
            }
            if (loggedIn_status) {
                loggedIn_status.hidden = true;
            }
        }
    }
}

function getHashParams() {
    let hashParams = {};
    let cookie = document.cookie;
    let cookies = parse(cookie);
    if (cookies) {
        hashParams.access_token = cookies.access_token;
        hashParams.refresh_token = cookies.refresh_token;
    }

    return hashParams;
}

function checkIfSpotifyWebPlaybackSDKIsAvailable(token) {
    if (window.onSpotifyWebPlaybackSDKReady) {
        initWebPlayback(token);
        return;
    }

    window.requestAnimationFrame(() => { checkIfSpotifyWebPlaybackSDKIsAvailable(token); });
}

function generateProfileDOMElements(data) {
    let profileLinkElement = document.getElementById("profile-link");
    let imageUrl = "";
    let displayName = data.display_name;

    if (profileLinkElement) {
        let mainImage = data.images[0];
        if (mainImage) {
            imageUrl = mainImage["url"];
        }
        profileLinkElement.innerHTML =
        `
        <img src="${imageUrl}" alt="" width="32" height="32" class="rounded-circle me-2">
        <strong>${displayName}</strong>
        `
    }
}

init();