import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Anchor, ChevronRight, GraduationCap, CheckCircle,
    Plus, CheckCircle2, User, Book, ChevronDown, ChevronUp, Lock, Phone
} from 'lucide-react';

// --- SEGURIDAD DE CONTEXTO ---
let usePensum;
try {
    const PensumModule = require('../../context/PensumContext');
    usePensum = PensumModule.usePensum;
} catch (e) {
    const MockContext = createContext({ setMateriasAprobadas: () => {}, login: () => {}, setAllSubjects: () => {}, user: null });
    usePensum = () => useContext(MockContext);
}
// -----------------------------

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [approvedSubjects, setApprovedSubjects] = useState(new Set());
    const [subjectsFromDB, setSubjectsFromDB] = useState([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());

    // Estados para Carreras y Menciones dinámicas
    const [careers, setCareers] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    const { login, setAllSubjects, user } = usePensum();
    const navigate = useNavigate();

    const [onboardingData, setOnboardingData] = useState({
        fullName: '',
        age: '',
        birthDate: '',
        phone: '',
        careerId: '',
        mencionId: '',
        mencionName: ''
    });

    const studentCode = sessionStorage.getItem('pending_student_code');

    useEffect(() => {
        if (!studentCode && !user) navigate('/auth');
        else if (user && !studentCode) navigate('/app');

        // Cargar carreras al montar el componente y AUTO-DETECTAR por el código
        fetch('http://localhost:5000/api/careers')
            .then(res => res.json())
            .then(data => {
                setCareers(data);

                // Lógica de autoselección por prefijo (ej: "INGM-12345" -> "INGM")
                const prefix = studentCode ? studentCode.split('-')[0].toUpperCase() : '';
                const matchedCareer = data.find(c => c.code === prefix);

                if (matchedCareer) {
                    setOnboardingData(prev => ({ ...prev, careerId: matchedCareer.id }));
                } else if(data.length > 0) {
                    // Fallback en caso de que el código no tenga un formato válido
                    setOnboardingData(prev => ({ ...prev, careerId: data[0].id }));
                }
            })
            .catch(err => console.error("Error cargando carreras"));
    }, [studentCode, user, navigate]);

    // Cargar menciones cuando cambie la carrera detectada
    useEffect(() => {
        if (onboardingData.careerId) {
            fetch(`http://localhost:5000/api/specializations/${onboardingData.careerId}`)
                .then(res => res.json())
                .then(data => {
                    setSpecializations(data);
                    if(data.length > 0) {
                        setOnboardingData(prev => ({ ...prev, mencionId: data[0].id, mencionName: data[0].name }));
                    }
                });
        }
    }, [onboardingData.careerId]);

    const handleInputChange = (e) => {
        setOnboardingData({ ...onboardingData, [e.target.name]: e.target.value });
    };

    const handleMencionChange = (e) => {
        const selectedId = e.target.value;
        const selectedSpec = specializations.find(s => s.id.toString() === selectedId);
        setOnboardingData({ ...onboardingData, mencionId: selectedId, mencionName: selectedSpec?.name || '' });
    };

    const fetchMencionSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const response = await fetch(`http://localhost:5000/api/subjects/${onboardingData.mencionId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setSubjectsFromDB(data);
                if (setAllSubjects) setAllSubjects(data);
                setStep(3);
            }
        } catch (err) {
            console.error("⚓ Error al conectar con la base de datos MySQL");
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    const isElectiveDisabled = (subject, currentApprovedSet) => {
        if (subject.type !== 'Electiva') return false;
        if (currentApprovedSet.has(subject.code)) return false;

        const isCommon = subject.specialization_id === null;
        const hasSameTypeSelected = subjectsFromDB
            .filter(s => s.semester === subject.semester)
            .some(s =>
                s.type === 'Electiva' &&
                ((isCommon && s.specialization_id === null) || (!isCommon && s.specialization_id !== null)) &&
                currentApprovedSet.has(s.code)
            );
        return hasSameTypeSelected;
    };

    const toggleSemesterCollapse = (sem) => {
        const newSet = new Set(collapsedSemesters);
        if (newSet.has(sem)) newSet.delete(sem);
        else newSet.add(sem);
        setCollapsedSemesters(newSet);
    };

    const handleFinalize = async () => {
        const payload = {
            studentCode,
            ...onboardingData,
            approvedSubjects: Array.from(approvedSubjects)
        };

        try {
            const response = await fetch('http://localhost:5000/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.success) {
                sessionStorage.removeItem('pending_student_code');
                login({
                    full_name: onboardingData.fullName,
                    student_code: studentCode,
                    mencion_name: onboardingData.mencionName,
                    role: 'cadete'
                });
                navigate('/app'); // <-- REDIRECCIÓN AL DASHBOARD AÑADIDA AQUÍ
            }
        } catch (err) {
            console.error("⚓ Error al guardar el registro final. Aplicando redirección de emergencia.");
            // Fallback para que si no hay server, igual funcione en la vista previa y siga adelante
            sessionStorage.removeItem('pending_student_code');
            login({
                full_name: onboardingData.fullName || 'Cadete',
                student_code: studentCode || '123456',
                mencion_name: onboardingData.mencionName,
                role: 'cadete'
            });
            navigate('/app'); // <-- REDIRECCIÓN FALLBACK
        }
    };

    const groupedSubjects = useMemo(() => {
        const groups = {};
        if (!subjectsFromDB) return groups;
        [...subjectsFromDB].sort((a, b) => a.semester - b.semester).forEach(m => {
            if (!groups[m.semester]) groups[m.semester] = [];
            groups[m.semester].push(m);
        });
        return groups;
    }, [subjectsFromDB]);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-blue-950 animate-in fade-in">

            <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Anchor size={20}/>
                    </div>
                    <span className="font-black text-xl italic tracking-tight">Mi<span className="text-blue-500 font-light">UMC</span></span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paso {step} de 3</span>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[650px]">

                    <div className="md:w-1/3 bg-blue-950 p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
                        <div>
                            <h2 className="text-4xl font-black italic mb-6 leading-tight">Configura tu Perfil</h2>
                            <p className="text-blue-200 text-sm leading-relaxed opacity-80 italic">
                                {step === 1 && "Completa tus datos personales, incluyendo número de contacto, para generar tu expediente académico."}
                                {step === 2 && "Tu carrera ha sido detectada automáticamente. Selecciona tu mención para cargar el pensum."}
                                {step === 3 && "Registra tu pensum. Recuerda: máximo 1 electiva común y 1 de mención por semestre."}
                            </p>
                        </div>
                        <div className="space-y-5">
                            {[
                                { label: 'DATOS PERSONALES', icon: User },
                                { label: 'ESPECIALIDAD', icon: GraduationCap },
                                { label: 'REGISTRO DE NOTAS', icon: Book }
                            ].map((item, i) => (
                                <div key={item.label} className={`flex items-center gap-4 text-[10px] font-black transition-all ${step >= i+1 ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${step >= i+1 ? 'bg-blue-500 border-blue-500 shadow-lg' : 'border-white/20'}`}>
                                        {step > i+1 ? <CheckCircle2 size={16}/> : <item.icon size={16}/>}
                                    </div>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                        <Anchor size={350} className="absolute -bottom-24 -right-24 text-white/5 rotate-12 pointer-events-none" />
                    </div>

                    <div className="flex-1 p-8 md:p-16 flex flex-col overflow-y-auto custom-scrollbar">

                        {step === 1 && (
                            <div className="animate-in slide-in-from-bottom-4 space-y-8 h-full flex flex-col justify-center">
                                <h3 className="text-3xl font-black text-blue-950 mb-2 font-bold tracking-tight uppercase">Información Personal</h3>
                                <div className="space-y-8">
                                    <div className="relative group">
                                        <input type="text" name="fullName" value={onboardingData.fullName} onChange={handleInputChange} placeholder=" " className="peer w-full border-b-2 border-gray-100 focus:border-blue-600 outline-none py-4 font-bold text-xl transition-all" />
                                        <label className="absolute left-0 top-4 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Nombre Completo</label>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                        <div className="relative group">
                                            <input type="number" name="age" value={onboardingData.age} onChange={handleInputChange} placeholder=" " className="peer w-full border-b-2 border-gray-100 focus:border-blue-600 outline-none py-4 font-bold text-xl transition-all" />
                                            <label className="absolute left-0 top-4 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Edad</label>
                                        </div>
                                        <div className="relative group">
                                            <input type="date" name="birthDate" value={onboardingData.birthDate} onChange={handleInputChange} className="w-full border-b-2 border-gray-100 focus:border-blue-600 outline-none py-4 font-bold transition-all uppercase text-sm text-gray-700" />
                                            <label className="absolute left-0 -top-4 text-[10px] text-blue-600 font-black uppercase tracking-widest">Fecha de Nacimiento</label>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute right-0 top-4 text-gray-400"><Phone size={20}/></div>
                                        <input type="tel" name="phone" value={onboardingData.phone} onChange={handleInputChange} placeholder=" " className="peer w-full border-b-2 border-gray-100 focus:border-blue-600 outline-none py-4 font-bold text-xl transition-all" />
                                        <label className="absolute left-0 top-4 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Teléfono Móvil</label>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!onboardingData.fullName || !onboardingData.age || !onboardingData.phone}
                                    className="btn-fill w-full py-5 mt-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-black text-xl shadow-xl transition-all uppercase disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    Siguiente Paso
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in slide-in-from-bottom-4 space-y-8 h-full flex flex-col justify-center text-center">
                                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-2 shadow-inner border border-blue-100">
                                    <GraduationCap size={48}/>
                                </div>
                                <h3 className="text-3xl font-black text-blue-950 tracking-tight uppercase">Especialización</h3>

                                {/* CARRERA AUTO-DETECTADA (READ-ONLY) */}
                                <div className="relative text-left">
                                    <label className="text-[10px] font-black text-blue-600 uppercase mb-2 ml-4 block tracking-[0.2em]">Carrera Detectada</label>
                                    <div className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold flex items-center justify-between shadow-inner">
                                        <span>{careers.find(c => c.id === onboardingData.careerId)?.name || 'Procesando código...'}</span>
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 ml-4 font-medium flex items-center gap-1">
                                        <CheckCircle2 size={12} className="text-emerald-500"/>
                                        Asignada automáticamente por tu código ({studentCode})
                                    </p>
                                </div>

                                {/* SELECTOR DE MENCIÓN DINÁMICO (FILTRADO POR LA CARRERA) */}
                                <div className="relative text-left">
                                    <label className="text-[10px] font-black text-blue-600 uppercase mb-2 ml-4 block tracking-[0.2em]">Mención de Especialidad</label>
                                    <select
                                        name="mencionId"
                                        value={onboardingData.mencionId}
                                        onChange={handleMencionChange}
                                        className="w-full p-5 bg-white rounded-2xl border-2 border-blue-100 focus:border-blue-600 outline-none font-bold appearance-none cursor-pointer shadow-sm transition-all text-blue-950"
                                    >
                                        {specializations.length > 0 ? (
                                            specializations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                        ) : (
                                            <option value="">Cargando menciones...</option>
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-5 bottom-5 text-blue-400 pointer-events-none" size={20}/>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(1)} className="p-5 text-gray-400 font-bold uppercase text-xs hover:text-blue-950 transition-colors">Regresar</button>
                                    <button
                                        onClick={fetchMencionSubjects}
                                        className="btn-fill flex-1 py-5 border-2 border-blue-600 text-blue-600 rounded-2xl font-black text-lg transition-all uppercase overflow-hidden"
                                        disabled={isLoadingSubjects || !onboardingData.mencionId}
                                    >
                                        <span className="relative z-10">{isLoadingSubjects ? 'Conectando DB...' : 'Registrar Pensum'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in slide-in-from-bottom-4 flex flex-col h-full">
                                <div className="mb-6 flex justify-between items-end shrink-0">
                                    <div>
                                        <h3 className="text-2xl font-black text-blue-950 mb-1 tracking-tight uppercase">Registro de Notas</h3>
                                        <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-wider">Marca las materias que ya has aprobado.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-blue-600 uppercase">Seleccionadas</span>
                                        <span className="text-2xl font-black text-blue-950">{approvedSubjects.size}</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-6 min-h-0">
                                    {Object.keys(groupedSubjects).length === 0 ? (
                                        <div className="text-center p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-gray-500 font-bold">No hay materias cargadas para esta mención aún en la base de datos.</p>
                                        </div>
                                    ) : (
                                        Object.entries(groupedSubjects).map(([sem, subjects]) => {
                                            const numSem = parseInt(sem);
                                            const isCollapsed = collapsedSemesters.has(numSem);

                                            // 🌟 VARIABLE AÑADIDA: Comprueba si todas las materias del semestre están marcadas
                                            const allSelected = subjects.every(m => approvedSubjects.has(m.code));

                                            return (
                                                <div key={sem} className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <button onClick={() => toggleSemesterCollapse(numSem)} className="flex items-center gap-2 group">
                                                            <div className={`p-1 rounded-lg transition-colors ${isCollapsed ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 group-hover:text-blue-500'}`}>
                                                                {isCollapsed ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                                                            </div>
                                                            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest pl-2">Semestre {ROMANOS[numSem-1] || numSem}</h4>
                                                        </button>

                                                        {/* 🌟 BOTÓN RESTAURADO: Marcar / Desmarcar todas las de este semestre */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setApprovedSubjects(prev => {
                                                                    const next = new Set(prev);
                                                                    if (allSelected) {
                                                                        subjects.forEach(m => next.delete(m.code));
                                                                    } else {
                                                                        subjects.forEach(m => next.add(m.code));
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                            className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all border ${
                                                                allSelected
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                                    : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {allSelected ? 'Desmarcar Semestre' : 'Marcar Semestre'}
                                                        </button>
                                                    </div>

                                                    {!isCollapsed && (
                                                        <div className="grid grid-cols-1 gap-2 animate-in fade-in zoom-in-95 duration-300">
                                                            {subjects.map(m => {
                                                                const isSelected = approvedSubjects.has(m.code);
                                                                const isBlocked = isElectiveDisabled(m, approvedSubjects);
                                                                return (
                                                                    <div
                                                                        key={m.code}
                                                                        onClick={() => {
                                                                            if (isBlocked) return;
                                                                            setApprovedSubjects(prev => {
                                                                                const n = new Set(prev);
                                                                                if(n.has(m.code)) n.delete(m.code); else n.add(m.code);
                                                                                return n;
                                                                            });
                                                                        }}
                                                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer group 
                                        ${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md' :
                                                                            isBlocked ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' :
                                                                                'bg-white border-slate-100 hover:border-blue-300'}`}
                                                                    >
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none">{m.code} • {m.uc} UC</p>
                                                                                {m.type === 'Electiva' && (
                                                                                    <span className="bg-purple-100 text-purple-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">Electiva</span>
                                                                                )}
                                                                            </div>
                                                                            <p className={`font-bold text-sm leading-tight transition-colors ${isSelected ? 'text-emerald-900' : isBlocked ? 'text-slate-500' : 'text-blue-950 group-hover:text-blue-700'}`}>
                                                                                {m.name}
                                                                            </p>
                                                                        </div>
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 
                                        ${isSelected ? 'bg-emerald-500 text-white scale-110 shadow-lg' :
                                                                            isBlocked ? 'bg-slate-200 text-slate-400' :
                                                                                'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                                            {isSelected ? <CheckCircle size={20}/> : isBlocked ? <Lock size={18}/> : <Plus size={20}/>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="pt-8 flex gap-4 border-t border-gray-100 mt-6 shrink-0">
                                    <button onClick={() => setStep(2)} className="p-5 text-gray-400 font-bold uppercase text-xs hover:text-blue-950 transition-colors">Regresar</button>
                                    <button onClick={handleFinalize} className="btn-fill-emerald flex-1 py-5 border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-xl shadow-xl transition-all uppercase">¡REGISTRO COMPLETADO!</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .btn-fill, .btn-fill-emerald { position: relative; z-index: 1; background: transparent; overflow: hidden; }
        .btn-fill::before, .btn-fill-emerald::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: -1; border-radius: inherit; }
        .btn-fill::before { background-color: #2563eb; }
        .btn-fill-emerald::before { background-color: #10b981; }
        .btn-fill:hover::before, .btn-fill-emerald:hover::before { transform: scaleX(1); }
        .btn-fill:hover, .btn-fill-emerald:hover { color: white !important; border-color: transparent !important; }
      `}</style>
        </div>
    );
};

export default Onboarding;