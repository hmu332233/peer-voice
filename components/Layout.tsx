import React from 'react';
import Head from 'next/head';

import Header from 'components/Header';
import Footer from 'components/Footer';

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <title>Peer Voice</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container grow">{children}</main>
        <Footer />
      </div>
    </>
  );
}

export default Layout;
