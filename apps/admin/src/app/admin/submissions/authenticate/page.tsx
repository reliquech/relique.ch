import { redirect } from "next/navigation";

export default function SubmissionsAuthenticatePage() {
  redirect("/admin/submissions?tab=verifications");
}
