import Image from 'next/image';
import { Developer, ContributionFacts } from '@/lib/types';

interface DeveloperNodeProps {
    developer: Developer;
    facts?: ContributionFacts;
    isStart?: boolean;
    isEnd?: boolean;
}

export default function DeveloperNode({ developer, facts, isStart, isEnd }: DeveloperNodeProps) {
    const avatarUrl = `https://avatars.githubusercontent.com/u/${developer.githubId}?v=4`;

    return (
        <div className={`relative flex items-center gap-4 p-4 rounded-xl border-l-4 ${isEnd ? 'border-yellow-500 bg-yellow-500/10' :
                isStart ? 'border-green-500 bg-green-500/10' :
                    'border-blue-500 bg-blue-500/10'
            } backdrop-blur-sm`}>
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-700">
                <Image
                    src={avatarUrl}
                    alt={developer.username}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <a
                        href={`https://github.com/${developer.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-white hover:text-blue-400 transition-colors truncate"
                    >
                        @{developer.username}
                    </a>
                    {isEnd && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                            Linus
                        </span>
                    )}
                    {isStart && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                            You
                        </span>
                    )}
                </div>
                {facts && (
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {facts.totalCommits.toLocaleString()} commits
                        </span>
                        {facts.linesAdded > 0 && (
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {facts.linesAdded.toLocaleString()} lines
                            </span>
                        )}
                        {facts.primaryLanguage !== 'Unknown' && (
                            <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-full">
                                {facts.primaryLanguage}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
