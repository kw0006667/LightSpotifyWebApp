import { GetServerSideProps } from "next";
import React from "react";
import Image from "next/future/image";
import { Item, Track } from "../types";
import axiosInstance from "../utilities/axios-instance";
import AlbumTrackDOM from "../components/albumtrack";
import AuthInstance from "../utilities/auth-instance";

interface ILikeDetailProps {
    access_token: string | string[] | undefined
}

interface ILikeDetailState {
    tracks: Item[] | undefined,
    isLoading: boolean
}

class LikePage extends React.Component<ILikeDetailProps, ILikeDetailState> {
    constructor(props: ILikeDetailProps) {
        super(props);
        this.state = {
            tracks: undefined,
            isLoading: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });

        this.fetchLikedTracks();
    }

    fetchLikedTracks() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/tracks?limit=50`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            }
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            console.log(response.data.items);
            this.setState({
                tracks: response.data.items,
                isLoading: false
            });
        });
    }

    playEntirePlaylist() {
        const trackUris: string[] = [];
        this.state.tracks?.forEach(item => {
            trackUris.push(item.track.uri);
        });

        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                uris: trackUris
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in the Playlist');
            }
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
        if (!this.state.tracks) {
            return <p>No tracks data</p>
        }
        
        let trackId = 0;
        let tracks = this.state.tracks.map(track => {
                trackId++;
                return <AlbumTrackDOM key={track.track.id} trackId={trackId} track={track.track} albumUri={track.track.album?.uri}/>
        });

        let imageUrl = this.state.tracks[0].track.album.images?.at(0)?.url ?? '';
        return(
            <main>
                <div className="container maincontainer scrollarea">
                    <section>
                        <div className="d-flex align-items-baseline">
                            <div>
                                <Image className="album-image" src={imageUrl} alt={'...'} width="256" height="256"/>
                            </div>
                            <div className="album-title">
                                <div className="album-name">
                                    Playlist
                                </div>
                                <div className="album-artist">
                                    <span>
                                    Liked Songs
                                    </span>
                                </div>
                                <div className="album-date text-muted">
                                    {AuthInstance.personalData?.display_name}
                                </div>
                                <div className="album-follow d-flex">
                                    <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={() => this.playEntirePlaylist()}>Play</button>
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
                                {tracks}
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>
        )
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

export default LikePage;