import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import WebPlayback from "./webplayback";

interface ITrackLinkProps {
    track: Spotify.Track | undefined,
    context: Spotify.PlaybackContext | undefined
}

function TrackLinkDOM(props: ITrackLinkProps) {
    const router = useRouter();
    const navigateToContextDetail = (event: React.MouseEvent<HTMLAnchorElement>, albumUri: string | undefined) => {
        if (albumUri) {
            const albumStr = albumUri.split(':');
            if (albumStr?.length === 3) {
                const contextId = albumStr[2];
                router.push(`/albums/${contextId}`);
            }
        }
    };

    return(
        <Link href={WebPlayback.getContextLink(props.track?.album.uri)}>
            <a className="spotify-link" data-bs-toggle="tooltip" title={props.track?.name} onClick={(e) => navigateToContextDetail(e, props.track?.album.uri)}>{props.track?.name}</a>
        </Link>
    );
}

export default TrackLinkDOM;