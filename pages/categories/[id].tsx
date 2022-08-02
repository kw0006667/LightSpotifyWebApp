import axios from "axios";
import { GetServerSideProps } from "next";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import PlaylistCardDOM from "../../components/playlistcard";
import { Playlist } from "../../types";
import axiosInstance from "../../utilities/axios-instance";

interface ICategoryDetailRouterProps {
    router: NextRouter
}

interface ICategoryDetailProps extends ICategoryDetailRouterProps {
    access_token: string | string[] | undefined
}

interface ICategoryDetailState {
    playlists: Playlist[] | undefined,
    isLoading: boolean
}

class CategoryDetail extends React.Component<ICategoryDetailProps, ICategoryDetailState> {
    constructor(props: ICategoryDetailProps) {
        super(props);
        this.state = {
            playlists: undefined,
            isLoading: true
        };
    }

    componentDidMount() {
        this.fetchCategoryDetail();
    }

    fetchCategoryDetail() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/browse/categories/${this.props.router.query.id}/playlists`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                playlists: response.data.playlists.items,
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
        )
    };
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    return {
        props: {
            access_token: req.cookies.access_token
        }
    };
}

export default withRouter(CategoryDetail);