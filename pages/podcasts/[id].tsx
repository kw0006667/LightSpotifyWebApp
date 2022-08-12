import { GetServerSideProps, NextPage } from "next";
import Image from "next/future/image";
import { useRouter, withRouter, NextRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import PodcastEpisodeDOM from "../../components/podcastepisode";
import PodcastLinkDOM from "../../components/podcastlink";
import { AxiosRequestConfig, Podcast } from "../../types";
import Authorization from "../../utilities/auth";
import axiosInstance from "../../utilities/axios-instance";


interface PodcastDetailProps {
    access_token: string
}

type PodcastDetailState = {
    podcast: Podcast | undefined
};

const usePodcastDetail = (requestConfig: AxiosRequestConfig, id: string | string[] | undefined): PodcastDetailState => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/shows/${id}`;
    const { data } = useSWR(request);

    return {
        podcast: data
    };
}

const PodcastDetail: NextPage<PodcastDetailProps> = (props: PodcastDetailProps) => {
    const id = useRouter().query.id;
    const requestConfig = {
        url: "",
        headers: {
            'Authorization': 'Bearer ' + props.access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { podcast } = usePodcastDetail(requestConfig, id);
    const [saveState, setSaveState] = useState(false);

    useEffect(() => {
        getSaveStatus();
    }, [id]);

    const getSaveStatus = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/shows/contains?ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            setSaveState(response.data[0]);
        });
    }

    const setSaveStatus = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/shows?ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: saveState ? 'DELETE' : 'PUT'
        };
        
        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 204) {
                setSaveState(!saveState);
            }
        });
    };

    const playEntirePodcast = (event: React.MouseEvent<HTMLButtonElement>, podcast_uri: string | undefined) => {

    };

    if (!podcast) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    let episodes = podcast.episodes.items.map(episode => 
        <PodcastEpisodeDOM key={episode.id} episode={episode} podcast={podcast} />
    );

    return(
        <main>
            <div className="container maincontainer scrollarea">
            <section>
                    <div className="d-flex align-items-center">
                        <div>
                            <Image className="album-image" src={podcast.images[0].url} alt={"..."} width="256" height="256"/>
                        </div>
                        <div className="album-title">
                            <div className="album-name">
                                {podcast.name}
                            </div>
                            <div className="album-artist">
                                <PodcastLinkDOM podcast={podcast} />
                            </div>
                            <div className="album-date text-muted">
                                {podcast.description}
                            </div>
                            <div className="album-follow d-flex">
                                <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (saveState ? 'active' : '')} onClick={() => setSaveStatus()}>{saveState ? 'Saved' : 'Save'}</button>
                                {/* <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => playEntirePodcast(e, podcast.uri)}>Play</button> */}
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

// export default PodcastDetail;
export default PodcastDetail;