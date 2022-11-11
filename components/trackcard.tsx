import { useRouter } from "next/router";
import { Track } from "../types";
import Image  from "next/image";
import ArtistLinkDOM from "./atistlink";
import React from "react";
import axiosInstance from "../utilities/axios-instance";
import AuthInstance from "../utilities/auth-instance";

function TrackCardDOM(props: { track: Track }) {
    const router = useRouter();
    
    const navigateToAlbumDetail = (event: React.MouseEvent<HTMLDivElement>, album_id: string) => {
        router.push(`/albums/${album_id}`);
    }

    const playTrackInAlbum = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: props.track.album.uri,
                offset: {
                    uri: props.track.uri
                }
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in Album');
            }
        });
    }

    let artists = props.track.artists.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
    });

    return(
        <div className="card-playlist m-2" onClick={(e) => navigateToAlbumDetail(e, props.track.album.id)}>
            <div style={{position: 'relative'}}>
                <Image src={props.track.album.images[0].url} className="card-img-top card-playlist-img" alt="..." height="200" width="200" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" onClick={(e) => playTrackInAlbum(e)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{props.track.name}</div>
                <div className="card-subtitle mb-2 text-muted">{artists}</div>
            </div>
        </div>
    );
}

export default TrackCardDOM;