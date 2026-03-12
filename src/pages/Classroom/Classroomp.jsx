import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    MessageSquare, Book, User, MapPin, FileText, UploadCloud,
    ArrowLeft, Users, CheckCircle, Clock, Link2, PlaySquare,
    AlertCircle, ChevronRight, GraduationCap, Download, CheckCircle2,
    Lock
} from 'lucide-react';

// --- SEGURIDAD DE CONTEXTO ---
let usePensum;
try {
    const PensumModule = require('../../context/PensumContext');
    usePensum = PensumModule.usePensum;
} catch (e) {
    const MockContext = createContext({
        materiasInscritas: [
            { codigo: 'INF-102', nombre: 'Informática Básica', color: 'bg-blue-500', room: 'Lab 3', day: 'Lunes', startTime: '08:00', endTime: '10:00' },
            { codigo: 'PRO-413', nombre: 'Programación I', color: 'bg-purple-500', room: 'Aula 12', day: 'Miércoles', startTime: '10:00', endTime: '12:00' }
        ]
    });
    usePensum = () => useContext(MockContext);
}
// -----------------------------

// --- DATOS SIMULADOS PARA EL AULA ---
const MOCK_CLASSMATES = [
    { name: "Ana Martínez", code: "28111222" },
    { name: "Luis Gómez", code: "27333444" },
    { name: "Sofía Castro", code: "29555666" },
    { name: "Diego Rojas", code: "26888999" },
    { name: "Camila Fernández", code: "27999000" },
    { name: "Javier Mendoza", code: "28444555" }
];

const MOCK_MATERIALS = [
    { id: 1, type: 'pdf', title: 'Plan de Evaluación Oficial 2026', date: '12 Feb', size: '2.4 MB' },
    { id: 2, type: 'link', title: 'Repositorio de Prácticas (GitHub)', date: '15 Feb', size: 'Enlace web' },
    { id: 3, type: 'video', title: 'Clase Grabada: Introducción a la Materia', date: '20 Feb', size: '45 mins' },
    { id: 4, type: 'pdf', title: 'Guía Práctica N° 1', date: '25 Feb', size: '1.1 MB' }
];

// Simulamos que una clase es normal y otra (ej. Informática) ya finalizó.
const generateMockEvaluations = (isFinished) => {
    if (isFinished) {
        return [
            { id: 1, title: 'Práctica 1: Fundamentos', dueDate: '25 Feb 2026', maxScore: 20, status: 'graded', score: 18 },
            { id: 2, title: 'Proyecto Parcial', dueDate: '15 Mar 2026', maxScore: 20, status: 'graded', score: 16 },
            { id: 3, title: 'Examen Final', dueDate: '10 Jul 2026', maxScore: 20, status: 'graded', score: 19 }
        ];
    }
    return [
        { id: 1, title: 'Práctica 1: Fundamentos', dueDate: '25 Feb 2026', maxScore: 20, status: 'graded', score: 18 },
        { id: 2, title: 'Proyecto Parcial', dueDate: '15 Mar 2026', maxScore: 20, status: 'pending' },
        { id: 3, title: 'Examen Final', dueDate: '10 Jul 2026', maxScore: 20, status: 'locked' }
    ];
};

const Classroom = () => {
    const { materiasInscritas } = usePensum();

    const [activeClass, setActiveClass] = useState(null);
    const [activeTab, setActiveTab] = useState('muro'); // muro, material, evaluaciones, personas

    // Estados para simular interacciones de subida de tareas
    const [uploadingId, setUploadingId] = useState(null);
    const [evaluationsState, setEvaluationsState] = useState([]);

    // Al entrar a un aula, inicializamos sus evaluaciones
    useEffect(() => {
        if (activeClass) {
            // Simula que la primera materia en la lista ya terminó su curso
            const isFinished = activeClass.codigo === materiasInscritas[0]?.codigo;
            setEvaluationsState(generateMockEvaluations(isFinished));
            setActiveTab('muro');
        }
    }, [activeClass, materiasInscritas]);

    const handleUpload = (evalId) => {
        setUploadingId(evalId);
        setTimeout(() => {
            setEvaluationsState(prev => prev.map(ev =>
                ev.id === evalId ? { ...ev, status: 'submitted' } : ev
            ));
            setUploadingId(null);
        }, 2000); // Simula 2 segundos de carga
    };

    // 🎓 VERIFICACIÓN DE CURSO FINALIZADO
    const isCourseFinished = evaluationsState.length > 0 && evaluationsState.every(e => e.status === 'graded');
    const finalScore = isCourseFinished ? Math.round(evaluationsState.reduce((acc, curr) => acc + curr.score, 0) / evaluationsState.length) : null;

    // --- VISTA PRINCIPAL: LISTA DE AULAS ---
    if (!activeClass) {
        return (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-black text-blue-950 mb-1 italic tracking-tight">Aula Virtual</h2>
                    <p className="text-gray-500 font-medium">Accede al contenido, evaluaciones y compañeros de tus clases.</p>
                </div>

                {materiasInscritas.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <MessageSquare size={64} className="text-gray-200 mb-4"/>
                        <p className="text-gray-500 font-bold text-lg">No tienes aulas habilitadas.</p>
                        <p className="text-gray-400 text-sm mt-1">Aparecerán aquí una vez que completes tu inscripción.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8 custom-scrollbar pr-2">
                        {materiasInscritas.map(m => (
                            <div
                                key={m.codigo}
                                onClick={() => setActiveClass(m)}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all flex flex-col cursor-pointer"
                            >
                                <div className={`h-28 w-full ${m.color || 'bg-blue-600'} p-5 flex justify-between items-start relative overflow-hidden`}>
                                    <Book size={120} className="absolute -right-4 -bottom-4 text-white opacity-20 transform rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500"/>
                                    <span className="bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-lg backdrop-blur-md relative z-10 border border-white/20 tracking-widest">{m.codigo}</span>
                                    {/* Notificación Aleatoria */}
                                    {Math.random() > 0.5 && <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full relative z-10 shadow-md border-2 border-white uppercase tracking-wider animate-pulse">Pendiente</span>}
                                </div>
                                <div className="p-6 relative flex-1 flex flex-col">
                                    <div className="absolute -top-10 right-6 w-16 h-16 bg-gray-100 rounded-2xl border-4 border-white overflow-hidden shadow-lg flex items-center justify-center text-gray-400 group-hover:rotate-6 transition-transform">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.codigo}&backgroundColor=e5e7eb`} alt="Profesor" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-black text-gray-800 text-lg leading-tight mb-2 pr-14 group-hover:text-blue-700 transition-colors">{m.nombre}</h3>
                                    <div className="space-y-1 mt-2">
                                        <p className="text-xs text-gray-500 font-bold flex items-center gap-2"><User size={14} className="text-blue-400"/> Prof. Asignado</p>
                                        <p className="text-xs text-gray-500 font-bold flex items-center gap-2"><MapPin size={14} className="text-emerald-500"/> Sección: 01</p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-blue-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        <span>Ingresar al Aula</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- VISTA DETALLE DEL AULA ---
    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">

            {/* 1. Header del Aula */}
            <div className="shrink-0 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => setActiveClass(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest mb-3 transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a mis aulas
                    </button>
                    <h2 className="text-3xl font-black text-blue-950 leading-tight uppercase tracking-tighter flex items-center gap-3">
                        {activeClass.nombre}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">{activeClass.codigo}</span>
                        <span className="text-sm font-bold text-gray-500">Sección 01</span>
                    </div>
                </div>

                {/* 🌟 BANNER DE CURSO FINALIZADO EN EL HEADER */}
                {isCourseFinished && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/20 flex items-center gap-4 shrink-0 animate-in zoom-in">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <GraduationCap size={24} className="text-white"/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Curso Finalizado</p>
                            <p className="text-2xl font-black">{finalScore} <span className="text-sm font-medium opacity-80">/ 20 Pts</span></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">

                {/* 2. Barra Lateral de Navegación del Aula */}
                <div className="lg:w-64 shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible hide-scroll">
                        {[
                            { id: 'muro', icon: Book, label: 'Inicio del Curso' },
                            { id: 'material', icon: FileText, label: 'Material de Apoyo' },
                            { id: 'evaluaciones', icon: UploadCloud, label: 'Evaluaciones' },
                            { id: 'personas', icon: Users, label: 'Compañeros' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap lg:whitespace-normal
                            ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-950'}`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Info Académica Básica */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hidden lg:block">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Detalles del Curso</h4>
                        <div className="space-y-4 text-sm font-medium text-gray-600">
                            <div className="flex items-start gap-3">
                                <Clock size={16} className="text-blue-500 mt-0.5"/>
                                <div>
                                    <p className="font-bold text-gray-800">{activeClass.day || 'Sin día'}</p>
                                    <p className="text-xs">{activeClass.startTime} - {activeClass.endTime}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-emerald-500 mt-0.5"/>
                                <div>
                                    <p className="font-bold text-gray-800">Aula Asignada</p>
                                    <p className="text-xs">{activeClass.room || 'Virtual'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <GraduationCap size={16} className="text-purple-500 mt-0.5"/>
                                <div>
                                    <p className="font-bold text-gray-800">Carrera</p>
                                    <p className="text-xs leading-tight">Ingeniería Informática</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Área de Contenido Principal Dinámica */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-y-auto custom-scrollbar p-6 lg:p-8">

                    {/* TABS: MURO / INICIO */}
                    {activeTab === 'muro' && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">

                            {/* Tarjeta de Docente */}
                            <div className="bg-blue-950 rounded-2xl p-6 text-white flex items-center gap-5 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeClass.codigo}&backgroundColor=4f46e5`} alt="Profesor" className="w-16 h-16 rounded-2xl bg-white/10 p-1 border border-white/20 relative z-10" />
                                <div className="relative z-10">
                                    <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1">Docente Asignado</p>
                                    <h3 className="text-xl font-bold">Ing. Carlos Pérez</h3>
                                    <p className="text-sm text-blue-200 mt-1 flex items-center gap-2"><Mail size={14}/> cperez@miumc.edu.ve</p>
                                </div>
                            </div>

                            {/* Mensaje de Bienvenida */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MessageSquare size={18} className="text-blue-500"/> Último Anuncio</h4>
                                <div className="p-5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-sm text-gray-600 leading-relaxed">
                                    <p className="font-bold text-gray-800 mb-2">¡Bienvenidos al curso, futuros ingenieros!</p>
                                    <p>En este espacio encontraremos todo el material necesario para llevar a cabo la materia. Les recuerdo que el plan de evaluación ya se encuentra disponible en la sección de "Material de Apoyo". Por favor revisarlo y cualquier duda la aclaramos en la próxima clase presencial.</p>
                                    <p className="mt-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Publicado el: 10 Feb 2026</p>
                                </div>
                            </div>

                            {/* Resumen de Estado */}
                            {isCourseFinished && (
                                <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-center space-y-2">
                                    <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2"/>
                                    <h3 className="text-lg font-black text-emerald-900 uppercase">Materia Aprobada Exitosamente</h3>
                                    <p className="text-emerald-700 text-sm font-medium">El docente ha publicado la ponderación final. Esta aula quedará en modo de solo lectura.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TABS: MATERIAL DE APOYO */}
                    {activeTab === 'material' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <h3 className="font-black text-xl text-blue-950 mb-2">Recursos Compartidos</h3>
                            <div className="space-y-3">
                                {MOCK_MATERIALS.map(mat => (
                                    <div key={mat.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group bg-white cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0
                                        ${mat.type === 'pdf' ? 'bg-red-500' : mat.type === 'link' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                {mat.type === 'pdf' ? <FileText size={20}/> : mat.type === 'link' ? <Link2 size={20}/> : <PlaySquare size={20}/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">{mat.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1 font-medium">{mat.date} • {mat.size}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                                            {mat.type === 'link' ? <ChevronRight size={18}/> : <Download size={18}/>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TABS: EVALUACIONES */}
                    {activeTab === 'evaluaciones' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="font-black text-xl text-blue-950">Plan de Evaluaciones</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Sube tus asignaciones y consulta tus calificaciones.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Acumulado</p>
                                    <p className="text-2xl font-black text-blue-600">
                                        {evaluationsState.reduce((acc, curr) => acc + (curr.score || 0), 0)} <span className="text-sm text-gray-400">Pts</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {evaluationsState.map((ev) => {
                                    // Definición visual según estado
                                    let statusConfig = {
                                        color: 'bg-gray-100 text-gray-500',
                                        icon: Lock,
                                        label: 'Bloqueada',
                                        border: 'border-gray-200'
                                    };

                                    if (ev.status === 'pending') {
                                        statusConfig = { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Pendiente', border: 'border-orange-200 shadow-sm' };
                                    } else if (ev.status === 'submitted') {
                                        statusConfig = { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'En Revisión', border: 'border-blue-200 bg-blue-50/30' };
                                    } else if (ev.status === 'graded') {
                                        statusConfig = { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Calificada', border: 'border-emerald-200 bg-emerald-50/50' };
                                    }

                                    return (
                                        <div key={ev.id} className={`p-5 rounded-2xl border-2 transition-all ${statusConfig.border}`}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 w-fit ${statusConfig.color}`}>
                                                    <statusConfig.icon size={10}/> {statusConfig.label}
                                                </span>
                                                        {ev.status === 'graded' && <span className="text-sm font-black text-emerald-600 bg-white px-2 rounded-md shadow-sm border border-emerald-100">{ev.score} / {ev.maxScore} Pts</span>}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 text-lg leading-tight">{ev.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1"><Clock size={12}/> Vence: {ev.dueDate}</p>
                                                </div>

                                                {/* Botón de Acción Condicional */}
                                                <div className="shrink-0 w-full md:w-auto">
                                                    {isCourseFinished ? (
                                                        <div className="w-full text-center px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest cursor-not-allowed">Curso Cerrado</div>
                                                    ) : ev.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleUpload(ev.id)}
                                                            disabled={uploadingId === ev.id}
                                                            className="w-full md:w-auto btn-fill bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none"
                                                        >
                                                            {uploadingId === ev.id ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Subiendo...</> : <><UploadCloud size={18}/> Subir Archivo</>}
                                                        </button>
                                                    ) : ev.status === 'submitted' ? (
                                                        <div className="w-full text-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1"><CheckCircle size={14}/> Entregado</div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Simulación de archivo subido */}
                                            {(ev.status === 'submitted' || ev.status === 'graded') && (
                                                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0"><FileText size={16}/></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-blue-950 truncate">Entrega_Victor_Gonzalez.pdf</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">Subido exitosamente</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TABS: PERSONAS / COMPAÑEROS */}
                    {activeTab === 'personas' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <h3 className="font-black text-xl text-blue-950 mb-4 border-b border-gray-100 pb-2">Docente</h3>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeClass.codigo}&backgroundColor=4f46e5`} alt="Profesor" className="w-12 h-12 rounded-xl bg-white shadow-sm" />
                                <div>
                                    <p className="font-bold text-blue-900 text-sm">Ing. Carlos Pérez</p>
                                    <p className="text-xs text-blue-700/70 font-medium">Profesor Principal</p>
                                </div>
                            </div>

                            <h3 className="font-black text-xl text-blue-950 mt-8 mb-4 border-b border-gray-100 pb-2 flex items-center justify-between">
                                Compañeros de Clase
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{MOCK_CLASSMATES.length} Alumnos</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {MOCK_CLASSMATES.map((student, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=e2e8f0`} alt={student.name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 text-sm truncate">{student.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        
        .btn-fill { position: relative; z-index: 1; overflow: hidden; }
        .btn-fill::before { 
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
            transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
            z-index: -1; background-color: #1e3a8a; border-radius: inherit;
        }
        .btn-fill:hover::before { transform: scaleX(1); }
      `}</style>
        </div>
    );
};

export default Classroom;