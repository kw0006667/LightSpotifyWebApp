import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Context, ContextType, Track } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import { SpotifyUtils } from "../utilities/spotifyutils";
import AlbumCardDOM from "./albumcard";
import ArtistCardDOM from "./artistcard";
import ArtistLinkDOM from "./atistlink";
import PlaylistCardDOM from "./playlistcard";

interface Props {
    track: Track,
    context: Context
}

function RecentlyPlayedCardDOM(props: Props) {
    const [contextItem, setContextItem] = useState<any | undefined>();
    const [isLoading, setLoading] = useState(false);
    let track = props.track;
    
    useEffect(() => {
        setLoading(true);
        let contextLink = SpotifyUtils.getContextLink(props.context.uri);
        let requestConfig = {
        url: `https://api.spotify.com/v1${contextLink}`,
        headers: {
            'Authorization': 'Bearer ' + AuthInstance.access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
      };

      axiosInstance.request(requestConfig)
      .then(response => {
        if (response.status === 200) {
          let data = response.data;
          switch (data.type) {
            case ContextType.Playlist:
                setContextItem(<PlaylistCardDOM key={data.id} playlist={data} />);
                break;
            case ContextType.Album:
                setContextItem(<AlbumCardDOM key={data.id} album={data} />);
                break;
            case ContextType.Artist:
              setContextItem(<ArtistCardDOM key={data.id} artist={data} />);
              break;
          }
        }
      });
    }, [props.context.uri]);

    // let imageUrl = track.album.images[0].url
    // let artists = track.artists.map(artist => {
    //     return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
    // });
    // let playlist_uri = props.context?.uri;
    let router = useRouter();



    const navigateToAlbumDetail = (event: React.MouseEvent<HTMLDivElement>, album_id: string) => {
        event.stopPropagation();
        router.push(`/albums/${album_id}`);
        console.log(`navigateToAlbumDetail: ${album_id}`);
    }

    if (contextItem) {
        return(
            // <div className="card-playlist m-2" onClick={(e) => navigateToAlbumDetail(e, track.album.id)}>
            //     <div style={{position: 'relative'}}>
            //         <Image src={imageUrl} className="card-img-top card-playlist-img" alt="..." height="200px" width="200px" />
            //         <div className="card-cover"></div>
            //         <button className="btn btn-success card-play-button" onClick={(e) => playRecentlyPlayedTrack(e, track.uri, playlist_uri)}>
            //             <i className="bi bi-play"></i>
            //         </button>
            //     </div>
            //     <div className="card-body">
            //         <div className="card-title">{track.name}</div>
            //         <div className="card-subtitle mb-2 text-muted">{artists}</div>
            //     </div>
            // </div>
            <>
                {contextItem}
            </>
            
        );
    } else {
        return(
            <>
            </>
        )
    }
}

function playRecentlyPlayedTrack(event: React.MouseEvent<HTMLButtonElement>, track_uri: string, playlist_uri: string) {
    event.stopPropagation();
    console.log(`playRecentlyPlayTrack: ${track_uri} - ${playlist_uri}` );
    let requestConfig = {
        url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
        headers: {
            'Authorization': 'Bearer ' + AuthInstance.access_token,
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        data: JSON.stringify({
            context_uri: playlist_uri,
            offset: {
                uri: track_uri
            }
        })
    };

    axiosInstance.request(requestConfig)
    .then(response => {
        if (response.status === 202) {
            console.log('Play Playlist');
        }
    });
}

export default RecentlyPlayedCardDOM;