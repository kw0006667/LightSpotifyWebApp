'use strict';

/**
 * Module exports.
 * @public
 */
exports.fetchRecentlyPlayed = fetchRecentlyPlayed;


/**
 * @private
 */


function AlbumCardDOM(props) {
    let album = props.album;
    let imageUrl = album.images[0]?.url;
    let artistsStr = '';
    album.artists.forEach(artist => {
        artistsStr += `${artist.name}, `;
    });
    artistsStr = artistsStr.slice(0, artistsStr.length - 2);
    let album_uri = album.uri;

    return(
        <div className="card card-playlist m-2">
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h6 className="card-title">{album.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{artistsStr}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(null, album_uri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function generateAlbumPageContent(savedAlbums) {
    let albums = savedAlbums.items
                .filter((v, i, a) => a.findIndex(v2 => (v2.album.id === v.album.id)) === i)
                .map(item => 
                    <AlbumCardDOM key={item.album.id}
                                    album={item.album} />
                    );

    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div style={{marginTop: '10px'}}>
                    <div className="d-flex flex-wrap mt-4">
                        {albums}
                    </div>
            </div>
            , content_Element
        );
    }
}

function fetchSavedAlbums() {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/me/albums?limit=50`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        console.log(data);
        generateAlbumPageContent(data);
    })
    .catch(reason => {
        console.error(`fetchSavedAlbums:\n${reason}`);
    });
}