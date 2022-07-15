'use strict';

/**
 * Module exports.
 * @public
 */
exports.initPlaylists = initPlaylists;

/**
 * @private
 */
let playlists = {
    _playlistCollection: [],
    _isStillFetchingPlaylists: false,
    _nextPlaylistsUrl: null,
    _playlists_Element: null,
    _content_Element: null,
    _requestConfig: null,
    _userId: null,
    _playlistsDOM: null
};

function fetchUserPlaylists(userId, nextPlaylistsUrl = null) {

    let requestConfig = Object.assign({}, globalRequestConfig);
    if (!requestConfig) {
        return;
    }

    requestConfig.headers["Content-Type"] = 'application/json';

    let requestUrl = nextPlaylistsUrl !== null ? nextPlaylistsUrl : `https://api.spotify.com/v1/users/${userId}/playlists`;
    let requestLimit = 20;

    fetch(requestUrl, requestConfig)
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
            return;
        }
    })
    .then(data => {
        console.log(`fetchUserPlaylists: \n${data}`);

        // Store playlists to the collection
        data.items.forEach(item => {
            playlists._playlistCollection.push(item);
        });

        // generatePlaylistsDOMElements(data.items);

        // Check if there are still other playlists
        let total = data.total;
        let offset = requestLimit;
        let promiseArray = [];
        if (data.next) {
            do {
                let nextUrl = `https://api.spotify.com/v1/users/kw0006667/playlists?offset=${offset}&limit=${requestLimit}`;
                promiseArray.push(fetch(nextUrl, requestConfig));
                offset += requestLimit;
            } while (offset <= total);
            Promise.all(promiseArray)
            .then(responses => {
                return Promise.all(responses.map(r => r.json()));
            })
            .then(data => {
                data.forEach(d => {
                    d.items.forEach(item => {
                        playlists._playlistCollection.push(item);
                    });
                });
            })
            .catch(reason => {
                console.error(`Promise.All\n${reason}`);
            })
            .finally( () => {
                generatePlaylistsDOMElements(playlists._playlistCollection);
            });
        }
    })
    .catch(reason => {
        console.error(`fetchUserPlaylists: \n${reason}`);
    });
}

function PlaylistCardDOM(props) {
    return(
        <div className="card card-playlist m-2" onClick={() => fetchPlaylistTracks(props.playlist.id)}>
            <img src={props.imageUri} className="card-img-top" alt="..."/>
            <div className="card-body">
                <h6 className="card-title">{props.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{props.subtitle}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={(e) => playEntirePlaylist(e, props.playlistUri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function generatePlaylistsDOMElements(playlistsData) {
    if (playlistsData?.length > 0) {
        playlists._playlistsDOM = playlistsData.map(playlist => 
            <PlaylistCardDOM key={playlist.id} 
                            name={playlist.name} 
                            subtitle={playlist.description ? playlist.description : 'By ' + playlist.owner?.display_name} 
                            imageUri={playlist.images[0]?.url}
                            playlistUri={playlist.uri} 
                            playlist={playlist} />
            );

        renderPlaylistsDOM();
    }
}

function renderPlaylistsDOM() {
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.unmountComponentAtNode(content_Element);

        ReactDOM.render(
            <div className="container d-flex flex-wrap mt-4">
                {playlists._playlistsDOM}
            </div>
            , content_Element
        );
    }
}

function PlaylistDetailDOM(props) {
    // let artistsStr = '';
    // props.track.artists.forEach(artist => {
    //     artistsStr += `${artist.name}, `;
    // });
    // artistsStr = artistsStr.slice(0, artistsStr.length - 2);
    let artists = props.track.artists.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
    });

    return(
        <tr className="album-table-row" onDoubleClick={() => playTrackInPlaylist(props.playlistUri, props.track.uri)}>
            <th scope="row">{props.trackId}</th>
            <td>{props.track.name}</td>
            <td>{artists}</td>
            <td><AlbumLinkDOM albumId={props.track.album.id} albumName={props.track.album.name} /></td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
    );
}

function generatePlaylistDetailPageContent(playlist) {
    let trackId = 0;
    let tracks = playlist.tracks.items.map(track => {
            trackId++;
            return <PlaylistDetailDOM key={trackId} playlistUri={playlist.uri} trackId={trackId} track={track.track} />
    });
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <img className="album-image" src={playlist.images[0]?.url}/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {playlist.name}
                            </div>
                            <div className="album-artist">
                                {playlist.owner.display_name}
                            </div>
                            <div className="album-date text-muted">
                                {playlist.description}
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <table className="table table-hover align-middle album-table">
                        <colgroup>
                            <col span={1} style={{width:'5%'}}/>
                            <col span={1} style={{width:'20%'}}/>
                            <col span={1} style={{width:'30%'}}/>
                            <col span={1} style={{width:'30%'}}/>
                            <col span={1} style={{width:'10%'}}/>
                            <col span={1} style={{width:'5%'}}/>
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" style={{width:'5%'}}>#</th>
                                <th >Title</th>
                                <th >Artist</th>
                                <th >Album</th>
                                <th >Time</th>
                                <th ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks}
                        </tbody>
                    </table>
                </section>
                
            </div>
            , content_Element
        )
    }
}

function fetchPlaylistTracks(playlist_id) {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/playlists/${playlist_id}?additional_types=track,episode`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        generatePlaylistDetailPageContent(data);
    })
    .catch(reason => {
        console.log(`fetchAlbumTracks:\n${reason}`);
    });
}

function initPlaylists(userId, requestConfig) {
    playlists._playlists_Element = document.getElementById('playlists');
    playlists._content_Element = document.getElementById('content');
    if (playlists._content_Element) {
        playlists._requestConfig = requestConfig;
        playlists._userId = userId;
        if (playlists._playlistCollection.length === 0) {
            fetchUserPlaylists(userId);
        }
    }
}

function playEntirePlaylist(event, playlistUri) {
    event.stopPropagation();
    let reqConfig = Object.assign({}, globalRequestConfig);
    reqConfig.headers["Content-Type"] = 'application/json';
    let playlistData = {
        context_uri: playlistUri
    };
    reqConfig.body = JSON.stringify(playlistData);
    reqConfig.method = 'PUT';

    let currentPlayingDeviceId = '';
    if (Devices.currentDeviceId) {
        currentPlayingDeviceId = Devices.currentDeviceId;
    } else {
        currentPlayingDeviceId = Playback._deviceId;
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentPlayingDeviceId}`, reqConfig)
    .then(response => {
        if (response.status == 204) {
            // return response.json();
            console.log(`startFetchingPlayback:\t${response}`);
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .catch(reason => {
        console.error(`play track:\n${reason}`);
    });
}

function playTrackInPlaylist(playlistUri, trackUri) {
    let reqConfig = Object.assign({}, globalRequestConfig);
    let trackData = {
        context_uri: playlistUri,
        offset:  {
            uri: trackUri
        },
        position_ms: 0
    };
    reqConfig.body = JSON.stringify(trackData);
    reqConfig.method = "PUT";

    let currentPlayingDeviceId = '';
    if (Devices.currentDeviceId) {
        currentPlayingDeviceId = Devices.currentDeviceId;
    } else {
        currentPlayingDeviceId = Playback._deviceId;
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentPlayingDeviceId}`, reqConfig)
    .then(response => {
        if (response.status == 204) {
            console.log(`startFetchingPlayback:\t${response}`);
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .catch(reason => {
        console.error(`play track:\n${reason}`);
    });
}