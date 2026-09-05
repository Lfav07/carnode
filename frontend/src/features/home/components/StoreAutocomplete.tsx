import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchStores } from "@/features/stores/api/storesApi";
import type { StoreResponse } from "@/features/stores/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface StoreAutocompleteProps {
  value: StoreResponse | null;
  onChange: (store: StoreResponse | null) => void;
  error?: string;
}

export function StoreAutocomplete({
  value,
  onChange,
  error,
}: StoreAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value?.location.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(inputValue, 300);

  const { data: stores } = useQuery({
    queryKey: ["stores", "user", "search", debouncedSearch],
    queryFn: () => searchStores(debouncedSearch),
    enabled: isOpen && debouncedSearch.length >= 2,
    staleTime: 30000,
  });

  const results = useMemo(() => stores ?? [], [stores]);

  const selectStore = useCallback(
    (store: StoreResponse) => {
      onChange(store);
      setInputValue(store.location.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  const clearSelection = useCallback(() => {
    onChange(null);
    setInputValue("");
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          selectStore(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3.5 transition-colors focus-within:bg-white/[0.06] focus-within:ring-1",
          error
            ? "focus-within:ring-red-500/50 ring-1 ring-red-500/30"
            : "focus-within:ring-[#f79d00]/30",
        )}
      >
        <MapPin className="h-4 w-4 shrink-0 text-[#f79d00]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Where do you want to pick up?"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (value) onChange(null);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {!value && inputValue.length === 0 && (
          <Search className="h-4 w-4 shrink-0 text-muted-foreground/30" />
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-[#14141f] shadow-2xl shadow-black/40">
          {results.map((store, index) => (
            <li
              key={store.id}
              role="option"
              aria-selected={highlightedIndex === index}
              onMouseDown={() => selectStore(store)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors",
                highlightedIndex === index
                  ? "bg-[#f79d00]/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f79d00]/60" />
              <div>
                <p className="font-medium">{store.location.name}</p>
                <p className="text-xs text-muted-foreground/60">
                  {store.location.city}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && debouncedSearch.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#14141f] p-4 text-center text-sm text-muted-foreground/60 shadow-2xl shadow-black/40">
          No stores found
        </div>
      )}
    </div>
  );
}
