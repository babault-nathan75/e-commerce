import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

export default function DashboardLayout({ children, isAdmin }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar isAdmin={isAdmin} />
      </div>

      {/* Sidebar mobile */}
      <MobileSidebar isAdmin={isAdmin} />

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
