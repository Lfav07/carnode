import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
}: SearchBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  }

  return (
    <div className="glass-light flex items-center gap-3 rounded-xl px-4 py-3">
      <Search className="h-4 w-4 text-[#f79d00]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
      {onSearch && (
        <button
          onClick={onSearch}
          className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.10] hover:text-foreground"
        >
          Search
        </button>
      )}
    </div>
  );
}
