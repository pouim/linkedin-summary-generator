import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Generate your linkedin summary bio in seconds."
          />
          <meta
            property="og:description"
            content="Generate your linkedin summary bio in seconds."
          />
          <meta property="og:title" content="Linkedin Summary Generator" />
          <meta name="linkedin:card" content="summary_large_image" />
          <meta name="linkedin:title" content="Linkedin Summary Generator" />
          <meta
            name="linkedin:description"
            content="Generate your linkedin summary bio in seconds."
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
