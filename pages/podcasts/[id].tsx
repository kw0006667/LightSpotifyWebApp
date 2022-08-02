import { GetServerSideProps } from "next";
import Image from "next/future/image";
import { useRouter, withRouter, NextRouter } from "next/router";
import React, { useEffect, useState } from "react";
import PodcastEpisodeDOM from "../../components/podcastepisode";
import PodcastLinkDOM from "../../components/podcastlink";
import { Podcast } from "../../types";
import Authorization from "../../utilities/auth";
import axiosInstance from "../../utilities/axios-instance";

interface RouterProps {
    router: NextRouter
}

interface PodcastDetailProps extends RouterProps {
    access_token: string
}

type PodcastDetailState = {
    saveState: boolean,
    podcast: Podcast | undefined,
    podcastId: string | string[] | undefined,
    isLoading: boolean
};

class PodcastDetail extends React.Component<PodcastDetailProps, PodcastDetailState> {

    constructor(props: PodcastDetailProps) {
        super(props);
        this.state = {
            podcast: undefined,
            saveState: false,
            isLoading: false,
            podcastId: this.props.router.query.id
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });
        this.fetchPodcastDetail();
        this.getSaveStatus();
    }

    fetchPodcastDetail() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/shows/${this.state.podcastId}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                podcast: response.data,
                isLoading: false
            });
        })
    }

    getSaveStatus() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/shows/contains?ids=${this.state.podcastId}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                saveState: response.data[0]
            });
        });
    }

    setSaveStatus = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/shows?ids=${this.state.podcastId}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: this.state.saveState ? 'DELETE' : 'PUT'
        };
        
        axiosInstance.request(requestConfig)
        .then(resposne => {
            this.setState({
                saveState: !this.state.saveState
            });
        });
    };

    playEntirePodcast = (event: React.MouseEvent<HTMLButtonElement>, podcast_uri: string | undefined) => {

    };

    render() {
        if (this.state.isLoading) {
            return(
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }
        if (!this.state.podcast) {
            return (<div>{`No data enough`}</div>);
        }
    
        let episodes = this.state.podcast.episodes.items.map(episode => 
            <PodcastEpisodeDOM key={episode.id} episode={episode} podcast={this.state.podcast} />
        );
    
        return(
            <main>
                <div className="container maincontainer scrollarea">
                <section>
                        <div className="d-flex align-items-center">
                            <div>
                                <Image className="album-image" src={this.state.podcast.images[0].url} alt={"..."} width="256" height="256"/>
                            </div>
                            <div className="album-title">
                                <div className="album-name">
                                    {this.state.podcast.name}
                                </div>
                                <div className="album-artist">
                                    <PodcastLinkDOM podcast={this.state.podcast} />
                                </div>
                                <div className="album-date text-muted">
                                    {this.state.podcast.description}
                                </div>
                                <div className="album-follow d-flex">
                                    <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (this.state.saveState ? 'active' : '')} onClick={() => this.setSaveStatus()}>{this.state.saveState ? 'Saved' : 'Save'}</button>
                                    <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => this.playEntirePodcast(e, this.state.podcast?.uri)}>Play</button>
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
                                {episodes}
                            </tbody>
                        </table>
                    </section>
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

// export default PodcastDetail;
export default withRouter(PodcastDetail);