// client/src/components/HistoryPanel.tsx
import useSWR from "swr";
import { Link, useLocation } from "wouter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HistoryPanel() {
  const { data, error } = useSWR("/api/history", fetcher, {
    refreshInterval: 5000,
  });
  const [location] = useLocation();

  if (error)
    return (
      <div className="p-3 text-sm text-red-500">History failed to load.</div>
    );
  const items = data?.items ?? [];

  return (
    <div className="p-3 space-y-2">
      <div className="text-sm font-semibold opacity-70">Recent Analyses</div>
      {items.length === 0 && (
        <div className="text-xs opacity-60">No analyses yet.</div>
      )}
      {items.map((it: any) => {
        const href = `/property/${it.super_id}`;
        const active = location === href;
        return (
          <Link key={it.super_id} href={href}>
            <a
              className={`flex items-center gap-3 p-2 rounded hover:bg-muted ${active ? "bg-muted" : ""}`}
            >
              {it.card?.thumb ? (
                <img
                  src={it.card.thumb}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted/50" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm">
                  {it.card?.title ?? it.super_id}
                </div>
                <div className="text-xs opacity-60">
                  {it.card?.price ? `£${it.card.price.toLocaleString()}` : ""} ·{" "}
                  {it.card?.beds ?? "?"} bed · {it.card?.baths ?? "?"} bath
                </div>
                <div className="text-[10px] uppercase opacity-60">
                  {it.status}
                </div>
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
