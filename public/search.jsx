'use strict';

/**
 * Module exports.
 * @public
 */



/**
 * @private
 */


function openSearchPage() {
    let pageContentReactDom = document.getElementById('content');
    if (pageContentReactDom) {
        ReactDOM.render(
            <div>
                <section>
                    <div className="m-3">
                        <input type="text" list="datalistOptions" className="form-control" id="searchInput" placeholder="Search" onKeyUp={searchInput}></input>
                        <datalist id="datalistOptions">
                            <option value="San Francisco">
                            </option><option value="New York">
                            </option><option value="Seattle">
                            </option><option value="Los Angeles">
                            </option><option value="Chicago">
                            </option></datalist>
                    </div>
                </section>
                <section>
                    <div id="resultContent">
                    </div>
                </section>
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
    let pageContentReactDom = document.getElementById('content');
    if (result?.tracks?.items?.length > 0) {
        let trackList = result.tracks.items.map(track =>
            <TrackResultDOM key={track.id} track={track} />
            );
        
        ReactDOM.render(
            <div className="list-group w-auto py-3">
                {trackList}
            </div>
            ,pageContentReactDom
        );
    }
}


            // <ol className="list-group list-group-numbered">
            //     {trackList}
            // </ol>