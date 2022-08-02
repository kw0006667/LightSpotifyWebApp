import { GetServerSideProps } from "next";
import React from "react";
import AlbumCardDOM from "../components/albumcard";
import { Album } from "../types";
import axiosInstance from "../utilities/axios-instance";

type AlbumState = {
    albums: { album: Album}[] | undefined,
    isLoading: boolean
};

type AlbumProps = {
    access_token: string
};

class AlbumPage extends React.Component<AlbumProps, AlbumState> {
    constructor(props: AlbumProps) {
        super(props);
        this.state = {
            albums: undefined,
            isLoading: false
        };
    }
    componentDidMount() {
        this.fetchAlbums();
    }
    
    fetchAlbums() {
        this.setState({isLoading: true});
        let requestConfig = {
            url: 'https://api.spotify.com/v1/me/albums?limit=50',
            headers: {
                'Authorization': `Bearer ${this.props.access_token}`,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };
        axiosInstance.request(requestConfig)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    albums: response.data.items,
                    isLoading: false
                });
            } else if (response.status === 401) {
                console.warn('this is 401');
            }
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
        if (!this.state.albums) {
            return <p>No enough data</p>
        }
    
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div className="d-flex flex-wrap">
                        {this.state.albums.map(item => {
                            return(<AlbumCardDOM key={item.album.id} album={item.album} />);
                        })}
                    </div>
                </div>
            </main>
        );
    }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {req, res} = context;
    return {
        props: {
            access_token: req.cookies.access_token
        }
    };
};

export default AlbumPage;