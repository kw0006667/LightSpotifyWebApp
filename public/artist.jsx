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
        <div className="card-playlist m-2" onClick={(e) => fetchArtistDetail(e, artist.id)}>
            <div style={{position: 'relative'}}>
                <img src={imageUrl} className="card-img-top card-playlist-img" alt="..." height="200px" width="200px" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(null, artist_uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <h6 className="card-title">{artist.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{artist.type}</span>
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
            <div className="container" style={{marginTop: '10px'}}>
                    <div className="d-flex flex-wrap mt-4">
                        {artists}
                    </div>
            </div>
            , content_Element
        );
    }
}

function ArtistLinkDOM(props) {
    return(
        <a href="#" className="spotify-link" onClick={(e) => fetchArtistDetail(e, props.artistId)}>{props.artistName}</a>
    );
}

function ArtistTopTracksDOM(props) {
    return(
        <tr className="album-table-row" onDoubleClick={() => playTrackInAlbum(props.track.album.uri, props.track.uri)}>
            <th scope="row">{props.trackId}</th>
            <td>{props.track.name}</td>
            <td><AlbumLinkDOM albumId={props.track.album.id} albumName={props.track.album.name}/></td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
    );
}

function generateArtistDetailPageContent(artist, topTracks, recentlyAlbums, relativedArtists) {
    let trackId = 0;
    let tracks = topTracks.tracks.map(track => {
            trackId++;
            return <ArtistTopTracksDOM key={track.id} artistUri={artist.uri} trackId={trackId} track={track} />
        });

    let albums = recentlyAlbums.map(album => 
             <AlbumCardDOM key={album.id} album={album} />
        );
        
    let relatedArtists = relativedArtists.map(artist => 
            <ArtistCardDOM key={artist.id} artist={artist} />
        );

    let content_Element = document.getElementById('content');
    if (content_Element) {

        ReactDOM.render(
            <div style={{marginTop: '10px'}}>
                <section className="artist-section">
                    <div className="align-items-baseline artist-banner">
                        <div >
                            <div className="artist-image-banner" style={{backgroundImage: `url(${artist.images[0]?.url})`}}></div>
                            <img className="album-image rounded-circle" src={artist.images[0]?.url}/>
                        </div>
                        <div className="artist-title">
                            <div className="album-name">
                                {artist.name}
                            </div>
                            <div className="album-artist">
                                {artist.genres[0]}
                            </div>
                            <div className="album-date text-muted">
                                {'Followers: ' + artist.followers?.total}
                            </div>
                        </div>
                    </div>
                </section>
                <section className="container artist-section">
                    <div className="artist-section-title">
                        Top Songs
                    </div>
                    <table className="table table-hover align-middle album-table">
                        <colgroup>
                            <col span={1} style={{width:'5%'}}/>
                            <col span={1} style={{width:'40%'}}/>
                            <col span={1} style={{width:'40%'}}/>
                            <col span={1} style={{width:'10%'}}/>
                            <col span={1} style={{width:'5%'}}/>
                        </colgroup>
                        <tbody>
                            {tracks}
                        </tbody>
                    </table>
                </section>
                <section className="container artist-section">
                    <div className="artist-section-title d-flex justify-content-between">
                        <div>
                            Albums
                        </div>
                        <div>
                            <a href="#" className="spotify-link spotify-link-thin spotify-link-small" onClick={(e) => fetchAllArtistAlbums(e, artist.id)}>See All</a>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap">
                        {albums}
                    </div>
                </section>
                <section className="container artist-section">
                    <div className="artist-section-title">
                        Similar Artists
                    </div>
                    <div className="d-flex flex-wrap">
                        {relatedArtists}
                    </div>
                </section>
            </div>
            , content_Element
        )
    }
}

function generateAllAlbumsPageContent(albums) {
    let albumsArray = albums.map(album => 
            <AlbumDetailContentDOM key={album.id} album={album} />
        );
    
    let content_Element = document.getElementById('content');
    if (content_Element) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '30px'}}>
                    {albumsArray}
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

function fetchArtistDetail(event, artist_id) {
    event.stopPropagation();
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    let promiseArray = [];
    // Get Artist
    promiseArray.push(
            fetch(`https://api.spotify.com/v1/artists/${artist_id}`, requestConfig)
    );
    // Get Artist's top tracks
    promiseArray.push(
        fetch(`https://api.spotify.com/v1/artists/${artist_id}/top-tracks?market=${userProfile.country}`, requestConfig)
    );
    // Get Artist's first 5 albums
    promiseArray.push(
            fetch(`https://api.spotify.com/v1/artists/${artist_id}/albums?limit=20`, requestConfig)
    );
    // Get Artist's relative
    promiseArray.push(
        fetch(`https://api.spotify.com/v1/artists/${artist_id}/related-artists`, requestConfig)
    );

    Promise.all(promiseArray)
        .then(responses => {
            return Promise.all(responses.map(res => res.json()));
        })
        .then(data => {
            if (data?.length < promiseArray.length || !data[0] || !data[1]) {
                throw('data response were not enough');
            } else {
                generateArtistDetailPageContent(data[0] /* Artist's info */,
                                                 data[1] /* Artist's top tracks */,
                                                 data[2].items.filter( (v, i, a) => a.findIndex(v2 => (v2.name === v.name)) === i).slice(0, data[2].items.length > 6 ? 6 : data[2].items.length) /* Artist's albums */,
                                                 data[3].artists.slice(0, data[3].artists.length > 6 ? 6 : data[3].artists.length) /* Artist's relative */);
            }
        })
        .catch(reason => {
            console.error(`fetchArtistDetail:\n${reason}`);
        });
}

function fetchAllArtistAlbums(event, artist_id) {
    event.stopPropagation();
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/artists/${artist_id}/albums?limit=50`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401){
            refreshToken();
        }
    })
    .then(data => {
        let albumsLink = data.items.filter( (v, i, a) => a.findIndex(v2 => (v2.name === v.name)) === i).map(album => album.id);
        albumsLink = albumsLink.slice(0, albumsLink.length > 20 ? 20 : albumsLink.length);

        fetch(`https://api.spotify.com/v1/albums?ids=${albumsLink.toString()}`, requestConfig)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                refreshToken();
            }
        })
        .then(albumsData => {
            generateAllAlbumsPageContent(albumsData.albums);
        })
        .catch(reason => {
            console.error(`fetchAllArtistAlbums:\n${reason}`);
        });
    })
    .catch(reason => {
        console.error(`fetchAllArtistAlbums:\n${reason}`);
    });

}

function playTopTrackInArtist(album_uri, track_uri) {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'PUT';
    let body = {
        // context_uri: artist_uri,
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