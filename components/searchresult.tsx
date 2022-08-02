import { ISearchResult, Tracks } from "../types";
import AlbumCardDOM from "./albumcard";
import ArtistCardDOM from "./artistcard";
import EpisodeCardDOM from "./episodecard";
import PlaylistCardDOM from "./playlistcard";
import PodcastCardDOM from "./podcastcard";
import TrackResultDOM from "./trackresult";

interface SearchResultProps {
    searchResult: ISearchResult
}

function SearchResultDOM(props: SearchResultProps) {
    let trackList: JSX.Element[] = [];
    let artistList: JSX.Element[] = [];
    let albumList: JSX.Element[] = [];
    let playlistList: JSX.Element[] = [];
    let episodeList: JSX.Element[] = [];
    let podcastList: JSX.Element[] = [];
    if (props.searchResult.tracks.items.length > 0) {
        trackList = props.searchResult.tracks.items.slice(0, 10).map(track => {
            return(<TrackResultDOM key={track.id} track={track} />);
        });
    }

    if (props.searchResult.artists.items.length > 0) {
        artistList = props.searchResult.artists.items.slice(0, 6).map(artist => {
            return(<ArtistCardDOM key={artist.id} artist={artist} />);
        });
    }

    if (props.searchResult.albums.items.length > 0) {
        albumList = props.searchResult.albums.items.slice(0, 6).map(album => {
            return(<AlbumCardDOM key={album.id} album={album} />);
        });
    }

    if (props.searchResult.playlists.items.length > 0) {
        playlistList = props.searchResult.playlists.items.slice(0, 6).map(playlist => {
            return(<PlaylistCardDOM key={playlist.id} playlist={playlist} />);
        });
    }

    if (props.searchResult.episodes.items.length > 0) {
        episodeList = props.searchResult.episodes.items.slice(0, 6).map(episode => {
            return(<EpisodeCardDOM key={episode.id} episode={episode} />);
        });
    }

    if (props.searchResult.shows.items.length > 0) {
        podcastList = props.searchResult.shows.items.slice(0, 6).map(podcast => {
            return(<PodcastCardDOM key={podcast.id} podcast={podcast} />);
        });
    }

    return(
        <>
            <section className="artist-section" >
                <div className="artist-section-title">Songs</div>
                <table className="table table-hover align-middle album-table">
                    <colgroup>
                        <col span={1} style={{width:'5%'}}/>
                        <col span={1} style={{width:'30%'}}/>
                        <col span={1} style={{width:'35%'}}/>
                        <col span={1} style={{width:'20%'}}/>
                        <col span={1} style={{width:'5%'}}/>
                        <col span={1} style={{width:'5%'}}/>
                    </colgroup>
                    <tbody>
                        {trackList}
                    </tbody>
                </table>
            </section>
            <section className="artist-section">
                <div className="artist-section-title d-flex justify-content-between">
                    <div>
                        Artists
                    </div>
                </div>
                <div className="d-flex flex-wrap">
                    {artistList}
                </div>
            </section>
            <section className="artist-section">
                <div className="artist-section-title d-flex justify-content-between">
                    <div>
                        Albums
                    </div>
                </div>
                <div className="d-flex flex-wrap">
                    {albumList}
                </div>
            </section>
            <section className="artist-section">
                <div className="artist-section-title d-flex justify-content-between">
                    <div>
                        Playlists
                    </div>
                </div>
                <div className="d-flex flex-wrap">
                    {playlistList}
                </div>
            </section>
            <section className="artist-section">
                <div className="artist-section-title d-flex justify-content-between">
                    <div>
                        Podcasts
                    </div>
                </div>
                <div className="d-flex flex-wrap">
                    {podcastList}
                </div>
            </section>
            <section className="artist-section">
                <div className="artist-section-title d-flex justify-content-between">
                    <div>
                        Episodes
                    </div>
                </div>
                <div className="d-flex flex-wrap">
                    {episodeList}
                </div>
            </section>
        </>
    )
}

export default SearchResultDOM;