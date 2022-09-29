import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import type { GetServerSideProps, NextPage } from 'next';
import { useInView } from 'react-intersection-observer';
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
  } from '@tanstack/react-query'
import { FetchAlbumsInfo } from '../../../../types';
import AlbumCardDOM from '../../../../components/albumcard';
import axiosInstance from '../../../../utilities/axios-instance';

type AllDiscographyProps = {
    access_token: string | string[] | undefined
}

const useArtistAllAlbumsInfiniteResult = (access_token: string | string[] | undefined, id: string | string[] | undefined) => {
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
        ['allAlbums'],
        async ({ pageParam = `https://api.spotify.com/v1/artists/${id}/albums?limit=50` }): Promise<FetchAlbumsInfo> => {
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

const AllDiscography: NextPage<AllDiscographyProps> = (props: AllDiscographyProps) => {
    const id = useRouter().query.id;
    const { status, data, isFetching, fetchNextPage, hasNextPage } = useArtistAllAlbumsInfiniteResult(props.access_token, id);

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [inView]);

    // useEffect(() => {
    //     console.log(id);
    // }, [id]);

    if (!data && status !== "success" && isFetching) {
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
            <div className='container maincontainer scrollarea'>
                <section className="artist-section">
                    <div className="artist-section-title">
                        {/* {allAlbums[0].artists?.at(0)?.name} */}
                        {/* {data?.pages[0].items[0].artists[0].name} */}
                    </div>
                    <div className="d-flex flex-wrap">
                        {/* {allAlbums.map(album => {
                            return(<AlbumCardDOM key={album.id} album={album} />);
                        })} */}
                        {data?.pages.map(page => (
                            <React.Fragment key={page.href}>
                                {page.items.map(album => (
                                    <AlbumCardDOM key={album.id} album={album} />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                    <div ref={ref}>

                    </div>
                </section>
            </div>
        </main>
    );
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

export default AllDiscography;