'use strict';

/**
 * Module exports.
 * @public
 */



/**
 * @private
 */

function CategoryBoxDOM(props) {
    return(
        <div className="category-box" style={{cursor: 'pointer'}} onClick={(e) => fetchCategoryPlaylists(e, props.category.id)}>
            <img src={props.category.icons[0]?.url} width={'128px'} height={'128px'} />
            <div className="category-box-name">
                <span>{props.category.name}</span>
            </div>
        </div>
    )
}

function generateSearchPageContent(categories) {
    let categoryArray = categories.map(category =>
            <CategoryBoxDOM key={category.id} category={category} />
        );

    let pageContentReactDom = document.getElementById('content');
    if (pageContentReactDom) {
        ReactDOM.render(
            <div className="container" style={{marginTop: '10px'}}>
                 <section>
                    <div className="m-3">
                        <input type="text" list="datalistOptions" className="form-control" id="searchInput" placeholder="Search" onKeyUp={searchInput}></input>
                    </div>
                </section>
                <div id="resultContent">
                    <section className="artist-section">
                        <div className="artist-section-title">
                            Categories
                        </div>
                        <div className="d-flex flex-wrap">
                            {categoryArray}
                        </div>
                    </section>
                </div>
            </div>
        , pageContentReactDom
        );
    }
}

function searchInput(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        console.log(`SearchInput:\t${event.key}`);
        let requestConfig = Object.assign({}, globalRequestConfig);
        let searchText = event.target.value;

        fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchText)}&type=album,track,artist,playlist,show,episode`, requestConfig)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 401) {
                refreshToken();
                return;
            }
        })
        .then(data => {
            console.log(data);
            resetSwitchTabsStatus();
            generateResultDOMElement(data);
        })
        .catch(reason => {
            console.error(`searchInput:\n${reason}`);
        });
    }
}

function generateResultDOMElement(result) {
    let pageContentReactDom = document.getElementById('resultContent');
    let trackList = [];
    let artistList = [];
    let albumList = [];
    let episodeList = [];
    if (result?.tracks?.items?.length > 0) {
        trackList = result.tracks.items.slice(0, 10).map(track =>
            <TrackResultDOM key={track.id} track={track} />
            );
    }

    if (result?.artists?.items?.length > 0) {
        artistList = result.artists.items.slice(0, 6).map(artist =>
            <ArtistCardDOM key={artist.id} artist={artist} />
            );
    }

    if (result?.albums?.items?.length > 0) {
        albumList = result.albums.items.slice(0, 6).map(album =>
            <AlbumCardDOM key={album.id} album={album} />
            );
    }

    if (result?.episodes?.items?.length > 0) {
        episodeList = result?.episodes?.items.slice(0, 6).map(episode =>
            <EpisodeCardDOM key={episode.id} episode={episode} />
            );
    }
        
    ReactDOM.render(
        <div>
            <section className="artist-section" >
                <div className="artist-section-title">Songs</div>
                <table className="table table-hover align-middle album-table">
                    <colgroup>
                        <col span={1} style={{width:'5%'}}/>
                        <col span={1} style={{width:'15%'}}/>
                        <col span={1} style={{width:'35%'}}/>
                        <col span={1} style={{width:'35%'}}/>
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
                        Episodes
                    </div>
                </div>
                <div className="d-flex flex-wrap">
                    {episodeList}
                </div>
            </section>
        </div>
        ,pageContentReactDom
    );
    
}

function fetchSearchContent() {
    let requestConfig = Object.assign({}, globalRequestConfig);
    requestConfig.headers["Content-Type"] = 'application/json';
    requestConfig.method = 'GET';

    fetch(`https://api.spotify.com/v1/browse/categories?limit=50`, requestConfig)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else if (response.status === 401) {
            refreshToken();
        }
    })
    .then(data => {
        // check if there are still next
        if (data && data.next) {
            
        }
        generateSearchPageContent(data.categories.items);
    })
    .catch(reason => {
        console.error(`fetchSearchContent:\n${reason}`);
    });
}