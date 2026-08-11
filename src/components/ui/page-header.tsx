import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
      {eyebrow ? (
        <p className="text-sm font-medium text-slate-500">
          {eyebrow}
        </p>
      ) : null}
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </header>
  );
}
