import React from 'react';

import Header from 'components/Header';
import Footer from 'components/Footer';

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container grow">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
