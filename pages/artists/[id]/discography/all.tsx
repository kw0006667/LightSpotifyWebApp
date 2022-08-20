import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import type { GetServerSideProps, NextPage } from 'next';
import useSWR from "swr";
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { useQuery } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { Album } from '../../../../types';
import AlbumCardDOM from '../../../../components/albumcard';
import axiosInstance from '../../../../utilities/axios-instance';

type AllDiscographyProps = {
    access_token: string | string[] | undefined
}

const useArtistAllAlbums = (requestConfig: AxiosRequestConfig, id: string | string [] | undefined) : {allAlbums: Album[] | undefined} => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/artists/${id}/albums?limit=50`;
    const { data } = useSWR(request);
    return {
        allAlbums: data?.items
    };
}

const AllDiscography: NextPage<AllDiscographyProps> = (props: AllDiscographyProps) => {
    const id = useRouter().query.id;
    const requestConfig = {
        url: "",
        headers: {
            'Authorization': 'Bearer ' + props.access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };
    const { allAlbums } = useArtistAllAlbums(requestConfig, id);    

    useEffect(() => {
        console.log(id);
    }, [id]);

    if (!allAlbums) {
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
                {/* <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                    <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked />
                    <label className="btn btn-outline-primary" htmlFor="btnradio1">Radio 1</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
                    <label className="btn btn-outline-primary" htmlFor="btnradio2">Radio 2</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                    <label className="btn btn-outline-primary" htmlFor="btnradio3">Radio 3</label>
                </div> */}
                <section className="artist-section">
                    <div className="artist-section-title">
                        {allAlbums[0].artists?.at(0)?.name}
                    </div>
                    <div className="d-flex flex-wrap">
                        {allAlbums.map(album => {
                            return(<AlbumCardDOM key={album.id} album={album} />);
                        })}
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