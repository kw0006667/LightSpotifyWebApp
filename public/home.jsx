'use strict';

/**
 * Module exports.
 * @public
 */
exports.fetchRecentlyPlayed = fetchRecentlyPlayed;


/**
 * @private
 */



 function RecentlyPlayedCardDOM(props) {
    let track = props.track;
    let imageUrl = track.album.images[0]?.url
    let artistsStr = '';
    track.artists.forEach(artist => {
        artistsStr += `${artist.name}, `;
    });
    artistsStr = artistsStr.slice(0, artistsStr.length - 2);
    let playlist_uri = props.context?.uri;
    
    return(
        <div className="card card-playlist m-2">
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h5 className="card-title">{track.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{artistsStr}</h6>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(track.uri, playlist_uri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function generateHomePageContent(recentlyPlayedTracks) {
    let tracks = recentlyPlayedTracks.items.map(item => 
            <RecentlyPlayedCardDOM key={item.track.id} 
                                    track={item.track} 
                                    context={item.context} />
        );
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div style={{marginTop: '10px'}}>
                <section>
                    <h5>Recently played</h5>
                </section>
                <section>
                    <div className="d-flex flex-wrap mt-4">
                        {tracks}
                    </div>
                </section>
            </div>
            , content_Element
        );
    }
}

function fetchRecentlyPlayed() {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/me/player/recently-played?before=${Date.now()}&limit=50`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        generateHomePageContent(data);
        console.log(data);
    })
    .catch(reason => {
        console.error(`fetchRecentlyPlayed:\n${reason}`);
    });
}

function playRecentlyPlayedTrack(track_uri, context_uri) {
    let reqConfig = Object.assign({}, globalRequestConfig);
    reqConfig.headers["Content-Type"] = 'application/json';
    let playData = {};
    if (context_uri) {
        playData.context_uri = context_uri;
    }

    if (track_uri) {
        playData.offset = {
            uri: track_uri
        };
    }
    reqConfig.body = JSON.stringify(playData);
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
            console.log(`playRecentlyPlayedTrack:\t${response}`);
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .catch(reason => {
        console.error(`playRecentlyPlayedTrack:\n${reason}`);
    });
}