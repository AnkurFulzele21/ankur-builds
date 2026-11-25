import { AdminShell } from "@/components/AdminShell";
import { PostEditor } from "@/components/PostEditor";

export default function NewPostPage() {
  return (
    <AdminShell title="New Newsletter Issue">
      <PostEditor />
    </AdminShell>
  );
}
