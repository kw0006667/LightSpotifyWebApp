'use strict';

/**
 * Module exports.
 * @public
 */
exports.initPlaybackStatus = initPlaybackStatus;

/**
 * @private
 */
let Playback = {
    _requestConfig: null,
    _userId: null,
    _isFetchingPlayback: false,
    _currentPlaybackData: null,
    _previousPlaybackData: null,
    _playerInstance: null,
    _deviceId: null,
    _currentPlayingTrack: null
};

function initWebPlayback(token) {
    let access_token = token;
    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = access_token;
        const player = new Spotify.Player({
            name: 'Light Web Spotify Player',
            getOAuthToken: cb => { 
                cb(token); 
            },
            volume: 0.5
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            Playback._deviceId = device_id;
            if (localStorage.getItem("lastPlaybackData")) {
                Playback._currentPlaybackData = JSON.parse(localStorage.getItem('lastPlaybackData'));
                Devices.currentDeviceId = device_id;
            }
            // initPlaybackStatus(playerInstance);
            getAvailableDevices(globalRequestConfig);
            startFetchingPlayback();
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => { 
            console.error(message);
        });
    
        player.addListener('authentication_error', ({ message }) => {
            console.error(message);
        });
    
        player.addListener('account_error', ({ message }) => {
            console.error(message);
        });

        player.addListener('player_state_changed', (state) => {
            if (state) {
                // updatePlaybackStateBar(state);
                // updateCoverPhoto(state.track_window.current_track);
                // updatePlayingInfo(state.track_window.current_track);
                console.log('Currently Playing', state.track_window.current_track);
                console.log('Position in Song', state.position);
                console.log('Duration of Song', state.duration);
            }

        });

        player.connect();

        Playback._playerInstance = player;
    };

    window.addEventListener('beforeunload', ev => {
        if (Playback._currentPlaybackData) {
            Playback._currentPlaybackData.is_playing = false;
            localStorage.setItem("lastPlaybackData", JSON.stringify(Playback._currentPlaybackData));
        }
    });
}

function playAction(event) {
    if (Playback._playerInstance) {
        // Playback._playerInstance.resume().then(() => {
        //     console.log('Music is resumed');
        // });
        // Playback._playerInstance.togglePlay().then(() =>{
        //     console.log('Play toggled');
            
        // });

        // return;
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.method = "PUT";

        let actionStr = "";
        let pendingAction = event.getAttribute("data-action");
        let url = ""
        switch (pendingAction) {
            case "Resume":
                // if (Playback._currentPlaybackData.device.id == Playback._deviceId) {
                //     Playback._playerInstance.togglePlay().then(() =>{
                //             console.log('Play toggled');
                            
                //         });
                //     return;
                // }
                actionStr = Playback._currentPlaybackData?.is_playing ? "pause" : "play"
                if (actionStr === "play") {
                    let body = {};
                    if (Playback._currentPlaybackData.context?.uri) {
                        body = {
                            context_uri: Playback._currentPlaybackData.context?.uri,
                            offset: {
                                uri: Playback._currentPlaybackData.item.uri
                            },
                            position_ms: Playback._currentPlaybackData.progress_ms
                        };
                        requestConfig.body = JSON.stringify(body);

                    }
                    
                    // requestConfig.body = JSON.stringify(body);
                }
                requestConfig.method = "PUT"
                break;
            case "Backward":
                actionStr = "previous";
                requestConfig.method = "POST"
                break;
            case "Forward":
                actionStr = "next";
                requestConfig.method = "POST"
                break;
            default:
                return;
        }
        
        fetch(`https://api.spotify.com/v1/me/player/${actionStr}?device_id=${Devices.currentDeviceId}`, requestConfig)
            .then(response => {
                if (response.status === 204) {
                    console.log('Play toggled');
                } else if (response.status === 502) {
                    playOnLocal();
                }
            })
            .catch(reason => {
                console.error(`Play toggle:\n${reason}`);
            });
    }
}

function playOnLocal() {
    if (Playback._playerInstance && globalRequestConfig) {
        let currentRequestConfig = Object.assign({}, globalRequestConfig);
        currentRequestConfig.headers["Content-Type"] = 'application/json';
        let body = {
            device_ids: [Playback._deviceId],
            play: true
        };
        currentRequestConfig.body = JSON.stringify(body);
        currentRequestConfig.method = "PUT";

        fetch('https://api.spotify.com/v1/me/player', currentRequestConfig)
        .then(response => {
            if (response.status == 204) {
                console.log(`playOnLocal:\t${response}`);
            }
        })
        .catch(reason => {
            console.error(`playOnLocal:\n${reason}`);
        });
    }
}

function initPlaybackStatus(playbackInstance) {
    // _playback._userId = userId;
    // _playback._requestConfig = requestConfig;

    // if (_playback._requestConfig) {
    //     _playback._requestConfig.headers["Content-Type"] = 'application/json';
    // }

    setPlaybackInstance(playbackInstance);
    // startFetchingPlayback();
}

function setPlaybackInstance(playbackInstance) {
    if (playbackInstance) {
        Playback._playerInstance = playbackInstance;
        getPlaybackStatus();
    }
}

function getPlaybackStatus() {
    if (Playback._playerInstance) {
        Playback._playerInstance.getCurrentState()
        .then(state => {
            if (!state) {
                console.info('User is not playing music through the Web Playback SDK');
                return;
            }

            var current_track = state.track_window.current_track;
            var next_track = state.track_window.next_tracks[0];

            

            console.log('Currently Playing', current_track);
            console.log('Playing Next', next_track);
        })
        .catch(reason => {
            console.error(`getPlaybackStatus:\n${reason}`);
        });
    }
}

function startFetchingPlayback() {
    if (!globalRequestConfig) {
        return;
    }

    let localRequestConfig = Object.assign({}, globalRequestConfig);
    localRequestConfig.headers["Content-Type"] = 'application/json';

    setTimeout(() => {
        fetch('https://api.spotify.com/v1/me/player', localRequestConfig)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } 
        })
        .then(data => {
            // console.log(`CurrentPlayback:\n${data.progress_ms}`);

            if (data || Playback._currentPlaybackData) {
                if (data) {
                    Playback._currentPlaybackData = data;
                }

                if (!Playback._isFetchingPlayback) {
                    // render();
                    Playback._isFetchingPlayback = true;
                }
                
                if (Playback._currentPlaybackData?.item.id != Playback._previousPlaybackData?.item.id) {
                    updateCoverPhoto(Playback._currentPlaybackData?.item);
                    updatePlayingInfo(Playback._currentPlaybackData?.item);
                    updateTrackDurationInfo(Playback._currentPlaybackData?.item);
                }

                updatePlaybackStateBar(Playback._currentPlaybackData, Playback._previousPlaybackData);
                updateProgressBar(Playback._currentPlaybackData.progress_ms, Playback._currentPlaybackData.item.duration_ms); 

                Playback._previousPlaybackData = Playback._currentPlaybackData;

                if (data) {
                    Devices.currentDeviceId = data.device.id;
                } 
                else {
                    Devices.currentDeviceId = Playback._deviceId;
                }

                updateRemoteConnectState();
            }
            
            

            // if (Playback._currentPlaybackData?.item.id != Playback._previousPlaybackData?.item.id) {
            //     updateCoverPhoto();
            //     updatePlayingInfo();
            // }
        })
        .catch(reason => {
            console.log(`startFetchingPlayback:\n${reason}`);
        })
        .finally(() => {
            startFetchingPlayback();
        })
    }, 800);
}

function render() {
    window.requestAnimationFrame(() => {
        updateProgressBar(Playback._currentPlaybackData.progress_ms, Playback._currentPlaybackData.item.duration_ms); 
    });
}

function isPlaybackStateChanged(currentPlayback, previousPlayback) {
    return (
        currentPlayback.is_playing !== previousPlayback.is_playing ||
        currentPlayback.repeat_state !== previousPlayback.repeat_state ||
        currentPlayback.shuffle_state !== previousPlayback.shuffle_state ||
        currentPlayback.actions !== previousPlayback.actions
    );
}

function updatePlaybackStateBar(playbackState, previousPlaybackState) {
    if (!playbackState || !previousPlaybackState) {
        return;
    }

    if (!isPlaybackStateChanged(playbackState, previousPlaybackState)) {
        return;
    }

    // Toggle Play button
    let playToggleBtn = document.getElementById('playToggleBtn');
    let playToggleStyle = playToggleBtn?.getElementsByTagName('i');
    if (playToggleStyle && playToggleStyle.length > 0) {
        playToggleStyle[0].className = !playbackState.is_playing ? "bi bi-play" : "bi bi-pause";
    }
    if (playToggleBtn) {
        if (playbackState.actions.disallows?.pausing && playbackState.actions.disallows?.resuming) {
            playToggleBtn.setAttribute("disabled", "");
        } else {
            playToggleBtn.removeAttribute("disabled", "");
        }
    }

    // Backward button
    let backwardBtn = document.getElementById('backwardBtn');
    if (backwardBtn) {
        if (playbackState.actions.disallows?.skipping_prev) {
            backwardBtn.setAttribute("disabled", "");
        } else {
            backwardBtn.removeAttribute("disabled", "");
        }
    }

    // Forward button
    let forwardBtn = document.getElementById('forwardBtn');
    if (forwardBtn) {
        if (playbackState.actions.disallows?.skipping_next) {
            forwardBtn.setAttribute("disabled", "");
        } else {
            forwardBtn.removeAttribute("disabled", "");
        }
    }

    // Shuffle button
    let shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        if (playbackState.actions.disallows?.toggling_shuffle) {
            shuffleBtn.setAttribute("disabled", "");
        } else {
            shuffleBtn.removeAttribute("disabled");
        }
    }

    // Repeat button
    let repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) {
        if (playbackState.actions.disallows?.toggling_repeat_context && playbackState.actions.disallows?.toggle_repeat_track) {
            repeatBtn.setAttribute("disabled", "");
        } else {
            repeatBtn.removeAttribute("disabled");
        }
    }
}

function updateProgressBar(currentTime, totalTime) {
    if (!Playback._currentPlaybackData?.is_playing) {
        return
    }
    let progressBar_Element = document.getElementById('playbackProgressBar');
    if (progressBar_Element) {
        let currentPlayPercent = (currentTime / totalTime * 100).toFixed(0);
        // progressBar_Element.setAttribute("width", `${currentPlayPercent}%`);
        progressBar_Element.style.width = `${currentPlayPercent}%`;
        progressBar_Element.setAttribute("aria-valuenow", currentPlayPercent);

        // window.requestAnimationFrame(() => {
        //     updateProgressBar(Playback._currentPlaybackData.progress_ms, Playback._currentPlaybackData.item.duration_ms); 
        // });
    }

    let trackPosition_Element = document.getElementById('trackPosition');
    if (trackPosition_Element) {
        trackPosition_Element.innerText = new Date(currentTime).toISOString().slice(14, 19);
    }
}

function updateCoverPhoto(track) {
    if (!track) {
        return;
    }

    let coverPhoto_Element = document.getElementById('coverPhoto');
    if (coverPhoto_Element) {
        let imageUrl = track.album.images[0].url;
        coverPhoto_Element.setAttribute("src", imageUrl);
    }
}

function updatePlayingInfo(track) {
    if (!track) {
        return;
    }

    let playingInfo_Element = document.getElementById('playingInfo');
    if (playingInfo_Element) {
        let title = track.name;
        let artist = track.artists[0].name;

        playingInfo_Element.innerHTML = 
        `
        <header>${title}</header>
        <sub class="text-muted">${artist}</sub>
        `;
    }
}

function updateTrackDurationInfo(track) {
    if (!track) {
        return;
    }

    let trackDuration_Element = document.getElementById('trackDuration');
    if (trackDuration_Element) {
        trackDuration_Element.innerText = new Date(track.duration_ms).toISOString().slice(14, 19);
    }
}

function updateRemoteConnectState() {
    let remoteConnectState_Element = document.getElementById('remoteContectStateBtn');
    if (remoteConnectState_Element) {
        let connectedDevice_Element = remoteConnectState_Element.getElementsByTagName("span").item(0);
        let connectedDeviceStr = "";
        if (connectedDevice_Element) {
            if (Playback._currentPlaybackData.device.id === Playback._deviceId) {
                connectedDeviceStr = "Listening on this device";
                // remoteConnectState_Element.classList.remove("d-flex");
                // remoteConnectState_Element.style.display = "none";
            } else {
                connectedDeviceStr = "Listening on " + Playback._currentPlaybackData.device.name;
                // remoteConnectState_Element.classList.add("d-flex");
            }
            connectedDevice_Element.innerHTML = connectedDeviceStr;
        }
        // remoteConnectState_Element.classList.remove("d-flex");
        // remoteConnectState_Element.style.display = isPlayLocal ? "none" : "flex";
    }
}