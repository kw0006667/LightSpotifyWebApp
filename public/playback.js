'use strict';

/**
 * Module exports.
 * @public
 */
exports.initPlaybackStatus = initPlaybackStatus;

/**
 * @private
 */

const RepeatState = ["off", "context", "track"];

let Playback = {
    _requestConfig: null,
    _userId: null,
    _isFetchingPlayback: false,
    _currentPlaybackData: null,
    _previousPlaybackData: null,
    _playerInstance: null,
    _deviceId: null,
    _currentPlayingTrack: null,
    _shuffle_state: null,
    _repeat_state: RepeatState[0],
    _currentVolume: 50
};

function initWebPlayback(token) {
    let access_token = token;
    if (localStorage.getItem("lastPlaybackData")) {
        Playback._currentPlaybackData = JSON.parse(localStorage.getItem('lastPlaybackData'));
        Playback._repeat_state = Playback._currentPlaybackData.repeat_state;
        Playback._currentVolume = Playback._currentPlaybackData.device.volume_percent;
    }
    updateVolumeState(Playback._currentVolume);

    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = access_token;
        const player = new Spotify.Player({
            name: 'Light Web Spotify Player',
            getOAuthToken: cb => { 
                let access_token = parse(document.cookie).access_token;
                cb(access_token); 
            },
            volume: Playback._currentVolume / 100
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            Playback._deviceId = device_id;
            if (localStorage.getItem("lastPlaybackData")) {
                Devices.currentDeviceId = device_id;
            }
            // initPlaybackStatus(playerInstance);
            getAvailableDevices();
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
                }else if (response.status === 401) {
                    refreshToken();
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

function shuffleAction() {
    if (Playback._playerInstance && globalRequestConfig) {
        let currentRequestConfig = Object.assign({}, globalRequestConfig);
        currentRequestConfig.headers["Content-Type"] = 'application/json';
        currentRequestConfig.method = "PUT";

        fetch(`https://api.spotify.com/v1/me/player/shuffle?device_id=${Devices.currentDeviceId}&state=${!Playback._shuffle_state}`, currentRequestConfig)
        .then(response => {
            if (response.ok) {
                console.log(`Shuffle set to: ${!Playback._shuffle_state}`);
                Playback._shuffle_state = !Playback._shuffle_state;
            }
        })
        .catch(reason => {
            console.error(`shuffleAction\n${reason}`);
        });
    }
}

function repeatAction() {
    if (Playback._playerInstance && globalRequestConfig) {
        let currentRequestConfig = Object.assign({}, globalRequestConfig);
        currentRequestConfig.headers["Content-Type"] = 'application/json';
        currentRequestConfig.method = "PUT";

        let repeatMode = (RepeatState.indexOf(Playback._repeat_state) + 1) % 3;
        

        fetch(`https://api.spotify.com/v1/me/player/repeat?device_id=${Devices.currentDeviceId}&state=${RepeatState[repeatMode]}`, currentRequestConfig)
        .then(response => {
            if (response.ok) {
                console.log(`RepeatMode set to: ${RepeatState[repeatMode]}`);
                Playback._repeat_state = RepeatState[repeatMode];
                // Playback._shuffle_state = !Playback._shuffle_state;
            }
        })
        .catch(reason => {
            console.error(`repeatAction\n${reason}`);
        });
    }
}

function adjustVolume(element) {
    if (element.getAttribute("data-start") === "true") {
        let volumeSlider_Element = document
        if (Playback._playerInstance && Playback._deviceId === Devices.currentDeviceId) {
            Playback._currentVolume = Number.parseFloat((element.value / 100).toFixed(2));
            Playback._playerInstance.setVolume(Playback._currentVolume).then(() => {
                console.log(`Volume adjusting...${element.value}`);
                updateVolumeState();
            });
        }
    }
    
}

function startAdjustVolume(element) {
    if (element) {
        element.setAttribute("data-start", "true");
        console.log(element.value);
        updateVolumeState();
    }
}

function adjustVolumeDone(element) {
    element.setAttribute("data-start", "false");

    if (Playback._currentPlaybackData.device.id !== Playback._deviceId) {
        let currentRequestConfig = Object.assign({}, globalRequestConfig);
        currentRequestConfig.headers["Content-Type"] = 'application/json';
        currentRequestConfig.method = "PUT";

        fetch(`https://api.spotify.com/v1/me/player/volume?device_id=${Devices.currentDeviceId}&volume_percent=${element.value}`, currentRequestConfig)
        .then(response => {
            if (response.ok) {
                console.log(`Volume adjusted: ${element.value}`);
            }
        })
        .catch(reason => {
            console.error(`adjustVolume:\n${reason}`);
        });
    }

    updateVolumeState();
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
        fetch('https://api.spotify.com/v1/me/player?additional_types=track,episode', localRequestConfig)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            }  else if (response.status === 401) {
                refreshToken();
                return;
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

                if (!Playback._shuffle_state ||
                    Playback._currentPlaybackData.device.id !== Playback._deviceId) {
                    Playback._shuffle_state = Playback._currentPlaybackData.shuffle_state;
                }

                
                    Playback._repeat_state = Playback._currentPlaybackData.repeat_state;
                
                
                Playback._currentVolume = Playback._currentPlaybackData.device.volume_percent;
                if (Playback._currentPlaybackData.device.id !== Playback._deviceId) {
                    updateVolumeState(Playback._currentVolume);
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
            shuffleBtn.classList.add("btn-outline-success");
            shuffleBtn.classList.remove("btn-success");
            shuffleBtn.setAttribute("disabled", "");
        } else {
            shuffleBtn.removeAttribute("disabled");
            if (Playback._shuffle_state) {
                shuffleBtn.classList.remove("btn-outline-success");
                shuffleBtn.classList.add("btn-success");
                shuffleBtn.classList.add("active");
            } else {
                shuffleBtn.classList.add("btn-outline-success");
                shuffleBtn.classList.remove("btn-success");
                shuffleBtn.classList.remove("active");
            }
        }
    }

    // Repeat button
    let repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) {
        let icon_element = repeatBtn.getElementsByTagName('i')[0];
        if (playbackState.actions.disallows?.toggling_repeat_context && playbackState.actions.disallows?.toggle_repeat_track) {
            repeatBtn.setAttribute("disabled", "");
            repeatBtn.className = "btn btn-outline-success";
            icon_element.className = "bi bi-arrow-clockwise";
        } else {
            switch (Playback._repeat_state) {
                case RepeatState[0]:
                    repeatBtn.className = "btn btn-outline-success";
                    icon_element.className = "bi bi-arrow-clockwise";
                    break;
                case RepeatState[1]:
                    repeatBtn.className = "btn btn-success active";
                    icon_element.className = "bi bi-arrow-clockwise";
                    break;
                case RepeatState[2]:
                    repeatBtn.className = "btn btn-success active";
                    icon_element.className = "bi bi-app-indicator";
                default:
                    break;
            }
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
        let imageUrl = track.type === 'track' ? track.album.images[0].url : track.images[0]?.url;
        coverPhoto_Element.setAttribute("src", imageUrl);
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

function updateVolumeState(volumeInit = null) {
    let volumeSlider_Element = document.getElementById('volumeSlider');
    if (volumeSlider_Element) {
        let currentValue = volumeSlider_Element.value;
        if (volumeInit) {
            currentValue = volumeInit;
            volumeSlider_Element.value = volumeInit;
        }
        // let value = volumeSlider_Element.value;
        // volumeSlider_Element.value = Playback._currentVolume;
        volumeSlider_Element.style.backgroundImage = `linear-gradient(to right, #198754 0%, #198754 ${currentValue}%, #e2e2e2 ${currentValue}%, #e2e2e2 100%)`;
    }
}