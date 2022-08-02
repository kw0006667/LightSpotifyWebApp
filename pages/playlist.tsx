import { GetServerSideProps, GetStaticProps, NextPage, NextPageContext } from "next";
import React, { useEffect, useState } from "react";
import PlaylistCardDOM from "../components/playlistcard";
import { PersonalData, Playlist, Playlists } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";

type PlaylistProps = {
    access_token: string
};

type PlaylistState = {
    playlists: Playlist[] | undefined,
    isLoading: boolean
};

class PlaylistPage extends React.Component<PlaylistProps, PlaylistState> {
    constructor(props: PlaylistProps) {
        super(props);
        this.state = {
            playlists: undefined,
            isLoading: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });

        this.fetchPlaylists();
    }

    fetchPlaylists() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/me/playlists?limit=50`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };
        
        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                playlists: response.data.items,
                isLoading: false
            });
        });
    }

    render() {
        if (this.state.isLoading) {
            return(
                <main>
                    <div className='container maincontainer scrollarea'>
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </main>
            );
        }
        if (!this.state.playlists) {
            return <p>No enough data</p>
        }
        
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div className="d-flex flex-wrap">
                        {this.state.playlists.map(playlist => {
                            return( <PlaylistCardDOM key={playlist.id} playlist={playlist} />);
                        })}
                    </div>
                </div>
            </main>
        );
    }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const instance = AuthInstance;
    const { req, res } = context;
    const token = req.cookies.access_token;

    return {
        props: {
            access_token: token
        }
    };
}

export default PlaylistPage;