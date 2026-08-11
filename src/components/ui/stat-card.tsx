import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
};

export function StatCard({
  label,
  value,
  helper,
  trend,
}: StatCardProps) {
  return (
    <article className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm")}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {trend ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {trend}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
    </article>
  );
}
