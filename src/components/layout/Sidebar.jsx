import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Book, Calendar, MessageSquare, Anchor, Power, ShieldCheck } from 'lucide-react';

// IMPORTACIÓN REAL AL CONTEXTO (Cero simulaciones)
import { usePensum } from '../../context/PensumContext';

const Sidebar = ({ isSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extraemos el objeto `user` y la función `logout` de tu contexto real
    const { logout, user } = usePensum();

    // Chivato de depuración para ver qué datos llegan a la barra lateral
    useEffect(() => {
        console.log("⚓ Datos del usuario leídos en Sidebar:", user);
    }, [user]);

    const handleLogout = () => {
        if (logout) logout();
        navigate('/auth');
    };

    // Rutas base visibles para TODOS los usuarios (Cadetes y Admins)
    const navItems = [
        { id: '/app', icon: User, label: 'Mi Tablero' },
        { id: '/app/inscripciones', icon: Book, label: 'Inscripción' },
        { id: '/app/horario', icon: Calendar, label: 'Mi Horario' },
        { id: '/app/aula-virtual', icon: MessageSquare, label: 'Aula Virtual' },
    ];

    /**
     * VERIFICACIÓN DE ROL:
     * Solo si el usuario existe, tiene la propiedad 'role',
     * y ese rol es estrictamente 'admin', inyectamos el botón del Panel de Administración.
     */
    if (user && user.role && String(user.role).toLowerCase() === 'admin') {
        navItems.push({
            id: '/app/admin-panel',
            icon: ShieldCheck,
            label: 'Panel Admin'
        });
    }

    return (
        <aside className={`h-screen bg-blue-950 text-white transition-all duration-500 ease-in-out flex flex-col shadow-2xl border-r border-blue-900 z-50
      fixed lg:sticky top-0 left-0 
      ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>

            {/* Encabezado con Logo */}
            <div className="h-20 flex items-center px-6 border-b border-blue-900/50 shrink-0 overflow-hidden">
                <div className={`flex items-center gap-3 w-full ${!isSidebarOpen && 'lg:justify-center'}`}>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-900 shadow-inner shrink-0 transform transition-transform hover:rotate-12">
                        <Anchor size={24} />
                    </div>
                    <span className={`font-black text-2xl tracking-tight truncate transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
            Mi<span className="text-blue-400 font-light">UMC</span>
          </span>
                </div>
            </div>

            {/* Navegación Dinámica */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {navItems.map(item => (
                    <Link
                        key={item.id}
                        to={item.id}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
              ${location.pathname === item.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-semibold'
                            : 'text-blue-300 hover:bg-blue-900/40 hover:text-white font-medium'
                        } ${!isSidebarOpen && 'lg:justify-center'}
              ${item.label === 'Panel Admin' ? 'border border-blue-400/20 bg-blue-900/20' : ''}`}
                    >
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                            <item.icon size={20} className={`${location.pathname === item.id ? 'scale-110' : 'transition-transform group-hover:scale-110'}`} />
                        </div>

                        <span className={`font-medium truncate transition-all duration-300 ease-in-out whitespace-nowrap
              ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              {item.label}
            </span>

                        {/* Distintivo visual exclusivo para el botón del Panel Admin */}
                        {isSidebarOpen && item.label === 'Panel Admin' && (
                            <span className="ml-auto bg-emerald-500 text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm">Admin</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Botón de Cierre de Sesión (Icono de Encendido) */}
            <div className="p-4 border-t border-blue-900/50 flex justify-center shrink-0">
                <button
                    onClick={handleLogout}
                    className="relative p-3 text-red-500 rounded-xl transition-all duration-300 group overflow-hidden hover:text-white"
                    title="Cerrar Sesión"
                >
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/15 transition-colors duration-300 rounded-xl border border-transparent group-hover:border-red-400"></div>
                    <Power size={24} className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;