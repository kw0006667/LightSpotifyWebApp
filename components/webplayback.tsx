// Reference type from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/spotify-web-playback-sdk/index.d.ts
import React from "react";
import Image from "next/future/image";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import TrackLinkDOM from "./tracklink";
import Link from "next/link";
import { SpotifyUtils } from "../utilities/spotifyutils";
import { Device } from "../types";
import LikeDOM from "./like";
import useSWR from "swr";
import DeviceItemDOM from "./deviceitem";

interface IWebPlaybackProps {
    access_token: string
}

interface IWebPlaybackState {
    player: Spotify.Player | null,
    isPaused: boolean,
    isActive: boolean,
    currentTrack: Spotify.Track | undefined,
    currentState: Spotify.PlaybackState | undefined,
    isInitialized: boolean,
    devices: Device[] | undefined,
    deviceId: string,
    isShuffle: boolean,
    repeatMode: number,
    position: number,
    progress: number,
    volume: number
}

/*
* 0: off
* 1: context
* 2: track
*/
const RepeatState = ["off", "context", "track"];

const useDevices = (access_token: string | string[] | undefined): { devices: Device[] | undefined } => {
    const requestConfig = {
        url: `https://api.spotify.com/v1/me/player/devices`,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { data } = useSWR(requestConfig);

    return {
        devices: data.devices
    };
}

class WebPlayback extends React.Component<IWebPlaybackProps, IWebPlaybackState> {
    constructor(props: IWebPlaybackProps) {
        super(props);
        this.state = {
            player: null,
            isPaused: false,
            isActive: false,
            currentTrack: undefined,
            currentState: undefined,
            isInitialized: true,
            devices: undefined,
            deviceId: "",
            isShuffle: false,
            repeatMode: 0,
            position: 0,
            progress: 0,
            volume: 50
        };

        setInterval(() => {this.updateCurrentInfo();}, this.updateStatusInterval);
    }

    updateStatusInterval: number = 1000;
    
    componentDidMount() {
        if (window.onSpotifyWebPlaybackSDKReady === undefined) {
            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;

            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new Spotify.Player({
                    name: 'Light Web Spotify Player - Next',
                    getOAuthToken: async (cb) => { 
                        const result = await AuthInstance.RefreshToken();
                        cb(result.access_token);
                        // cb(AuthInstance.access_token); 
                    },
                    volume: 0.5
                });

                // Spotify.Player.setPlayer(player);

                // Ready
                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    this.setState({
                        deviceId: device_id
                    });
                    AuthInstance.currentDeviceId = device_id;
                    // Playback._deviceId = device_id;
                    if (localStorage.getItem("lastPlaybackData")) {
                        // Devices.currentDeviceId = device_id;
                    }
                    // initPlaybackStatus(playerInstance);
                    // getAvailableDevices();
                    // startFetchingPlayback();
                    this.fetchAllDevices();
                });

                // Not Ready
                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });

                player.addListener('autoplay_failed', () => {
                    console.log('Autoplay is not allowed by the browser autoplay rules');
                });

                player.on('authentication_error', ({ message }) => {
                    console.error('Failed to authenticate', message);
                  });

                player.addListener('player_state_changed', (state) => {
                    if (state) {
                        // updatePlaybackStateBar(state);
                        // updateCoverPhoto(state.track_window.current_track);
                        // updatePlayingInfo(state.track_window.current_track);
                        console.log('Currently Playing', state);
                        this.setState({
                            isActive: true,
                            isPaused: state.paused,
                            currentTrack: state.track_window.current_track,
                            currentState: state,
                            isShuffle: state.shuffle,
                            repeatMode: state.repeat_mode,
                            position: state.position,
                            progress: SpotifyUtils.GetPercentageProgress(state.position, state.duration)
                        });
                        console.log('Position in Song', state.position);
                        console.log('Duration of Song', state.duration);
                    } else {
                        this.setState({
                            isActive: false
                        });
                    }
                });

                player.connect();
                this.setState({
                    player: player
                });
                // this.playerInstance = player;
                player.activateElement();
            }
        }
    }
    componentDidUpdate(prevProps: IWebPlaybackProps, prevState: IWebPlaybackState) {

    }

    fetchAllDevices() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/devices`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                devices: response.data.devices
            });
        });
    }

    checkIfRepeatModeIsDisallow() {
        return this.state.currentState?.disallows.toggling_repeat_context && this.state.currentState?.disallows.toggling_repeat_track;
    }

    getButtonClassNameForRepeatMode() {
        switch (this.state.repeatMode) {
            case 0:
                return "btn-outline-success"
            case 1:
            case 2:
                return "btn-success active"
            default:
                return "btn-outline-success"
        }
    }

    getIconClassNameForRepeatMode() {
        switch (this.state.repeatMode) {
            case 0:
            case 1:
                return "bi-arrow-clockwise";
            case 2:
                return "bi-app-indicator"
            default:
                return "bi-arrow-clockwise";
        }
    }

    shuffleAction() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/shuffle?device_id=${this.state.deviceId}&state=${!this.state.isShuffle}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
        };
        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                this.setState({
                    isShuffle: !this.state.isShuffle
                });
            }
        });
    }

    playAction(event: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.player) {
            return;
        }

        const data_action = event.currentTarget.getAttribute('data-action');
        if (data_action) {
            switch (data_action) {
                case 'Backward':
                    this.state.player.getCurrentState().then(state => {
                        if (state?.position !== undefined && state?.position > 1000) {
                            this.state.player?.seek(0).then(() => {
                                this.state.player?.resume();
                            });
                        } else {
                            this.state.player?.previousTrack().then(() => {

                            });
                        }
                    });
                    break;
                case 'Resume':
                    this.state.player.togglePlay().then(() => {
                        console.log('toggle Play');
                    });
                    break;
                case 'Forward':
                    this.state.player.getCurrentState().then(status => {
                        if (!status?.disallows.skipping_next) {
                            this.state.player?.nextTrack().then(() => {
                                console.log('Toggle Forward');
                            });
                        }
                    })
                    
                    break;
                default:
                    break;
            }
        }
    }

    repeatAction() {
        // 0: No repeat - off
        // 1: Context repeat - context
        // 2: Track repeat - track
        let currentRepeatMode = this.state.repeatMode;
        const disallows = this.state.currentState?.disallows;

        if (disallows?.toggling_repeat_context || disallows?.toggling_repeat_track) {
            return;
        }

        currentRepeatMode = (currentRepeatMode + 1) % 3;
        if (currentRepeatMode === 1 && disallows?.toggling_repeat_context) {
            currentRepeatMode = (currentRepeatMode + 1) % 3;
        }
        if (currentRepeatMode === 2 && disallows?.toggling_repeat_track) {
            currentRepeatMode = (currentRepeatMode + 1) % 3;
        }

        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/repeat?state=${RepeatState[currentRepeatMode]}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
        };
        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                // this.setState({
                //     repeatMode: currentRepeatMode
                // });
            }
        });
    }

    openAllDevicesList(event: React.MouseEvent<HTMLAnchorElement>) {
        // let requestConfig = {
        //     url: `https://api.spotify.com/v1/me/player`,
        //     headers: {
        //         'Authorization': 'Bearer ' + AuthInstance.access_token,
        //         'Content-Type': 'application/json'
        //     },
        //     method: 'PUT',
        //     data: JSON.stringify({
        //         device_ids: [this.state.deviceId]
        //     })
        // };
    
        // axiosInstance.request(requestConfig)
        // .then(response => {
        //     if (response.status === 202) {
        //         console.log('Play Playlist');
        //         this.state.player?.activateElement();
        //     }
        // });
        let allDeviceList_Element = document.getElementById('allDeviceList');
        if (!allDeviceList_Element)
            return;

        this.fetchAllDevices();

        const visibleClassName = 'connect-device-list-container-visible';
        if (allDeviceList_Element.classList.contains(visibleClassName)) {
            allDeviceList_Element.classList.remove(visibleClassName);
        } else {
            allDeviceList_Element.classList.add(visibleClassName);
        }
    }

    transferPlayDevice(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                device_ids: [id]
            })
        };
    
        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Playlist');
                this.state.player?.activateElement();
            }
        });
    }

    onMouseDown(event: React.MouseEvent<HTMLInputElement>) {
        const element = event.currentTarget;
        element.setAttribute("data-start", "true");
    }

    onMouseMove(event: React.MouseEvent<HTMLInputElement>) {
        const element = event.currentTarget;
        if (element.getAttribute('data-start') === 'true') {
            console.log(element.value);
            this.setState({
                volume: Number(element.value)
            }, () => {
                this.updateVolume(this.state.volume);
            });
        }
        

        // if (Playback._currentPlaybackData.device.id !== Playback._deviceId) {
        //     let currentRequestConfig = Object.assign({}, globalRequestConfig);
        //     currentRequestConfig.headers["Content-Type"] = 'application/json';
        //     currentRequestConfig.method = "PUT";

        //     fetch(`https://api.spotify.com/v1/me/player/volume?device_id=${Devices.currentDeviceId}&volume_percent=${element.value}`, currentRequestConfig)
        //     .then(response => {
        //         if (response.ok) {
        //             console.log(`Volume adjusted: ${element.value}`);
        //         }
        //     })
        //     .catch(reason => {
        //         console.error(`adjustVolume:\n${reason}`);
        //     });
        // }

        // updateVolumeState();
    }

    onMouseUp(event: React.MouseEvent<HTMLInputElement>) {
        const element = event.currentTarget;
        element.setAttribute('data-start', "false");
        this.setState({
            volume: Number(element.value)
        }, () => {
            this.updateVolume(this.state.volume);
        });
    }

    updateVolume(volumeValue: number) {
        this.state.player?.setVolume(volumeValue / 100).then(() => {
            console.log('Volume Adjusted');
        });
    }

    updateSeekPosition(event: React.MouseEvent<HTMLInputElement>) {
        const element = event.currentTarget;
        const value = element.value;
        console.log(value);
    }

    static getContextLink(contextUri: string | undefined | null): string {
        if (contextUri) {
            const contextStr = contextUri.split(':');
            if (contextStr.length === 3) {
                const contextType = contextStr[1];
                const contextId = contextStr[2];
                let navigateTarget = '';
                switch (contextType) {
                    case 'album':
                        navigateTarget = 'albums';
                        break;
                    case 'artist':
                        navigateTarget = 'artists';
                        break;
                    case 'show':
                        navigateTarget = 'podcasts';
                        break;
                    case 'episode':
                        navigateTarget = 'episodes';
                        break;
                    case 'playlist':
                        navigateTarget = 'playlists';
                        break;
                    default:
                        return "/";
                }

                return `/${navigateTarget}/${contextId}`;
            }
        }
        return "/";
    }

    ArtistInfoLinkDOM(props: {artistUri: string, artistName: string, children: string}) {
        return(
            <Link href={WebPlayback.getContextLink(props.artistUri)}>
                <a className="spotify-link">{props.artistName}</a>
            </Link>
        );
    }

    EpisodeInfoLinkDOM(props: {episode: Spotify.Track | undefined}) {
        return(
            <Link href={WebPlayback.getContextLink(props.episode?.uri)}>
                <a className="spotify-link">{props.episode?.name}</a>
            </Link>
        );
    }

    PodcastInfoLinkDOM(props: {podcast: Spotify.Album | undefined}) {
        return(
            <Link href={WebPlayback.getContextLink(props.podcast?.uri)}>
                <a className="spotify-link">{props.podcast?.name}</a>
            </Link>
        )
    }

    updateCurrentInfo() {
        if (this.state.isActive && this.state.player) {
            if (!this.state.currentState?.paused) {
                const currentPos = this.state.position + this.updateStatusInterval;
                this.setState({
                    position: currentPos,
                    progress: SpotifyUtils.GetPercentageProgress(currentPos, this.state.currentState?.duration)
                });
            }
        }
    }

    getCurrentPlayingDeviceInfo() {
        let playingInfo = "Pick a device to play";
        this.state.devices?.forEach(device => {
            if (device.is_active) {
                playingInfo = device.id === this.state.deviceId ? 'Listening on the local device' : `Listening on ${device.name}`;
            }
        });

        return playingInfo;
    }

    render() {
        let artists = null;
        if (this.state.currentTrack?.type === 'track') {
            artists = this.state.currentTrack?.artists.map(artist => {
                return( <this.ArtistInfoLinkDOM key={artist.uri} artistUri={artist.uri} artistName={artist.name}>{', '}</this.ArtistInfoLinkDOM>);
            });
        } else {
            artists = this.state.currentTrack?.album.name;
        }
        return(
            <>
                <div className="d-flex footer-left">
                    <Link href={WebPlayback.getContextLink(this.state.currentState?.context.uri)}>
                        <a>
                            <Image id="coverPhoto" src={this.state.currentTrack?.album.images[0].url ?? "https://i.scdn.co/image/ab67616d0000b273fb0610caa5ce0747743fb52e"} alt={'...'} height="64" width="64" />
                        </a>
                    </Link>
                    <div id="playingInfo" className="playing-info mx-2 d-flex">
                        <div>
                            <div className="playing-info-tracklink">
                                <span>
                                    {this.state.currentTrack?.type === 'track' ? <TrackLinkDOM track={this.state.currentTrack} context={this.state.currentState?.context}/> : <this.EpisodeInfoLinkDOM episode={this.state.currentTrack}/> }
                                </span>
                            </div>
                            <div className="playing-info-artistlink">
                                <sub>
                                    {this.state.currentTrack?.type === 'track' ? artists : <this.PodcastInfoLinkDOM podcast={this.state.currentTrack?.album}/> }
                                </sub>
                            </div>
                        </div>
                        <div className="playing-info-like mx-4" >
                            { this.state?.currentTrack ? <LikeDOM track={this.state.currentTrack} /> : <></>}
                        </div>
                    </div>
                </div>

                <div className="footer-center" style={{textAlign: 'center'}} >
                    <div id="playback" className="mx-2">
                    <button id="shuffleBtn" type="button" className={"btn btn-outline-success footer-button-play mx-1 " + (this.state.isShuffle ? 'active' : '')} disabled={this.state.currentState?.disallows.toggling_shuffle} onClick={() => {this.shuffleAction()}}>
                        <i className="bi bi-shuffle"></i>
                        <span className="visually-hidden">shuffle</span>
                    </button>
                    <button id="backwardBtn" type="button" className="btn btn-outline-success footer-button-play mx-1" data-action="Backward" onClick={(e) => {this.playAction(e)}}>
                        <i className="bi bi-skip-backward"></i>
                        <span className="visually-hidden">Backward</span>
                    </button>
                    <button id="playToggleBtn" type="button" className="btn btn-outline-success footer-button-resume mx-1" data-action="Resume" onClick={(e) => {this.playAction(e)}}>
                        <i className={this.state.isPaused ? "bi bi-play" : "bi bi-pause"}></i>
                        <span className="visually-hidden">Resume</span>
                    </button>
                    <button id="forwardBtn" type="button" className="btn btn-outline-success footer-button-play mx-1"  data-action="Forward" onClick={(e) => {this.playAction(e)}}>
                        <i className="bi bi-skip-forward"></i>
                        <span className="visually-hidden">Forward</span>
                    </button>
                    <button id="repeatBtn" type="button" className={"btn footer-button-play mx-1 " + this.getButtonClassNameForRepeatMode()} disabled={this.checkIfRepeatModeIsDisallow()} onClick={() => {this.repeatAction()}}>
                        <i className={"bi " + this.getIconClassNameForRepeatMode()}></i>
                        <span className="visually-hidden">Repeat</span>
                    </button>
                    </div>

                    {/* <!-- Progress bar --> */}
                    <div className="d-flex justify-content-center my-2">
                    <sub id="trackPosition">{SpotifyUtils.CovertDurationToTime(this.state.position)}</sub>
                    <input type="range" className="volume-slider mx-2" id="seekSlider" style={{backgroundImage: `linear-gradient(to right, #198754 0%, #198754 ${this.state.progress}%, #e2e2e2 ${this.state.progress}%, #e2e2e2 100%)`, width: "500px"}} min="0" max="100" value={this.state.progress} data-start="false" onMouseDown={() => {}} onMouseMove={(e) => {this.updateSeekPosition(e)}}/>
                    <sub id="trackDuration">{SpotifyUtils.CovertDurationToTime(this.state.currentState?.duration)}</sub>
                    </div>

                    {/* <!-- Remote play status --> */}
                    <div id="remoteConnectState" className="d-flex aligh-items-center justify-content-center" style={{marginTop: "5px", color: "#2d921a", alignItems: "center"}}>
                    <a id="remoteContectStateBtn" href="#" className="d-inline-flex text-decoration-none rounded" data-bs-toggle="popover" data-bs-placement="top" title="Popover title" onClick={(e) => {this.openAllDevicesList(e)}}>
                        <i className="bi bi-speaker"></i>
                        <span className="mx-2" style={{fontSize: "small"}}>{this.getCurrentPlayingDeviceInfo()}</span>
                    </a>
                    <div id="allDeviceList" className="connect-device-list-container">
                        <div style={{textAlign: "left", color: "#4a4a4a", paddingLeft: "8px"}}>
                        <h6>Connect to a device</h6>
                        </div>
                        <div id="hiddenPopoverContent" className="list-group w-auto">
                            {this.state.devices?.map(device => {
                                return(
                                    <DeviceItemDOM key={device.id} device={device} callback={this.transferPlayDevice.bind(this)} />
                                );
                            })}
                        </div>
                    </div>
                    </div>
                </div>

                <div className="footer-right">
                    <div>
                    {/* <a href="#" className="d-inline-flex text-decoration-none rounded">
                        <i className="bi bi-volume-down"></i>
                    </a> */}
                    <input type="range" className="volume-slider" id="volumeSlider" style={{backgroundImage: `linear-gradient(to right, #198754 0%, #198754 ${this.state.volume}%, #e2e2e2 ${this.state.volume}%, #e2e2e2 100%)`}} min="0" max="100" defaultValue={50} data-start="false" onMouseDown={ (e) => this.onMouseDown(e)} onMouseMove={(e) => this.onMouseMove(e)} onMouseUp={(e) => this.onMouseUp(e)}/>
                    </div>
                </div> 
            </>
        );
    }
}

export default WebPlayback;
