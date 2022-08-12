import Image from "next/future/image";
import { Track } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import AlbumLinkDOM from "./albumlink";
import ArtistLinkDOM from "./atistlink";
import LikeDOM from "./like";

function TrackResultDOM(props: { track: Track }) {
    let artists = props.track.artists.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>{', '}</ArtistLinkDOM>);
    });

    const playTrackInAlbum = (album_uri: string, track_uri: string) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: album_uri,
                offset: {
                    uri: track_uri
                }
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in the Playlist');
            }
        });
    }

    return(
        <tr className="album-table-row" onDoubleClick={() => playTrackInAlbum(props.track.album.uri, props.track.uri)}>
            <td><Image src={props.track.album.images[0].url} width="32" height="32" alt={props.track.album.name} /></td>
            <td>
                <div className="d-flex justify-content-between" >
                    {props.track.name} 
                    <div className="album-track-like">
                        <LikeDOM track={props.track} />
                    </div>
                </div>
            </td>
            <td>{artists}</td>
            <td><AlbumLinkDOM albumId={props.track.album.id} albumName={props.track.album.name} /></td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
    );
}

export default TrackResultDOM;