import { GetServerSideProps, GetStaticPaths, GetStaticProps, NextPage, NextPageContext } from "next";
import Image from "next/future/image";
import Link from "next/link";
import { NextRouter, useRouter, withRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import AlbumCardDOM from "../../components/albumcard";
import ArtistCardDOM from "../../components/artistcard";
import ArtistTopTracksDOM from "../../components/artisttoptrack";
import { Album, Artist, AxiosRequestConfig, Track } from "../../types";
import Authorization from "../../utilities/auth";
import AuthInstance from "../../utilities/auth-instance";
import axiosInstance from "../../utilities/axios-instance";

interface ArtistDetailProps {
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

const useArtistDetail = (requestConfig: AxiosRequestConfig, id: string | string[] | undefined): { artist: Artist | undefined } => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/artists/${id}`;
    const { data } = useSWR(request);

    return {
        artist: data
    };
}

const useArtistTopTracks = (requestConfig: AxiosRequestConfig, id: string| string[] | undefined) : { topTracks: Track[] | undefined } => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=${AuthInstance.personalData?.country}`;
    const { data } = useSWR(request);

    return {
        topTracks: data?.tracks
    };
}

const useArtistRecentlyAlbums = (requestConfig: AxiosRequestConfig, id: string | string [] | undefined) : {recentlyAlbums: Album[] | undefined} => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/artists/${id}/albums?limit=20`;
    const { data } = useSWR(request);

    return {
        recentlyAlbums: data?.items
    };
}

const useArtistSimilarArtists = (requestConfig: AxiosRequestConfig, id: string | string[] | undefined) : { similarArtists: Artist[] | undefined } => {
    let request = Object.assign({}, requestConfig);
    request.url = `https://api.spotify.com/v1/artists/${id}/related-artists`;
    const { data } = useSWR(request);

    return {
        similarArtists: data?.artists
    };
}

const ArtistDetail: NextPage<ArtistDetailProps> = (props: ArtistDetailProps) => {
    const id = useRouter().query.id;
    const requestConfig = {
        url: "",
        headers: {
            'Authorization': 'Bearer ' + props.access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { artist } = useArtistDetail(requestConfig, id);
    const { topTracks } = useArtistTopTracks(requestConfig, id);
    const { recentlyAlbums } = useArtistRecentlyAlbums(requestConfig, id);
    const { similarArtists } = useArtistSimilarArtists(requestConfig, id);
    const [followState, setFollowState] = useState(false);

    useEffect(() => {
        getFollowStatus();
    }, [id]);

    const getFollowStatus = () => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/following/contains?type=artist&ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            setFollowState(response.data[0]);
        });
    }

    const setFollowStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/following?type=artist&ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: followState ? 'DELETE' : 'PUT'
          };

          axiosInstance.request(requestConfig)
          .then(response => {
            if (response.status === 204) {
                setFollowState(!followState);
            }
          });
    }

    const playTopTrackInArtist = (event: React.MouseEvent<HTMLButtonElement>, artistUri: string | undefined) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
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
                console.debug('Play top tracks in the Artist');
            }
        });
    }

    if (!artist) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    let trackId = 0;
        let tracks = topTracks?.map(track => {
                trackId++;
                return <ArtistTopTracksDOM key={track.id} trackId={trackId} track={track} />
            });

    let albums = recentlyAlbums?.filter( (v, i, a) => a.findIndex(v2 => (v2.name === v.name)) === i).slice(0, recentlyAlbums.length > 12 ? 12 : recentlyAlbums.length).map(album => 
        <AlbumCardDOM key={album.id} album={album} />
    );
    
    let relatedArtists = similarArtists?.slice(0, similarArtists.length > 12 ? 12 : similarArtists.length).map(artist => 
        <ArtistCardDOM key={artist.id} artist={artist} />
    );
    return(
        <main>
        <div className="maincontainer scrollarea">
            <div>
            <section className="artist-section">
                    <div className="align-items-baseline artist-banner">
                        <div >
                            <div className="artist-image-banner" style={{backgroundImage: `url(${artist.images[0].url})`}}></div>
                            <Image className="album-image rounded-circle" src={artist.images[0].url} alt={'...'} width="256" height="256"/>
                        </div>
                        <div className="artist-title">
                            <div className="album-name">
                                {artist.name}
                            </div>
                            <div className="artist-follow d-flex">
                                <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (followState ? 'active' : '')} onClick={(e) => setFollowStatus(e)}>{followState ? 'Following' : 'Follow'}</button>
                                <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => playTopTrackInArtist(e, artist?.uri)}>Play</button>
                            </div>
                            <div className="album-artist">
                                {artist.genres[0]}
                            </div>
                            <div className="album-date text-muted">
                                {'Followers: ' + artist.followers.total}
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

export default ArtistDetail;