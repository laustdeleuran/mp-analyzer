import type { Metadata } from 'next';
import { Playfair_Display, Lato, Source_Code_Pro } from 'next/font/google';
import { Theme } from '@radix-ui/themes';

import { FilterProvider } from '@/store/filterContext';

import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
});

const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code-pro',
  subsets: ['latin'],
});

const lato = Lato({
  variable: '--font-lato-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Mountain Project Tick Analyzer',
  description: 'Visualize your Mountain Project tick history.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Theme>
      <html lang="en">
        <body className={`${playfairDisplay.variable} ${lato.variable} ${sourceCodePro.variable} antialiased`}>
          <FilterProvider>{children}</FilterProvider>
        </body>
      </html>
    </Theme>
  );
}
