import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { Toaster } from '@/src/components/ui/sonner';
import '@/src/styles/globals.css';

const inter = Inter({
   variable: '--font-inter',
   subsets: ['latin'],
   display: 'swap',
   preload: true,
   fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
   display: 'swap',
   preload: false, // Only preload the primary font
   fallback: ['ui-monospace', 'monospace'],
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
      // site and creator removed
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

import { ThemeProvider } from '@/src/components/layout/theme-provider';
import { HydrationErrorBoundary } from '@/src/components/common/HydrationErrorBoundary';
import { SafeHydrate } from '@/src/components/common/SafeHydrate';

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
         <body className={`${inter.variable} ${geistMono.variable} antialiased bg-background`}>
            <HydrationErrorBoundary>
               <SafeHydrate>
                  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                     {children}
                     <Toaster />
                  </ThemeProvider>
               </SafeHydrate>
            </HydrationErrorBoundary>
         </body>
      </html>
   );
}
