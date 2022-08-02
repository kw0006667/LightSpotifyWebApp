import { GetServerSideProps } from "next";
import React from "react";
import PodcastCardDOM from "../components/podcastcard";
import { PodcastResult } from "../types";
import axiosInstance from "../utilities/axios-instance";

type PodcastProps = {
    access_token: string
};

type PodcastState = {
    podcastsResult: PodcastResult | undefined,
    isLoading: boolean
};

class PodcastPage extends React.Component<PodcastProps, PodcastState> {
    constructor(props: PodcastProps) {
        super(props);
        this.state = {
            podcastsResult: undefined,
            isLoading: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });
        this.fetchPodcasts();
    }

    fetchPodcasts() {
        let requestConfig = {
            url: 'https://api.spotify.com/v1/me/shows?limit=50',
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };
        
        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                podcastsResult: response.data,
                isLoading: false
            });
        });
    }
    
    render() {
        if (this.state.isLoading) {
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
        if (!this.state.podcastsResult) {
            return <p>No enough data</p>
        }
    
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div className="d-flex flex-wrap">
                {this.state.podcastsResult?.items.map(item => {
                    return(<PodcastCardDOM key={item.show.id} podcast={item.show}/>);
                })}
            </div>
                </div>
            </main>
        );
    }
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