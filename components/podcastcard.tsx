import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { Podcast } from "../types";

interface PodcastProps {
    podcast: Podcast
}

function PodcastCardDOM(props: PodcastProps) {
    const router = useRouter();

    const navigateToPodcastDetail = (event: React.MouseEvent<HTMLDivElement>, podcast_id: string) => {
        router.push(`/podcasts/${podcast_id}`);
    }

    const playPodcast = (event: React.MouseEvent<HTMLButtonElement>, prodcast_url: string) => {
        event.stopPropagation();
    }

    return(
        <div className="card-playlist m-2" onClick={(e) => navigateToPodcastDetail(e, props.podcast.id)}>
            <div style={{position: 'relative'}}>
                <Image src={props.podcast.images[0].url} className="card-img-top card-playlist-img" alt="..." height="200" width="200" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button"  onClick={(e) => playPodcast(e, props.podcast.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <div className="card-title">{props.podcast.name}</div>
                <div className="card-subtitle mb-2 text-muted">{props.podcast.publisher}</div>
            </div>
        </div>
    );
}

export default PodcastCardDOM;