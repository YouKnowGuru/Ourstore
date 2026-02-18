import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: "Bhutan's Premier Tech Store",
    description: "Quality Tech Products & Custom Services",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://unpkg.com/react-quill-new@3.3.1/dist/quill.snow.css" />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
