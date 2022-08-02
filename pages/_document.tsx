import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
    render() {
        return(
            <Html lang="en">
                <Head>
                    <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"
                        strategy="lazyOnload"
                    />
                 </Head>
                 <body>
                    <Main />
                    <NextScript/>
                 </body>
            </Html>
        );
    }
}

export default MyDocument;