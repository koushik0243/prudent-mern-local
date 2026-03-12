// app/(admin)/layout.js
import AdminHeader from "@/Components/Admin/Header/Header.js";
import AdminSidebar from "@/Components/Admin/Sidebar/Sidebar.js";
import AdminFooter from "@/Components/Admin/Footer/Footer.js";
import AuthWrapper from "@/Components/Admin/AuthWrapper/AuthWrapper.js";
import { SidebarProvider } from "@/contexts/SidebarContext";
import './admin.css';

import "@/assets/css/style.css";
import "@/assets/css/bootstrap.min.css";
import 'font-awesome/css/font-awesome.min.css';

export const metadata = {
    title: {
        default: 'Backend - Admin Dashboard',
        template: '%s',
    },
};

export default function AdminLayout({ children }) {
    return (
        <AuthWrapper>
            <SidebarProvider>
                <AdminHeader />

                <div className="wrapper" id="wrapper">
                    <section className="Dashboard-section">
                        <div className="container-fluid">
                            <div className="row">
                                <AdminSidebar />
                                {children}

                            </div>
                        </div>
                    </section>
                </div>

                <AdminFooter />
            </SidebarProvider>
        </AuthWrapper>
    );
}
