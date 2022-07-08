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

};

function fetchUserPlaylists(userId, requestConfig, nextPlaylistsUrl = null) {
    if (!requestConfig) {
        return;
    }

    requestConfig.headers["Content-Type"] = 'application/json';

    let requestUrl = nextPlaylistsUrl !== null ? nextPlaylistsUrl : `https://api.spotify.com/v1/users/${userId}/playlists`;
    let requestLimit = 20;

    fetch(requestUrl, requestConfig)
    .then(response => {
        return response.json();
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

function PlaylistDOM(props) {
    return(
        <li>
            <a href="#" className="link-dark d-inline-flex text-decoration-none rounded" onClick={() => playlistPageContent(props.playlist.id)}>{props.playlist.name}</a>
        </li>
    )
}

function PlaylistsDOM(props) {
    const playlists = props.playlists.map( playlist =>
        <PlaylistDOM key={playlist.id} playlist={playlist} />
        );
    
    return(
        <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
            {playlists}
        </ul>
    );
}

function generatePlaylistsDOMElements(playlists) {
    if (playlists?.length > 0) {
        let playlists_element = document.getElementById('dashboard-collapse');
        if (playlists_element) {
            ReactDOM.render(
                <PlaylistsDOM playlists={playlists}/>
                , playlists_element
            )
        }
    }
}

function initPlaylists(userId, requestConfig) {
    playlists._playlists_Element = document.getElementById('playlists');
    playlists._content_Element = document.getElementById('content');
    if (playlists._playlists_Element) {
        playlists._playlists_Element.innerHTML = "";
        playlists._requestConfig = requestConfig;
        playlists._userId = userId;
        fetchUserPlaylists(userId, requestConfig);
    }
}

function playlistPageContent(id) {
    if (!id) {
        return;
    }

    if (playlists._requestConfig) {
        playlists._requestConfig.headers["Content-Type"] = 'application/json';
    }

    fetch(`https://api.spotify.com/v1/playlists/${id}`, playlists._requestConfig)
    .then(response => {
        return response.json();
    })
    .then(data => {
        playlistPageContentLoad(data);
    })
    .catch(reason => {
        console.error(`playlistPageContent:\n${reason}`);
    });
}

function playTrackInPlaylist(playlistUri, trackUri) {
    let reqConfig = Object.assign({}, playlists._requestConfig);
    let trackData = {
        context_uri: playlistUri,
        // uris: [track.uri],
        offset:  {
            uri: trackUri
        },
        position_ms: 0
    };
    // reqConfig.body = data;
    reqConfig.body = JSON.stringify(trackData);
    // reqConfig.body["context_uri"] = track.uri;
    // reqConfig.body["position_ms"] = 0;
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
            // return response.json();
            console.log(`startFetchingPlayback:\t${response}`);
        }
    })
    .catch(reason => {
        console.error(`play track:\n${reason}`);
    });
}

function TrackDOM(props) {
    return(
        <li className="list-group-item d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto" onDoubleClick={() => playTrackInPlaylist(props.playlistUri, props.track.uri)}>
                <div className="fw-bold">{props.track.name}</div>
                {props.track.artists[0].name}
            </div>
        </li>
    );
}

function ArtistsDOM(artists) {
    
}

function TrackDOMV2(props) {
    return(
        <tr className="align-items-center" onDoubleClick={() => playTrackInPlaylist(props.playlistUri, props.track.uri)}>
            <th scope="row">{props.index}</th>
            <td className="d-flex">
                <img src={props.track.album.images[0].url} alt="twbs" width="32" height="32" className="flex-shrink-0"></img>
                <div className="ms-1 me-auto">
                    <header >{props.track.name}</header>
                    <span className="text-muted">{props.track.artists[0].name}</span>
                </div>
            </td>
            <td>
                <span className="text-muted">{props.track.album.name}</span>
            </td>
            <td>
                <span className="text-muted">
                    {new Date(props.track.duration_ms).toISOString().slice(14,19)}
                </span>
            </td>
        </tr>
    );
}

function TracksDOM(props) {
    const tracks = props.tracks.map(track => 
        <TrackDOM key={track.track.id} playlistUri={props.playlistUri} track={track.track}/>
    );

    return(
        <ol id="playlists_collection" className="list-group list-group-numbered">
            {tracks}
        </ol>
    );
}

function playlistPageContentLoad(data) {
    if (!data) {
        return;
    }

    let pageContentReactDom = document.getElementById('content');
    if (pageContentReactDom) {

        const tracks = data.tracks.items.map( (item, index) => 
            <TrackDOMV2 index={index + 1} key={item.track.id} playlistUri={data.uri} track={item.track} />
        );
        
        ReactDOM.render(
            <div>
                <img src={data.images[0].url} width="128" height="128" />
                <h1>{data.name}</h1>
                <h4>{data.description}</h4>
                <hr/>
                <table className="table align-middle table-hover table-sm">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Title</th>
                            <th scope="col">Album</th>
                            <th scope="col">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracks}
                    </tbody>
                </table>
                {/* <TracksDOM playlistUri={data.uri} tracks={data.tracks.items}/> */}
            </div>
        , pageContentReactDom
        );
    }

    

    let playlistContainerElement = document.getElementById('playlistContainer');
    if (playlistContainerElement) {
        // playlistContainerElement.innerHTML = 
        // `
        // <div>
        //     <img src="${data.images[0].url}" width="128" height="128" >
        //     <h1>${data.name}</h1>
        //     <h4>${data.description}</h4>
        //     <hr/>
        //     <ol id="playlists_collection" class="list-group list-group-numbered">
        //     </ol>
        //   </div>
        // `;
        // let ol = ReactDOM.createRoot(document.getElementById('playlists_collection'));
        let playTrack = () => {
            console.log('Play track: clicked');
            let reqConfig = Object.assign({}, playlists._requestConfig);
            let trackData = {
                context_uri: data.uri,
                // uris: [track.uri],
                offset:  {
                    uri: item.track.uri
                },
                position_ms: 0
                };
            // reqConfig.body = data;
            reqConfig.body = JSON.stringify(trackData);
            // reqConfig.body["context_uri"] = track.uri;
            // reqConfig.body["position_ms"] = 0;
            reqConfig.method = "PUT";

            fetch('https://api.spotify.com/v1/me/player/play?device_id=b9c5bdb3f1d1a676d17ba46a060e18aa6faa4eb0', reqConfig)
            .then(response => {
                if (response.status == 204) {
                    // return response.json();
                    console.log(`startFetchingPlayback:\t${response}`);
                }
            })
            .catch(reason => {
                console.error(`play track:\n${reason}`);
            });
        };
        const tracks = data.tracks.items.map( item => {
            <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto" ondblclick={playTrack}>
                    <div class="fw-bold">{item.track.name}</div>
                    {item.track.artists[0].name}
                </div>
            </li>
        });
        // if (ol) {
        //     ol.render(tracks);
        // }

        // data.tracks.items.forEach(item => {
        //     let track = item.track;
        //     let dblclickDOM = document.createElement('div');
        //     dblclickDOM.className = "ms-2 me-auto";
        //     // dblclickDOM.addEventListener("click")
        //     dblclickDOM.ondblclick = (ev) => {
        //         console.log('Play track: clicked');
        //         let reqConfig = Object.assign({}, playlists._requestConfig);
        //         let trackData = {
        //             context_uri: data.uri,
        //             // uris: [track.uri],
        //             offset:  {
        //                 uri: track.uri
        //             },
        //             position_ms: 0
        //           };
        //         // reqConfig.body = data;
        //         reqConfig.body = JSON.stringify(trackData);
        //         // reqConfig.body["context_uri"] = track.uri;
        //         // reqConfig.body["position_ms"] = 0;
        //         reqConfig.method = "PUT";

        //         fetch('https://api.spotify.com/v1/me/player/play?device_id=b9c5bdb3f1d1a676d17ba46a060e18aa6faa4eb0', reqConfig)
        //         .then(response => {
        //             if (response.status == 204) {
        //                 // return response.json();
        //                 console.log(`startFetchingPlayback:\t${response}`);
        //             }
        //         })
        //         .catch(reason => {
        //             console.error(`play track:\n${reason}`);
        //         });
        //     };
        //     dblclickDOM.innerHTML =
        //     `
        //     <div class="fw-bold">${track.name}</div>
        //     ${track.artists[0].name}
        //     `;

        //     let li = document.createElement('li');
        //     li.className = "list-group-item d-flex justify-content-between align-items-start";
        //     // li.innerHTML =
        //     // `
        //     // <span class="badge bg-primary rounded-pill">${new Date(track.duration_ms).toISOString().slice(11,19)}</span>
        //     // `;
        //     li.appendChild(dblclickDOM);
            
        //     ol.appendChild(li);
        // });
    }
}