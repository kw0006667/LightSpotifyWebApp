import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/globals.scss'
import '../styles/detail.scss'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import { GetServerSideProps } from 'next'
import WebPlayback from '../components/webplayback'
import AuthInstance from '../utilities/auth-instance'
import Link from 'next/link'
import { SWRConfig } from "swr";
import { AxiosRequestConfig } from 'axios'
import axiosInstance from '../utilities/axios-instance'
import React from 'react'

const instance = AuthInstance;

function MyApp({ Component, pageProps }: AppProps) {
  return(
    <SWRConfig
      value={{ 
        revalidateOnFocus: false,
        fetcher: (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data)
        }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SWRConfig>
  );
}

export default MyApp
