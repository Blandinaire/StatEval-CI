import { useState } from "react";

import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen w-full bg-gray-100">
            {/* =====================================================
                OVERLAY MOBILE
            ===================================================== */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Fermer le menu"
                    onClick={closeSidebar}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            {/* =====================================================
                SIDEBAR
                MOBILE  : drawer
                DESKTOP : sidebar fixe
            ===================================================== */}
            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={closeSidebar}
            />

            {/* =====================================================
                CONTENU PRINCIPAL
            ===================================================== */}
            <div className="min-h-screen w-full min-w-0 lg:pl-72">
                {/* =================================================
                    HEADER
                ================================================= */}
                <div className="sticky top-0 z-30">
                    <Header
                        onMenuClick={() =>
                            setSidebarOpen((previous) => !previous)
                        }
                    />
                </div>

                {/* =================================================
                    CONTENU DES PAGES
                ================================================= */}
                <main className="w-full min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}