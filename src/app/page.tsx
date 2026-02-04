import SearchForm from '@/components/SearchForm';
import Link from 'next/link';

export default function HomePage() {
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

            {/* Search Form */}
            <SearchForm />

            {/* Explanation */}
            <div className="mt-16 max-w-2xl text-center">
                <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl font-bold text-blue-400">1</span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">Enter username</h3>
                        <p className="text-sm text-gray-400">
                            Type any GitHub username to start the calculation.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl font-bold text-purple-400">2</span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">Find connections</h3>
                        <p className="text-sm text-gray-400">
                            We trace shared repositories between developers.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl font-bold text-pink-400">3</span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">Get your number</h3>
                        <p className="text-sm text-gray-400">
                            See your shortest path to Linus Torvalds.
                        </p>
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
