'use strict';

/**
 * Module exports.
 * @public
 */
exports.initPlaybackStatus = initPlaybackStatus;

/**
 * @private
 */

function EpisodeCardDOM(props) {
    let episode = props.episode;
    let imageUrl = episode.images[0]?.url;

    return(
        <div className="card-playlist m-2" onClick={(e) => fetchArtistDetail(e, episode.id)}>
            <div style={{position: 'relative'}}>
                <img src={imageUrl} className="card-img-top card-playlist-img" alt="..." height="200px" width="200px" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(null, episode.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <h6 className="card-title">{episode.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{episode.release_date}</span>
            </div>
        </div>
    );
}