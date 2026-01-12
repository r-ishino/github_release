import type { Metadata } from 'next';
import { Header } from '../components/Header';
import { QueryProvider } from '../providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub Release Manager',
  description: 'Easily create GitHub releases',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 min-h-screen">
        <QueryProvider>
          <Header />
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
