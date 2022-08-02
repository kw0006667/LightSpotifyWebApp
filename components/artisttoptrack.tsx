import React from "react";
import { Artist, Track } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import AlbumLinkDOM from "./albumlink";
import LikeDOM from "./like";

interface Props {
    trackId: number,
    track: Track
}

function ArtistTopTracksDOM(props: Props) {

    const playTopTrackInArtist = (artist_uri: string, track_uri: string) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: artist_uri,
                offset: {
                    uri: track_uri
                }
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play top track in the Artist');
            }
        });
    }

    const contextMenuPopup = (event: React.MouseEvent<HTMLTableRowElement>, track: Track) => {

    }

    return(
        <tr className="album-table-row" onDoubleClick={() => playTopTrackInArtist(props.track.album.uri, props.track.uri)} onContextMenu={(e) => contextMenuPopup(e, props.track)}>
            <th scope="row">{props.trackId}</th>
            <td>
                <div className="d-flex justify-content-between" >
                    {props.track.name} 
                    <div className="album-track-like">
                        <LikeDOM track={props.track} />
                    </div>
                </div>    
            </td>
            <td><AlbumLinkDOM albumId={props.track.album.id} albumName={props.track.album.name}/></td>
            <td>{new Date(props.track.duration_ms).toISOString().slice(14,19)}</td>
            <td><a href="#" >{'...'}</a></td>
        </tr>
    );
}

export default ArtistTopTracksDOM;