"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/api";
import { RequirePermission } from "@/components/admin/AdminShell";
import { CenteredSpinner, EmptyState, ErrorNote, formatDateTime, inputClass, PageHeader, Pager, Panel, useDebounced } from "@/components/admin/ui";

const PAGE_SIZE = 50;

function AuditTable() {
  const [action, setAction] = useState("");
  const [actorId, setActorId] = useState("");
  const [offset, setOffset] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const dAction = useDebounced(action);
  const dActor = useDebounced(actorId);

  const log = useQuery({
    queryKey: ["admin", "audit", { dAction, dActor, offset }],
    queryFn: () => adminApi.audit({ limit: PAGE_SIZE, offset, action: dAction, actor_id: dActor }),
    placeholderData: (prev) => prev,
  });

  return (
    <>
      <PageHeader title="Audit log" description="A permanent record of who did what, and when. Entries cannot be edited or deleted." />
      <Panel>
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <input className={`${inputClass} min-w-[200px] flex-1`} placeholder="Filter by action, e.g. payment or admin" value={action} onChange={(e) => { setAction(e.target.value); setOffset(0); }} />
          <input className={`${inputClass} w-40`} placeholder="Actor user ID" inputMode="numeric" value={actorId} onChange={(e) => { setActorId(e.target.value.replace(/\D/g, "")); setOffset(0); }} />
        </div>
        {log.isLoading ? <CenteredSpinner /> : log.isError ? <div className="p-4"><ErrorNote error={log.error} /></div> : !log.data?.results.length ? (
          <EmptyState title="No entries" hint="Nothing matches these filters yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Who</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">IP</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {log.data.results.map((e) => (
                  <Fragment key={e.id}>
                    <tr className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenId(openId === e.id ? null : e.id)}>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(e.created_at)}</td>
                      <td className="px-4 py-3">{e.actor_email || (e.actor_id ? `User ${e.actor_id}` : "—")}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{e.action}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.target_type ? `${e.target_type} ${e.target_id}` : "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.ip_address || "—"}</td>
                    </tr>
                    {openId === e.id && (
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="px-4 py-3">
                          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(e.metadata, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager total={log.data?.count ?? 0} pageSize={PAGE_SIZE} offset={offset} onChange={setOffset} />
      </Panel>
    </>
  );
}

export default function AdminAuditPage() {
  return <RequirePermission any={["view_audit_log"]}><AuditTable /></RequirePermission>;
}
