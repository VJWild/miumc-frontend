// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    // Cierra el sidebar en móviles cuando se cambia de ruta
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-gray-900 selection:bg-blue-200 overflow-hidden">
            {/* Overlay para móviles */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-blue-950/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isSidebarOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                <Topbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                {/* Aquí se inyectan las vistas dinámicas (Dashboard, Enrollment, etc.) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative custom-scrollbar bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;