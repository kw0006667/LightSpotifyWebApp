'use strict';

/**
 * Module exports.
 * @public
 */


 function TrackResultDOM(props) {
    return(
        <a href="#" className="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" onDoubleClick={() => playTrackInPlaylist(props.track.album.uri, props.track.uri)}>
            <img src={props.track.album.images[0].url} alt="twbs" width="32" height="32" className="rounded-circle flex-shrink-0"></img>
            <div className="d-flex gap-2 w-100 justify-content-between">
                <div>
                    <h6 className="mb-0">{props.track.name}</h6>
                    <p className="mb-0 opacity-75">{props.track.artists[0].name}</p>
                </div>
                <small className="opacity-50 text-nowrap">{new Date(props.track.duration_ms).toISOString().slice(14,19)}</small>
            </div>
        </a>
    );
}

function TrackLinkDOM(props) {
    return(
        <a href="#" className="spotify-link" onClick={(e) => fetchAlbumTracks(e, props.track.album.id)}>{props.track.name}</a>
    );
}

function updatePlayingInfo(track) {
    if (!track) {
        return;
    }

    let playingInfo_Element = document.getElementById('playingInfo');
    if (playingInfo_Element) {
        let artists = track.artists.map(artist => {
            return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
        });
        ReactDOM.render(
            <div>
                <div>
                    <span>
                        {<TrackLinkDOM track={track} /> }
                    </span>
                </div>
                <div>
                    <sub>
                        {artists}
                    </sub>
                </div>
            </div>
            , playingInfo_Element
        );
    }
}