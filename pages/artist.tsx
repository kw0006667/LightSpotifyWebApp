import { AxiosRequestConfig } from "axios";
import { GetServerSideProps, NextPage } from "next";
import React from "react";
import ArtistCardDOM from "../components/artistcard";
import { Artist } from "../types";
import axiosInstance from "../utilities/axios-instance";
import useSWR from "swr";

type ArtistProps = {
    access_token: string
};

type ArtistState = {
    artists: Artist[] | undefined
};

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const useArtists = (access_token: string): ArtistState => {
    const requestConfig = {
        url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { data, error } = useSWR(requestConfig, fetcher);

    return {
        artists: data?.artists.items
    }
}

const ArtistPage: NextPage<ArtistProps> = (props: ArtistProps) => {
    const { artists } = useArtists(props.access_token);

    if (!artists) {
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
                    {artists.map(artist => {
                        return( <ArtistCardDOM key={artist.id} artist={artist}/>);
                    })}
                </div>
            </div>
        </main>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    return {
        props: {
            access_token: req.cookies.access_token
        }
    };
}

export default ArtistPage;