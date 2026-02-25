import React, { useState, useRef } from 'react';
import {
    Calendar,
    Download,
    Clock,
    MapPin,
    X,
    ChevronDown,
    Image as ImageIcon,
    FileText,
    User as UserIcon,
    Loader2,
    Info,
    ExternalLink
} from 'lucide-react';

// --- IMPORTACIONES NATIVAS (Vite) ---
import { DAYS, HOURS } from '../../mocks/data';
import { usePensum } from '../../context/PensumContext';

const Schedule = () => {
    const { materiasInscritas, user } = usePensum();
    const scheduleRef = useRef(null);

    // Estados para la Interfaz
    const [selectedClass, setSelectedClass] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Cálculos dinámicos basados en data.js local
    const totalHours = HOURS.length;
    const firstHour = HOURS[0] || 7;

    const getPositionStyles = (startTime, duration) => {
        const startHour = parseInt(startTime.split(':')[0]);
        const offset = startHour - firstHour;
        return {
            top: `${(offset / totalHours) * 100}%`,
            height: `${(duration / totalHours) * 100}%`,
        };
    };

    const getCardTheme = (colorString) => {
        if (!colorString) return 'bg-blue-50 border-blue-500 text-blue-900';
        const color = colorString.toLowerCase();
        if (color.includes('emerald') || color.includes('green'))
            return 'bg-emerald-50 border-emerald-500 text-emerald-900';
        if (color.includes('purple') || color.includes('violet'))
            return 'bg-purple-50 border-purple-500 text-purple-900';
        if (color.includes('orange') || color.includes('amber'))
            return 'bg-orange-50 border-orange-500 text-orange-900';
        if (color.includes('red') || color.includes('rose'))
            return 'bg-red-50 border-red-500 text-red-900';
        return 'bg-blue-50 border-blue-500 text-blue-900';
    };

    // --- LÓGICA DE EXPORTACIÓN REFINADA ---
    const handleExport = async (format) => {
        if (!scheduleRef.current) return;
        setIsExporting(true);
        setShowExportMenu(false);

        // Pequeño delay para que el menú de exportación se cierre antes de la captura
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            // Importación dinámica de las librerías
            const html2canvas = (await import('html2canvas')).default;

            // CAPTURA: Configuramos html2canvas para que ignore el scroll del contenedor padre
            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2, // Doble resolución para que no se vea pixelado
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                // Forzamos el ancho y alto real del contenido interno para capturar todo
                width: scheduleRef.current.scrollWidth,
                height: scheduleRef.current.scrollHeight,
                windowWidth: scheduleRef.current.scrollWidth,
                windowHeight: scheduleRef.current.scrollHeight,
                onclone: (clonedDoc) => {
                    // Aquí podríamos modificar algo en el clon si quisiéramos antes de la foto
                    const element = clonedDoc.querySelector('[data-schedule-container]');
                    if (element) element.style.borderRadius = '0'; // Opcional
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            if (format === 'png') {
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `Horario_MiUMC_${user?.student_code || 'Cadete'}.png`;
                link.click();
            } else if (format === 'pdf') {
                const { jsPDF } = await import('jspdf');

                // Calculamos dimensiones para PDF Landscape
                const orientation = canvas.width > canvas.height ? 'l' : 'p';
                const pdf = new jsPDF(orientation, 'px', [canvas.width, canvas.height]);

                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`Horario_MiUMC_${user?.student_code || 'Cadete'}.pdf`);
            }
        } catch (error) {
            console.error("Error al exportar el horario:", error);
            // Podrías añadir un toast de error aquí si lo deseas
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">

            {/* Cabecera de la Vista */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-lg md:text-xl font-black text-blue-950 flex items-center gap-2 uppercase tracking-tight">
                        <Calendar className="text-blue-600" size={24}/> Horario Académico
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium italic">Consulta tu horario semanal y exportalo cuando quieras.</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => !isExporting && setShowExportMenu(!showExportMenu)}
                        className={`bg-blue-600 text-white p-2 md:px-5 md:py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin"/> : <Download size={18}/>}
                        <span className="hidden md:inline">{isExporting ? 'Procesando...' : 'Exportar Horario'}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`}/>
                    </button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                            <p className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">Formato de Descarga</p>
                            <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <FileText size={18}/>
                                </div>
                                Documento PDF (.pdf)
                            </button>
                            <button onClick={() => handleExport('png')} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <ImageIcon size={18}/>
                                </div>
                                Imagen PNG (.png)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid del Calendario (Scrollable) */}
            <div className="flex-1 overflow-auto custom-scrollbar relative p-2 md:p-6 bg-slate-50/50">

                {/* 🌟 Este div con ref es lo que se captura íntegramente */}
                <div
                    ref={scheduleRef}
                    data-schedule-container
                    className="relative border border-gray-200 rounded-3xl bg-white overflow-hidden shadow-sm"
                    style={{
                        minWidth: `${DAYS.length * 160 + 64}px`,
                        height: `${totalHours * 80}px`
                    }}
                >
                    {/* Fila superior: Días */}
                    <div className="absolute top-0 left-0 right-0 h-14 flex border-b border-gray-200 bg-gray-50/80 backdrop-blur-md z-20">
                        <div className="w-16 border-r border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100/30">
                            Hora
                        </div>
                        {DAYS.map(day => (
                            <div key={day} className="flex-1 border-r border-gray-200 last:border-0 flex items-center justify-center font-black text-blue-950 text-xs uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-14 left-0 right-0 bottom-0">
                        {/* Líneas Horizontales para cada hora */}
                        {HOURS.map((hour, idx) => (
                            <div key={hour} className="absolute w-full border-b border-gray-100 flex items-stretch" style={{ top: `${(idx / totalHours) * 100}%`, height: `${(1 / totalHours) * 100}%` }}>
                                <div className="w-16 border-r border-gray-200 bg-gray-50/20 flex items-start justify-center pt-3 text-[11px] text-gray-400 font-bold">
                                    {hour}:00
                                </div>
                                {DAYS.map(day => <div key={day} className="flex-1 border-r border-gray-100 last:border-0 border-dashed opacity-40"></div>)}
                            </div>
                        ))}

                        {/* Capa de Materias (Tarjetas Dinámicas) */}
                        <div className="absolute inset-0 flex ml-16 mt-0">
                            {DAYS.map((day) => (
                                <div key={day} className="flex-1 relative h-full px-1.5">
                                    {materiasInscritas.filter(m => m.day === day).map(materia => {
                                        const style = getPositionStyles(materia.startTime, materia.duration);
                                        const theme = getCardTheme(materia.color);

                                        return (
                                            <div
                                                key={materia.codigo}
                                                onClick={() => setSelectedClass(materia)}
                                                className="absolute w-full left-0 right-0 p-1.5 z-10 animate-in zoom-in duration-500 cursor-pointer"
                                                style={style}
                                            >
                                                <div className={`${theme} border-l-4 rounded-2xl p-3 h-full shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden group border-y border-r`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[9px] font-black opacity-60 uppercase tracking-widest leading-none bg-white/40 px-2 py-1 rounded-md">
                                                            {materia.codigo}
                                                        </span>
                                                    </div>
                                                    <span className="font-black text-xs md:text-[13px] leading-tight mb-2 line-clamp-2 uppercase">
                                                        {materia.nombre}
                                                    </span>
                                                    <div className="mt-auto space-y-1 opacity-70">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                            <Clock size={12} className="shrink-0"/> {materia.startTime} - {materia.endTime}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                            <MapPin size={12} className="shrink-0"/> {materia.room || 'Aula Virtual'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Informativo */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-widest shrink-0">
                <div className="flex items-center gap-1.5"><Info size={14} className="text-blue-500"/> Clic para detalles</div>
                <div className="hidden sm:block">|</div>
                <div className="flex items-center gap-1.5"><ExternalLink size={14} className="text-emerald-500"/> Desliza para ver la semana</div>
            </div>

            {/* Modal Detallado (Con efectos Hover-Fill) */}
            {selectedClass && (
                <div
                    className="fixed inset-0 bg-blue-950/60 z-[100] flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm"
                    onClick={() => setSelectedClass(null)}
                >
                    <div
                        className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 bg-slate-50 border-b border-gray-100 relative">
                            <button
                                onClick={() => setSelectedClass(null)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            >
                                <X size={24}/>
                            </button>
                            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full border border-blue-100 mb-4 inline-block">
                                {selectedClass.codigo}
                            </span>
                            <h2 className="text-3xl font-black leading-tight text-blue-950 pr-6 uppercase tracking-tighter">
                                {selectedClass.nombre}
                            </h2>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Horario */}
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm shrink-0">
                                    <Clock size={28}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Horario</p>
                                    <p className="font-black text-blue-950 text-base uppercase">{selectedClass.day}</p>
                                    <p className="font-bold text-gray-500 text-sm">{selectedClass.startTime} a {selectedClass.endTime} <span className="text-gray-300 font-normal ml-1">({selectedClass.duration}h)</span></p>
                                </div>
                            </div>

                            {/* Aula */}
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                                    <MapPin size={28}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Aula</p>
                                    <p className="font-black text-blue-950 text-base uppercase">{selectedClass.room || 'Salón por definir'}</p>
                                    <p className="font-bold text-gray-500 text-sm capitalize tracking-tighter">Sección: 01 | Carrera: {user?.career_name || 'Informática'}</p>
                                </div>
                            </div>

                            {/* Profesor */}
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm shrink-0">
                                    <UserIcon size={28}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Profesor</p>
                                    <p className="font-black text-blue-950 text-base uppercase">{selectedClass.professor || 'Docente sin asignar'}</p>
                                    <p className="font-bold text-gray-500 text-sm italic">Cátedra Ordinaria</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pb-8">
                            <button className="btn-fill-dark w-full py-5 border-2 border-blue-950 text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/10 transition-all overflow-hidden group">
                                <span className="relative z-10">Ir al Aula Virtual de la Materia</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                
                .btn-fill-dark { position: relative; z-index: 1; background: transparent; overflow: hidden; }
                .btn-fill-dark::before { 
                    content: ''; 
                    position: absolute; 
                    top: 0; 
                    left: 0; 
                    right: 0; 
                    bottom: 0; 
                    transform: scaleX(0); 
                    transform-origin: left; 
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
                    z-index: -1; 
                    background-color: #172554; /* bg-blue-950 */
                }
                .btn-fill-dark:hover::before { transform: scaleX(1); }
                .btn-fill-dark:hover { color: white !important; border-color: transparent !important; }
            `}</style>
        </div>
    );
};

export default Schedule;