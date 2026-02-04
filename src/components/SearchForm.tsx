'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const router = useRouter();

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsFetchingSuggestions(true);
        try {
            const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(data.suggestions?.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setIsFetchingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchSuggestions(username);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [username, fetchSuggestions]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setIsLoading(true);
            setShowSuggestions(false);
            router.push(`/result/${encodeURIComponent(username.trim())}`);
        }
    };

    const selectSuggestion = (suggestion: string) => {
        setUsername(suggestion);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    selectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setSelectedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Enter GitHub username..."
                        className="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isFetchingSuggestions ? (
                            <svg className="animate-spin w-5 h-5 text-gray-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <ul
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-2 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl shadow-xl overflow-hidden"
                        >
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={suggestion}
                                    onClick={() => selectSuggestion(suggestion)}
                                    className={`px-5 py-3 cursor-pointer transition-colors duration-150 flex items-center gap-3 ${index === selectedIndex
                                            ? 'bg-blue-600/30 text-blue-300'
                                            : 'text-gray-300 hover:bg-gray-700/50'
                                        }`}
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!username.trim() || isLoading}
                    className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Calculating...
                        </span>
                    ) : (
                        'Calculate Torvalds Number'
                    )}
                </button>
            </div>
        </form>
    );
}
