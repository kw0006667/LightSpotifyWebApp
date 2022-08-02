import { GetServerSideProps } from 'next';
import Image from 'next/future/image';
import { NextRouter, withRouter } from "next/router";
import React from "react";
import PlaylistTrackDOM from "../../components/playlisttrack";
import { Playlist } from "../../types";
import Authorization from '../../utilities/auth';
import AuthInstance from '../../utilities/auth-instance';
import axiosInstance from '../../utilities/axios-instance';

interface IPlaylistDetailRouterProps {
    router: NextRouter
}

interface IPlaylistDetailProps extends IPlaylistDetailRouterProps {
    access_token: string | string[] | undefined
}

interface IPlaylistDetailState {
    playlist: Playlist | undefined,
    followState: boolean,
    isLoading: boolean
}

class PlaylistDetail extends React.Component<IPlaylistDetailProps, IPlaylistDetailState> {
    constructor(props: IPlaylistDetailProps) {
        super(props);
        this.state = {
            playlist: undefined,
            followState: false,
            isLoading: true
        };
    }

    componentDidMount() {
        this.fetchPlaylistDetail();
        this.getFollowingStatus();
    }

    fetchPlaylistDetail() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/playlists/${this.props.router.query.id}?additional_types=track,episode`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                playlist: response.data,
                isLoading: false
            });
        });
    }

    getFollowingStatus() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/playlists/${this.props.router.query.id}/followers/contains?ids=${AuthInstance.personalData?.id}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                followState: response.data[0]
            });
        });
    }

    setFollowingStatus(event: React.MouseEvent<HTMLButtonElement>) {
        let requestConfig = {
            url:`https://api.spotify.com/v1/playlists/${this.props.router.query.id}/followers`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: this.state.followState ? 'DELETE' : 'PUT'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    followState: !this.state.followState
                });
            }
        });
    };

    playEntirePlaylist(event: React.MouseEvent<HTMLButtonElement>, playlistUri: string | undefined) {
        console.log(`PlayEntirePlaylist: ${playlistUri}`);
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: playlistUri,
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in the Playlist');
            }
        });
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
        if (!this.state.playlist) {
            return <p>No Playlist data</p>
        }
    
        let trackId = 0;
            let tracks = this.state.playlist?.tracks.items.map(track => {
                    trackId++;
                    return <PlaylistTrackDOM key={trackId} numberId={trackId} playlistUri={this.state.playlist?.uri}  track={track.track} />
            });

        let imageUrl = this.state.playlist.images.at(0)?.url ?? '';
        return (
            <main>
                <div className="container maincontainer scrollarea">
                    <div>
                        <section>
                            <div className="d-flex align-items-end">
                                <div>
                                    <Image className="album-image" src={imageUrl} alt={this.state.playlist.name} width="256" height="256" />
                                </div>
                                <div className="album-title">
                                    <div className="album-name">
                                        {this.state.playlist.name}
                                    </div>
                                    <div className="album-artist">
                                        {this.state.playlist.owner.display_name}
                                    </div>
                                    <div className="album-date text-muted">
                                        {this.state.playlist.description}
                                    </div>
                                    <div className="album-follow d-flex">
                                        <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (this.state.followState ? 'active' : '')} onClick={(e) => this.setFollowingStatus(e)}>{this.state.followState ? 'Following' : 'Follow'}</button>
                                        <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => this.playEntirePlaylist(e, this.state.playlist?.uri)}>Play</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <table className="table table-hover align-middle album-table">
                                <colgroup>
                                    <col span={1} style={{ width: '5%' }} />
                                    <col span={1} style={{ width: '20%' }} />
                                    <col span={1} style={{ width: '30%' }} />
                                    <col span={1} style={{ width: '30%' }} />
                                    <col span={1} style={{ width: '10%' }} />
                                    <col span={1} style={{ width: '5%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ width: '5%' }}>#</th>
                                        <th >Title</th>
                                        <th >Artist</th>
                                        <th >Album</th>
                                        <th >Time</th>
                                        <th ></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tracks}
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>
            </main>
        );
    }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    if (!Authorization.instance) {
        Authorization.instance = new Authorization();
    }
    return {
        props: {
            access_token: req.cookies.access_token
        }
    };
}

export default withRouter(PlaylistDetail);