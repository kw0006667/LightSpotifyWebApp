'use strict';

/**
 * Module exports.
 * @public
 */

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
        <div className="card card-playlist m-2" onClick={(e) => fetchAlbumTracks(e, track.album.id)}>
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h6 className="card-title">{track.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{artistsStr}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={(e) => playRecentlyPlayedTrack(e, track.uri, playlist_uri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function generateHomePageContent(recentlyPlayedTracks, featuredPlaylists) {
    let tracks = recentlyPlayedTracks.items.filter( (v, i, a) => a.findIndex(v2 => (v2.track.id === v.track.id)) === i).slice(0, 6).map(item => 
        <RecentlyPlayedCardDOM key={item.track.id} 
                                    track={item.track} 
                                    context={item.context} />
        );
    
    let playlists = featuredPlaylists.playlists.items.slice(0, 6).map(playlist => 
            <PlaylistCardDOM key={playlist.id}
                            name={playlist.name}
                            subtitle={playlist.description ? playlist.description : 'By ' + playlist.owner?.display_name}
                            imageUri={playlist.images[0]?.url}
                            playlistUri={playlist.uri}
                            playlist={playlist} />
        );

    // arr.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i)
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                <section className="artist-section">
                    <div className="artist-section-title">
                        Recently played
                    </div>
                    <div className="d-flex flex-wrap">
                        {tracks}
                    </div>
                </section>
                <section className="artist-section">
                    <div className="artist-section-title">
                        Featured Playlists
                    </div>
                    <div className="d-flex flex-wrap">
                        {playlists}
                    </div>
                </section>
            </div>
            , content_Element
        );
    }
}

function fetchHomePage() {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    let promiseArray = [];
    // Get recently played
    promiseArray.push(
            fetch(`https://api.spotify.com/v1/me/player/recently-played?before=${Date.now()}&limit=50`, requestConfig)
    );
    // Get Featured Playlists
    promiseArray.push(
        fetch(`https://api.spotify.com/v1/browse/featured-playlists`, requestConfig)
    );

    Promise.all(promiseArray)
    .then(responses => {
        return Promise.all(responses.map(res => {
            if (res.ok) {
                return res.json();
            } else if (res.status === 401) {
                refreshToken();
            }
        }));
    })
    .then(data => {
        if (data?.length < promiseArray.length || !data[0] || !data[1]) {
            throw('data response were not enough');
        } else {
            generateHomePageContent(data[0] /* recently played */,
                                    data[1] /* featured playlists */);
        }
    })
    .catch(reason => {
        console.error(`fetchHomePage:\n${reason}`);
    });
}

function playRecentlyPlayedTrack(event, track_uri, context_uri) {
    event.stopPropagation();
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