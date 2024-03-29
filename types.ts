
export type AxiosRequestConfig = {
    url: string,
    headers: {
        Authorization: string;
        'Content-Type': string;
    };
    method: string;
}

export interface GetRecentlyPlayedResults {
    info: RecentlyPlayedInfo;
}

export interface RecentlyPlayedInfo {
    items:   Item[];
    next?:    string;
    cursors?: Cursors;
    limit?:   number;
    href?:    string;
}

export interface FetchAlbumsInfo {
    href?:      string | null;
    items:      Album[];
    next?:      string;
    cursors?:   Cursors;
    limit:      number;
    offset:     number;
    previous?:  string;
    total:      number;
}

export interface FetchUserAlbumsInfo {
    href:       string,
    items:      {
        added_at: string,
        album: Album
    }[],
    next?:      string,
    limit:      number,
    offset:     number,
    previous?:  string,
    total:      number
}

export interface FeaturedPlaylistInfo {
    message: string,
    playlists: Playlists
}

export interface Recommendations {
    tracks: Track[];
    seeds:  Seed[];
}

export interface Seed {
    initialPoolSize:    number;
    afterFilteringSize: number;
    afterRelinkingSize: number;
    id:                 string;
    type:               string;
    href?:               null | string;
}

export interface FetchPlaylistsInfo {
    href:     string;
    items?:    Playlist[] | undefined;
    limit:    number;
    next:     string;
    offset:   number;
    previous: null;
    total:    number;
}

export interface Cursors {
    after?:  string;
    before?: string;
}

export interface Item {
    track:     Track;
    played_at?: Date;
    context:   Context;
}

export interface Playlists {
    items: Playlist[]
}

export interface Playlist {
    description: string,
    external_urls: ExternalUrls,
    followers: Follower[],
    owner: Owner,
    primary_color: string,
    tracks: {
        items: {
            track: Track
        }[]
    },
    id: string,
    name: string,
    public: boolean,
    snapshot_id: string,
    images: Image[],
    type: ContextType,
    uri: string
}

export interface Owner {
    display_name?: string,
    external_urls: ExternalUrls,
    href: string,
    id: string,
    type: string,
    uri: string
}

export interface Follower {
    href: string,
    total: string
}

export interface Context {
    external_urls?: ExternalUrls;
    href?:          string;
    type?:          ContextType;
    uri:           string;
}

export interface ExternalUrls {
    spotify?: string;
}

export enum ContextType {
    Album = "album",
    Artist = "artist",
    Playlist = "playlist",
}

export interface FetchLikedTracksInfo {
    href: string,
    items: {
        added_at: string,
        track: Track
    }[],
    limit: number,
    next?: string | null,
    offset: number,
    previous?: string | null,
    total: number
}

export interface FetchPlaylistTracksInfo {
    href: string,
    items: PlaylistTrack[],
    limit: number,
    next?: string | null,
    offset: number,
    previous?: string | null,
    total: number
}

export interface PlaylistTrack {
    added_at: string,
    added_by: Owner,
    is_local: boolean,
    primary_color?: string | null,
    track: Track,
    video_thumbnail: {
        url?: string | null
    }
}

export interface Tracks {
    href?:     string;
    items:    Item[];
    limit?:    number;
    next?:     null;
    offset?:   number;
    previous?: null;
    total?:    number;
}

export interface Track {
    album:             Album;
    artists:           Artist[];
    available_markets: string[];
    disc_number:       number;
    duration_ms:       number;
    explicit:          boolean;
    external_ids:      ExternalIDS;
    external_urls:     ExternalUrls;
    href:              string;
    id:                string;
    is_local:          boolean;
    name:              string;
    popularity:        number;
    preview_url:       string;
    track_number:      number;
    type:              TrackType;
    uri:               string;
}

export interface FetchAlbumDetailResult {
    album: Album | undefined
}

export interface Albums {
    items:      Album[]
}

export interface Album {
    album_type:             string;
    artists:                Artist[];
    available_markets:      string[];
    copyrights:             Copyright[];
    external_ids:           ExternalIDS;
    external_urls:          ExternalUrls;
    genres:                 any[];
    href:                   string;
    id:                     string;
    images:                 Image[];
    label:                  string;
    name:                   string;
    popularity:             number;
    release_date:           string;
    release_date_precision: string;
    total_tracks:           number;
    tracks:                 TracksItems;
    type:                   string;
    uri:                    string;
}

export interface ISearchResult {
    albums: Albums,
    artists: Artists,
    episodes: Episodes,
    playlists: Playlists,
    shows: Podcasts,
    tracks: TracksItems
}

export interface TracksItems {
    items:      Track[]
}

export interface Copyright {
    text?: string;
    type?: string;
}

export enum AlbumType {
    Album = "album",
    Compilation = "compilation",
    Single = "single",
}

export interface GetFetchArtistsInfo {
    artists: FetchArtistsInfo
}
export interface FetchArtistsInfo {
    cursor: Cursors,
    href: string,
    items: Artist[],
    limit: number,
    next?: string | null,
    total: number
}

export interface Artists {
    href: string,
    items: Artist[],
    limit: number,
    next: string,
    offset: number,
    previous: string,
    total: number
}

export interface Artist {
    external_urls: ExternalUrls;
    href:          string;
    id:            string;
    name:          string;
    type:          string;
    uri:           string;
    images:        Image[];
    genres:         string[];
    followers:     Follower;
}

export interface FetchPodcastsInfo {
    href: string,
    items: {
        added_at: string,
        show: Podcast
    }[],
    limit: number,
    next?: string | null,
    offset: number,
    previous?: string | null,
    total: number
}

export interface PodcastResult {
    items: { show: Podcast }[]
}

export interface Podcasts {
    items: Podcast[]
}

export interface Podcast {
    description: string,
    html_description: string,
    id: string,
    images: Image[],
    media_type: string,
    name: string,
    publisher: string,
    type: string,
    uri: string
    episodes: Episodes
}

export interface Episodes {
    items: Episode[]
}

export interface Episode {
    description: string,
    html_description: string,
    duration_ms: number,
    id: string,
    images: Image[],
    name: string,
    release_date: string,
    release_date_precision: ReleaseDatePrecision,
    type: TrackType,
    uri: string,
    show: Podcast
}

export interface FetchCategoriesInfo {
    categories: {
        href: string,
        items: Category[],
        limit: number,
        next: string | null,
        offset: number,
        previous: string | null,
        total: number
    }
}

export interface Category {
    href: string,
    icons: Image[],
    id: string,
    name: string
}


export interface Image {
    height: number;
    url:    string;
    width:  number;
}

export enum ReleaseDatePrecision {
    Day = "day",
    Month = "month",
    Year = "year",
}

export interface ExternalIDS {
    isrc?: string;
}

export enum TrackType {
    Track = "track",
    Episode = "episode"
}

export interface Device {
    id:                 string;
    is_active:          boolean;
    is_private_session: boolean;
    is_restricted:      boolean;
    name:               string;
    type:               string;
    volume_percent:     number;
}

export interface PersonalData {
    country: string,
    display_name: string,
    email: string,
    explicit_content: { filter_enabled: boolean, filter_locked: boolean },
    external_urls: ExternalUrls,
    followers: Follower,
    href: string,
    id: string,
    images:  Image[],
    product: string,
    type: string,
    uri: string
  }