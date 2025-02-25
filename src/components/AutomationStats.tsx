export function AutomationStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-card p-6">
        <div className="text-3xl font-bold">0</div>
        <div className="text-sm text-muted-foreground">Contacts</div>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <div className="text-3xl font-bold">0</div>
        <div className="text-sm text-muted-foreground">Link Clicks</div>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <div className="text-3xl font-bold">1</div>
        <div className="text-sm text-muted-foreground">Active Automations</div>
      </div>
    </div>
  );
}
