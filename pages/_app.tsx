import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/globals.scss'
import '../styles/detail.scss'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import Layout from '../components/layout'
import AuthInstance from '../utilities/auth-instance'
import { SWRConfig } from "swr";
import { AxiosRequestConfig } from 'axios'
import axiosInstance from '../utilities/axios-instance'
import React from 'react'

const instance = AuthInstance;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return(
    <QueryClientProvider client={queryClient}>
      <SWRConfig
        value={{ 
          revalidateOnFocus: false,
          fetcher: (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data)
          }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SWRConfig>
    </QueryClientProvider>
  );
}

export default MyApp
