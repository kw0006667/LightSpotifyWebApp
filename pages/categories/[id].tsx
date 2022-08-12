import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { NextRouter, useRouter, withRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import PlaylistCardDOM from "../../components/playlistcard";
import { AxiosRequestConfig, Playlist } from "../../types";
import AuthInstance from "../../utilities/auth-instance";
import axiosInstance from "../../utilities/axios-instance";

interface ICategoryDetailProps {
    access_token: string | string[] | undefined
}

interface ICategoryDetailState {
    playlists: Playlist[] | undefined
}

const useCategoryDetail = (requestConfig: AxiosRequestConfig, id: string | string[] | undefined): ICategoryDetailState => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/browse/categories/${id}/playlists?country=${AuthInstance.personalData?.country}&offset=0&limit=20`;
    const { data } = useSWR(request);

    return {
        playlists: data?.playlists.items
    };
}

const CategoryDetail: NextPage<ICategoryDetailProps> = (props: ICategoryDetailProps) => {
    const id = useRouter().query.id;
    const requestConfig = {
        url: "",
        headers: {
            'Authorization': 'Bearer ' + props.access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };
    const { playlists } = useCategoryDetail(requestConfig, id);

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
                    {playlists.map(playlist => {
                        return( <PlaylistCardDOM key={playlist.id} playlist={playlist} />);
                    })}
                </div>
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

export default CategoryDetail;