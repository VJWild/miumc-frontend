import React, { useState, useEffect } from 'react';

import {
    MessageSquare, Book, User, MapPin, FileText, UploadCloud,
    ArrowLeft, Users, CheckCircle, Clock, Link2, PlaySquare,
    AlertCircle, ChevronRight, GraduationCap, Download, CheckCircle2,
    Lock, Mail, Calendar, BookOpen, MoreVertical, FileBarChart, Loader2
} from 'lucide-react';
import { API_URL } from '../../config';
// 🌟 IMPORTACIÓN REAL DEL CONTEXTO
import { usePensum } from '../../context/PensumContext';


// --- DATOS SIMULADOS PARA EL INTERIOR DEL AULA (FASE 3) ---
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

const generateMockEvaluations = (isFinished) => {
    if (isFinished) {
        return [
            { id: 1, title: 'Práctica 1: Fundamentos', dueDate: '25 Feb 2026', maxScore: 20, status: 'graded', score: 18, submission: { type: 'file', name: 'Practica1_VG.pdf' } },
            { id: 2, title: 'Proyecto Parcial', dueDate: '15 Mar 2026', maxScore: 20, status: 'graded', score: 16, submission: { type: 'link', name: 'https://github.com/vjwild/proyecto' } },
            { id: 3, title: 'Examen Final', dueDate: '10 Jul 2026', maxScore: 20, status: 'graded', score: 19, submission: { type: 'file', name: 'Examen_Resuelto.pdf' } }
        ];
    }
    return [
        { id: 1, title: 'Práctica 1: Fundamentos', dueDate: '25 Feb 2026', maxScore: 20, status: 'graded', score: 18, submission: { type: 'file', name: 'Practica1_VG.pdf' } },
        { id: 2, title: 'Proyecto Parcial', dueDate: '15 Mar 2026', maxScore: 20, status: 'pending' },
        { id: 3, title: 'Examen Final', dueDate: '10 Jul 2026', maxScore: 20, status: 'locked' }
    ];
};

const Classroom = () => {
    const { materiasInscritas } = usePensum();

    const [activeClass, setActiveClass] = useState(null);
    const [activeTab, setActiveTab] = useState('muro');

    // 🌟 NUEVOS ESTADOS PARA MANEJO DE ENTREGAS
    const [activeSubmission, setActiveSubmission] = useState(null); // { id, type: 'file'|'link', value: '' }
    const [uploadingId, setUploadingId] = useState(null);
    const [evaluationsState, setEvaluationsState] = useState([]);

    useEffect(() => {
        if (activeClass && materiasInscritas && materiasInscritas.length > 0) {
            const isFinished = activeClass.codigo === materiasInscritas[0]?.codigo;
            setEvaluationsState(generateMockEvaluations(isFinished));
            setActiveTab('muro');
            setActiveSubmission(null);
        }
    }, [activeClass, materiasInscritas]);

    const handleConfirmUpload = (evalId) => {
        setUploadingId(evalId);

        // Simulamos el tiempo de subida al servidor
        setTimeout(() => {
            const submissionData = {
                type: activeSubmission.type,
                name: activeSubmission.type === 'file' ? 'Documento_Adjunto.pdf' : activeSubmission.value || 'Enlace adjunto'
            };

            setEvaluationsState(prev => prev.map(ev =>
                ev.id === evalId ? { ...ev, status: 'submitted', submission: submissionData } : ev
            ));

            setUploadingId(null);
            setActiveSubmission(null);
        }, 2000);
    };

    const isCourseFinished = evaluationsState.length > 0 && evaluationsState.every(e => e.status === 'graded');
    const finalScore = isCourseFinished ? Math.round(evaluationsState.reduce((acc, curr) => acc + curr.score, 0) / evaluationsState.length) : null;

    // Mapa de colores sutiles para los bordes superiores de las tarjetas
    const getBorderColor = (colorClass) => {
        if (!colorClass) return 'border-t-blue-500';
        if (colorClass.includes('blue')) return 'border-t-blue-500';
        if (colorClass.includes('purple')) return 'border-t-purple-500';
        if (colorClass.includes('emerald')) return 'border-t-emerald-500';
        if (colorClass.includes('amber')) return 'border-t-amber-500';
        if (colorClass.includes('rose')) return 'border-t-rose-500';
        return 'border-t-slate-500';
    };

    // --- VISTA PRINCIPAL: LISTA DE AULAS ---
    if (!activeClass) {
        return (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Mis Aulas Virtuales</h2>
                    <p className="text-slate-500 font-medium">Gestiona tu aprendizaje, evaluaciones y material de estudio.</p>
                </div>

                {!materiasInscritas || materiasInscritas.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 min-h-[400px]">
                        <BookOpen size={64} className="text-slate-200 mb-4"/>
                        <p className="text-slate-500 font-bold text-lg text-center px-4">No tienes aulas habilitadas.</p>
                        <p className="text-slate-400 text-sm mt-1 text-center px-4">Aparecerán aquí una vez que completes tu inscripción académica.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8 custom-scrollbar pr-2">
                        {materiasInscritas.map(m => (
                            <div
                                key={m.codigo || m.code}
                                onClick={() => setActiveClass(m)}
                                className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer group border-t-4 ${getBorderColor(m.color)}`}
                            >
                                <div className="p-6 border-b border-slate-100 relative overflow-hidden">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">{m.codigo || m.code}</span>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight mt-3 group-hover:text-blue-600 transition-colors">{m.nombre || m.name}</h3>
                                        </div>
                                        {/* Indicador de Tareas (Aleatorio para demo) */}
                                        {Math.random() > 0.5 && (
                                            <div className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <AlertCircle size={12}/> Pendiente
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.codigo || m.code}&backgroundColor=e2e8f0`} alt="Profesor" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Ing. Carlos Pérez</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Profesor Asignado</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                <MapPin size={14} className="text-emerald-500"/> Sec: 01
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                <Clock size={14} className="text-blue-500"/> {m.day || 'Lun'} • {m.startTime || '08:00'}
                                            </div>
                                        </div>
                                    </div>

                                    <button className="mt-6 w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all flex justify-center items-center gap-2">
                                        Ingresar al Aula <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                    </button>
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
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-300 bg-slate-50 -m-6 p-6">

            {/* 1. Header Profesional del Aula */}
            <div className="shrink-0 mb-6 bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <BookOpen size={200} className="text-white transform rotate-12 -translate-y-10 translate-x-10"/>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setActiveClass(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest mb-4 transition-colors group w-fit"
                    >
                        <div className="bg-slate-800 p-1.5 rounded-lg group-hover:bg-slate-700 transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Volver al Panel
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">{activeClass.codigo || activeClass.code}</span>
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest flex items-center gap-1"><Users size={12}/> Sección 01</span>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                        {activeClass.nombre || activeClass.name}
                    </h2>
                </div>

                {/* Banner de Curso Finalizado Integrado */}
                {isCourseFinished && (
                    <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-5 backdrop-blur-sm animate-in zoom-in">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <GraduationCap size={24} className="text-white"/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Materia Aprobada</p>
                            <p className="text-3xl font-black text-white leading-none">{finalScore} <span className="text-sm font-bold text-emerald-500/70">/ 20</span></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">

                {/* 2. Barra Lateral Clean */}
                <div className="lg:w-64 shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible hide-scroll">
                        {[
                            { id: 'muro', icon: Book, label: 'Inicio del Curso' },
                            { id: 'material', icon: FileBarChart, label: 'Material de Apoyo' },
                            { id: 'evaluaciones', icon: UploadCloud, label: 'Evaluaciones' },
                            { id: 'personas', icon: Users, label: 'Participantes' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap lg:whitespace-normal relative overflow-hidden group
                            ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'}`}
                            >
                                {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>}
                                <tab.icon size={18} className={`${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hidden lg:block">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Información General</h4>
                        <div className="space-y-4 text-sm font-medium text-slate-700">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={14}/></div>
                                <div>
                                    <p className="font-bold text-slate-900">{activeClass.day || 'Sin horario'}</p>
                                    <p className="text-xs text-slate-500">{activeClass.startTime || '--:--'} a {activeClass.endTime || '--:--'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={14}/></div>
                                <div>
                                    <p className="font-bold text-slate-900">Ubicación</p>
                                    <p className="text-xs text-slate-500">{activeClass.room || 'Virtual'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Área de Contenido Principal Dinámica */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">

                    {/* TABS: MURO / INICIO */}
                    {activeTab === 'muro' && (
                        <div className="space-y-8 animate-in fade-in duration-300">

                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeClass.codigo || activeClass.code}&backgroundColor=4f46e5`} alt="Profesor" className="w-16 h-16 rounded-2xl border border-slate-200 shadow-sm bg-slate-50" />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Ing. Carlos Pérez</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5"><Mail size={14}/> cperez@miumc.edu.ve</p>
                                </div>
                            </div>

                            {/* Muro Post Design */}
                            <div className="space-y-6">
                                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><MessageSquare size={14}/></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">Aviso del Profesor</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">10 Feb 2026</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16}/></button>
                                    </div>
                                    <div className="p-6 text-sm text-slate-700 leading-relaxed space-y-3">
                                        <p className="font-bold text-slate-900">¡Bienvenidos al curso, futuros ingenieros!</p>
                                        <p>En este espacio encontraremos todo el material necesario para llevar a cabo la materia. Les recuerdo que el plan de evaluación ya se encuentra disponible en la sección de "Material de Apoyo".</p>
                                        <p>Cualquier duda la aclaramos en la próxima clase presencial. ¡Éxitos!</p>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen de Estado si terminó */}
                            {isCourseFinished && (
                                <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center text-center mt-8">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 size={32}/>
                                    </div>
                                    <h3 className="text-lg font-black text-emerald-900 uppercase tracking-wide">Materia Concluida</h3>
                                    <p className="text-emerald-700 text-sm max-w-md mt-2">El acta de notas ha sido cerrada y enviada a Control de Estudios. Tu calificación definitiva es de <span className="font-bold">{finalScore} puntos</span>.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TABS: MATERIAL DE APOYO */}
                    {activeTab === 'material' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="font-bold text-xl text-slate-900 mb-4">Archivos y Enlaces</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_MATERIALS.map(mat => (
                                    <div key={mat.id} className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`p-3 rounded-xl text-white shadow-sm shrink-0
                                        ${mat.type === 'pdf' ? 'bg-rose-500' : mat.type === 'link' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                {mat.type === 'pdf' ? <FileText size={20}/> : mat.type === 'link' ? <Link2 size={20}/> : <PlaySquare size={20}/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors leading-tight">{mat.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1.5 font-medium">{mat.date} • {mat.size}</p>
                                            </div>
                                        </div>
                                        <button className="w-full py-2 bg-slate-50 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors flex items-center justify-center gap-2">
                                            {mat.type === 'link' ? <><Link2 size={14}/> Abrir Enlace</> : <><Download size={14}/> Descargar</>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 🌟 TABS: EVALUACIONES (MODIFICADO CON MÓDULO DE ENTREGA) */}
                    {activeTab === 'evaluaciones' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900">Actividades</h3>
                                    <p className="text-sm text-slate-500">Listado de entregas requeridas.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {evaluationsState.map((ev) => {
                                    let statusConfig = { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Lock, label: 'Próximamente' };

                                    if (ev.status === 'pending') {
                                        statusConfig = { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle, label: 'Pendiente' };
                                    } else if (ev.status === 'submitted') {
                                        statusConfig = { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: 'En Revisión' };
                                    } else if (ev.status === 'graded') {
                                        statusConfig = { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Calificada' };
                                    }

                                    const StatusIcon = statusConfig.icon;
                                    const isBeingSubmitted = activeSubmission?.id === ev.id;

                                    return (
                                        <div key={ev.id} className={`p-5 rounded-2xl border transition-all duration-300 ${isBeingSubmitted ? 'bg-white border-blue-300 shadow-md ring-4 ring-blue-50' : 'bg-white border-slate-200 hover:border-slate-300'}`}>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 w-fit ${statusConfig.color}`}>
                                                    <StatusIcon size={12}/> {statusConfig.label}
                                                </span>
                                                        {ev.status === 'graded' && <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">{ev.score} / {ev.maxScore} Pts</span>}
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-base">{ev.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Calendar size={12}/> Vencimiento: {ev.dueDate}</p>
                                                </div>

                                                {/* Botón Superior de Acción */}
                                                <div className="shrink-0 w-full md:w-auto pt-4 md:pt-0">
                                                    {isCourseFinished ? (
                                                        <span className="text-sm font-bold text-slate-400">Cerrado</span>
                                                    ) : ev.status === 'pending' ? (
                                                        !isBeingSubmitted && (
                                                            <button
                                                                onClick={() => setActiveSubmission({ id: ev.id, type: 'file', value: '' })}
                                                                className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-2 shadow-sm"
                                                            >
                                                                <UploadCloud size={16}/> Entregar
                                                            </button>
                                                        )
                                                    ) : ev.status === 'submitted' ? (
                                                        <span className="text-sm font-bold text-blue-600 flex items-center justify-end gap-1"><Clock size={16}/> Esperando Nota</span>
                                                    ) : (
                                                        <span className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1"><CheckCircle2 size={16}/> Evaluado</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 🌟 MÓDULO INTERACTIVO DE ENTREGA DESPLEGABLE */}
                                            {isBeingSubmitted && (
                                                <div className="mt-5 pt-5 border-t border-slate-100 animate-in slide-in-from-top-4 fade-in duration-300">
                                                    <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 w-fit rounded-lg">
                                                        <button
                                                            onClick={() => setActiveSubmission({...activeSubmission, type: 'file'})}
                                                            className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${activeSubmission.type === 'file' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            <FileText size={14}/> Archivo
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveSubmission({...activeSubmission, type: 'link'})}
                                                            className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${activeSubmission.type === 'link' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                        >
                                                            <Link2 size={14}/> Enlace URL
                                                        </button>
                                                    </div>

                                                    {/* Input dinámico basado en la selección */}
                                                    {activeSubmission.type === 'file' ? (
                                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group">
                                                            <div className="w-12 h-12 bg-white text-blue-500 rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                                <UploadCloud size={24}/>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Haz clic o arrastra tu archivo aquí</p>
                                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Soporta PDF, DOCX, ZIP (Máx 10MB)</p>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Link2 size={18}/></div>
                                                            <input
                                                                type="url"
                                                                placeholder="Pega el enlace a tu Drive, GitHub, o documento web..."
                                                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                                value={activeSubmission.value}
                                                                onChange={(e) => setActiveSubmission({...activeSubmission, value: e.target.value})}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Botones Finales */}
                                                    <div className="flex items-center justify-end gap-3 mt-5">
                                                        <button
                                                            onClick={() => setActiveSubmission(null)}
                                                            className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleConfirmUpload(ev.id)}
                                                            disabled={uploadingId === ev.id || (activeSubmission.type === 'link' && !activeSubmission.value)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {uploadingId === ev.id ? <><Loader2 size={16} className="animate-spin"/> Guardando...</> : 'Confirmar Entrega'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Muestra la entrega si ya se envió (Simulación de resultado) */}
                                            {(ev.status === 'submitted' || ev.status === 'graded') && ev.submission && (
                                                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 w-fit pr-6">
                                                    <div className={`w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 ${ev.submission.type === 'link' ? 'text-blue-500' : 'text-rose-500'}`}>
                                                        {ev.submission.type === 'link' ? <Link2 size={16}/> : <FileText size={16}/>}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{ev.submission.name}</p>
                                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Recibido con éxito</p>
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
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Profesor</h3>
                                <div className="flex items-center gap-4">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeClass.codigo || activeClass.code}&backgroundColor=e2e8f0`} alt="Profesor" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Ing. Carlos Pérez</p>
                                        <p className="text-xs text-slate-500">Titular de la Cátedra</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Compañeros</h3>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{MOCK_CLASSMATES.length} Alumnos</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {MOCK_CLASSMATES.map((student, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group cursor-default">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=f8fafc`} alt={student.name} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 group-hover:border-blue-300 transition-colors" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{student.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
        </div>
    );
};

export default Classroom;