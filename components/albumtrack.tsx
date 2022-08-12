import { Track } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import LikeDOM from "./like";

interface Props {
    track: Track,
    albumUri: string | undefined,
    trackId: number
}

function AlbumTrackDOM(props: Props) {
    const playTrackInAlbum = (album_uri: string | undefined, track_uri: string) => {
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
        <tr className="album-table-row" onDoubleClick={() => playTrackInAlbum(props.albumUri, props.track.uri)}>
            <th scope="row">{props.trackId}</th>
            <td>
                <div className="d-flex justify-content-between" >
                    {props.track.name} 
                    <div className="album-track-like">
                        <LikeDOM track={props.track} />
                    </div>
                </div>
            </td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td>{'...'}</td>
        </tr>
    );
}

export default AlbumTrackDOM;