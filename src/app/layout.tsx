import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Header } from '../components/Header';
import { LoginPrompt } from '../components/LoginPrompt';
import { decryptSession, SESSION_COOKIE } from '../lib/auth';
import { QueryProvider } from '../providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub Release Manager',
  description: 'Easily create GitHub releases',
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const session = await decryptSession(cookieStore.get(SESSION_COOKIE)?.value);

  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 min-h-screen">
        <QueryProvider>
          <Header login={session?.login ?? null} />
          <main>{session ? children : <LoginPrompt />}</main>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
