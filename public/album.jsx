'use strict';

/**
 * Module exports.
 * @public
 */


/**
 * @private
 */


function AlbumCardDOM(props) {
    let album = props.album;
    let imageUrl = album.images[0]?.url;
    let album_uri = album.uri;
    let artists = album.artists.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
    });

    return(
        <div className="card-playlist m-2" onClick={(e) => fetchAlbumTracks(e, album.id)}>
            <div style={{position: 'relative'}}>
                <img src={imageUrl} className="card-img-top card-playlist-img" alt="..." height="200px" width="200px" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" width="48px" height="48px" onClick={(e) => playEntirePlaylist(e, album_uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{album.name}</div>
                <div className="card-subtitle mb-2 text-muted">{artists}</div>
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
            <div className="container" style={{marginTop: '10px'}}>
                    <div className="d-flex flex-wrap mt-4">
                        {albums}
                    </div>
            </div>
            , content_Element
        );
    }
}

function AlbumDetailDOM(props) {
    return(
        <tr className="album-table-row" onDoubleClick={() => playTrackInAlbum(props.albumUri, props.track.uri)}>
            <th scope="row">{props.trackId}</th>
            <td>{props.track.name}</td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
    );
}

class AlbumDetailContentDOM extends React.Component {
    constructor(props) {
        super(props);
        this.state = {followState: false};
        this.album = this.props.album;
    }

    componentDidMount() {
        this.getFollowingStatus();
    }
    
    getFollowingStatus() {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = 'GET';

        fetch(`https://api.spotify.com/v1/me/albums/contains?ids=${this.album.id}`, requestConfig)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                refreshToken();
            }
        })
        .then(data => {
            if (data && data?.length > 0) {
                this.setState({followState: data[0]});
            }
        })
    }

    setFollowingStatus(e) {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = this.state.followState ? 'DELETE' : 'PUT';

        fetch(`https://api.spotify.com/v1/me/albums?ids=${this.album.id}`, requestConfig)
        .then(response => {
            if (response.ok) {
                this.setState({followState: !this.state.followState});
            } else if (response.status === 401) {
                refreshToken();
            }
        })
        .catch(reason => {
            console.error(`setFollowingStatus:\n$${reason}`);
        });
    }

    playEntireAlbum(e, albumUri) {
        let requestConfig = Object.assign({}, globalRequestConfig);
        requestConfig.headers["Content-Type"] = 'application/json';
        requestConfig.method = 'PUT';

        let albumData = {
            context_uri: albumUri
        };
        requestConfig.body = JSON.stringify(albumData);

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
            console.error(`play album:\n${reason}`);
        });
    }

    render() {
        const { album } = this.props;
        let trackId = 0;
        let tracks = album.tracks.items.map(track => {
                trackId++;
                return <AlbumDetailDOM key={track.id} albumUri={album.uri} trackId={trackId} track={track} />
        });
        let artists = album.artists.map(artist => {
            return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
        });
        return(
            <div style={{marginTop: '50px', marginBottom: '50px'}}>
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <img className="album-image" src={album.images[0]?.url}/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {album.name}
                            </div>
                            <div className="album-artist">
                                <span>
                                {artists}
                                </span>
                            </div>
                            <div className="album-date text-muted">
                                {album.release_date}
                            </div>
                            <div className="album-follow d-flex">
                                <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (this.state.followState ? 'active' : '')} onClick={(e) => this.setFollowingStatus(e)}>{this.state.followState ? 'Saved' : 'Save'}</button>
                                <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => this.playEntireAlbum(e, this.album.uri)}>Play</button>
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
                            {tracks}
                        </tbody>
                    </table>
                </section>
            </div>
        );
    }
}

function AlbumLinkDOM(props) {
    return(
        <a href="#" className="spotify-link" onClick={(e) => fetchAlbumTracks(e, props.albumId)}>{props.albumName}</a>
    );
}

function generateAlbumDetailPageContent(album) {
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                <AlbumDetailContentDOM album={album}/>
            </div>
            , content_Element
        )
    }
}

function fetchAlbumTracks(event, album_id) {
    event.stopPropagation();
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/albums/${album_id}`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        generateAlbumDetailPageContent(data);
    })
    .catch(reason => {
        console.log(`fetchAlbumTracks:\n${reason}`);
    });
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

function playTrackInAlbum(album_uri, track_uri) {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'PUT';
    let body = {
        context_uri: album_uri,
        offset: {
            uri: track_uri
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
        console.error(`playTrackInAlbum:\n${reason}`);
    });
}