// const { axios } = require("./axios.min");
// require('./palylists');

// import { fetchUserPlaylists } from "./playlists";

var playerInstance = null;
var globalRequestConfig = null;
var userId = null;

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
                userId = data.id;
                fetchRecentlyPlayed();
                // getAvailableDevices(requestConfig);
                // initPlaylists(data.id, requestConfig);
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

function refreshToken() {
    let refresh_token = getHashParams().refresh_token;
    if (!refresh_token) {
        return;
    }

    fetch('/refresh_token')
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }
    })
    .then(data => {
        if (data?.access_token) {
            document.cookie.replace('access_token', data.access_token);
            globalRequestConfig = {
                headers: {
                    'Authorization': 'Bearer ' + data.access_token
                }
            };
        }
    })
    .catch(reason => {
        console.error(`Refresh Token:${reason}`);
    });
    
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
    // let profileLinkElement = document.getElementById("profile-link");
    // let imageUrl = "";
    // let displayName = data.display_name;

    // if (profileLinkElement) {
    //     let mainImage = data.images[0];
    //     if (mainImage) {
    //         imageUrl = mainImage["url"];
    //     }
    //     profileLinkElement.innerHTML =
    //     `
    //     <img src="${imageUrl}" alt="" width="32" height="32" class="rounded-circle me-2">
    //     <strong>${displayName}</strong>
    //     `
    // }
    let profileIcon_Element = document.getElementById('userIcon');
    if (profileIcon_Element) {
        let mainImage = data?.images[0];
        if (mainImage) {
            profileIcon_Element.setAttribute('src', mainImage['url']);
        }
    }
}

function switchToPlaylistTab(element) {
    let targetIndex = element.getAttribute('data-index');
    let headerTabsBar_Element = document.getElementById('headerTabsBar');
    if (headerTabsBar_Element) {
        let tabElements = [...headerTabsBar_Element.getElementsByTagName('a')];
        tabElements.forEach(link => {
            let index = link.getAttribute('data-index');
            if (index === targetIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        })
        console.log(`Tab switched:${targetIndex}`);
    }
    switch (targetIndex) {
        case '0':
            fetchRecentlyPlayed();
            break;
        case '1':
            if (playlists._playlistsDOM) {
                renderPlaylistsDOM();
            } else {
                initPlaylists(userId, globalRequestConfig);
            }
            break;
        case '2':
            fetchSavedAlbums();
            break;
        case '3':
            fetchSavedPodcasts();
            break;
        case '4':
            fetchFollowedArtists();
            break;
        default:
            break;
    }
}

function resetSwitchTabsStatus() {
    let headerTabsBar_Element = document.getElementById('headerTabsBar');
    if (headerTabsBar_Element) {
        let tabElements = [...headerTabsBar_Element.getElementsByTagName('a')];
        tabElements.forEach(link => {
            link.classList.remove('active');
        })
        // console.log(`Tab switched:${targetIndex}`);
    }
}

init();