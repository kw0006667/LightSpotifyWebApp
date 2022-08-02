import { GetServerSideProps } from "next";
import Image from "next/future/image";
import Link from "next/link";
import AuthInstance from "../utilities/auth-instance";
import Footer from "./footer";

interface LayoutProps {
    children: React.ReactNode
}

function Layout({children}: LayoutProps) {
    const userIconUrl = AuthInstance.personalData?.images?.at(0)?.url ?? "/Spotify_Icon_RGB_Black.png";

    return(
        <>
            <header className="d-flex flex-wrap align-items-center justify-content-between px-3 mb-4 border-bottom" >
                <div className="d-flex align-items-center">
                    <div>
                        <Link href="/api/refresh_token">
                            <a  className="d-flex align-items-center  text-dark text-decoration-none">
                                <Image src={'/Spotify_Logo_RGB_Black.png'} alt={'spotify'} width="106" height="32" />
                            </a>
                        </Link>
                    </div>
                    

                    <div className="mx-2" >
                        <Link href="#">
                            <a>
                                <i className="bi bi-chevron-left"></i>
                            </a>
                        </Link>
                        <Link href="#">
                            <a>
                                <i className="bi bi-chevron-right"></i>
                            </a>
                        </Link>
                    </div>
                </div>
                
            
                <ul id="headerTabsBar" className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                    <li>
                        <Link href="/">
                            <a className="nav-link px-2 link-secondary link-item active" data-index="0" >Home</a>
                        </Link>
                    
                    </li>
                    <li>
                        <Link href={'/playlist'}>
                            <a className="nav-link px-2 link-dark link-item " data-index="1" >Playlist</a>
                        </Link>
                    </li>
                    <li>
                        <Link href={'/album'}>
                            <a className="nav-link px-2 link-dark link-item" data-index="2" >Album</a>
                        </Link>
                    </li>
                    <li>
                        <Link href={'/podcast'}>
                            <a className="nav-link px-2 link-dark link-item" data-index="3" >Podcast</a>
                        </Link>
                    
                    </li>
                    <li>
                        <Link href={'/artist'}>
                            <a className="nav-link px-2 link-dark link-item" data-index="4" >Artist</a>
                        </Link>
                    </li>
                    <li>
                        <Link href={'/likes'}>
                            <a className="nav-link px-2 link-dark link-item" data-index="4" >Liked</a>
                        </Link>
                    </li>
                    <li>
                        <Link href={'/search'}>
                        <a href="#" className="nav-link px-2 link-dark link-item" data-index="5" >Search</a>
                        </Link>
                    </li>
                </ul>
                <div className="dropdown text-end">
                    <a href="#" className="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                        <Image id="userIcon" src={userIconUrl} alt="mdo" width="32" height="32" className="rounded-circle"/>
                    </a>
                    <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
                        <li><a className="dropdown-item" href="#">New project...</a></li>
                        <li><a className="dropdown-item" href="#">Settings</a></li>
                        <li><a className="dropdown-item" href="#">Profile</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li>
                            <Link href="/api/login" >
                                <a className="dropdown-item" href="#">Sign out</a>
                            </Link>
                        </li>
                    </ul>
                </div>
            </header>
            {children}
            <Footer/>
        </>
    );
}

export default Layout;