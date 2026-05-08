import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function AdminHome() {
  const user = await getCurrentUser();
    if (!user || user.role !== 'admin') redirect('/');
      redirect('/admin/users');
      }
      
