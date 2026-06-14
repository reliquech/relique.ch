"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/admin/users/hooks/useProfile";
import type { NotificationPreferences } from "@/lib/types/admin";
import { notificationPreferencesService } from "@/admin/notifications/services/notificationPreferencesService";

export default function ProfilePage() {
  const { profile, userEmail, loading, error, refresh } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [prefSaving, setPrefSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    notificationPreferencesService
      .get()
      .then((data) => {
        if (mounted) setPreferences(data);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    if (!profile?.id) {
      toast.error("Profile not loaded");
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        // @ts-expect-error - Supabase inferred update type can be never when Table name is narrow
        .update({
          display_name: displayName.trim(),
          phone: phone.trim() || null,
        })
        .eq("id", profile.id);

      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success("Profile updated successfully");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async (next: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    try {
      setPrefSaving(true);
      const updated = await notificationPreferencesService.update({
        in_app_enabled: next.in_app_enabled ?? preferences.in_app_enabled,
        email_enabled: next.email_enabled ?? preferences.email_enabled,
        type_preferences: next.type_preferences ?? preferences.type_preferences ?? null,
      });
      setPreferences(updated);
      toast.success("Notification preferences updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update preferences");
    } finally {
      setPrefSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-destructive mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Update your display name and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Add a phone number"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{userEmail || "N/A"}</p>
          </div>
          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you receive CRM alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!preferences ? (
            <p className="text-sm text-muted-foreground">Loading preferences...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">In-app notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Show alerts in the notification center
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.in_app_enabled}
                  onChange={(e) => updatePreferences({ in_app_enabled: e.target.checked })}
                  disabled={prefSaving}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Send alerts to your email</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={(e) => updatePreferences({ email_enabled: e.target.checked })}
                  disabled={prefSaving}
                  className="h-4 w-4"
                />
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Alert types
                </p>
                {[
                  { key: "lead_stale", label: "Stale leads" },
                  { key: "deal_stale", label: "Stale deals" },
                  { key: "message_unread", label: "Unread messages" },
                ].map((type) => {
                  const enabled = preferences.type_preferences
                    ? preferences.type_preferences[type.key] !== false
                    : true;
                  return (
                    <div key={type.key} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">{type.label}</span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          const nextPrefs = {
                            ...(preferences.type_preferences ?? {}),
                            [type.key]: e.target.checked,
                          };
                          updatePreferences({ type_preferences: nextPrefs });
                        }}
                        disabled={prefSaving}
                        className="h-4 w-4"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
