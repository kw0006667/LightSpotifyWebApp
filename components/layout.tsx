import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthInstance from "../utilities/auth-instance";
import Footer from "./footer";

interface LayoutProps {
    children: React.ReactNode
}

function Layout({children}: LayoutProps) {
    const userIconUrl = AuthInstance.personalData?.images?.at(0)?.url ?? "/Spotify_Icon_RGB_Black.png";
    const router = useRouter();

    const previousPage = () => {
        // router.back();
        if (window) {
            window.history.back();
        }
    }

    const nextPage = () => {
        if (window) {
            window.history.forward();
        }
    }

    return(
        <>
            <header className="d-flex flex-wrap align-items-center justify-content-between px-3 mb-4 border-bottom" >
                <div className="d-flex align-items-center">
                    <div>
                        <Link href="/api/refresh_token" className="d-flex align-items-center  text-dark text-decoration-none">
                            <Image src={'/Spotify_Logo_RGB_Black.png'} alt={'spotify'} width="106" height="32" />
                        </Link>
                    </div>
                    

                    <div className="mx-2" >
                        <Link href="#" onClick={() => {previousPage()}}>
                            <i className="bi bi-chevron-left"></i>
                        </Link>
                        <Link href="#" onClick={() => {nextPage()}}>
                            <i className="bi bi-chevron-right"></i>
                        </Link>
                    </div>
                </div>
                
            
                <ul id="headerTabsBar" className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                    <li>
                        <Link href="/" className="nav-link px-2 link-secondary link-item active" data-index="0">
                            Home
                        </Link>
                    
                    </li>
                    <li>
                        <Link href={'/playlist'} className="nav-link px-2 link-dark link-item " data-index="1">
                            Playlist
                        </Link>
                    </li>
                    <li>
                        <Link href={'/album'} className="nav-link px-2 link-dark link-item" data-index="2">
                            Album
                        </Link>
                    </li>
                    <li>
                        <Link href={'/podcast'} className="nav-link px-2 link-dark link-item" data-index="3">
                            Podcast
                        </Link>
                    </li>
                    <li>
                        <Link href={'/artist'} className="nav-link px-2 link-dark link-item" data-index="4">
                            Artist
                        </Link>
                    </li>
                    <li>
                        <Link href={'/likes'} className="nav-link px-2 link-dark link-item" data-index="4">
                            Liked
                        </Link>
                    </li>
                    <li>
                        <Link href={'/search'} className="nav-link px-2 link-dark link-item" data-index="5">
                            Search
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
                            <Link href="/api/login" className="dropdown-item">
                                Sign out
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