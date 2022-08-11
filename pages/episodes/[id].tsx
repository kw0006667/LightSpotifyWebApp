import { GetServerSideProps, NextPage } from "next";
import Image from "next/future/image";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import PodcastLinkDOM from "../../components/podcastlink";
import { AxiosRequestConfig, Episode } from "../../types";
import AuthInstance from "../../utilities/auth-instance";
import axiosInstance from "../../utilities/axios-instance";

interface RouterProps {
    router: NextRouter
}

interface EpisodeDetailProps extends RouterProps {
    access_token: string
}

interface EpisodeDetailState {
    episode: Episode | undefined
}

const useEpisodeDetail = (requestConfig: AxiosRequestConfig, id: string | string[] | undefined): EpisodeDetailState => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/episodes/${id}`;
    const { data } = useSWR(request);

    return {
        episode: data
    };
}

const EpisodeDetail: NextPage<EpisodeDetailProps> = (props: EpisodeDetailProps) => {
    const id = useRouter().query.id;
    const requestConfig = {
        url: "",
        headers: {
            'Authorization': 'Bearer ' + props.access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };
    const { episode } = useEpisodeDetail(requestConfig, id);
    const [ saveState, setSaveState] = useState(false);

    useEffect(() => {
        getSaveStatus();
    }, [id]);

    const getSaveStatus = () => {
        const requestConfig = {
            url: `https://api.spotify.com/v1/me/episodes/contains?ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            }
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            setSaveState(response.data[0]);
        });
    }

    const setSaveStatus = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/episodes?ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: saveState ? 'DELETE' : 'PUT'
          };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 200) {
                setSaveState(!saveState);
            }
        });
    }
    
    const playEpisode = (event: React.MouseEvent<HTMLButtonElement>, episode_uri: string | undefined) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                uris: [episode_uri],
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.debug("Play episode");
            }
        });
    };

    if (!episode) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return(
        <main>
            <div className="container maincontainer scrollarea">
                <section>
                    <div className="d-flex align-items-baseline">
                        <div>
                            <Image className="album-image" src={episode.images[0].url} alt={episode.name} width="256" height="256"/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {episode.name}
                            </div>
                            <div className="album-artist">
                                <PodcastLinkDOM podcast={episode.show} />
                            </div>
                            <div className="album-follow d-flex">
                                <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (saveState ? 'active' : '')} onClick={() => setSaveStatus()}>{saveState ? 'Saved' : 'Save'}</button>
                                <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => playEpisode(e, episode.uri)}>Play</button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="artist-section">
                    <div>
                        Description
                    </div>
                    <div className="album-date text-muted">
                        <div dangerouslySetInnerHTML={{ __html: episode.html_description}} />
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

export default EpisodeDetail;