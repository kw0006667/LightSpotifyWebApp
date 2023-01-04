import Image from "next/image";
import { useRouter } from "next/router";
import { Episode } from "../types";

function EpisodeCardDOM(props: {episode: Episode}) {
    const router = useRouter();

    const navigateToEpisodeDetail = (episode_id: string) => {
        router.push(`/episodes/${episode_id}`);
    }

    const playEpisodeInPodcast = (event: React.MouseEvent<HTMLButtonElement> ,episode_uri: string) => {

    }

    return(
        <div className="card-playlist m-2" onClick={() => navigateToEpisodeDetail(props.episode.id)}>
            <div style={{position: 'relative'}}>
                <Image src={props.episode.images[0].url} className="card-img-top card-playlist-img" alt="..." height="200" width="200" />
                <div className="card-cover"></div>
                <button className="btn btn-success card-play-button" onClick={(e) => playEpisodeInPodcast(e, props.episode.uri)}>
                    <i className="bi bi-play"></i>
                </button>
            </div>
            <div className="card-body">
                <h6 className="card-title">{props.episode.name}</h6>
                <span className="card-subtitle mb-2 text-muted">{props.episode.release_date}</span>
            </div>
        </div>
    );
}

export default EpisodeCardDOM;