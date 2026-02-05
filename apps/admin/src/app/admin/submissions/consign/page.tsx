import { redirect } from "next/navigation";

export default function SubmissionsConsignPage() {
  redirect("/admin/submissions?tab=consignments");
}
