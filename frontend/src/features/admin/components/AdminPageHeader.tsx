import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  const words = title.split(" ");
  const accentWord = words.pop() ?? "";
  const baseWords = words.join(" ");

  return (
    <div className="reveal mb-10">
      <p className="font-heading mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#f79d00]/70">
        {subtitle}
      </p>
      <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
        {baseWords ? `${baseWords} ` : ""}
        <span className="text-gradient">{accentWord}</span>
      </h1>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
