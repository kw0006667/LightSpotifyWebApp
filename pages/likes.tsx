import { GetServerSideProps, NextPage } from "next";
import React from "react";
import Image from "next/future/image";
import { Item, Track } from "../types";
import axiosInstance from "../utilities/axios-instance";
import AlbumTrackDOM from "../components/albumtrack";
import AuthInstance from "../utilities/auth-instance";
import { AxiosRequestConfig } from "axios";
import useSWR from "swr";

interface ILikeDetailProps {
    access_token: string | string[] | undefined
}

interface ILikeDetailState {
    tracks: Item[] | undefined
}

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const useLikedTracks = (access_token: string | string[] | undefined): ILikeDetailState => {
    const requestConfig = {
        url: `https://api.spotify.com/v1/me/tracks?limit=50`,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    };

    const { data, error } = useSWR(requestConfig, fetcher);

    return {
        tracks: data?.items
    };
}

const LikePage: NextPage<ILikeDetailProps> = (props: ILikeDetailProps) => {
    const { tracks } = useLikedTracks(props.access_token);

    const playEntirePlaylist = () => {
        const trackUris: string[] = [];
        tracks?.forEach(item => {
            trackUris.push(item.track.uri);
        });

        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                uris: trackUris
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in the Playlist');
            }
        });
    }

    if (!tracks) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    
    let trackId = 0;
    let trackItems = tracks.map(track => {
            trackId++;
            return <AlbumTrackDOM key={track.track.id} trackId={trackId} track={track.track} albumUri={track.track.album?.uri}/>
    });

    let imageUrl = tracks[0].track.album.images?.at(0)?.url ?? '';
    return(
        <main>
            <div className="container maincontainer scrollarea">
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <Image className="album-image" src={imageUrl} alt={'...'} width="256" height="256"/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                Playlist
                            </div>
                            <div className="album-artist">
                                <span>
                                Liked Songs
                                </span>
                            </div>
                            <div className="album-date text-muted">
                                {AuthInstance.personalData?.display_name}
                            </div>
                            <div className="album-follow d-flex">
                                <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={() => playEntirePlaylist()}>Play</button>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <table className="table table-hover align-middle album-table">
                        <colgroup>
                            <col span={1} style={{width:'5%'}}/>
                            <col span={1} style={{width:'85%'}}/>
                            <col span={1} style={{width:'10%'}}/>
                            <col span={1} style={{width:'5%'}}/>
                        </colgroup>
                        <tbody>
                            {trackItems}
                        </tbody>
                    </table>
                </section>
            </div>
        </main>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    const token = req.cookies.access_token;
    if (!token) {
        return {
            redirect: {
                permanent: false,
                destination: '/'
            }
        };
    }

    return {
        props: {
            access_token: token
        }
    };
}

export default LikePage;