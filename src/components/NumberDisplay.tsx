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

    const getMessage = (n: number) => {
        if (n === 1) return 'Amazingly close! Direct collaborator through shared repos.';
        if (n === 2) return 'Impressive! Only two degrees from Linus Torvalds.';
        if (n <= 3) return 'Great connection! Well within the inner circle.';
        if (n <= 5) return 'Solid GitHub presence with a path to Linus.';
        return 'Connected to Linus through the open source community!';
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
