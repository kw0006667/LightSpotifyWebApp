'use strict';

/**
 * Module exports.
 * @public
 */


/**
 * @private
 */


function PodcastCardDOM(props) {
    let podcast = props.podcast;
    let imageUrl = podcast.show.images[0]?.url;
    return(
        <div className="card-playlist m-2" onClick={() => fetchPodcastEpisodes(podcast.show.id)}>
            <div style={{position: 'relative'}}>
                <img src={imageUrl} className="card-img-top card-playlist-img" alt="..." height="200px" width="200px" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" width="48px" height="48px" onClick={(e) => playRecentlyPlayedTrack(e, null /* track_id */, podcast.show.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{podcast.show.name}</div>
                <div className="card-subtitle mb-2 text-muted">{podcast.show.publisher}</div>
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
        <tr className="podcast-table-row" onDoubleClick={() => playEpisodeInPodcast(props.podcastUri, props.episode.uri)} onClick={() => {fetchEpisodeDetail(props.episode.id)}}>
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

function EpisodeLinkDOM(props) {
    return(
        <a href="#" className="spotify-link" onClick={() => fetchEpisodeDetail(props.episode.id)}>{props.episode.name}</a>
    );
}

function PodcastLinkDOM(props) {
    return(
        <a href="#" className="spotify-link" onClick={() => fetchPodcastEpisodes(props.podcast.id)}>{props.podcast.publisher}</a>
    );
}

class PodcastDetailContentDOM extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDataReturn: false,
            podcastId: this.props.podcastId,
            saveState: false,
            podcast: null
        };
    }

    componentDidMount() {
        this.getFollowingStatus();
        this.fetchPodcastDetail();
    }

    fetchPodcastDetail() {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = 'GET';
    
        fetch(`https://api.spotify.com/v1/shows/${this.state.podcastId}`, requestConfig)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                refreshToken();
            }
        })
        .then(data => {
            this.setState({
                isDataReturn: true,
                podcast: data
            });
        })
        .catch(reason => {
            console.log(`fetchPodcastEpisodes:\n${reason}`);
        });
    }

    getFollowingStatus() {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = 'GET';

        fetch(`https://api.spotify.com/v1/me/shows/contains?ids=${this.state.podcastId}`, requestConfig)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                refreshToken();
            }
        })
        .then(data => {
            if (data?.length > 0) {
                this.setState({saveState: data[0]});
            }
        })
        .catch(reason => {
            console.error(`getFollowingStatus:\n${reason}`);
        });
    }

    setFollowingStatus(e) {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = this.state.followState ? 'DELETE' : 'PUT';

        fetch(`https://api.spotify.com/v1/me/shows?ids=${this.state.podcastId}`, requestConfig)
        .then(response => {
            if (response.ok) {
                this.setState({saveState: !this.state.saveState});
            } else if (response.status === 401) {
                refreshToken();
            }
        })
        .catch(reason => {
            console.error(`setFollowingStatus:\n${reason}`);
        });
    }

    playEntirePodcast(e, podcastUri) {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = 'PUT';

        let artistData = {
            context_uri: podcastUri
        };
        requestConfig.body = JSON.stringify(artistData);

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
            console.error(`play artist:\n${reason}`);
        });
    }

    render() {
        if (!this.state.isDataReturn) {
            return(
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        let episodes = this.state.podcast.episodes.items.map(episode => 
            <PodcastDetailDOM key={episode.id} episode={episode} podcastUri={this.state.podcast.uri} />
        );
        return(
            <div>
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <img className="album-image" src={this.state.podcast.images[0]?.url}/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {this.state.podcast.name}
                            </div>
                            <div className="album-artist">
                                <PodcastLinkDOM podcast={this.state.podcast} />
                            </div>
                            <div className="album-date text-muted">
                                {this.state.podcast.description}
                            </div>
                            <div className="album-follow d-flex">
                                <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (this.state.saveState ? 'active' : '')} onClick={(e) => this.setFollowingStatus(e)}>{this.state.saveState ? 'Saved' : 'Save'}</button>
                                <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => this.playEntirePodcast(e, this.state.podcast.uri)}>Play</button>
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
        );
    }
}

function generatePodcastDetailPageContent(podcastId) {
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                <PodcastDetailContentDOM podcastId={podcastId} />
            </div>
            , content_Element
        )
    }
}

function generateEpisodeDetailPageContent(episode) {
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <img className="album-image" src={episode.images[0]?.url}/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {episode.name}
                            </div>
                            <div className="album-artist">
                                <PodcastLinkDOM podcast={episode.show} />
                            </div>
                            {/* <div className="album-date text-muted">
                                {episode.description}
                            </div> */}
                        </div>
                    </div>
                </section>
                <section className="artist-section">
                    <div>
                        Description
                    </div>
                    <div className="album-date text-muted">
                        <div dangerouslySetInnerHTML={{ __html: episode.html_description}} />
                        {/* {episode.html_description} */}
                    </div>
                </section>
                
            </div>
            , content_Element
        )
    }
}

function fetchPodcastEpisodes(podcast_id) {
    generatePodcastDetailPageContent(podcast_id);
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

function fetchEpisodeDetail(episode_id) {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/episodes/${episode_id}`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        generateEpisodeDetailPageContent(data);
    })
    .catch(reason => {
        console.error(`fetchEpisodeDetail:\n${reason}`);
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