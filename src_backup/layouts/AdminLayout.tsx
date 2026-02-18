import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col ml-72 h-screen">
        <AdminHeader />
        <main className="flex-1 p-10 overflow-auto scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
