import { AxiosRequestConfig } from 'axios'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { ReactComponentElement, useEffect, useRef } from 'react'
import AlbumCardDOM from '../components/albumcard'
import ArtistCardDOM from '../components/artistcard'
import PlaylistCardDOM from '../components/playlistcard'
import RecentlyPlayedCardDOM from '../components/recentlyplayedcard'
import TrackCardDOM from '../components/trackcard'
import { Album, Context, ContextType, Item, Playlist, Track } from '../types'
import axiosInstance from '../utilities/axios-instance'
import { SpotifyUtils } from '../utilities/spotifyutils'
import useSWR from "swr";

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

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const useRecentlyPlayedResults = (access_token: string, dateNow: number): {recentlyPlayedResultsItems: Item[] | undefined}=> {
  let recentlyPlayedRequestConfig = {
    url: `https://api.spotify.com/v1/me/player/recently-played?before=${dateNow}&limit=50`,
    headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
    },
    method: 'GET'
  };

  const { data, error } = useSWR(recentlyPlayedRequestConfig, fetcher);

  return {
    recentlyPlayedResultsItems: data?.items
  };
}

const useFeaturedPlaylists = (access_token: string): { featuredPlaylistItems: Playlist[] | undefined} => {
  const featuredPlaylistsRequestConfig = {
    url: `https://api.spotify.com/v1/browse/featured-playlists?country=tw`,
    headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
    },
    method: 'GET'
  };

  const { data, error } = useSWR(featuredPlaylistsRequestConfig, fetcher);

  return {
    featuredPlaylistItems: data?.playlists?.items
  };
}

const useNewReleaseAlbums = (access_token: string): { newReleaseAlbumItems: Album[] | undefined } => {
  const newReleaseRequestConfig = {
    url: `https://api.spotify.com/v1/browse/new-releases?country=tw`,
    headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
    },
    method: 'GET'
  };

  const { data, error } = useSWR(newReleaseRequestConfig, fetcher);

  return {
    newReleaseAlbumItems: data?.albums?.items
  };
}

const useMandpopPickedTracks = (access_token: string, predictInput: {context: Context, track: Track}[] | undefined): { mandopopPickedTracks: Track[] | undefined } => {
  let result: { trackIds: string[], artistIds: string[]} = { trackIds: [], artistIds: []};
  predictInput?.slice(0, 2).forEach(item => {
    result.artistIds.push(item.track.artists[0].id);
    result.trackIds.push(item.track.id);
  });
  const requestConfig = {
    url: `https://api.spotify.com/v1/recommendations?seed_artists=${result.artistIds.toString()}&seed_tracks=${result.trackIds.toString()}&seed_genres=mandopop&market=TW`,
    headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
    },
    method: 'GET'
  };

  const { data, error } = useSWR(requestConfig, fetcher);

  return {
    mandopopPickedTracks: data?.tracks.slice(0, 6)
  };
}

const generateRecentlyPlayedItems = (recentlyPlayedResultsItems: Item[] | undefined) => {
  let recentlyPlayedItems = recentlyPlayedResultsItems?.
        filter( (value, item, array) => (value.context?.type === ContextType.Playlist || value.context?.type === ContextType.Album || value.context?.type === ContextType.Artist) || value.track.album)
        .filter( (v, i, a) => a.findIndex(v2 => { 
          // Remove duplicated playlist or album
          // context will be null if this track was played by Spotify automatic pick-up
          // fallback as album
            if (v2.context && v2.context.uri && v.context?.uri) {
              return (v2.context.uri === v.context.uri)
            } else {
              return (v2.track.album.uri === v.track.album.uri)
            }
          }) === i)
        .slice(0, 6)
        .map(item => {
    return(<RecentlyPlayedCardDOM key={item.track.id} track={item.track} context={item.context} />);
  });

  return recentlyPlayedItems;
}

const currentDate = Date.now();

const Home: NextPage<HomeProps> = (props: HomeProps) => {
  const { recentlyPlayedResultsItems } = useRecentlyPlayedResults(props.access_token, currentDate);
  const { featuredPlaylistItems } = useFeaturedPlaylists(props.access_token);
  const { newReleaseAlbumItems } = useNewReleaseAlbums(props.access_token);
  const { mandopopPickedTracks } = useMandpopPickedTracks(props.access_token, recentlyPlayedResultsItems);

  useEffect(() => {

  }, []);

  if (!recentlyPlayedResultsItems && !featuredPlaylistItems && !newReleaseAlbumItems) {
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

  let recentlyPlayedItems = generateRecentlyPlayedItems(recentlyPlayedResultsItems);

  let newReleaseAlbums = newReleaseAlbumItems?.slice(0, 6).map(album => {
    return(<AlbumCardDOM key={album.id} album={album} />);
  });

  let mandopTracks = mandopopPickedTracks?.map(track => {
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
                    {featuredPlaylistItems?.slice(0, 6).map(item => {
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res} = context;
  return {
    props: {
      access_token: req.cookies.access_token
    }
  };
}

export default Home
