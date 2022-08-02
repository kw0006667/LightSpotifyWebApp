import Image from "next/future/image"
import { useRouter } from "next/router";
import React from "react"
import { Artist } from "../types"
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";

interface ArtistProps {
    artist: Artist
}

function ArtistCardDOM(props: ArtistProps) {
    const router = useRouter();

    const navigateToArtistDetail = (event: React.MouseEvent<HTMLDivElement>, artist_id: string) => {
        event.stopPropagation();
        router.push(`/artists/${artist_id}`);
    }

    const playArtistTopTracks = (event: React.MouseEvent<HTMLButtonElement>, artist_uri: string) => {
        event.stopPropagation();
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: artist_uri,
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play top tracks in the Artist');
            }
        });
    }

    const imageUrl = props.artist.images?.at(0)?.url ?? "/Spotify_Icon_RGB_Black.png";

    return(
        <div className="card-playlist m-2" onClick={(e) => navigateToArtistDetail(e, props.artist.id)}>
            <div style={{position: 'relative'}}>
                <Image src={imageUrl} className="card-img-top card-playlist-img" alt="..." height="200" width="200" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" onClick={(e) => playArtistTopTracks(e, props.artist.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{props.artist.name}</div>
                <div className="card-subtitle mb-2 text-muted">{props.artist.type}</div>
            </div>
        </div>
    );
}

export default ArtistCardDOM