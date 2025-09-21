import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

const siteUrl = 'https://heyspex.com';

export const metadata: Metadata = {
   title: {
      template: '%s | HeySpex',
      default: 'HeySpex',
   },
   description:
      'Project management interface inspired by Linear. Built with Next.js and shadcn/ui, this application allows tracking of issues, projects and teams with a modern, responsive UI.',
   openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: 'HeySpex',
      images: [
         {
            url: `${siteUrl}/banner.png`,
            width: 2560,
            height: 1440,
            alt: 'HeySpex UI',
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      site: '@ln_dev7',
      creator: '@ln_dev7',
      images: [
         {
            url: `${siteUrl}/banner.png`,
            width: 2560,
            height: 1440,
            alt: 'HeySpex',
         },
      ],
   },
   authors: [{ name: 'HeySpex Team', url: 'https://heyspex.com/' }],
   keywords: ['ui', 'heyspex', 'components', 'template', 'project-management'],
};

import { ThemeProvider } from '@/components/layout/theme-provider';

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" suppressHydrationWarning>
         <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
         </head>
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
               {children}
               <Toaster />
            </ThemeProvider>
         </body>
      </html>
   );
}
