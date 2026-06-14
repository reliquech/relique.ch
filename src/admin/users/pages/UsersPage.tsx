"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usersService, type UserRow } from "@/admin/users/services/usersService";
import { useProfile } from "@/admin/users/hooks/useProfile";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";

export default function UsersPage() {
  const { role, userId, loading: profileLoading } = useProfile();
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersService.list();
      setItems(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
  }, [role]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    try {
      setInviting(true);
      await usersService.invite({ email: inviteEmail.trim(), display_name: inviteName.trim() || undefined });
      toast.success("Invite sent");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (id: string, nextRole: "admin" | "editor" | "viewer") => {
    if (userId && id === userId && nextRole !== "admin") {
      toast.error("You cannot remove your own admin access.");
      return;
    }
    try {
      const updated = await usersService.updateRole(id, nextRole);
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const columns = [
    { header: "Name", accessor: "display_name", render: (r: UserRow) => <span className="font-semibold text-white">{r.display_name ?? "—"}</span> },
    { header: "Email", accessor: "email", render: (r: UserRow) => <span className="text-gray-300">{r.email ?? "—"}</span> },
    {
      header: "Role",
      accessor: "role",
      render: (r: UserRow) => (
        <select
          value={r.role}
          onChange={(e) => handleRoleChange(r.id, e.target.value as "admin" | "editor" | "viewer")}
          disabled={userId === r.id}
          className="bg-surface border border-border rounded-lg px-2 py-1 text-sm text-white"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      ),
    },
    { header: "Created", accessor: "created_at", render: (r: UserRow) => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  if (profileLoading) {
    return <AdminLoadingState />;
  }

  if (role !== "admin") {
    return <ErrorState message="You do not have access to manage users." />;
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Users"
          children={
            <Button onClick={() => setInviteOpen(true)}>Invite User</Button>
          }
        />
        {error ? (
          <ErrorState message={error} onRetry={fetchUsers} />
        ) : loading ? (
          <AdminLoadingState />
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </div>

      <FormDialog open={inviteOpen} onOpenChange={setInviteOpen} title="Invite User">
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <Label>Display name</Label>
            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setInviteOpen(false)} type="button">
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? "Inviting..." : "Send invite"}
            </Button>
          </div>
        </div>
      </FormDialog>
    </>
  );
}
