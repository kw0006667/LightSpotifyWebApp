import { GetServerSideProps, NextPage } from "next";
import React, { useEffect } from "react";
import { useInView } from 'react-intersection-observer';
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
  } from '@tanstack/react-query'
import Image from "next/image";
import { FetchLikedTracksInfo } from "../types";
import axiosInstance from "../utilities/axios-instance";
import AlbumTrackDOM from "../components/albumtrack";
import AuthInstance from "../utilities/auth-instance";
import { AxiosRequestConfig } from "axios";

interface ILikeDetailProps {
    access_token: string
}

const useLikedTracksInfiniteResult = (access_token: string) => {
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
        async ({ pageParam = 'https://api.spotify.com/v1/me/tracks?limit=50' }): Promise<FetchLikedTracksInfo> => {
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

const LikePage: NextPage<ILikeDetailProps> = (props: ILikeDetailProps) => {
    const { status, data, isFetching, fetchNextPage, hasNextPage } = useLikedTracksInfiniteResult(props.access_token);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [inView]);

    const playEntirePlaylist = () => {

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

    if (isFetching) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const trackUris: string[] = [];
    data?.pages.map(page => {
        page.items.map(item => {
            trackUris.push(item.track.uri);
        });
    });
    
    let trackId = 0;

    let imageUrl = data?.pages[0].items[0].track.album.images?.at(0)?.url ?? '';
    return(
        <main>
            <div className="container maincontainer scrollarea" ref={ref}>
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
                            {data?.pages.map(page => (
                                <React.Fragment key={page.href}>
                                    {page.items.map(item => {
                                        trackId++;
                                        return(<AlbumTrackDOM key={item.track.id} trackId={trackId} track={item.track} albumUri={item.track.album?.uri} />
                                );})}
                                </React.Fragment>
                            ))}
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