import StatusBadge from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <StatusBadge status="started" />
      <StatusBadge status="complete" />
      <StatusBadge status="error" />
      <StatusBadge status="waiting" />
    </div>
  );
}
