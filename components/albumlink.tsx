import Link from "next/link";

type AlbumLinkProps = {
    albumId: string,
    albumName: string
}

function AlbumLinkDOM(props: AlbumLinkProps) {
    return(
        <Link href={`/albums/${props.albumId}`}>
            <a className="spotify-link">{props.albumName}</a>
        </Link>
    );
}

export default AlbumLinkDOM