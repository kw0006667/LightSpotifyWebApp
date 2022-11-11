import { GetServerSideProps, GetStaticProps, NextPage, NextPageContext } from "next";
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
import PlaylistCardDOM from "../components/playlistcard";
import { FetchPlaylistsInfo, PersonalData, Playlist, Playlists } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";

type PlaylistProps = {
    access_token: string
};

const usePlaylistsInfiniteResult = (access_token: string) => {
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
        async ({ pageParam = 'https://api.spotify.com/v1/me/playlists?limit=50' }): Promise<FetchPlaylistsInfo> => {
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

const PlaylistPage: NextPage<PlaylistProps> = (props: PlaylistProps) => {
    const { status, data, isFetching, fetchNextPage, hasNextPage } = usePlaylistsInfiniteResult(props.access_token);
    
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [inView])

    if (isFetching) {
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </main>
          );
    }

    return(
        <main>
            <div className='container maincontainer scrollarea' ref={ref}>
                <div className="d-flex flex-wrap">
                    {/* {playlists?.map(playlist => {
                        return( <PlaylistCardDOM key={playlist.id} playlist={playlist} />);
                    })} */}
                    {data?.pages.map(page => (
                        <React.Fragment key={page.href}>
                            {page.items?.map(playlist => (
                                <PlaylistCardDOM key={playlist.id} playlist={playlist} />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const instance = AuthInstance;
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

export default PlaylistPage;