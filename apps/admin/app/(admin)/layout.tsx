import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from './_components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('njiani_admin_token')?.value;
  if (!token) redirect('/login');

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
