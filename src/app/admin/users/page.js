import AdminUsersList from "./ui/AdminUsersList";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Utilisateurs (Admin)</h1>
      <div className="mt-4">
        <AdminUsersList />
      </div>
    </div>
  );
}