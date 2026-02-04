import { DatabaseStats } from '@/lib/stats';

interface StatsDisplayProps {
    stats: DatabaseStats;
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString();
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
    const items = [
        { label: 'Developers', value: stats.developers, color: 'from-blue-400 to-blue-600' },
        { label: 'Repositories', value: stats.repositories, color: 'from-purple-400 to-purple-600' },
        { label: 'Contributions', value: stats.contributions, color: 'from-pink-400 to-pink-600' },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {items.map((item) => (
                <div key={item.label} className="text-center">
                    <div
                        className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
                    >
                        {formatNumber(item.value)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{item.label}</div>
                </div>
            ))}
        </div>
    );
}
