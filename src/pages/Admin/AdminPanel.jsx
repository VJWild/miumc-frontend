import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Search, ShieldCheck, Edit3, CheckCircle,
    Plus, ArrowLeft, GraduationCap, UserCheck, Shield,
    ChevronDown, ChevronUp, Save, Trash2, Phone, Mail,
    UserCog, X, UserMinus, Briefcase, BookOpen, ChevronRight, Loader2
} from 'lucide-react';

import { usePensum } from '../../context/PensumContext';

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Estados para la edición de expedientes (materias por semestre)
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRecords, setUserRecords] = useState(new Set());
    const [allSubjects, setAllSubjects] = useState([]);
    const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());

    // Estados para la edición de perfiles de usuario
    const [editingUser, setEditingUser] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const { user: currentUser, syncGlobalData } = usePensum();

    useEffect(() => {
        fetchUsers();
    }, []);

    // 🌟 PROTECCIÓN: Aseguramos que 'data' sea siempre un arreglo
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageRecords = async (user) => {
        setIsUpdating(true);
        try {
            const specId = user?.specialization_id || 1;

            const subjectsResponse = await fetch(`http://localhost:5000/api/subjects/${specId}`);
            if(subjectsResponse.ok) {
                const subjectsData = await subjectsResponse.json();
                // 🌟 PROTECCIÓN: Aseguramos que sea un arreglo
                setAllSubjects(Array.isArray(subjectsData) ? subjectsData : []);
            } else {
                setAllSubjects([]);
            }

            const progressResponse = await fetch(`http://localhost:5000/api/progress/${user?.student_code}`);
            if(progressResponse.ok) {
                const progressData = await progressResponse.json();
                // 🌟 PROTECCIÓN: Aseguramos que sea un arreglo para evitar que el Set() crashee
                setUserRecords(new Set(Array.isArray(progressData) ? progressData : []));
            } else {
                setUserRecords(new Set());
            }

            setSelectedUser(user);
        } catch (err) {
            console.error("Error al cargar datos del expediente:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveRecords = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/update-records-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    approvedSubjectCodes: Array.from(userRecords)
                })
            });
            if (response.ok) {
                if (syncGlobalData) syncGlobalData(selectedUser.student_code, Array.from(userRecords));
                setSelectedUser(null);
            }
        } catch (err) {
            console.error("Error al guardar récord:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`¿Seguro que deseas eliminar a ${name}? Esta acción es irreversible.`)) return;
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });
            if (response.ok) {
                setEditingUser(null);
                fetchUsers();
            }
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleSemester = (sem) => {
        const newSet = new Set(collapsedSemesters);
        if (newSet.has(sem)) newSet.delete(sem);
        else newSet.add(sem);
        setCollapsedSemesters(newSet);
    };

    // 🌟 PROTECCIÓN: Prevenir errores de iteración
    const subjectsBySemester = useMemo(() => {
        const groups = {};
        if (Array.isArray(allSubjects)) {
            allSubjects.forEach(sub => {
                if (!sub || !sub.semester) return;
                if (!groups[sub.semester]) groups[sub.semester] = [];
                groups[sub.semester].push(sub);
            });
        }
        return groups;
    }, [allSubjects]);

    // 🌟 PROTECCIÓN: Evitar llamadas a toLowerCase() en variables nulas
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];
        const term = (searchTerm || '').toLowerCase();
        return users.filter(u => {
            const fullName = (u?.full_name || '').toLowerCase();
            const studentCode = (u?.student_code || '').toLowerCase();
            return fullName.includes(term) || studentCode.includes(term);
        });
    }, [users, searchTerm]);

    if (isLoading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center justify-center h-full">
            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="font-black text-blue-900 uppercase tracking-widest text-xl italic">Sincronizando Comandancia...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 w-full max-w-full overflow-hidden">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-blue-950 flex items-center gap-3 italic uppercase tracking-tighter">
                        <ShieldCheck className="text-emerald-500" size={32} /> Administrador
                    </h2>
                    <p className="text-gray-500 font-medium text-sm italic">Lleva el control sobre tu población estudiantil</p>
                </div>
            </div>

            {!selectedUser ? (
                <div className="space-y-4 w-full">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar cadete por nombre o código..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-blue-950"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">

                        <div className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600/10 p-2 rounded-full animate-bounce pointer-events-none z-10 backdrop-blur-sm shadow-sm">
                            <ChevronRight size={16} className="text-blue-600" />
                        </div>

                        <div className="overflow-x-auto touch-pan-x custom-scrollbar-horizontal w-full">
                            <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                                <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Cadete</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Carrera y Mención</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Contacto</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Rol</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${u.role === 'admin' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                                                    {u.role === 'admin' ? <Shield size={18}/> : (u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-blue-950 leading-tight">{u.full_name || 'Sin Nombre'}</p>
                                                    <p className="text-[10px] font-mono text-gray-400 font-bold uppercase">{u.student_code || '---'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                                                    <Briefcase size={12} className="text-blue-400"/> {u.career_name || 'Sin Carrera'}
                                                </p>
                                                <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                                                    {u.mencion_name || 'Ciclo Básico'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-600 flex items-center gap-2 font-medium"><Mail size={12} className="text-gray-400"/> {u.email || 'N/A'}</p>
                                                <p className="text-xs text-gray-600 flex items-center gap-2 font-medium"><Phone size={12} className="text-emerald-500"/> {u.phone || 'Sin teléfono'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role || 'cadete'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingUser(u)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar Perfil">
                                                    <UserCog size={18} />
                                                </button>
                                                <button onClick={() => handleManageRecords(u)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Gestionar Notas">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id, u.full_name)}
                                                    disabled={u.student_code === currentUser?.student_code}
                                                    className={`p-2 rounded-lg transition-colors ${u.student_code === currentUser?.student_code ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-100'}`}
                                                    title="Eliminar Usuario"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No se encontraron resultados en la base de datos.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-right-4 space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
                    <div className="shrink-0 space-y-4">
                        <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-colors group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver a la lista
                        </button>
                        <div className="bg-blue-950 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
                            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-3xl font-black italic tracking-tight">{selectedUser?.full_name || 'Cadete'}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="opacity-80 text-sm font-medium uppercase tracking-widest">{selectedUser?.student_code || '---'}</p>
                                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                                        <p className="text-blue-400 text-sm font-bold">{selectedUser?.mencion_name || 'Ciclo Básico'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md text-center border border-white/10">
                                        <p className="text-[10px] font-black text-blue-300 uppercase">Aprobadas</p>
                                        <p className="text-2xl font-black text-emerald-400">{userRecords.size}</p>
                                    </div>
                                    <button
                                        onClick={handleSaveRecords}
                                        disabled={isUpdating}
                                        className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-400 transition-all flex items-center gap-2 uppercase shrink-0"
                                    >
                                        {isUpdating ? <Loader2 size={22} className="animate-spin" /> : <Save size={22}/>}
                                        {isUpdating ? 'Guardando...' : 'Confirmar Récord'}
                                    </button>
                                </div>
                            </div>
                            <GraduationCap size={150} className="absolute -right-10 -bottom-10 text-white/5 rotate-12 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-10">
                        {ROMANOS.map((rom, index) => {
                            const numSemestre = index + 1;
                            const materiasSemestre = subjectsBySemester[numSemestre];
                            if (!materiasSemestre || materiasSemestre.length === 0) return null;

                            const isCollapsed = collapsedSemesters.has(numSemestre);

                            return (
                                <div key={rom} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                                    <div
                                        onClick={() => toggleSemester(numSemestre)}
                                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4 rounded-xl select-none"
                                    >
                                        <h3 className="text-sm font-black text-blue-900 tracking-widest uppercase pl-3 border-l-4 border-blue-500">Semestre {rom}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 font-black bg-gray-100 px-3 py-1 rounded-lg">{materiasSemestre.length} Materias</span>
                                            <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                                                <ChevronUp size={20} className="text-blue-500"/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`grid transition-all duration-300 ease-in-out ${isCollapsed ? 'grid-rows-[0fr] opacity-0 overflow-hidden' : 'grid-rows-[1fr] opacity-100'}`}>
                                        <div className="overflow-hidden">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 pt-2">
                                                {materiasSemestre.map(sub => {
                                                    const isApproved = userRecords.has(sub.code);
                                                    return (
                                                        <div
                                                            key={sub.code}
                                                            onClick={() => {
                                                                const n = new Set(userRecords);
                                                                if(n.has(sub.code)) n.delete(sub.code); else n.add(sub.code);
                                                                setUserRecords(n);
                                                            }}
                                                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                                                                isApproved ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-gray-50 border-transparent hover:border-blue-300'
                                                            }`}
                                                        >
                                                            <div className="flex-1 pr-3">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{sub.code}</p>
                                                                <h4 className={`font-bold text-sm leading-tight transition-colors ${
                                                                    isApproved ? 'text-emerald-900' : 'text-blue-950 group-hover:text-blue-700'
                                                                }`}>{sub.name}</h4>
                                                            </div>
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                                                                isApproved ? 'bg-emerald-500 text-white shadow-md scale-110' : 'bg-white text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 border border-gray-100'
                                                            }`}>
                                                                {isApproved ? <CheckCircle size={20} /> : <Plus size={20} />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal de Edición de Usuario */}
            {editingUser && (
                <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Editar Perfil</h3>
                                <p className="text-blue-100 text-xs font-bold uppercase">{editingUser.student_code}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X/></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-950"
                                        value={editingUser.full_name || ''}
                                        onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Rol del Usuario</label>
                                        <select
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold cursor-pointer text-blue-950"
                                            value={editingUser.role || 'cadete'}
                                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        >
                                            <option value="cadete">CADETE</option>
                                            <option value="admin">ADMIN</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Carrera (ID)</label>
                                        <select
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold cursor-pointer text-blue-950"
                                            value={editingUser.career_id || 1}
                                            onChange={(e) => setEditingUser({...editingUser, career_id: e.target.value})}
                                        >
                                            <option value="1">ING. INFORMÁTICA</option>
                                            <option value="2">ING. MARÍTIMA</option>
                                            <option value="3">ING. AMBIENTAL</option>
                                            <option value="4">ADMINISTRACIÓN</option>
                                            <option value="5">TURISMO</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-950"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all uppercase flex justify-center items-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : null}
                                {isUpdating ? 'ACTUALIZANDO...' : 'CONFIRMAR CAMBIOS'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .touch-pan-x {
                    touch-action: pan-x;
                    -webkit-overflow-scrolling: touch;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;