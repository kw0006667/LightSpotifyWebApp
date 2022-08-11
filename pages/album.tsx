import { AxiosRequestConfig } from "axios";
import { GetServerSideProps, NextPage } from "next";
import React from "react";
import AlbumCardDOM from "../components/albumcard";
import { Album } from "../types";
import axiosInstance from "../utilities/axios-instance";
import useSWR from "swr";

type AlbumState = {
    albums: { album: Album}[] | undefined
};

type AlbumProps = {
    access_token: string
};

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const useAlbums = (access_token: string): AlbumState => {
    const requestConfig = {
        url: 'https://api.spotify.com/v1/me/albums?limit=50',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { data, error } = useSWR(requestConfig, fetcher);

    return {
        albums: data?.items
    };
}

const AlbumPage: NextPage<AlbumProps> = (props: AlbumProps) => {
    const { albums } = useAlbums(props.access_token);

    if (!albums) {
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
                <div className="d-flex flex-wrap">
                    {albums.map(item => {
                        return(<AlbumCardDOM key={item.album.id} album={item.album} />);
                    })}
                </div>
            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {req, res} = context;
    return {
        props: {
            access_token: req.cookies.access_token
        }
    };
};

export default AlbumPage;