'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NumberDisplay from '@/components/NumberDisplay';
import PathVisualization from '@/components/PathVisualization';
import { CalculateResponse, CalculateErrorResponse } from '@/lib/types';

export default function ResultPage() {
    const params = useParams();
    const username = params.username as string;

    const [result, setResult] = useState<CalculateResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchResult() {
            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: decodeURIComponent(username) }),
                });

                const data: CalculateResponse | CalculateErrorResponse = await response.json();

                if ('error' in data) {
                    setError(data.error);
                } else {
                    setResult(data);
                }
            } catch (err) {
                setError('Failed to calculate path. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchResult();
    }, [username]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500 mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Calculating...</h2>
                    <p className="text-gray-400">
                        Finding the shortest path to Linus Torvalds
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Path Found</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Try another username
                    </Link>
                </div>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    return (
        <div className="min-h-screen px-4 py-16">
            {/* Back Button */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to search
                </Link>
            </div>

            {/* Number Display */}
            <div className="mb-16">
                <NumberDisplay number={result.number} username={result.username} />
            </div>

            {/* Path Visualization */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                    Your Path to Linus
                </h2>
                <PathVisualization path={result.path} />
            </div>

            {/* Share Section */}
            <div className="mt-16 text-center">
                <p className="text-gray-500 mb-4">Share your Torvalds Number</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            const url = typeof window !== 'undefined' ? window.location.href : '';
                            const text = `Check out my Torvalds Number! ${url}`;
                            navigator.clipboard.writeText(text);
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                    >
                        Copy to clipboard
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 text-center">
                <Link
                    href="https://github.com/softarn/torvalds-number"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all mb-4"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                </Link>
                <p className="text-sm text-gray-500">
                    Data sourced from GitHub&apos;s top repositories • Powered by Neo4j
                </p>
            </footer>
        </div>
    );
}
