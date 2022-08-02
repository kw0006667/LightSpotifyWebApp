import { GetServerSideProps } from "next";
import Image from "next/future/image";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import PodcastLinkDOM from "../../components/podcastlink";
import { Episode } from "../../types";
import axiosInstance from "../../utilities/axios-instance";

interface RouterProps {
    router: NextRouter
}

interface EpisodeDetailProps extends RouterProps {
    access_token: string
}

interface EpisodeDetailState {
    episode: Episode | undefined,
    isLoading: boolean
    episodeId: string | string[] | undefined
}

class EpisodeDetail extends React.Component<EpisodeDetailProps, EpisodeDetailState> {
    constructor(props: EpisodeDetailProps) {
        super(props);
        this.state = {
            episode: undefined,
            isLoading: false,
            episodeId: this.props.router.query.id
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });
        this.fetchEpisodeDetail();
    }

    fetchEpisodeDetail() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/episodes/${this.state.episodeId}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                episode: response.data,
                isLoading: false
            });
        });
    }

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
        if (!this.state.episode) {
            return (<div>{`No data enough`}</div>);
        }
    
        return(
            <main>
                <div className="container maincontainer scrollarea">
                    <section>
                        <div className="d-flex align-items-baseline">
                            <div>
                                <Image className="album-image" src={this.state.episode.images[0].url} alt={this.state.episode.name} width="256" height="256"/>
                            </div>
                            <div className="album-title">
                                <div className="album-name">
                                    {this.state.episode.name}
                                </div>
                                <div className="album-artist">
                                    <PodcastLinkDOM podcast={this.state.episode.show} />
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="artist-section">
                        <div>
                            Description
                        </div>
                        <div className="album-date text-muted">
                            <div dangerouslySetInnerHTML={{ __html: this.state.episode.html_description}} />
                        </div>
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

export default withRouter(EpisodeDetail);