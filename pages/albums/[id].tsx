import { GetServerSideProps } from "next";
import Image from "next/future/image";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import AlbumTrackDOM from "../../components/albumtrack";
import ArtistLinkDOM from "../../components/atistlink";
import  { Album } from "../../types";
import AuthInstance from "../../utilities/auth-instance";
import axiosInstance from "../../utilities/axios-instance";

interface AlbumDetailRouterProps {
    router: NextRouter
}

interface IAlbumDetailProps extends AlbumDetailRouterProps {
    access_token: string | string[] | undefined
}

interface IAlbumDetailState {
    album: Album | undefined,
    saveState: boolean,
    isLoading: boolean
}

class AlbumPage extends React.Component<IAlbumDetailProps, IAlbumDetailState> {
    constructor(props: IAlbumDetailProps) {
        super(props);
        this.state = {
            album: undefined,
            saveState: false,
            isLoading: true,
        };
    }

    componentDidMount() {
        this.fetchAlbumDetail();
        this.getSaveStatus();
    }

    componentDidUpdate(prevProps: IAlbumDetailProps, prevState: IAlbumDetailState) {
        if (this.props.router.query.id !== prevProps.router.query.id) {
            this.setState({
                isLoading: true
            }, () => {
                this.fetchAlbumDetail();
                this.getSaveStatus();
            })
        }
    }

    fetchAlbumDetail() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/albums/${this.props.router.query.id}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            }
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                album: response.data,
                isLoading: false
            });
        });
    }

    getSaveStatus() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/albums/contains?ids=${this.props.router.query.id}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            }
        };
        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                saveState: response.data[0]
            });
        });
    }

    playEntireAlbum(event: React.MouseEvent<HTMLButtonElement>, album_uri: string | undefined) {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: album_uri,
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play Track in the Playlist');
            }
        });
    }

    setSaveStatus(event: React.MouseEvent<HTMLButtonElement>) {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/albums?ids=${this.state.album?.id}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: this.state.saveState ? 'DELETE' : 'PUT'
          };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 204) {
                this.setState({
                    saveState: !this.state.saveState
                });
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
        if (!this.state.album) {
            return <p>No album data</p>
        }

        let artists = this.state.album.artists.map(artist => {
            return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
        });

        let trackId = 0;
        let tracks = this.state.album.tracks.items.map(track => {
                trackId++;
                return <AlbumTrackDOM key={track.id} trackId={trackId} track={track} albumUri={this.state.album?.uri}/>
        });

        let imageUrl = this.state.album.images?.at(0)?.url ?? '';
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
                                    {this.state.album.name}
                                </div>
                                <div className="album-artist">
                                    <span>
                                    {artists}
                                    </span>
                                </div>
                                <div className="album-date text-muted">
                                    {this.state.album.release_date}
                                </div>
                                <div className="album-follow d-flex">
                                    <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (this.state.saveState ? 'active' : '')} onClick={(e) => this.setSaveStatus(e)}>{this.state.saveState ? 'Saved' : 'Save'}</button>
                                    <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => this.playEntireAlbum(e, this.state.album?.uri)}>Play</button>
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

export default withRouter(AlbumPage);