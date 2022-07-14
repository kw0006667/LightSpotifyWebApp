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
        <div className="card card-playlist m-2" onClick={() => fetchPodcastEpisodes(podcast.show.id)}>
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h6 className="card-title">{podcast.show.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{podcast.show.publisher}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={(e) => playRecentlyPlayedTrack(e, null /* track_id */, podcast.show.uri)}>
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
            <div className="container" style={{marginTop: '10px'}}>
                    <div className="d-flex flex-wrap mt-4">
                        {podcasts}
                    </div>
            </div>
            , content_Element
        );
    }
}

function PodcastDetailDOM(props) {
    return(
        <tr className="album-table-row" onDoubleClick={() => playEpisodeInPodcast(props.podcastUri, props.episode.uri)}>
            <th scope="row">{props.trackId}</th>
            <td>
                <div>
                    <div className="podcast-table-releasedate text-muted">{props.episode.release_date}</div>
                    <div className="podcast-table-name">{props.episode.name}</div>
                    <p className="podcast-table-des">{props.episode.description}</p>
                </div>
            </td>
            <td>{new Date(props.episode.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
    )
}

function generatePodcastDetailPageContent(podcast) {
    let episodes = podcast.episodes.items.map(episode => 
            <PodcastDetailDOM key={episode.id} episode={episode} podcastUri={podcast.uri} />
        );
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <img className="album-image" src={podcast.images[0]?.url}/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {podcast.name}
                            </div>
                            <div className="album-artist">
                                {podcast.publisher}
                            </div>
                            <div className="album-date text-muted">
                                {podcast.description}
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <table className="table table-hover align-middle album-table">
                        <colgroup>
                            <col span={1} style={{width:'5%'}}/>
                            <col span={1} style={{width:'85%'}}/>
                            <col span={1} style={{width:'10%'}}/>
                            <col span={1} style={{width:'5%'}}/>
                        </colgroup>
                        <tbody>
                            {episodes}
                        </tbody>
                    </table>
                </section>
                
            </div>
            , content_Element
        )
    }
}

function fetchPodcastEpisodes(podcast_id) {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/shows/${podcast_id}`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        generatePodcastDetailPageContent(data);
    })
    .catch(reason => {
        console.log(`fetchPodcastEpisodes:\n${reason}`);
    });
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

function playEpisodeInPodcast(podcast_uri, episode_uri) {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'PUT';
    let body = {
        context_uri: podcast_uri,
        offset: {
            uri: episode_uri
        },
        position_ms: 0
    };
    requestConfig.body = JSON.stringify(body);

    // Check the current playing device
    let currentPlayingDeviceId = '';
    if (Devices.currentDeviceId) {
        currentPlayingDeviceId = Devices.currentDeviceId;
    } else {
        currentPlayingDeviceId = Playback._deviceId;
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${currentPlayingDeviceId}`, requestConfig)
    .then(response => {
        if (response.status == 204) {
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .catch(reason => {
        console.error(`playEpisodeInPodcast:\n${reason}`);
    });
}