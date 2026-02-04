interface NumberDisplayProps {
    number: number;
    username: string;
}

export default function NumberDisplay({ number, username }: NumberDisplayProps) {
    const getNumberColor = (n: number) => {
        if (n === 1) return 'from-green-400 to-emerald-500';
        if (n <= 3) return 'from-blue-400 to-cyan-500';
        if (n <= 5) return 'from-purple-400 to-pink-500';
        return 'from-orange-400 to-red-500';
    };

    const messages: Record<string, string[]> = {
        '1': [
            'You practically share a desk with Linus! 🔥',
            'One repo away? Are you a kernel maintainer? 🐧',
            'Direct collaborator status achieved!',
            'Linus probably knows your code!',
            'The inner circle welcomes you! 🎉',
        ],
        '2': [
            'Two hops to the legend. Impressive! 🌟',
            'So close you can almost smell the kernel.',
            'Just one developer between you and greatness!',
            "You're in elite company here.",
            'Linux royalty is within reach! 👑',
        ],
        '3': [
            'Three degrees of Torvalds separation!',
            "Not bad! You're well connected.",
            'The open source force is strong with you.',
            'A solid path to the top! 💪',
            "You're closer than most developers!",
        ],
        '4': [
            'Four repos away. Still in the neighborhood!',
            'A respectable Torvalds Number.',
            "You've got open source street cred.",
            "Keep contributing, you're doing great!",
            'The path to Linus is clear! 🛤️',
        ],
        '5': [
            'Five degrees! The Kevin Bacon of code.',
            'Halfway across the open source world.',
            'A journey of a thousand commits!',
            'Connected through the community. 🤝',
            'Open source brings us all together!',
        ],
        'high': [
            'Connected through the vast open source web!',
            'A long but meaningful path to Linus.',
            'Every contribution counts! Keep going. 🚀',
            'The open source community connects us all.',
            'Your journey through GitHub is unique! ✨',
        ],
    };

    const getMessage = (n: number) => {
        const key = n <= 5 ? String(n) : 'high';
        const options = messages[key];
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    };

    return (
        <div className="text-center">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
                {username}&apos;s Torvalds Number
            </p>
            <div className={`inline-block text-8xl md:text-9xl font-black bg-gradient-to-br ${getNumberColor(number)} bg-clip-text text-transparent drop-shadow-2xl`}>
                {number}
            </div>
            <p className="mt-4 text-lg text-gray-300 max-w-md mx-auto">
                {getMessage(number)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
                {number} {number === 1 ? 'repository' : 'repositories'} separate you from Linus Torvalds
            </p>
        </div>
    );
}
