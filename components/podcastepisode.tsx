import { useRouter } from "next/router";
import React from "react";
import { Episode, Podcast } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import { SpotifyUtils } from "../utilities/spotifyutils";

interface PodcastEpisodeProps {
    episode: Episode,
    podcast: Podcast | undefined
}

function PodcastEpisodeDOM(props: PodcastEpisodeProps) {
    const router = useRouter();
    const playEpisodeInPodcast = (event: React.MouseEvent<HTMLTableRowElement>, podcast_url: string | undefined, episode_uri: String) => {
        event.stopPropagation();
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: podcast_url,
                offset: {
                    uri: episode_uri
                }
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Episode in the Podcast');
            }
        });
    }

    const navigateToEpisodeDetail = (event: React.MouseEvent<HTMLTableRowElement>) => {
        router.push(`/episodes/${props.episode.id}`);
    }

    return(
        <tr className="podcast-table-row" onDoubleClick={(e) => playEpisodeInPodcast(e, props.podcast?.uri, props.episode.uri)} onClick={(e) => navigateToEpisodeDetail(e)}>
            <th scope="row"></th>
            <td>
                <div>
                    <div className="podcast-table-releasedate text-muted">{props.episode.release_date}</div>
                    <div className="podcast-table-name">{props.episode.name}</div>
                    <p className="podcast-table-des">{props.episode.description}</p>
                </div>
            </td>
            <td>{SpotifyUtils.CovertDurationToTime(props.episode.duration_ms)}</td>
            <td>{'...'}</td>
        </tr>
    );
}

export default PodcastEpisodeDOM;