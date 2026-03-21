
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserLocation } from '@/hooks/useUserLocation';
import { Search, MapPin, ChevronDown, Check } from 'lucide-react';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [citySearch, setCitySearch] = useState('');
    const [isSearchingCity, setIsSearchingCity] = useState(false);
    const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
    const [recentCities, setRecentCities] = useState<string[]>([]);

    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { location } = useUserLocation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCityDropdownOpen(false);
                setCitySearch('');
            }
        };

        if (isCityDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCityDropdownOpen]);

    // Setup Recent Cities & Default location
    useEffect(() => {
        const savedCities = localStorage.getItem('selectedCities');
        const savedRecent = localStorage.getItem('recentCities');
        let hasSavedSelection = false;

        if (savedCities) {
            try {
                const parsed = JSON.parse(savedCities);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSelectedCities(parsed);
                    hasSavedSelection = true;
                }
            } catch (e) {
                console.error('Failed to parse saved cities');
            }
        }

        if (savedRecent) {
            try {
                const parsed = JSON.parse(savedRecent);
                if (Array.isArray(parsed)) setRecentCities(parsed);
            } catch (e) { }
        }

        // Auto-select precise location if available AND user hasn't made a manual selection
        if (!hasSavedSelection && location?.city && location.source === 'browser') {
            setSelectedCities([location.city]);
            localStorage.setItem('selectedCities', JSON.stringify([location.city]));
            // Also add to recents
            if (!savedRecent?.includes(location.city)) {
                const newRecents = [location.city].slice(0, 5);
                setRecentCities(newRecents);
                localStorage.setItem('recentCities', JSON.stringify(newRecents));
            }
            window.dispatchEvent(new Event('cityChange'));
        }
    }, [location]);

    const searchDynamicCities = useCallback(async (query: string) => {
        if (!query.trim()) {
            setCitySearchResults([]);
            return;
        }
        setIsSearchingCity(true);
        try {
            // Search specifically for cities/towns/features using Nominatim
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=city,town,village&limit=5`);
            if (response.ok) {
                const data = await response.json();
                setCitySearchResults(data || []);
            }
        } catch (error) {
            console.error("City search error:", error);
        } finally {
            setIsSearchingCity(false);
        }
    }, []);

    // Debounce for city search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (citySearch.length > 2) {
                searchDynamicCities(citySearch);
            } else {
                setCitySearchResults([]);
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [citySearch, searchDynamicCities]);

    const toggleCity = (cityOrLocationObj: any) => {
        const cityName = typeof cityOrLocationObj === 'string'
            ? cityOrLocationObj
            : (cityOrLocationObj.name || cityOrLocationObj.display_name.split(',')[0]);

        let newCities: string[];
        if (selectedCities.includes(cityName)) {
            newCities = selectedCities.filter(c => c !== cityName);
        } else {
            // For now, let's keep it to single city selection for simplicity and accuracy just dropping array structure if preferred,
            // but keeping array for multi-select compatibility
            newCities = [cityName]; // Override to single select
        }

        setSelectedCities(newCities);
        localStorage.setItem('selectedCities', JSON.stringify(newCities));

        // Update recents
        const newRecents = [cityName, ...recentCities.filter(c => c !== cityName)].slice(0, 5);
        setRecentCities(newRecents);
        localStorage.setItem('recentCities', JSON.stringify(newRecents));

        setCitySearch('');
        setIsCityDropdownOpen(false);
        window.dispatchEvent(new Event('cityChange'));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const locParam = selectedCities.length > 0 ? `&location=${encodeURIComponent(selectedCities.join(','))}` : '';
            router.push(`/search?q=${encodeURIComponent(searchQuery)}${locParam}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 text-white shadow-premium">
            {/* Background & Animation Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ background: 'linear-gradient(135deg, #7030ef 0%, #db1fff 100%)' }}>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-y-0 w-1/4 bg-white/30 -skew-x-12 animate-[sweep_5s_infinite] blur-2xl" style={{ left: '-50%' }} />
                </div>
            </div>

            {/* Upper Header: Logo, Search, Location, Login */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="flex items-center justify-between gap-8 py-4 md:py-5">
                    {/* Logo with Glow */}
                    <Link href="/" className="flex-shrink-0 group">
                        <h1 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter uppercase transition-all duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover:scale-[1.02]">
                            Konkani<span className="text-white/70 not-italic">Show</span>
                        </h1>
                    </Link>

                    {/* Search Bar - Refined Glassmorphism */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-2xl relative group"
                    >
                        <input
                            type="text"
                            placeholder="Search for Events"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-sm text-white placeholder:text-white/50 transition-all duration-300 focus:bg-white/20 group-hover:border-white/40 shadow-inner"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white group-hover:scale-110 transition-transform">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                    </form>

                    {/* Location & CTA */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="flex items-center gap-1.5 cursor-pointer group"
                                onClick={() => {
                                    setIsCityDropdownOpen(!isCityDropdownOpen);
                                    if (isCityDropdownOpen) setCitySearch('');
                                }}
                            >
                                <div className="text-white/70 group-hover:text-white transition-colors text-right hidden sm:block">
                                    <span className="text-xs uppercase font-black tracking-widest block opacity-60">Location</span>
                                    <span className="text-sm font-bold block leading-tight truncate max-w-[100px] lg:max-w-[150px]">
                                        {selectedCities.length === 0 ? 'All Cities' :
                                            selectedCities.length === 1 ? selectedCities[0] :
                                                `${selectedCities.length} Cities`}
                                    </span>
                                </div>
                                <div className="sm:hidden flex flex-col items-center">
                                    <MapPin size={18} strokeWidth={2} className="text-white/80" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                                        {selectedCities.length === 0 ? 'All' :
                                            selectedCities.length === 1 ? selectedCities[0] :
                                                `${selectedCities.length}`}
                                    </span>
                                </div>
                                <ChevronDown size={14} strokeWidth={2.5} className={`text-white/40 group-hover:text-white transition-all transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* City Dropdown */}
                            {isCityDropdownOpen && (
                                <div className="absolute top-full right-0 mt-3 w-56 bg-white  shadow-premium z-[100] py-2 border border-surface-200 animate-in fade-in slide-in-from-top-2 duration-200 text-[#1a1a1a]">
                                    <div className="px-4 py-2 flex justify-between items-center border-b border-surface-50 mb-1">
                                        <span className="text-[10px] font-black text-[#666666] uppercase tracking-widest">Select Cities</span>
                                        {selectedCities.length > 0 && (
                                            <button
                                                onClick={() => { setSelectedCities([]); localStorage.setItem('selectedCities', JSON.stringify([])); window.dispatchEvent(new Event('cityChange')); }}
                                                className="text-[10px] font-bold text-primary hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* City Search Filter */}
                                    <div className="px-3 pb-2 pt-1 border-b border-surface-50">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Search for any city..."
                                                value={citySearch}
                                                onChange={(e) => setCitySearch(e.target.value)}
                                                className="w-full pl-8 pr-8 py-2 bg-surface-50 border border-surface-100  focus:outline-none focus:border-primary/30 text-xs font-bold placeholder:text-surface-400 transition-all text-surface-900"
                                                autoFocus
                                            />
                                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors">
                                                <Search size={14} strokeWidth={3} />
                                            </div>
                                            {isSearchingCity && (
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 border-2 border-primary border-t-transparent  animate-spin"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto">

                                        {/* Dynamic Search Results */}
                                        {citySearch.length > 2 ? (
                                            <div>
                                                <div className="px-4 py-2 text-[10px] font-black tracking-widest text-surface-400 uppercase">Search Results</div>
                                                {citySearchResults.map((result, idx) => {
                                                    const cityName = result.name || result.display_name.split(',')[0];
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => toggleCity(result)}
                                                            className="w-full text-left px-4 py-2.5 transition-colors hover:bg-surface-50 border-b border-surface-50 last:border-0"
                                                        >
                                                            <p className="text-sm font-bold text-[#333333]">{cityName}</p>
                                                            <p className="text-[10px] text-surface-500 truncate">{result.display_name}</p>
                                                        </button>
                                                    )
                                                })}
                                                {!isSearchingCity && citySearchResults.length === 0 && (
                                                    <div className="px-4 py-8 text-center text-xs font-medium text-surface-400">
                                                        No cities found matching "{citySearch}"
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {/* Use Current Location Shortcut */}
                                                <button
                                                    onClick={() => {
                                                        if (location?.city) toggleCity(location.city);
                                                    }}
                                                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors border-b border-surface-50 group"
                                                >
                                                    <div className="text-primary">
                                                        <MapPin size={16} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-primary uppercase tracking-widest">
                                                            {location?.source === 'browser' ? 'Live Location' : 'Detect Current Location'}
                                                        </p>
                                                        <p className="text-sm font-bold text-surface-900 group-hover:text-primary transition-colors">
                                                            {location?.city || (location ? 'Location detected' : 'Detecting...')}
                                                        </p>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => { setSelectedCities(['Worldwide']); localStorage.setItem('selectedCities', JSON.stringify(['Worldwide'])); window.dispatchEvent(new Event('cityChange')); setIsCityDropdownOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between border-b border-surface-50 ${selectedCities.includes('Worldwide') || selectedCities.length === 0 ? 'text-primary bg-primary/5' : 'text-[#333333] hover:bg-surface-50'}`}
                                                >
                                                    Worldwide (All Cities)
                                                    {(selectedCities.includes('Worldwide') || selectedCities.length === 0) && (
                                                        <Check size={16} strokeWidth={3} className="text-primary" />
                                                    )}
                                                </button>

                                                {/* Recently Selected Cities */}
                                                {recentCities.length > 0 && (
                                                    <div className="py-2">
                                                        <div className="px-4 py-1 text-[10px] font-black tracking-widest text-surface-400 uppercase">Recent</div>
                                                        {recentCities.map((city) => (
                                                            <button
                                                                key={city}
                                                                onClick={() => toggleCity(city)}
                                                                className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors flex items-center justify-between ${selectedCities.includes(city) ? 'text-primary bg-primary/5' : 'text-[#333333] hover:bg-surface-50 border-white'}`}
                                                            >
                                                                {city}
                                                                {selectedCities.includes(city) && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>


                        <Link
                            href="/submit-event"
                            className="relative px-6 py-2.5 bg-surface-50 text-primary text-[14px] font-black rounded-lg hover:bg-surface-100 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 group overflow-hidden hidden sm:block"
                        >
                            <span className="relative z-10">List Your Show</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </Link>

                        {/* Mobile Search Toggle */}
                        <button className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10  transition-all">
                            <Search size={22} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lower Header: Navigation Section - More Air, Refined items */}
            <nav className="bg-white border-t border-surface-100 hidden md:block relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
                    <ul className="flex items-center gap-8 h-full">
                        {['Events'].map((item) => (
                            <li key={item} className="h-full">
                                <Link href={`/${item.toLowerCase()}`} className="relative h-full flex items-center text-[13px] font-bold text-[#333333] hover:text-primary transition-all group">
                                    {item}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                </div>
            </nav>

            <style jsx>{`
                @keyframes sweep {
                    0% { transform: translateX(0) skewX(-12deg); }
                    100% { transform: translateX(1000%) skewX(-12deg); }
                }
            `}</style>
        </header>
    );
};

export default Header;

