import { redirect } from "next/navigation";

export default function LegacyWriteRedirect() {
  redirect("/admin/posts/new");
}
