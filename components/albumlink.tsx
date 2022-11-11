import Link from "next/link";
import React from "react";

type AlbumLinkProps = {
    albumId: string,
    albumName: string
}

function AlbumLinkDOM(props: AlbumLinkProps) {
    return(
        <Link href={`/albums/${props.albumId}`} className="spotify-link">
            {props.albumName}
        </Link>
    );
}

export default AlbumLinkDOM