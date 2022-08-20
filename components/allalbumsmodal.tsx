import React from "react";
import { Album, Albums, Artist } from "../types";
import AlbumCardDOM from "./albumcard";

type AllAlbumsModalProps = {
    albums: Album[] | undefined,
    artist: Artist
}

function AllAlbumsModalDOM(props: AllAlbumsModalProps) {

    return(
        <div className="modal fade" id="allAlbumModal" tabIndex={-1} aria-labelledby="allAlbumModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="allAlbumModalLabel">{props.artist.name}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex flex-wrap">
                            {props.albums?.map(album => {
                                return(<AlbumCardDOM key={album.id} album={album} />);
                            })}
                        </div>
                    </div>
                    {/* <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary">Save changes</button>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default AllAlbumsModalDOM;