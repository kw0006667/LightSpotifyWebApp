import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { ReactComponentElement } from 'react'
import AlbumCardDOM from '../components/albumcard'
import ArtistCardDOM from '../components/artistcard'
import PlaylistCardDOM from '../components/playlistcard'
import RecentlyPlayedCardDOM from '../components/recentlyplayedcard'
import TrackCardDOM from '../components/trackcard'
import { Album, Context, ContextType, Item, Playlist, Track } from '../types'
import axiosInstance from '../utilities/axios-instance'
import { SpotifyUtils } from '../utilities/spotifyutils'

type HomeProps = {
  access_token: string
};

type HomeState = {
  recentlyPlayedResultsItems: Item[] | undefined,
  featuredPlaylistItems: Playlist[] | undefined,
  newReleaseAlbumItems: Album[] | undefined,
  mandopopPickedTracks: Track[] | undefined,
  isLoading: boolean
};
class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      recentlyPlayedResultsItems: undefined,
      featuredPlaylistItems: undefined,
      newReleaseAlbumItems: undefined,
      mandopopPickedTracks: undefined,
      isLoading: true
    };
  }

  componentDidMount() {
    this.fetchHomeData();
  }

  fetchHomeData() {
    let recentlyPlayedRequestConfig = {
      url: `https://api.spotify.com/v1/me/player/recently-played?before=${Date.now()}&limit=50`,
      headers: {
          'Authorization': 'Bearer ' + this.props.access_token,
          'Content-Type': 'application/json'
      },
      method: 'GET'
    };

    let featuredPlaylistsRequestConfig = {
      url: `https://api.spotify.com/v1/browse/featured-playlists?country=tw`,
      headers: {
          'Authorization': 'Bearer ' + this.props.access_token,
          'Content-Type': 'application/json'
      },
      method: 'GET'
    };

    let newReleaseRequestConfig = {
      url: `https://api.spotify.com/v1/browse/new-releases?country=tw`,
      headers: {
          'Authorization': 'Bearer ' + this.props.access_token,
          'Content-Type': 'application/json'
      },
      method: 'GET'
    };

    let promiseArray = [];
     promiseArray.push(axiosInstance.request(recentlyPlayedRequestConfig));
     promiseArray.push(axiosInstance.request(featuredPlaylistsRequestConfig));
     promiseArray.push(axiosInstance.request(newReleaseRequestConfig));
     Promise.all(promiseArray)
     .then(responses => {
        return Promise.all(responses.map(res => {
          return res.data;
        }));
     })
     .then(data => {
        if (data?.length === 3) {
          this.setState({
            recentlyPlayedResultsItems: data[0].items,
            featuredPlaylistItems: data[1].playlists?.items,
            newReleaseAlbumItems: data[2].albums?.items,
            isLoading: false
          }, () => {
            let result: { trackIds: string[], artistIds: string[]} = { trackIds: [], artistIds: []};
            (data[0].items as {context: Context, track: Track}[]).slice(0, 2).forEach(item => {
              result.artistIds.push(item.track.artists[0].id);
              result.trackIds.push(item.track.id);
            });
            
            let requestConfig = {
              url: `https://api.spotify.com/v1/recommendations?seed_artists=${result.artistIds.toString()}&seed_tracks=${result.trackIds.toString()}&seed_genres=mandopop&market=TW`,
              headers: {
                  'Authorization': 'Bearer ' + this.props.access_token,
                  'Content-Type': 'application/json'
              },
              method: 'GET'
            };
            axiosInstance.request(requestConfig)
            .then(response => {
              this.setState({
                mandopopPickedTracks: response.data.tracks.slice(0, 6)
              });
            });
          });
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
    if (!this.state.recentlyPlayedResultsItems 
        && !this.state.featuredPlaylistItems 
        && !this.state.newReleaseAlbumItems
        && !this.state.mandopopPickedTracks ) {
      return <p>No enough data</p>
    }

    let recentlyPlayedItems = this.state.recentlyPlayedResultsItems?.filter( (value, item, array) => value.context?.type === ContextType.Playlist || value.context?.type === ContextType.Album || value.context?.type === ContextType.Artist).filter( (v, i, a) => a.findIndex(v2 => (v2.context.uri === v.context.uri)) === i).slice(0, 6).map(item => {
      return(<RecentlyPlayedCardDOM key={item.track.id} track={item.track} context={item.context} />);
    });

    let newReleaseAlbums = this.state.newReleaseAlbumItems?.slice(0, 6).map(album => {
      return(<AlbumCardDOM key={album.id} album={album} />);
    });

    let mandopTracks = this.state.mandopopPickedTracks?.map(track => {
      return(<TrackCardDOM key={track.id} track={track} />);
    });
  
    return (
      <main>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <div className='container maincontainer scrollarea'>
              <section className="artist-section">
                <div className="artist-section-title">
                    New Release
                </div>
                <div className="d-flex flex-wrap">
                  {newReleaseAlbums}
                </div>
              </section>
              <section className="artist-section">
                  <div className="artist-section-title">
                      Recently played
                  </div>
                  <div className="d-flex flex-wrap">
                  {recentlyPlayedItems}
                  </div>
              </section>
              <section className="artist-section">
                  <div className="artist-section-title">
                      Featured Playlists
                  </div>
                  <div className="d-flex flex-wrap">
                      {this.state.featuredPlaylistItems?.slice(0, 6).map(item => {
                        return(
                          <PlaylistCardDOM key={item.id} playlist={item} />
                        );
                      })}
                  </div>
              </section>
              <section className="artist-section">
                  <div className="artist-section-title">
                      Mandop Picked Tracks
                  </div>
                  <div className="d-flex flex-wrap">
                      {mandopTracks}
                  </div>
              </section>
          </div>
        </main>
      </main>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res} = context;
  return {
    props: {
      access_token: req.cookies.access_token
    }
  };
}

export default Home
