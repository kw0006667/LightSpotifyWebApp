import { AxiosRequestConfig } from "axios";
import { GetServerSideProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import PodcastCardDOM from "../components/podcastcard";
import { PodcastResult } from "../types";
import axiosInstance from "../utilities/axios-instance";
import useSWR from "swr";

type PodcastProps = {
    access_token: string
};

type PodcastState = {
    podcastsResult: PodcastResult | undefined,
    isLoading: boolean
};

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const usePodcastsResult = (access_token: string): PodcastState => {
    const requestConfig = {
        url: 'https://api.spotify.com/v1/me/shows?limit=50',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };
    const { data, error } = useSWR(requestConfig, fetcher);

    return {
        podcastsResult: data,
        isLoading: !error && !data
    }
}

const PodcastPage: NextPage<PodcastProps> = (props: PodcastProps) => {
    const { podcastsResult, isLoading } = usePodcastsResult(props.access_token);
    
    if (isLoading) {
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
    if (!podcastsResult) {
        return <p>No enough data</p>
    }

    return(
        <main>
            <div className='container maincontainer scrollarea'>
                <div className="d-flex flex-wrap">
            {podcastsResult?.items.map(item => {
                return(<PodcastCardDOM key={item.show.id} podcast={item.show}/>);
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

export default PodcastPage;