import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { Playlist } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";

interface Props {
    playlist: Playlist
}

function PlaylistCardDOM(props: Props) {
    const router = useRouter();

    const playEntirePlaylist = (event: React.MouseEvent<HTMLButtonElement>, playlistUri: string) => {
        event.stopPropagation();
        console.log(`playEntiredPlaylist: ${playlistUri}`);
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: playlistUri
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Playlist');
            }
        });
    }

    const navigateToPlaylistDetail = (event: React.MouseEvent<HTMLDivElement>, playlist_id: string) => {
        event.stopPropagation();
        console.log(`navigateToPlaylistDetail: ${playlist_id}`);
        router.push(`/playlists/${playlist_id}`);
    }

    return(
        <div className="card-playlist m-2" onClick={(e) => navigateToPlaylistDetail(e, props.playlist.id)}>
            <div style={{position: 'relative'}} >
                <Image src={props.playlist.images[0].url} className="card-img-top card-playlist-img" alt="..." width="200"height="200"/>
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" onClick={(e) => playEntirePlaylist(e, props.playlist.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{props.playlist.name}</div>
                <div className="card-subtitle mb-2 text-muted">{props.playlist.description}</div>
            </div>
        </div>
    );
}

export default PlaylistCardDOM;