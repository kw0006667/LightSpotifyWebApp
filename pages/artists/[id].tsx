import { GetServerSideProps, GetStaticPaths, GetStaticProps, NextPage, NextPageContext } from "next";
import Image from "next/future/image";
import Link from "next/link";
import { NextRouter, useRouter, withRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AlbumCardDOM from "../../components/albumcard";
import ArtistCardDOM from "../../components/artistcard";
import ArtistTopTracksDOM from "../../components/artisttoptrack";
import { Album, Artist, Track } from "../../types";
import Authorization from "../../utilities/auth";
import AuthInstance from "../../utilities/auth-instance";
import axiosInstance from "../../utilities/axios-instance";

interface ArtistDetailRouterProps {
    router: NextRouter
}

interface ArtistDetailProps extends ArtistDetailRouterProps {
    access_token: string
}

interface ArtistDetailState {
    followState: boolean,
    artist: Artist | undefined,
    topTracks: Track[] | undefined,
    recentlyAlbums: Album[] | undefined,
    similarArtists: Artist[] | undefined,
    isLoading: boolean,
    artistId: string | string[] | undefined
}

class ArtistDetail extends React.Component<ArtistDetailProps, ArtistDetailState> {
    constructor(props: ArtistDetailProps) {
        super(props);
        this.state = {
            followState: false,
            artist: undefined,
            topTracks: undefined,
            recentlyAlbums: undefined,
            similarArtists: undefined,
            isLoading: false,
            artistId: this.props.router.query.id
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });
        this.fetchArtistDetail();
        this.getFollowStatus();
    }

    componentDidUpdate(prevProps: ArtistDetailProps, prevState: ArtistDetailState) {
        if (this.props.router.query.id !== prevProps.router.query.id) {
            this.setState({
                isLoading: true,
                artistId: this.props.router.query.id
            }, () => {
                this.fetchArtistDetail();
                this.getFollowStatus();
            });
        }
    }

    fetchArtistDetail() {
        let requestConfig = {
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        let promiseArray = [];
        promiseArray.push(
            axiosInstance.get(`https://api.spotify.com/v1/artists/${this.state.artistId}`, requestConfig));
        // Get Artist's top tracks
        promiseArray.push(
            axiosInstance.get(`https://api.spotify.com/v1/artists/${this.state.artistId}/top-tracks?market=${AuthInstance.personalData?.country}`, requestConfig)
        );
        // Get Artist's first 5 albums
        promiseArray.push(
            axiosInstance.get(`https://api.spotify.com/v1/artists/${this.state.artistId}/albums?limit=20`, requestConfig)
        );
        // Get Artist's relative
        promiseArray.push(
            axiosInstance.get(`https://api.spotify.com/v1/artists/${this.state.artistId}/related-artists`, requestConfig)
        );

        Promise.all(promiseArray)
        .then(responses => {
            return Promise.all(responses.map(res => res.data));
        })
        .then(data => {
            this.setState({
                artist: data[0],
                topTracks: data[1].tracks,
                recentlyAlbums: data[2].items,
                similarArtists: data[3].artists,
                isLoading: false
            });
        });
    }

    getFollowStatus() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/following/contains?type=artist&ids=${this.state.artistId}`,
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

    setFollowStatus(event: React.MouseEvent<HTMLButtonElement>) {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/following?type=artist&ids=${this.state.artistId}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: this.state.followState ? 'DELETE' : 'PUT'
          };

          axiosInstance.request(requestConfig)
          .then(response => {
            this.setState({
                followState: !this.state.followState
            });
          });
    }

    playTopTrackInArtist(event: React.MouseEvent<HTMLButtonElement>, artistUri: string | undefined) {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + AuthInstance.access_token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            data: JSON.stringify({
                context_uri: artistUri,
            })
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 202) {
                console.log('Play top tracks in the Artist');
            }
        });
    }

    render() {
        if (this.state.isLoading) {
            return <p>Loading...</p>
        }
        if (!this.state.artist) {
            return <p>No Artist data</p>
        }
    
        let trackId = 0;
            let tracks = this.state.topTracks?.map(track => {
                    trackId++;
                    return <ArtistTopTracksDOM key={track.id} trackId={trackId} track={track} />
                });
    
        let albums = this.state.recentlyAlbums?.filter( (v, i, a) => a.findIndex(v2 => (v2.name === v.name)) === i).slice(0, this.state.recentlyAlbums.length > 12 ? 12 : this.state.recentlyAlbums.length).map(album => 
            <AlbumCardDOM key={album.id} album={album} />
        );
        
        let relatedArtists = this.state.similarArtists?.slice(0, this.state.similarArtists.length > 12 ? 12 : this.state.similarArtists.length).map(artist => 
            <ArtistCardDOM key={artist.id} artist={artist} />
        );
        return(
            <main>
            <div className="maincontainer scrollarea">
                <div>
                <section className="artist-section">
                        <div className="align-items-baseline artist-banner">
                            <div >
                                <div className="artist-image-banner" style={{backgroundImage: `url(${this.state.artist.images[0].url})`}}></div>
                                <Image className="album-image rounded-circle" src={this.state.artist.images[0].url} alt={'...'} width="256" height="256"/>
                            </div>
                            <div className="artist-title">
                                <div className="album-name">
                                    {this.state.artist.name}
                                </div>
                                <div className="artist-follow d-flex">
                                    <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (this.state.followState ? 'active' : '')} onClick={(e) => this.setFollowStatus(e)}>{this.state.followState ? 'Following' : 'Follow'}</button>
                                    <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => this.playTopTrackInArtist(e, this.state.artist?.uri)}>Play</button>
                                </div>
                                <div className="album-artist">
                                    {this.state.artist.genres[0]}
                                </div>
                                <div className="album-date text-muted">
                                    {'Followers: ' + this.state.artist.followers.total}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="container artist-section">
                        <div className="artist-section-title">
                            Top Songs
                        </div>
                        <table className="table table-hover align-middle album-table">
                            <colgroup>
                                <col span={1} style={{width:'5%'}}/>
                                <col span={1} style={{width:'40%'}}/>
                                <col span={1} style={{width:'40%'}}/>
                                <col span={1} style={{width:'10%'}}/>
                                <col span={1} style={{width:'5%'}}/>
                            </colgroup>
                            <tbody>
                                {tracks}
                            </tbody>
                        </table>
                    </section>
                    <section className="container artist-section">
                        <div className="artist-section-title d-flex justify-content-between">
                            <div>
                                Albums
                            </div>
                            <div>
                                <Link href={`/`} >
                                    <a href="#" className="spotify-link spotify-link-thin spotify-link-small">See All</a>
                                </Link>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap">
                            {albums}
                        </div>
                    </section>
                    <section className="container artist-section">
                        <div className="artist-section-title">
                            Similar Artists
                        </div>
                        <div className="d-flex flex-wrap">
                            {relatedArtists}
                        </div>
                    </section>
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

export default withRouter(ArtistDetail);