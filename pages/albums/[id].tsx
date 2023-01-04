import { AxiosRequestConfig } from "axios";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { NextRouter, useRouter, withRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query'
import useSWR from "swr";
import AlbumTrackDOM from "../../components/albumtrack";
import ArtistLinkDOM from "../../components/atistlink";
import  { Album } from "../../types";
import AuthInstance from "../../utilities/auth-instance";
import axiosInstance from "../../utilities/axios-instance";

interface IAlbumDetailProps {
    access_token: string | string[] | undefined
}

interface IAlbumDetailState {
    album: Album | undefined,
    saveState: boolean,
    isLoading: boolean
}

const albumDetailFetcher = async (config: AxiosRequestConfig<any>): Promise<Album> => axiosInstance.request(config).then(response => response.data);

const useAlbumDetailResult = (access_token: string | string[] | undefined, id: string | string[] | undefined): { album: Album | undefined} => {
    let requestConfig = {
        url: `https://api.spotify.com/v1/albums/${id}`,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
    };

    const { isLoading, data, isError, error } = useQuery(['albumDetail', requestConfig], () => albumDetailFetcher(requestConfig));

    return {
        album: data 
    };
}

const AlbumPage: NextPage<IAlbumDetailProps> = (props: IAlbumDetailProps) => {
    const id = useRouter().query.id;
    const { album } = useAlbumDetailResult(props.access_token, id);
    // const { saveState } = useAlbumSaveState(props.access_token, router.query.id);
    const [saveState, setSaveState] = useState(false);

    useEffect(() => {
        getSaveStatus();
    }, [id]);

    const getSaveStatus = () => {
        const requestConfig = {
            url: `https://api.spotify.com/v1/me/albums/contains?ids=${id}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig).then(response => setSaveState(response.data[0]));
    }

    const playEntireAlbum = (event: React.MouseEvent<HTMLButtonElement>, album_uri: string | undefined) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${AuthInstance.currentDeviceId}`,
            headers: {
                'Authorization': 'Bearer ' + props.access_token,
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

    const setSaveStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/albums?ids=${album?.id}`,
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

    if (!album) {
        return(
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    let artists = album.artists.map(artist => {
        return( <ArtistLinkDOM key={artist.id} artistId={artist.id} artistName={artist.name}>, </ArtistLinkDOM>);
    });

    let trackId = 0;
    let tracks = album.tracks.items.map(track => {
            trackId++;
            return <AlbumTrackDOM key={track.id} trackId={trackId} track={track} albumUri={album?.uri}/>
    });

    let imageUrl = album.images?.at(0)?.url ?? '';
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
                                {album.name}
                            </div>
                            <div className="album-artist">
                                <span>
                                {artists}
                                </span>
                            </div>
                            <div className="album-date text-muted">
                                {album.release_date}
                            </div>
                            <div className="album-follow d-flex">
                                <button className={'btn btn-outline-success btn-sm album-follow-btn ' + (saveState ? 'active' : '')} onClick={(e) => setSaveStatus(e)}>{saveState ? 'Saved' : 'Save'}</button>
                                <button className="btn btn-outline-success btn-sm album-follow-btn" onClick={(e) => playEntireAlbum(e, album?.uri)}>Play</button>
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

export default AlbumPage