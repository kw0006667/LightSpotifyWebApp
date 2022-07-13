'use strict';

/**
 * Module exports.
 * @public
 */
exports.initPlaybackStatus = initPlaybackStatus;

/**
 * @private
 */

 function ArtistCardDOM(props) {
    let artist = props.artist;
    let imageUrl = artist.images[0]?.url;
    let artist_uri = artist.uri;

    return(
        <div className="card card-playlist m-2">
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h6 className="card-title">{artist.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{artist.type}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(null, artist_uri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function generateArtistPageContent(followedArtist) {
    let artists = followedArtist.artists.items.map(artist => 
        <ArtistCardDOM key={artist.id} artist={artist} />
        );

    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div style={{marginTop: '10px'}}>
                    <div className="d-flex flex-wrap mt-4">
                        {artists}
                    </div>
            </div>
            , content_Element
        );
    }
}

function fetchFollowedArtists() {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/me/following?type=artist&limit=50`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        console.log(data);
        generateArtistPageContent(data);
    })
    .catch(reason => {
        console.error(`fetchSavedAlbums:\n${reason}`);
    });
}