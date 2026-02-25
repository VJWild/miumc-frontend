import React, { useState } from 'react';
import { Book, CheckCircle, Plus, CheckSquare, Lock, X, GitBranch, ChevronDown, ChevronUp, Unlock, LogOut, Save, Loader2 } from 'lucide-react';
import { dbMaterias, ROMANOS, DAYS, COLORS } from '../../mocks/data';
import { usePensum } from '../../context/PensumContext';

const Enrollment = () => {
    const {
        user,
        materiasAprobadas, materiasInscritas,
        setMateriasInscritas, ucAprobadas
    } = usePensum();

    // 🌟 ESTADO LOCAL: Ahora la mención se maneja internamente en esta vista
    const [mencionActual, setMencionActual] = useState('Ver Todo');
    const [filtroSemestre, setFiltroSemestre] = useState('Todos');
    const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [toast, setToast] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSemester = (sem) => {
        const newSet = new Set(collapsedSemesters);
        if (newSet.has(sem)) newSet.delete(sem);
        else newSet.add(sem);
        setCollapsedSemesters(newSet);
    };

    const verificarEstadoInscripcion = (materia) => {
        if (materiasAprobadas.has(materia.codigo)) return 'aprobada';
        if (materiasInscritas.find(m => m.codigo === materia.codigo)) return 'inscrita';

        if (materia.tipo === 'Electiva') {
            const electivaAprobada = Array.from(materiasAprobadas).some(codigo => {
                const m = dbMaterias.find(mat => mat.codigo === codigo);
                return m && m.tipo === 'Electiva' && m.semestre === materia.semestre;
            });
            const electivaInscrita = materiasInscritas.some(m => m.tipo === 'Electiva' && m.semestre === materia.semestre);
            if (electivaAprobada || electivaInscrita) return 'bloqueada-electiva';
        }

        if (!materia.prelacion) return 'disponible';
        let str = materia.prelacion.toUpperCase();
        if (str.includes('UC APROB') || str.includes('UC') || str.includes('50%')) {
            let ucReqMatch = str.match(/(\d+)\s*UC/);
            if (ucReqMatch && ucAprobadas < parseInt(ucReqMatch[1])) return 'bloqueada';
            if (str.includes('50%') && ucAprobadas < 112) return 'bloqueada';
        }

        let codigosPrevios = str.replace(/\d+\s*UC.*/g, '').replace(/50%.*/g, '').split(/[\/\-]/);
        for (let req of codigosPrevios) {
            req = req.trim();
            if (req.match(/^[A-Z]{3}-\d{3}$/) && !materiasAprobadas.has(req)) return 'bloqueada';
        }
        return 'disponible';
    };

    const generarHorarioMock = () => {
        const dayIdx = Math.floor(Math.random() * 5);
        const startHour = 8 + Math.floor(Math.random() * 6);
        return {
            day: DAYS[dayIdx], dayIdx,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + 2).toString().padStart(2, '0')}:00`,
            room: `Lab ${Math.floor(Math.random() * 5) + 1}`,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            duration: 2, professor: 'Prof. Asignado'
        };
    };

    const handleToggleInscripcion = (materia) => {
        const isEnrolled = materiasInscritas.find(m => m.codigo === materia.codigo);
        if (isEnrolled) {
            setMateriasInscritas(materiasInscritas.filter(m => m.codigo !== materia.codigo));
            showToast(`${materia.nombre} retirada de la lista`, 'success');
        } else {
            setMateriasInscritas([...materiasInscritas, { ...materia, ...generarHorarioMock() }]);
            showToast(`${materia.nombre} pre-inscrita`, 'success');
        }
        setSelectedMateria(null);
    };

    // Lógica para enviar las materias al Backend
    const handleSaveEnrollment = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/enrollments/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentCode: user?.code,
                    period: '2026-I',
                    enrolledSubjects: materiasInscritas
                })
            });

            const result = await response.json();
            if (result.success) {
                showToast('¡Inscripción guardada exitosamente en la base de datos!', 'success');
            } else {
                showToast('Hubo un error al guardar la inscripción', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión con el servidor MySQL', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Filtro reactivo basado en la mención seleccionada
    const pensumFiltrado = mencionActual === 'Ver Todo'
        ? dbMaterias : dbMaterias.filter(m => m.mencion === 'Todas' || m.mencion === mencionActual);

    const mencionesNavegacion = ['Ver Todo', 'Redes y Telecomunicaciones', 'Gestión de Datos', 'Seguridad Informática', 'Automatización de Procesos'];

    return (
        <div className="animate-in fade-in h-full flex flex-col relative">
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-bottom-5 flex items-center gap-3 text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
                    <CheckCircle size={20}/> {toast.message}
                </div>
            )}

            {/* CABECERA Y CONTROLES */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-blue-950">Inscripción Académica</h2>
                    <p className="text-gray-500 text-sm mt-1">Selecciona asignaturas y procesa tu inscripción.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">

                    <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 font-bold text-blue-900 text-sm flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
                        <Book size={18} className="text-blue-500"/>
                        UC Inscritas: {materiasInscritas.reduce((acc, curr) => acc + curr.uc, 0)}
                    </div>

                    <button
                        onClick={handleSaveEnrollment}
                        disabled={isSaving || materiasInscritas.length === 0}
                        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-2.5 rounded-xl font-black text-sm tracking-wide shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 disabled:opacity-50 disabled:pointer-events-none group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} className="group-hover:scale-110 transition-transform"/>}
                            {isSaving ? 'GUARDANDO...' : 'PROCESAR INSCRIPCIÓN'}
                        </span>
                    </button>

                    <div className="relative w-full sm:w-48 shrink-0">
                        <select value={filtroSemestre} onChange={(e) => setFiltroSemestre(e.target.value)} className="w-full bg-white border border-gray-300 text-blue-950 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold shadow-sm outline-none cursor-pointer">
                            <option value="Todos">Todos los Semestres</option>
                            {ROMANOS.map((r, i) => <option key={r} value={i+1}>Semestre {r}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 🌟 SELECTOR DE MENCIONES */}
            <div className="flex gap-2 overflow-x-auto hide-scroll pb-2 mb-4 w-full">
                {mencionesNavegacion.map(mencion => (
                    <button key={mencion} onClick={() => setMencionActual(mencion)} className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-all border shrink-0 ${mencionActual === mencion ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-700'}`}>
                        {mencion === 'Ver Todo' ? 'Explorar Todo el Pensum' : mencion.replace(' y Telecomunicaciones', ' y Telecom.')}
                    </button>
                ))}
            </div>

            <div className="flex gap-3 overflow-x-auto hide-scroll text-xs font-bold mb-6 shrink-0 pb-1">
                <span className="flex items-center text-emerald-700 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0"><CheckCircle size={14} className="mr-1.5"/>Aprobada</span>
                <span className="flex items-center text-blue-600 px-3 py-1.5 bg-white border border-blue-200 rounded-lg shrink-0"><Plus size={14} className="mr-1.5"/>Disponible</span>
                <span className="flex items-center text-blue-800 px-3 py-1.5 bg-blue-50 border border-blue-300 shadow-inner rounded-lg shrink-0"><CheckSquare size={14} className="mr-1.5"/>Pre-Inscrita</span>
                <span className="flex items-center text-gray-500 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shrink-0"><Lock size={14} className="mr-1.5"/>Bloqueada</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-8">
                {ROMANOS.map((rom, index) => {
                    const numSemestre = index + 1;
                    if (filtroSemestre !== 'Todos' && parseInt(filtroSemestre) !== numSemestre) return null;

                    const materiasSemestre = pensumFiltrado.filter(m => m.semestre === numSemestre);
                    if (materiasSemestre.length === 0) return null;
                    const isCollapsed = collapsedSemesters.has(numSemestre);

                    return (
                        <div key={rom} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                            <div onClick={() => toggleSemester(numSemestre)} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4 rounded-xl select-none">
                                <h3 className="text-sm font-bold text-gray-600 tracking-widest uppercase pl-3 border-l-4 border-blue-500">Semestre {rom}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-lg">{materiasSemestre.length} Materias</span>
                                    {isCollapsed ? <ChevronDown size={20} className="text-blue-500"/> : <ChevronUp size={20} className="text-blue-500"/>}
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4 pt-2">
                                    {materiasSemestre.map(materia => {
                                        const estado = verificarEstadoInscripcion(materia);
                                        let cardStyle = ''; let badgeStyle = ''; let actionButton = null;

                                        if (estado === 'aprobada') {
                                            cardStyle = 'bg-emerald-50/50 border-emerald-200'; badgeStyle = 'bg-emerald-100 text-emerald-800';
                                            actionButton = <div className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-emerald-100/60 text-emerald-700 flex justify-center items-center gap-2 border border-emerald-200/50"><CheckCircle size={18}/> Aprobada</div>;
                                        } else if (estado === 'inscrita') {
                                            cardStyle = 'bg-blue-50 border-blue-200 shadow-inner'; badgeStyle = 'bg-blue-200 text-blue-900 border border-blue-300/50';
                                            actionButton = (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleInscripcion(materia); }}
                                                    className="btn-outline-red w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-sm"
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">Retirar Materia <LogOut size={16} className="shrink-0"/></span>
                                                </button>
                                            );
                                        } else if (estado === 'disponible') {
                                            cardStyle = 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1'; badgeStyle = materia.tipo === 'Obligatoria' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
                                            actionButton = <button onClick={(e) => { e.stopPropagation(); handleToggleInscripcion(materia); }} className="btn-fill w-full mt-4 py-3 rounded-xl font-bold text-sm border-2 border-blue-600 text-blue-600 flex justify-center items-center gap-2 overflow-hidden"><span className="relative z-10 flex items-center gap-2">Pre-Inscribir <Plus size={18}/></span></button>;
                                        } else {
                                            cardStyle = 'bg-gray-50 border-gray-200 opacity-70'; badgeStyle = 'bg-gray-200 text-gray-500';
                                            actionButton = <div className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-gray-200/50 text-gray-500 flex justify-center items-center gap-2"><Lock size={18}/> Bloqueada</div>;
                                        }

                                        return (
                                            <div key={materia.codigo} onClick={() => setSelectedMateria(materia)} className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col h-full cursor-pointer group ${cardStyle}`}>
                                                <div className="flex justify-between items-start mb-4 gap-2">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${badgeStyle}`}>{materia.tipo}</span>
                                                        {mencionActual === 'Ver Todo' && materia.mencion !== 'Todas' && (
                                                            <span className={`text-[0.65rem] font-bold tracking-wider px-2.5 py-1 rounded-md border ${materia.mencion.includes('Redes') ? 'bg-blue-50 text-blue-700 border-blue-200' : materia.mencion.includes('Datos') ? 'bg-purple-50 text-purple-700 border-purple-200' : materia.mencion.includes('Seguridad') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{materia.mencion.split(' ')[0]}</span>
                                                        )}
                                                    </div>
                                                    {estado === 'aprobada' && <CheckCircle size={22} className="text-emerald-500 shrink-0" />}
                                                    {estado === 'inscrita' && <CheckSquare size={22} className="text-blue-600 animate-in zoom-in shrink-0" />}
                                                    {(estado === 'bloqueada' || estado === 'bloqueada-electiva') && <Lock size={20} className="text-gray-400 shrink-0" />}
                                                </div>
                                                <h3 className="font-bold text-lg md:text-xl text-blue-950 mb-2 leading-tight flex-1 mt-1">{materia.nombre}</h3>
                                                <div className="space-y-2 mb-2 mt-4">
                                                    <p className="text-sm text-gray-600 flex items-center gap-2 font-medium"><Book size={16} className="text-blue-400"/> {materia.codigo} • {materia.uc} UC</p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-2"><GitBranch size={16} className={(estado === 'bloqueada' || estado === 'bloqueada-electiva') ? 'text-gray-400' : 'text-orange-400'}/> <span className="truncate">Req: {materia.prelacion || 'Ninguno'}</span></p>
                                                </div>
                                                {actionButton}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal Flotante */}
            {selectedMateria && (() => {
                const estadoModal = verificarEstadoInscripcion(selectedMateria);
                let modalHeaderColor = '';
                if (estadoModal === 'aprobada') modalHeaderColor = 'bg-emerald-500';
                else if (estadoModal === 'inscrita') modalHeaderColor = 'bg-blue-800';
                else if (estadoModal === 'disponible') modalHeaderColor = 'bg-blue-600';
                else modalHeaderColor = 'bg-gray-500';

                return (
                    <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className={`p-6 pb-4 ${modalHeaderColor} text-white relative`}>
                                <button onClick={() => setSelectedMateria(null)} className="absolute top-4 right-4 p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors"><X size={20}/></button>
                                <span className="text-xs font-bold tracking-widest uppercase mb-1 block opacity-80 bg-black/10 w-fit px-2 py-0.5 rounded">{selectedMateria.codigo}</span>
                                <h2 className="text-xl font-bold leading-tight mb-3 pr-8">{selectedMateria.nombre}</h2>
                                <div className="flex gap-2 text-xs font-medium">
                                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">Semestre {ROMANOS[selectedMateria.semestre-1]}</span>
                                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{selectedMateria.uc} Créditos</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requisitos (Prelaciones)</h3>
                                    {!selectedMateria.prelacion ? (
                                        <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center w-fit"><Unlock size={16} className="mr-2"/> Sin requisitos</span>
                                    ) : (
                                        <span className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2"><GitBranch size={16} className="text-blue-500"/> {selectedMateria.prelacion}</span>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    {estadoModal === 'aprobada' && (
                                        <button className="w-full py-3 rounded-xl font-bold text-base bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed flex justify-center items-center gap-2"><CheckCircle size={20}/> Materia ya Aprobada</button>
                                    )}
                                    {estadoModal === 'inscrita' && (
                                        <button
                                            onClick={() => handleToggleInscripcion(selectedMateria)}
                                            className="btn-outline-red w-full py-4 rounded-xl font-bold text-base transition-all flex justify-center items-center gap-2 shadow-sm"
                                        >
                                            <span className="relative z-10 flex items-center gap-2"><LogOut size={20} className="shrink-0"/> Retirar Materia</span>
                                        </button>
                                    )}
                                    {estadoModal === 'disponible' && (
                                        <button onClick={() => handleToggleInscripcion(selectedMateria)} className="btn-fill w-full py-3 rounded-xl font-bold text-base border-2 border-blue-600 text-blue-600 flex justify-center items-center gap-2 overflow-hidden shadow-sm">
                                            <span className="relative z-10 flex items-center gap-2">Pre-Inscribir Materia <Plus size={20}/></span>
                                        </button>
                                    )}
                                    {estadoModal === 'bloqueada' && (
                                        <>
                                            <button className="w-full py-3 rounded-xl font-bold text-base bg-gray-100 text-gray-400 cursor-not-allowed flex justify-center items-center gap-2"><Lock size={20}/> Bloqueada</button>
                                            <p className="text-center text-xs text-red-500 font-medium mt-2">No cumples con las prelaciones requeridas o UC.</p>
                                        </>
                                    )}
                                    {estadoModal === 'bloqueada-electiva' && (
                                        <>
                                            <button className="w-full py-3 rounded-xl font-bold text-base bg-gray-100 text-gray-400 cursor-not-allowed flex justify-center items-center gap-2"><Lock size={20}/> Bloqueada</button>
                                            <p className="text-center text-xs text-orange-500 font-medium mt-2">Ya tienes una electiva aprobada o en curso para este semestre.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                /* Botón Inscribir (Azul) */
                .btn-fill { position: relative; z-index: 1; background: transparent; overflow: hidden; }
                .btn-fill::before { 
                    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                    transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                    z-index: -1; border-radius: inherit; background-color: #2563eb; 
                }
                .btn-fill:hover::before { transform: scaleX(1); }
                .btn-fill:hover { color: white !important; border-color: transparent !important; }

                /* Nuevo Estilo: Botón Retirar (Rojo Dinámico) */
                .btn-outline-red {
                    position: relative; z-index: 1; background: transparent; overflow: hidden;
                    border: 2px solid #fecaca; color: #ef4444;
                }
                .btn-outline-red::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    transform: scaleX(0); transform-origin: right;
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: -1; border-radius: inherit; background-color: #ef4444;
                }
                .btn-outline-red:hover::before { transform: scaleX(1); transform-origin: left; }
                .btn-outline-red:hover { color: white !important; border-color: transparent !important; }

                .hide-scroll::-webkit-scrollbar { display: none; }
                .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default Enrollment;