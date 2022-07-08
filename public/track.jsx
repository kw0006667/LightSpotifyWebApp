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

// <li className="list-group-item d-flex justify-content-between align-items-start">
        //     <div className="ms-2 me-auto d-flex" onDoubleClick={() => playTrackInPlaylist(props.track.album.uri, props.track.uri)}>
        //         <img src={props.track.album.images[0].url} width="64" height="64"></img>
        //         <div className="mx-2">
        //             <header>{props.track.name}</header>
        //             <sub className="text-muted">{props.track.artists[0].name}</sub>
        //         </div>                
        //     </div>
        // </li>