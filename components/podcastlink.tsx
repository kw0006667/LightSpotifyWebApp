import Link from "next/link";
import { Podcast } from "../types";

interface PodcastProps {
    podcast: Podcast
}

function PodcastLinkDOM(props: PodcastProps) {
    return(
        <Link href={`/podcasts/${props.podcast.id}`} className="spotify-link">
            {props.podcast.publisher}
        </Link>
    );
}

export default PodcastLinkDOM;