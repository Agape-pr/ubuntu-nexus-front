"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import type { AccountUser, PermissionInfo } from "@/lib/admin/types";
import { RequirePermission } from "@/components/admin/AdminShell";
import {
  buttonClass, CenteredSpinner, dangerButtonClass, EmptyState, ErrorNote, formatDateTime, ghostButtonClass,
  inputClass, PageHeader, Panel, Pill,
} from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function PermissionPicker({ catalogue, value, onChange }: { catalogue: PermissionInfo[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((p) => p !== id) : [...value, id]);
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium">What can this admin access?</legend>
      {catalogue.map((p) => (
        <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/50">
          <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" checked={value.includes(p.id)} onChange={() => toggle(p.id)} />
          <span className="font-medium">{p.label}</span>
        </label>
      ))}
      <p className="text-xs text-muted-foreground">Only super admins can manage admin accounts. Changes apply within about 10 minutes of the admin&apos;s next activity.</p>
    </fieldset>
  );
}

function CreateAdminDialog({ open, onClose, catalogue }: { open: boolean; onClose: () => void; catalogue: PermissionInfo[] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", phone_number: "" });
  const [perms, setPerms] = useState<string[]>([]);

  const create = useMutation({
    mutationFn: () => adminApi.createAdmin({ ...form, phone_number: form.phone_number || undefined, admin_permissions: perms }),
    onSuccess: (a) => {
      toast.success(`Admin ${a.email} created`);
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
      setForm({ email: "", password: "", phone_number: "" });
      setPerms([]);
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add an admin</DialogTitle>
          <DialogDescription>They sign in at this console with email, password and an emailed code.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <label className="block text-sm font-medium">Email
            <input className={`${inputClass} mt-1`} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">Temporary password
            <input className={`${inputClass} mt-1`} type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">Phone (optional)
            <input className={`${inputClass} mt-1`} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </label>
          <PermissionPicker catalogue={catalogue} value={perms} onChange={setPerms} />
          {create.isError && <ErrorNote error={create.error} />}
          <div className="flex justify-end gap-2">
            <button type="button" className={ghostButtonClass} onClick={onClose}>Cancel</button>
            <button className={buttonClass} disabled={create.isPending}>Create admin</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPermissionsDialog({ admin, catalogue, onClose }: { admin: AccountUser | null; catalogue: PermissionInfo[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [perms, setPerms] = useState<string[]>([]);
  const [loadedFor, setLoadedFor] = useState<number | null>(null);
  if (admin && loadedFor !== admin.id) { setLoadedFor(admin.id); setPerms(admin.admin_permissions); }

  const save = useMutation({
    mutationFn: () => adminApi.updateAdmin(admin!.id, { admin_permissions: perms }),
    onSuccess: () => {
      toast.success("Permissions updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
      setLoadedFor(null);
      onClose();
    },
  });

  return (
    <Dialog open={!!admin} onOpenChange={(o) => { if (!o) { setLoadedFor(null); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permissions for {admin?.email}</DialogTitle>
          <DialogDescription>Choose exactly what this admin can see and do.</DialogDescription>
        </DialogHeader>
        <PermissionPicker catalogue={catalogue} value={perms} onChange={setPerms} />
        {save.isError && <ErrorNote error={save.error} />}
        <div className="flex justify-end gap-2">
          <button className={ghostButtonClass} onClick={() => { setLoadedFor(null); onClose(); }}>Cancel</button>
          <button className={buttonClass} disabled={save.isPending} onClick={() => save.mutate()}>Save</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminsManager() {
  const { user: me } = useAdminSession();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AccountUser | null>(null);
  const [removing, setRemoving] = useState<AccountUser | null>(null);

  const admins = useQuery({ queryKey: ["admin", "admins"], queryFn: adminApi.admins });
  const catalogue = useQuery({ queryKey: ["admin", "permissions"], queryFn: adminApi.permissions, staleTime: Infinity });
  const labels = Object.fromEntries((catalogue.data ?? []).map((p) => [p.id, p.label]));
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });

  const setActive = useMutation({
    mutationFn: (a: AccountUser) => adminApi.updateAdmin(a.id, { is_active: !a.is_active }),
    onSuccess: (a) => { toast.success(`${a.email} ${a.is_active ? "reactivated" : "deactivated"}`); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (a: AccountUser) => adminApi.deleteAdmin(a.id),
    onSuccess: () => { toast.success("Admin removed"); setRemoving(null); refresh(); },
    onError: (e: Error) => { toast.error(e.message); setRemoving(null); },
  });

  return (
    <>
      <PageHeader
        title="Admins"
        description="Create admins and decide what each one can access. Super admins always have full access."
        actions={<button className={buttonClass} onClick={() => setCreating(true)}><Plus size={16} /> Add admin</button>}
      />
      <Panel>
        {admins.isLoading ? <CenteredSpinner /> : admins.isError ? <div className="p-4"><ErrorNote error={admins.error} /></div> : !admins.data?.length ? (
          <EmptyState title="No admins yet" />
        ) : (
          <ul className="divide-y divide-border">
            {admins.data.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {a.email}
                    {a.is_superuser && <Pill tone="violet">Super admin</Pill>}
                    {!a.is_active && <Pill tone="red">Inactive</Pill>}
                    {a.id === me?.id && <Pill tone="gray">You</Pill>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.is_superuser ? <span className="text-xs text-muted-foreground">Full access</span> : a.admin_permissions.length ? a.admin_permissions.map((p) => (
                      <Pill key={p} tone="blue">{labels[p] ?? p}</Pill>
                    )) : <span className="text-xs text-muted-foreground">No permissions yet</span>}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Last sign-in: {formatDateTime(a.last_login)}</p>
                </div>
                {!a.is_superuser && a.id !== me?.id && (
                  <div className="flex gap-2">
                    <button className={`${ghostButtonClass} h-8 px-3`} onClick={() => setEditing(a)}>Permissions</button>
                    <button className={`${ghostButtonClass} h-8 px-3`} disabled={setActive.isPending} onClick={() => setActive.mutate(a)}>{a.is_active ? "Deactivate" : "Reactivate"}</button>
                    <button className={`${ghostButtonClass} h-8 px-3 text-destructive`} onClick={() => setRemoving(a)}>Remove</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <CreateAdminDialog open={creating} onClose={() => setCreating(false)} catalogue={catalogue.data ?? []} />
      <EditPermissionsDialog admin={editing} catalogue={catalogue.data ?? []} onClose={() => setEditing(null)} />

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.email}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the admin account. Their past actions stay in the audit log. To keep the account but block access, deactivate it instead.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={ghostButtonClass}>Cancel</AlertDialogCancel>
            <AlertDialogAction className={dangerButtonClass} disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)}>Remove admin</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AdminAdminsPage() {
  return <RequirePermission superOnly><AdminsManager /></RequirePermission>;
}
