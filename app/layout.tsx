import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

// Force dynamic rendering to prevent stale prerendered HTML after deployments
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Bhutan's Premier Tech Store",
    description: "Quality Tech Products & Custom Services",
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <body suppressHydrationWarning>
                <Providers>{children}</Providers>
                <link rel="stylesheet" href="https://unpkg.com/react-quill-new@3.3.1/dist/quill.snow.css" />
            </body>
        </html>
    );
}
