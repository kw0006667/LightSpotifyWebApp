import { GetServerSideProps } from "next";
import Image from "next/image";
import React from "react";
import WebPlayback from "./webplayback";

function Footer() {

    return(
        <footer className="footer py-3 px-5 d-flex justify-content-between align-items-center fixed-bottom border-top" >
            <WebPlayback access_token=""/>
        </footer>
    )
}

export default Footer;