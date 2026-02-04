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
            <footer className="mt-20 text-center text-sm text-gray-500">
                <p>
                    Data sourced from GitHub&apos;s top repositories • {' '}
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-400 transition-colors"
                    >
                        Powered by Neo4j
                    </Link>
                </p>
            </footer>
        </div>
    );
}
