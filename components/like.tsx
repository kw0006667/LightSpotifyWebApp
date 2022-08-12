import Link from "next/link";
import { useEffect, useState } from "react";
import { Track } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";

function LikeDOM(props: {track: Spotify.Track | Track | undefined}) {
    const [isLike, setLike] = useState(false);

    useEffect(() => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/${props.track?.type}s/contains?ids=${props.track?.id}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };
        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 200) {
                setLike(response.data[0]);
            }
        });
    }, [props.track?.id, isLike]);

    const LikeTrack = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/${props.track?.type}s?ids=${props.track?.id}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: isLike ? 'DELETE' : 'PUT'
        };
        axiosInstance.request(requestConfig)
        .then(response => {
            setLike(!isLike);
        });
    }

    return(
        <Link  href={"#"}>
            <a onClick={() => LikeTrack()}>
                <i className={"bi " + (isLike ? "bi-heart-fill" : "bi-heart")}></i>
            </a>
        </Link>
    )
}

export default LikeDOM;