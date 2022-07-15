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
        <div className="card card-playlist m-2" onClick={(e) => fetchArtistDetail(e, episode.id)}>
            <img src={imageUrl} className="card-img-top" alt="..." height="200px" width="200px" />
            <div className="card-body">
                <h6 className="card-title">{episode.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{episode.release_date}</span>
            </div>
            <div className="card-playlist-footer" >
                <div className="card-playlist-footer-content">
                    <button className="btn btn-success" width="48px" height="48px" onClick={() => playRecentlyPlayedTrack(null, episode.uri)}>
                        <i className="bi bi-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}