"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface FilterOption {
    label: string;
    value: string;
}

interface SearchAndFiltersProps {
    placeholder?: string;
    filterOptions?: FilterOption[];
    filterParamName?: string; // e.g., 'tipo' ou 'status'
}

export default function SearchAndFilters({
    placeholder = "Pesquisar...",
    filterOptions = [],
    filterParamName = "status"
}: SearchAndFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [activeFilter, setActiveFilter] = useState(searchParams.get(filterParamName) || "Todos");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set("search", searchTerm);
            } else {
                params.delete("search");
            }
            params.set("page", "1"); // Reset page on search
            router.push(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router, searchParams]);

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "Todos") {
            params.delete(filterParamName);
        } else {
            params.set(filterParamName, value);
        }
        params.set("page", "1"); // Reset page on filter
        setActiveFilter(value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="glass-panel p-2 flex flex-col md:flex-row gap-2 items-center justify-between border border-white/5 backdrop-blur-xl bg-navy/20">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-navy/40 border border-white/10 rounded-none focus:outline-none focus:border-amber/50 focus:bg-white/10 font-mono text-xs text-white placeholder:text-white/20 transition-all uppercase tracking-wider"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1 w-full md:w-auto">
                <button 
                    onClick={() => handleFilterChange("Todos")}
                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${
                        activeFilter === 'Todos' 
                            ? 'bg-amber text-navy shadow-glow scale-[1.02]' 
                            : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                    Todos
                </button>
                {filterOptions.map((option) => (
                    <button 
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none flex items-center justify-center gap-2 ${
                            activeFilter === option.value 
                                ? 'bg-amber text-navy shadow-glow scale-[1.02]' 
                                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        {activeFilter !== option.value && <Filter className="h-3.5 w-3.5" />}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
