'use strict';

/**
 * Module exports.
 * @public
 */


function TrackResultDOM(props) {
    let artists = props.track.artists.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>{', '}</ArtistLinkDOM>);
    });

    return(
        <tr className="album-table-row" onDoubleClick={() => playTrackInAlbum(props.track.album.uri, props.track.uri)}>
            <td><img src={props.track.album.images[0]?.url} width={'32px'} height={'32px'} /></td>
            <td>{props.track.name}</td>
            <td>{artists}</td>
            <td><AlbumLinkDOM albumId={props.track.album.id} albumName={props.track.album.name} /></td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
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
        let artists = null;
        if (track.type === 'track') {
            artists = track.artists.map(artist => {
                return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
            });
        } else {
            artists = track.show.name;
        }
        ReactDOM.render(
            <div>
                <div>
                    <span>
                        {track.type === 'track' ? <TrackLinkDOM track={track} /> : <EpisodeLinkDOM episode={track}/> }
                    </span>
                </div>
                <div>
                    <sub>
                        {track.type === 'track' ? artists : <PodcastLinkDOM podcast={track.show} /> }
                    </sub>
                </div>
            </div>
            , playingInfo_Element
        );
    }
}