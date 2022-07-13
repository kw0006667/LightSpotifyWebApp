'use strict';

/**
 * Module exports.
 * @public
 */
exports.fetchRecentlyPlayed = fetchRecentlyPlayed;


/**
 * @private
 */


function PodcastCardDOM(props) {
    let podcast = props.podcast;
    let imageUrl = podcast.show.images[0]?.url;
    return(
        <div className="card card-playlist m-2">
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h6 className="card-title">{podcast.show.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{podcast.show.publisher}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(null, podcast.show.uri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}


function generatePodcastPageContent(savedPodcasts) {
    let podcasts = savedPodcasts.items.map(podcast => 
        <PodcastCardDOM key={podcast.show.id} podcast={podcast} />
    );

    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div style={{marginTop: '10px'}}>
                    <div className="d-flex flex-wrap mt-4">
                        {podcasts}
                    </div>
            </div>
            , content_Element
        );
    }
}

function fetchSavedPodcasts() {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/me/shows?limit=50`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        console.log(data);
        generatePodcastPageContent(data);
    })
    .catch(reason => {
        console.error(`fetchSavedAlbums:\n${reason}`);
    });
}