import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Torvalds Number',
    description: 'Calculate your degrees of separation from Linus Torvalds on GitHub',
    keywords: ['GitHub', 'Linus Torvalds', 'open source', 'developers', 'six degrees'],
    openGraph: {
        title: 'Torvalds Number',
        description: 'Calculate your degrees of separation from Linus Torvalds on GitHub',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
                <main className="relative z-10">
                    {children}
                </main>
            </body>
        </html>
    );
}
