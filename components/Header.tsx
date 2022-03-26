import React from 'react';
import Link from 'next/link';

type Props = {};

function Header({}: Props) {
  return (
    <header className="container text-center py-4">
      <h1 className="text-4xl font-bold text-base-content ">
        <Link href="/">
          <a>
            <span className="text-primary">Peer</span> Voice
          </a>
        </Link>
      </h1>
      <p className="py-4">웹페이지에서 친구와 간단하게 통화해보세요!</p>
    </header>
  );
}

export default Header;
