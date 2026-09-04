import { RotateCcw } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  key: string;
  label: string;
  type: "select" | "date" | "text";
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function FilterPanel({
  fields,
  values,
  onChange,
  onReset,
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(values).some((v) => v !== "");

  return (
    <div className="glass-light flex flex-wrap items-end gap-3 rounded-xl px-4 py-3">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground/70">
            {field.label}
          </label>
          {field.type === "select" ? (
            <select
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            >
              <option value="">{field.placeholder ?? "All"}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "date" ? (
            <input
              type="date"
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f79d00]/30 focus:border-[#f79d00]/50 transition-colors"
            />
          )}
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  );
}
