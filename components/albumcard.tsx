import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { Album } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import ArtistLinkDOM from "./atistlink";


function AlbumCardDOM(props: { album: Album}) {
    const router = useRouter();
    const navigateToAlbumDetail = (event: React.MouseEvent<HTMLDivElement>, album_id: string) => {
        router.push(`/albums/${props.album.id}`);
    }

    const playEntireAlbum = (event: React.MouseEvent<HTMLButtonElement>, album_uri: string) => {
        event.stopPropagation();
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: album_uri
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Playlist');
            }
        });
    }

    let artists = props.album?.artists?.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
    });

    return(
        <div className="card-playlist m-2" onClick={(e) => navigateToAlbumDetail(e, props.album?.id)}>
            <div style={{position: 'relative'}}>
                <Image src={props.album?.images[0].url} className="card-img-top card-playlist-img" alt="..." height="200" width="200" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" onClick={(e) => playEntireAlbum(e, props.album?.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{props.album?.name}</div>
                <div className="card-subtitle mb-2 text-muted">{artists}</div>
            </div>
        </div>
    );
}

export default AlbumCardDOM;