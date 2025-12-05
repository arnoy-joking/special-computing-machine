
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'NodeMusic',
  description: 'Your daily dose of music, curated just for you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://www.nicepng.com/png/full/358-3582537_best-apollo-icon-android-lollipop-png-play-music.png" type="image/png" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground h-dvh flex flex-col font-sans overflow-x-hidden">
        <MainLayout>{children}</MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
