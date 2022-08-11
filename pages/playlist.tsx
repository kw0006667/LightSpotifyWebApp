import { AxiosRequestConfig } from "axios";
import { GetServerSideProps, GetStaticProps, NextPage, NextPageContext } from "next";
import React, { useEffect, useState } from "react";
import PlaylistCardDOM from "../components/playlistcard";
import { PersonalData, Playlist, Playlists } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";
import useSWR from "swr";

type PlaylistProps = {
    access_token: string
};

type PlaylistState = {
    playlists: Playlist[] | undefined,
    isLoading: boolean
};

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const usePlaylistsResult = (access_token: string): {playlists: Playlist[] | undefined} => {
    const requestConfig = {
        url: `https://api.spotify.com/v1/me/playlists?limit=50`,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { data, error } = useSWR(requestConfig, fetcher);

    return {
        playlists: data?.items
    };
}

const PlaylistPage: NextPage<PlaylistProps> = (props: PlaylistProps) => {
    const { playlists } = usePlaylistsResult(props.access_token);

    if (!playlists) {
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
                    {playlists?.map(playlist => {
                        return( <PlaylistCardDOM key={playlist.id} playlist={playlist} />);
                    })}
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