import SearchForm from '@/components/SearchForm';
import StatsDisplay from '@/components/StatsDisplay';
import { getStats } from '@/lib/stats';
import Link from 'next/link';

export default async function HomePage() {
    const stats = await getStats();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-black mb-4">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Torvalds
                    </span>
                    <br />
                    <span className="text-white">Number</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 max-w-lg mx-auto">
                    How many degrees of separation are you from{' '}
                    <Link
                        href="https://github.com/torvalds"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                        Linus Torvalds
                    </Link>
                    ?
                </p>
            </div>

            {/* Database Stats */}
            <div className="mb-12">
                <StatsDisplay stats={stats} />
            </div>

            {/* Search Form */}
            <SearchForm />

            {/* Explanation */}
            <div className="mt-16 max-w-2xl text-center">
                <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                    Your Torvalds Number is the number of{' '}
                    <span className="text-purple-400 font-medium">repositories</span>{' '}
                    between you and Linus Torvalds. Fewer repos = closer to the creator of Linux!
                </p>

                {/* Visual Path Diagram */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* You */}
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                            You
                        </div>
                    </div>

                    <span className="text-gray-500 text-xl">→</span>

                    {/* Repo 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            Repo
                        </div>
                    </div>

                    <span className="text-gray-500 text-xl">→</span>

                    {/* Dev */}
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                            Dev
                        </div>
                    </div>

                    <span className="text-gray-500 text-xl">→</span>

                    {/* Repo 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            Repo
                        </div>
                    </div>

                    <span className="text-gray-500 text-xl">→</span>

                    {/* Torvalds */}
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-bold text-xs">
                            Linus
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Developer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Repository</span>
                    </div>
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
