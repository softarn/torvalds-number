import { Repository } from '@/lib/types';

interface RepositoryNodeProps {
    repository: Repository;
}

export default function RepositoryNode({ repository }: RepositoryNodeProps) {
    return (
        <div className="relative flex items-center gap-4 p-4 rounded-xl border-l-4 border-purple-500 bg-purple-500/10 backdrop-blur-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-purple-500/20">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v10" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <a
                    href={`https://github.com/${repository.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-white hover:text-purple-400 transition-colors truncate block"
                >
                    {repository.name}
                </a>
                <p className="text-sm text-gray-400">
                    Shared repository
                </p>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </div>
    );
}
