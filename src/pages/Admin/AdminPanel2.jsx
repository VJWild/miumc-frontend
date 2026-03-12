import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
    Users, Search, ShieldCheck, Edit3, CheckCircle,
    Plus, ArrowLeft, GraduationCap, UserCheck, Shield,
    ChevronDown, ChevronUp, Save, Trash2, Phone, Mail,
    UserCog, X, UserMinus, Briefcase, ChevronRight, Loader2,
    BookOpen, MapPin, Clock, FileText, Settings
} from 'lucide-react';

// ============================================================================
// ⚠️ NOTA PARA TU ENTORNO LOCAL (VS CODE):
// Para conectar con tu Backend real, borra el bloque "MOCK LOCAL" de abajo
// y usa esta importación:
// import { usePensum, API_BASE_URL } from '../../context/PensumContext';
// ============================================================================

// --- MOCK LOCAL PARA PREVISUALIZACIÓN EN CANVAS ---
const API_BASE_URL = 'http://localhost:8000/api';
const MockContext = createContext({
    user: { full_name: "Admin de Prueba", role: "admin", student_code: "ADM001" },
    syncGlobalData: () => {}
});
const usePensum = () => useContext(MockContext);

const MOCK_USERS = [
    { id: 901, full_name: "Prof. Alberto Martinez", student_code: "PROF-001", role: "profesor", career_name: "Ingeniería Marítima", phone: "0414-9876543", email: "amartinez@miumc.edu.ve", mencion_name: "Operaciones" },
    { id: 902, full_name: "Dra. María López", student_code: "COORD-001", role: "coordinador", admin_department: "Control de Estudios", phone: "0412-5555555", email: "mlopez@miumc.edu.ve", mencion_name: null },
    { id: 903, full_name: "Ing. Carlos Pérez", student_code: "PROF-002", role: "profesor", career_name: "Ingeniería Informática", phone: "0424-1112233", email: "cperez@miumc.edu.ve", mencion_name: "Redes y Telecomunicaciones" },
    { id: 904, full_name: "Lic. Ana Gómez", student_code: "DIR-001", role: "director", admin_department: "Planificación Académica", phone: "0416-9998877", email: "agomez@miumc.edu.ve", mencion_name: null },
    { id: 905, full_name: "TSU. José Ramírez", student_code: "ADMIN-001", role: "administrativo", admin_department: "Coordinación Docente", phone: "0412-3334455", email: "jramirez@miumc.edu.ve", mencion_name: null }
];
// --------------------------------------------------

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Estado para manejar las pestañas (Tabs)
    const [activeTab, setActiveTab] = useState('estudiantes'); // 'estudiantes', 'profesores', 'coordinacion'

    // Estados para la edición de expedientes (materias por semestre)
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRecords, setUserRecords] = useState(new Set());
    const [allSubjects, setAllSubjects] = useState([]);
    const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());

    // Estados para la edición de perfiles de usuario
    const [editingUser, setEditingUser] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // ESTADOS PARA MODALES ESTRUCTURALES
    const [showCreateProfModal, setShowCreateProfModal] = useState(false);
    const [showCreateCoordModal, setShowCreateCoordModal] = useState(false);

    // Modal de Asignación de Materias a Profesor
    const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Estados para selectores dinámicos
    const [careersList, setCareersList] = useState([]);
    const [specsList, setSpecsList] = useState([]);

    const { user: currentUser, syncGlobalData } = usePensum();

    useEffect(() => {
        fetchUsers();
        fetchCareers();
    }, []);

    // Efecto para buscar las menciones cuando se edita un usuario y cambia su carrera
    useEffect(() => {
        if (editingUser && editingUser.career_id) {
            fetchSpecializations(editingUser.career_id);
        }
    }, [editingUser?.career_id]);

    const fetchUsers = async () => {
        try {
            // 🌟 RUTA LARAVEL: Obtener todos los usuarios
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                const arrayData = Array.isArray(data) ? data : (data.data || []);
                // COMBINAMOS CON LOS MOCKS PARA QUE PUEDAS PREVISUALIZARLOS
                setUsers([...arrayData, ...MOCK_USERS]);
            } else {
                setUsers(MOCK_USERS);
            }
        } catch (err) {
            console.error("Error al obtener usuarios (usando mocks):", err);
            setUsers(MOCK_USERS);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCareers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/careers`, {
                headers: { 'Accept': 'application/json' }
            });
            if(response.ok) {
                const data = await response.json();
                setCareersList(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) { console.error(err); }
    };

    const fetchSpecializations = async (careerId) => {
        try {
            // 🌟 RUTA LARAVEL: Menciones por Carrera
            const response = await fetch(`${API_BASE_URL}/careers/${careerId}/specializations`, {
                headers: { 'Accept': 'application/json' }
            });
            if(response.ok) {
                const data = await response.json();
                setSpecsList(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) { console.error(err); }
    };

    const handleManageRecords = async (user) => {
        setIsUpdating(true);
        try {
            const specId = user?.specialization_id || 1;

            // 🌟 RUTA LARAVEL: Materias por Mención
            const subjectsResponse = await fetch(`${API_BASE_URL}/specializations/${specId}/subjects`, {
                headers: { 'Accept': 'application/json' }
            });
            if(subjectsResponse.ok) {
                const subjectsData = await subjectsResponse.json();
                const arrayData = Array.isArray(subjectsData) ? subjectsData : (subjectsData.data || []);
                setAllSubjects(arrayData);
            } else {
                setAllSubjects([]);
            }

            // Progreso del estudiante
            const progressResponse = await fetch(`${API_BASE_URL}/progress/${user?.student_code}`, {
                headers: { 'Accept': 'application/json' }
            });
            if(progressResponse.ok) {
                const progressData = await progressResponse.json();
                const arrayData = Array.isArray(progressData) ? progressData : (progressData.data || []);
                setUserRecords(new Set(arrayData));
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
            const response = await fetch(`${API_BASE_URL}/admin/update-records-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    approvedSubjectCodes: Array.from(userRecords)
                })
            });
            if (response.ok) {
                if (syncGlobalData) syncGlobalData(selectedUser.student_code, Array.from(userRecords));
                setSelectedUser(null);
            } else {
                alert('Error al guardar el récord académico.');
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
            // Prevenir eliminar los mock users en UI
            if(id > 900) {
                setUsers(users.filter(u => u.id !== id));
                return;
            }

            // 🌟 RUTA LARAVEL: Eliminar usuario
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== id));
            } else {
                alert('Hubo un error al intentar eliminar el usuario.');
            }
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const payload = {
            ...editingUser,
            career_id: editingUser.career_id || 1,
            specialization_id: editingUser.specialization_id || 1,
            phone: editingUser.phone || 'Sin teléfono'
        };

        try {
            // Mock users update local only
            if(editingUser.id > 900) {
                setUsers(users.map(u => u.id === editingUser.id ? payload : u));
                setEditingUser(null);
                setIsUpdating(false);
                return;
            }

            // 🌟 RUTA LARAVEL: Actualizar usuario
            const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setEditingUser(null);
                fetchUsers();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Verifica los datos enviados.'}`);
            }
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    // Abrir modal de asignación de profesor
    const openAssignSubjectModal = (prof) => {
        setSelectedTeacher(prof);
        setShowAssignSubjectModal(true);
    };

    const toggleSemester = (sem) => {
        const newSet = new Set(collapsedSemesters);
        if (newSet.has(sem)) newSet.delete(sem);
        else newSet.add(sem);
        setCollapsedSemesters(newSet);
    };

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

    // FILTRO ACTUALIZADO: Admins en Población Estudiantil
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];
        const term = (searchTerm || '').toLowerCase();

        return users.filter(u => {
            const fullName = (u?.full_name || '').toLowerCase();
            const studentCode = (u?.student_code || '').toLowerCase();
            const matchesSearch = fullName.includes(term) || studentCode.includes(term);
            const userRole = String(u.role).toLowerCase();

            // Lógica de Pestañas
            let matchesTab = false;
            if (activeTab === 'estudiantes') matchesTab = ['cadete', 'admin'].includes(userRole);
            else if (activeTab === 'profesores') matchesTab = userRole === 'profesor';
            else if (activeTab === 'coordinacion') matchesTab = ['coordinador', 'director', 'administrativo'].includes(userRole);

            return matchesSearch && matchesTab;
        });
    }, [users, searchTerm, activeTab]);

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
                    <p className="text-gray-500 font-medium text-sm italic">Lleva el control sobre tu población estudiantil y personal.</p>
                </div>
            </div>

            {!selectedUser ? (
                <div className="space-y-4 w-full">

                    {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
                    <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar-horizontal w-full md:w-fit border border-gray-200">
                        {[
                            { id: 'estudiantes', icon: Users, label: 'Población Estudiantil' },
                            { id: 'profesores', icon: BookOpen, label: 'Salón de Profesores' },
                            { id: 'coordinacion', icon: Shield, label: 'Coordinaciones' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-white text-blue-700 shadow-sm border border-gray-200/50'
                                        : 'text-gray-500 hover:text-blue-900 hover:bg-gray-200/50'
                                }`}
                            >
                                <tab.icon size={16} className={activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}/>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Buscar en ${activeTab === 'estudiantes' ? 'estudiantes' : activeTab === 'profesores' ? 'profesores' : 'coordinaciones'}...`}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-blue-950"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* BOTÓN DE PROFESORES */}
                        {activeTab === 'profesores' && (
                            <button
                                onClick={() => setShowCreateProfModal(true)}
                                className="group w-full md:w-auto bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg hover:shadow-purple-500/30 shrink-0"
                            >
                                <div className="bg-purple-100 text-purple-600 group-hover:bg-white group-hover:text-purple-500 rounded-lg p-1.5 transition-colors duration-300">
                                    <Plus size={16} strokeWidth={3} />
                                </div>
                                Nuevo Profesor
                            </button>
                        )}

                        {/* BOTÓN DE COORDINACIÓN (ESMERALDA) */}
                        {activeTab === 'coordinacion' && (
                            <button
                                onClick={() => setShowCreateCoordModal(true)}
                                className="group w-full md:w-auto bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg hover:shadow-emerald-500/30 shrink-0"
                            >
                                <div className="bg-emerald-100 text-emerald-600 group-hover:bg-white group-hover:text-emerald-500 rounded-lg p-1.5 transition-colors duration-300">
                                    <Plus size={16} strokeWidth={3} />
                                </div>
                                Nuevo Personal
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">

                        <div className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600/10 p-2 rounded-full animate-bounce pointer-events-none z-10 backdrop-blur-sm shadow-sm">
                            <ChevronRight size={16} className="text-blue-600" />
                        </div>

                        <div className="overflow-x-auto touch-pan-x custom-scrollbar-horizontal w-full">
                            {/* RENDERIZADO CONDICIONAL DE TABLAS SEGÚN LA PESTAÑA */}
                            {activeTab === 'profesores' ? (
                                // --- ESTRUCTURA DE TABLA: PROFESORES ---
                                <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                                    <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Docente</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Departamento Asignado</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Información de Contacto</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Carga Académica</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-purple-50/20 transition-colors group animate-in fade-in">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 bg-purple-500">
                                                        <BookOpen size={18}/>
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
                                                        <Briefcase size={12} className="text-purple-400"/> {u.career_name || 'General / Sin Asignar'}
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
                                                {/* Badge estructural sin lógica real aún */}
                                                <span className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">
                                                    0 Materias Asignadas
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    {/* 🌟 BOTÓN PARA ASIGNAR MATERIAS AL PROFESOR */}
                                                    <button onClick={() => openAssignSubjectModal(u)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Asignar Materias a Impartir">
                                                        <BookOpen size={18} />
                                                    </button>
                                                    <button onClick={() => setEditingUser(u)} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="Editar Perfil del Docente">
                                                        <UserCog size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u.id, u.full_name)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Remover Docente">
                                                        <UserMinus size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                                No hay profesores registrados o no coinciden con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            ) : (
                                // --- ESTRUCTURA DE TABLA: ESTUDIANTES / COORDINACIÓN ---
                                <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                                    <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Usuario</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                            {activeTab === 'coordinacion' ? 'Departamento Asignado' : 'Departamento / Carrera'}
                                        </th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Contacto</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Rol</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-blue-50/20 transition-colors group animate-in fade-in">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 
                                                        ${['admin', 'coordinador', 'director', 'administrativo'].includes(u.role) ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                                                        {['admin', 'coordinador', 'director', 'administrativo'].includes(u.role) ? <Shield size={18}/> : (u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U')}
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
                                                        <Briefcase size={12} className={activeTab === 'coordinacion' ? "text-emerald-400" : "text-blue-400"}/>
                                                        {u.admin_department || u.career_name || 'General / Sin Asignar'}
                                                    </p>
                                                    {u.mencion_name && !u.admin_department && (
                                                        <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                                                            {u.mencion_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-600 flex items-center gap-2 font-medium"><Mail size={12} className="text-gray-400"/> {u.email || 'N/A'}</p>
                                                    <p className="text-xs text-gray-600 flex items-center gap-2 font-medium"><Phone size={12} className="text-emerald-500"/> {u.phone || 'Sin teléfono'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg 
                                                        ${['admin', 'coordinador', 'director', 'administrativo'].includes(u.role) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {u.role || 'cadete'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingUser(u)} className={`p-2 rounded-lg transition-colors ${['admin', 'coordinador', 'director', 'administrativo'].includes(u.role) ? 'text-emerald-600 hover:bg-emerald-100' : 'text-blue-600 hover:bg-blue-100'}`} title="Editar Perfil">
                                                        <UserCog size={18} />
                                                    </button>

                                                    {/* ACTUALIZADO: Cadetes y Admins tienen botón de notas */}
                                                    {['cadete', 'admin'].includes(String(u.role).toLowerCase()) && (
                                                        <button onClick={() => handleManageRecords(u)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Gestionar Notas">
                                                            <Edit3 size={18} />
                                                        </button>
                                                    )}

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
                                                No hay usuarios en esta categoría o no coinciden con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            )}
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

            {/* 🌟 MODAL DE EDICIÓN DE USUARIO EXISTENTE INTELIGENTE */}
            {editingUser && (
                <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
                        <div className={`p-8 text-white flex justify-between items-center shrink-0 transition-colors duration-300 ${['coordinador', 'director', 'administrativo', 'admin'].includes(editingUser.role) ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Editar Perfil</h3>
                                <p className={`text-xs font-bold uppercase ${['coordinador', 'director', 'administrativo', 'admin'].includes(editingUser.role) ? 'text-emerald-100' : 'text-blue-100'}`}>{editingUser.student_code}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X/></button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Nombre Completo</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-950"
                                                value={editingUser.full_name || ''}
                                                onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Rol del Usuario</label>
                                            <select
                                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold cursor-pointer text-blue-950"
                                                value={editingUser.role || 'cadete'}
                                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                            >
                                                <option value="cadete">CADETE</option>
                                                <option value="profesor">PROFESOR</option>
                                                <option value="administrativo">PERSONAL ADMINISTRATIVO</option>
                                                <option value="coordinador">COORDINADOR(A)</option>
                                                <option value="director">DIRECTOR(A)</option>
                                                <option value="admin">SÚPER ADMINISTRADOR</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-950"
                                                value={editingUser.email || ''}
                                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Teléfono</label>
                                            <input
                                                type="tel"
                                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-950"
                                                value={editingUser.phone || ''}
                                                onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* 🌟 RENDERIZADO CONDICIONAL DE DEPARTAMENTO O CARRERA SEGÚN ROL */}
                                    {['cadete', 'profesor'].includes(editingUser.role) ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Carrera / Facultad Académica</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold cursor-pointer text-blue-950"
                                                    value={editingUser.career_id || ''}
                                                    onChange={(e) => {
                                                        const newCareerId = e.target.value;
                                                        setEditingUser({ ...editingUser, career_id: newCareerId, specialization_id: null });
                                                    }}
                                                >
                                                    {careersList.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Mención / Especialidad</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold cursor-pointer text-blue-950"
                                                    value={editingUser.specialization_id || ''}
                                                    onChange={(e) => setEditingUser({...editingUser, specialization_id: e.target.value})}
                                                    disabled={specsList.length === 0}
                                                >
                                                    {specsList.length === 0 ? (
                                                        <option value="">Básico / Sin menciones</option>
                                                    ) : (
                                                        specsList.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 mb-2 block flex items-center gap-1"><Settings size={12}/> Departamento Administrativo Asignado</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {['Control de Estudios', 'Planificación Académica', 'Coordinación Docente', 'Sistemas / Rectorado'].map(dept => (
                                                    <label key={dept} className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 bg-white cursor-pointer hover:border-emerald-500 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                                        <input
                                                            type="radio"
                                                            name="edit_departamento"
                                                            className="w-4 h-4 accent-emerald-600"
                                                            value={dept}
                                                            checked={editingUser.admin_department === dept || (!editingUser.admin_department && dept === 'Control de Estudios')}
                                                            onChange={(e) => setEditingUser({...editingUser, admin_department: e.target.value})}
                                                        />
                                                        <span className="font-bold text-blue-950 text-xs">{dept}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className={`w-full py-5 text-white rounded-2xl font-black text-lg shadow-xl transition-all uppercase flex justify-center items-center gap-2 mt-4 
                                        ${['coordinador', 'director', 'administrativo', 'admin'].includes(editingUser.role) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : null}
                                    {isUpdating ? 'ACTUALIZANDO...' : 'CONFIRMAR CAMBIOS'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ESTRUCTURAL PARA CREAR PROFESOR */}
            {showCreateProfModal && (
                <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
                        <div className="p-8 bg-purple-600 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Registrar Nuevo Docente</h3>
                                <p className="text-purple-100 text-xs font-bold uppercase tracking-widest">Creación de Credenciales</p>
                            </div>
                            <button onClick={() => setShowCreateProfModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X/></button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Nombres y Apellidos</label>
                                        <input type="text" placeholder="Ej: Ing. Carlos Pérez" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-blue-950 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Cédula de Identidad (Usuario)</label>
                                        <input type="text" placeholder="V-12345678" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-blue-950 transition-colors" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Correo Electrónico</label>
                                        <input type="email" placeholder="profesor@miumc.edu.ve" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-blue-950 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Teléfono</label>
                                        <input type="tel" placeholder="0414-0000000" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-blue-950 transition-colors" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Departamento / Escuela Asignada</label>
                                        <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer text-blue-950 transition-colors">
                                            <option value="">Seleccione un departamento...</option>
                                            {careersList.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-purple-700 active:scale-[0.98] transition-all uppercase flex justify-center items-center gap-2 mt-4">
                                <Plus size={20} /> Crear Perfil Docente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 MODAL ESTRUCTURAL DE ASIGNACIÓN DE MATERIAS (PROFESORES) */}
            {showAssignSubjectModal && selectedTeacher && (
                <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">

                        <div className="p-8 bg-purple-900 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none">
                                <BookOpen size={150} />
                            </div>
                            <div className="relative z-10 flex items-center gap-5">
                                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">
                                    {selectedTeacher.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Carga Académica</h3>
                                    <p className="text-purple-200 text-sm font-bold flex items-center gap-2">
                                        {selectedTeacher.full_name} <span className="opacity-50">•</span> {selectedTeacher.student_code}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowAssignSubjectModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X/></button>
                        </div>

                        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                            {/* Columna Izquierda: Materias Actualmente Asignadas */}
                            <div className="lg:w-1/2 p-8 border-r border-gray-100 flex flex-col bg-gray-50/50 overflow-y-auto custom-scrollbar">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText size={16} className="text-purple-500"/> Materias Asignadas (2)
                                </h4>

                                <div className="space-y-4">
                                    {/* Card Mock de Materia Asignada */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group">
                                        <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16}/>
                                        </button>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-md">INF-102</span>
                                        <h5 className="font-bold text-blue-950 mt-2 mb-3 pr-6 leading-tight">Informática Básica</h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500">
                                            <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400"/> Salón A-14</p>
                                            <p className="flex items-center gap-1.5"><Users size={12} className="text-gray-400"/> Sección: 01</p>
                                            <p className="flex items-center gap-1.5 col-span-2 mt-1"><Clock size={12} className="text-purple-400"/> Lunes • 08:00 - 10:00</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group">
                                        <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16}/>
                                        </button>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-md">PRO-413</span>
                                        <h5 className="font-bold text-blue-950 mt-2 mb-3 pr-6 leading-tight">Programación I</h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500">
                                            <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400"/> Laboratorio 3</p>
                                            <p className="flex items-center gap-1.5"><Users size={12} className="text-gray-400"/> Sección: 02</p>
                                            <p className="flex items-center gap-1.5 col-span-2 mt-1"><Clock size={12} className="text-purple-400"/> Miércoles • 10:00 - 12:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Añadir Nueva Materia */}
                            <div className="lg:w-1/2 p-8 flex flex-col overflow-y-auto custom-scrollbar bg-white">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Plus size={16} className="text-emerald-500"/> Nueva Asignación
                                </h4>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Buscar Materia (Pensum)</label>
                                        <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer text-blue-950 transition-colors">
                                            <option value="">Seleccione una materia...</option>
                                            {allSubjects.map(sub => (
                                                <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Día de Clase</label>
                                            <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer text-blue-950 transition-colors">
                                                <option>Lunes</option>
                                                <option>Martes</option>
                                                <option>Miércoles</option>
                                                <option>Jueves</option>
                                                <option>Viernes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Bloque Horario</label>
                                            <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer text-blue-950 transition-colors">
                                                <option>08:00 - 10:00</option>
                                                <option>10:00 - 12:00</option>
                                                <option>13:00 - 15:00</option>
                                                <option>15:00 - 17:00</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Salón / Laboratorio</label>
                                            <input type="text" placeholder="Ej: Aula 12" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-blue-950 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Sección</label>
                                            <input type="text" placeholder="Ej: 01" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-blue-950 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-4 mt-auto bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-purple-700 active:scale-[0.98] transition-all uppercase flex justify-center items-center gap-2">
                                    <CheckCircle size={18} /> Confirmar Asignación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 MODAL ESTRUCTURAL PARA CREAR PERSONAL ADMINISTRATIVO (POR DEPARTAMENTO) */}
            {showCreateCoordModal && (
                <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
                        <div className="p-8 bg-emerald-600 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none">
                                <Settings size={150} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Registrar Personal</h3>
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Coordinaciones y Directivos</p>
                            </div>
                            <button onClick={() => setShowCreateCoordModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10"><X/></button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50/50">

                            {/* Alerta Informativa sobre Permisos */}
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-3 items-start">
                                <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5"/>
                                <div>
                                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-1">Permisos basados en Departamento</h4>
                                    <p className="text-xs text-emerald-800 font-medium">El usuario creado tendrá el rol automático de "Administrativo". Su nivel de acceso dependerá del departamento seleccionado.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Nombres y Apellidos</label>
                                        <input type="text" placeholder="Ej: Dra. María López" className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-blue-950 transition-colors shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Identificador Único (Usuario)</label>
                                        <input type="text" placeholder="COORD-1234" className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-blue-950 transition-colors shadow-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Correo Institucional</label>
                                        <input type="email" placeholder="admin@miumc.edu.ve" className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-blue-950 transition-colors shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Teléfono Móvil</label>
                                        <input type="tel" placeholder="0414-0000000" className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-blue-950 transition-colors shadow-sm" />
                                    </div>
                                </div>

                                {/* 🌟 SELECTOR DE DEPARTAMENTOS / PERMISOS */}
                                <div className="pt-2 border-t border-gray-200">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Asignación de Departamento / Permisos</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-white cursor-pointer hover:border-emerald-500 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                            <input type="radio" name="departamento" className="w-5 h-5 accent-emerald-600" defaultChecked/>
                                            <div>
                                                <p className="font-bold text-blue-950 text-sm">Control de Estudios</p>
                                                <p className="text-xs text-gray-500 font-medium">Gestiona inscripciones de cadetes y expedientes de notas.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-white cursor-pointer hover:border-emerald-500 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                            <input type="radio" name="departamento" className="w-5 h-5 accent-emerald-600"/>
                                            <div>
                                                <p className="font-bold text-blue-950 text-sm">Planificación Académica</p>
                                                <p className="text-xs text-gray-500 font-medium">Actualiza semestres, materias, horarios, salones y secciones.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-white cursor-pointer hover:border-emerald-500 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                            <input type="radio" name="departamento" className="w-5 h-5 accent-emerald-600"/>
                                            <div>
                                                <p className="font-bold text-blue-950 text-sm">Coordinación Docente</p>
                                                <p className="text-xs text-gray-500 font-medium">Asigna materias a los profesores y evalúa el cuerpo docente.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-white cursor-pointer hover:border-emerald-500 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                            <input type="radio" name="departamento" className="w-5 h-5 accent-emerald-600"/>
                                            <div>
                                                <p className="font-bold text-blue-950 text-sm">Sistemas / Rectorado (Súper Admin)</p>
                                                <p className="text-xs text-gray-500 font-medium">Acceso total a todas las funciones y configuraciones del portal.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all uppercase flex justify-center items-center gap-2 mt-4">
                                <Plus size={20} /> Crear Perfil Administrativo
                            </button>
                        </div>
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