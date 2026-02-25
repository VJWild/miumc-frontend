import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
// Importamos el hook del contexto para mostrar los datos del usuario real en la barra superior
import { usePensum } from '../../context/PensumContext';

const Topbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    // Obtenemos el objeto user del contexto global
    const { user } = usePensum();

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex justify-between items-center px-4 lg:px-8 shadow-sm z-30 shrink-0">

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-blue-950 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden md:flex items-center relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input
                        type="text"
                        placeholder="Buscar asignatura..."
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-gray-200 pl-3 md:pl-6">
                    <div className="hidden sm:block text-right">
                        {/* Mostramos el nombre y código del usuario real */}
                        <p className="text-sm font-bold text-blue-950 leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{user.code}</p>
                    </div>
                    {/* El avatar ahora también es dinámico */}
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:bg-blue-700 transition-colors uppercase">
                        {user.avatar}
                    </div>
                </div>
            </div>

        </header>
    );
};

export default Topbar;