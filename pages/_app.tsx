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

const instance = AuthInstance;

function MyApp({ Component, pageProps }: AppProps) {
  return(
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp
