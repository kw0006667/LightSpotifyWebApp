import { AxiosRequestConfig } from 'axios';
import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/future/image';
import { NextRouter, useRouter, withRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { InView, useInView } from 'react-intersection-observer';
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
  } from '@tanstack/react-query'
import useSWR from "swr";
import PlaylistTrackDOM from "../../components/playlisttrack";
import { FetchPlaylistTracksInfo, Playlist } from "../../types";
import Authorization from '../../utilities/auth';
import AuthInstance from '../../utilities/auth-instance';
import axiosInstance from '../../utilities/axios-instance';

interface IPlaylistDetailProps {
    access_token: string | string[] | undefined
}

interface IPlaylistDetailState {
    playlist: Playlist | undefined
}

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const usePlaylistTracksInfiniteResult = (access_token: string | string[] | undefined, id: string | string[] | undefined) => {
    const {
        status,
        data,
        error,
        isFetching,
        isFetchingNextPage,
        isFetchingPreviousPage,
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage,
      } = useInfiniteQuery(
        ['projects'],
        async ({ pageParam = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=50` }): Promise<FetchPlaylistTracksInfo> => {
            const requestConfig = {
                url: pageParam,
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            };
            const res = await axiosInstance.request(requestConfig);
            return res.data;
        },
        {
          getPreviousPageParam: (firstPage) => firstPage.previous ?? undefined,
          getNextPageParam: (lastPage) => lastPage.next ?? undefined,
        },
    );

    return {
        status: status,
        data: data,
        isFetching: isFetching,
        fetchNextPage: fetchNextPage,
        hasNextPage: hasNextPage
    };
}

const usePlaylistDetail = (access_token: string | string[] | undefined, id: string | string[] | undefined): IPlaylistDetailState=> {
    const requestConfig = {
        url: `https://api.spotify.com/v1/playlists/${id}`,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { data } = useSWR(requestConfig, fetcher);

    return {
        playlist: data
    };
}

const PlaylistDetail: NextPage<IPlaylistDetailProps> = (props: IPlaylistDetailProps) => {
    const id = useRouter().query.id;
    const { playlist } = usePlaylistDetail(props.access_token, id);
    const { status, data, isFetching, fetchNextPage, hasNextPage } = usePlaylistTracksInfiniteResult(props.access_token, id);
    const [followState, setFollowState] = useState(false);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [inView]);

    useEffect(() => {
        getFollowingStatus();
    }, [id]);

    const getFollowingStatus = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/playlists/${id}/followers/contains?ids=${AuthInstance.personalData?.id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            setFollowState(response.data[0]);
        });
    }

    const setFollowingStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
        let requestConfig = {
            url:`https://api.spotify.com/v1/playlists/${id}/followers`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: followState ? 'DELETE' : 'PUT'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 200) {
                setFollowState(!followState);
            }
        });
    };

    const playEntirePlaylist = (event: React.MouseEvent<HTMLButtonElement>, playlistUri: string | undefined) => {
        console.log(`PlayEntirePlaylist: ${playlistUri}`);
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: playlistUri,
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in the Playlist');
            }
        });
    };

    if (!playlist && status !== "success" && isFetching) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    let trackId = 0;

    let imageUrl = playlist?.images.at(0)?.url ?? '/../../public/Spotify_Icon_RGB_Black.png';
    return (
        <main>
            <div className="container maincontainer scrollarea">
                <div>
                    <section>
                        <div className="d-flex align-items-end">
                            <div>
                                <Image className="album-image" src={imageUrl} alt={playlist?.name} width="256" height="256" />
                            </div>
                            <div className="album-title">
                                <div className="album-name">
                                    {playlist?.name}
                                </div>
                                <div className="album-artist">
                                    {playlist?.owner.display_name}
                                </div>
                                <div className="album-date text-muted">
                                    {playlist?.description}
                                </div>
                                <div className="album-follow d-flex">
                                    <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (followState ? 'active' : '')} onClick={(e) => setFollowingStatus(e)}>{followState ? 'Following' : 'Follow'}</button>
                                    <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => playEntirePlaylist(e, playlist?.uri)}>Play</button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <table className="table table-hover align-middle album-table">
                            <colgroup>
                                <col span={1} style={{ width: '5%' }} />
                                <col span={1} style={{ width: '20%' }} />
                                <col span={1} style={{ width: '30%' }} />
                                <col span={1} style={{ width: '30%' }} />
                                <col span={1} style={{ width: '10%' }} />
                                <col span={1} style={{ width: '5%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" style={{ width: '5%' }}>#</th>
                                    <th >Title</th>
                                    <th >Artist</th>
                                    <th >Album</th>
                                    <th >Time</th>
                                    <th ></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.pages.map(page => (
                                    <React.Fragment key={page.href}>
                                        {page.items.map(item => {
                                            trackId++;
                                            return(
                                                <PlaylistTrackDOM key={trackId} numberId={trackId} playlistUri={playlist?.uri} track={item.track} />
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                        <div ref={ref}></div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    if (!Authorization.instance) {
        Authorization.instance = new Authorization();
    }

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

export default PlaylistDetail;