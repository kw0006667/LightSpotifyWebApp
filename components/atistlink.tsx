import Link from "next/link";

interface Props {
    key: string,
    artistId: string,
    artistName: string,
    children: string
}

function ArtistLinkDOM(props: Props) {
    return(
        <Link href={`/artists/${props.artistId}`} className="spotify-link">
            {props.artistName}
        </Link>
    );
}

function fetchArtistDetail(event: React.MouseEvent<HTMLAnchorElement>, artist_id: string) {
    event.stopPropagation();
    console.log(`fetchArtistDetail: ${artist_id}`);
}

export default ArtistLinkDOM;