import { GetServerSideProps } from "next";
import React from "react";
import ArtistCardDOM from "../components/artistcard";
import { Artist } from "../types";
import axiosInstance from "../utilities/axios-instance";

type ArtistProps = {
    access_token: string
};

type ArtistState = {
    artists: Artist[] | undefined,
    isLoading: boolean
};

class ArtistPage extends React.Component<ArtistProps, ArtistState> {
    constructor(props: ArtistProps) {
        super(props);
        this.state = {
            artists: undefined,
            isLoading: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });
        this.fetchArtists();
    }

    fetchArtists() {
        let requestConfig = {
            url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                artists: response.data.artists.items,
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
        if (!this.state.artists) {
            return <p>No enough data</p>
        }
    
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div className="d-flex flex-wrap">
                        {this.state.artists.map(artist => {
                            return( <ArtistCardDOM key={artist.id} artist={artist}/>);
                        })}
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

export default ArtistPage;