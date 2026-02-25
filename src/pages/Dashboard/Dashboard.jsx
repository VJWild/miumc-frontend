import React from 'react';
import { Link } from 'react-router-dom';
import {
    Target, Anchor, Award, Sparkles, Calendar,
    Book, TrendingUp, ChevronRight, MapPin, GraduationCap
} from 'lucide-react';

// Importamos el hook del contexto para obtener los datos del usuario en sesión
import { usePensum } from '../../context/PensumContext';

const Dashboard = () => {
    // 🌟 EXTRAEMOS LOS TOTALES CALCULADOS DESDE EL CONTEXTO
    const { user, ucAprobadas, materiasAprobadas, materiasInscritas, loading, totalesCarrera } = usePensum();

    // Desestructuramos los totales dinámicos (con fallback por si está cargando)
    const TOTAL_UC_CARRERA = totalesCarrera?.uc || 225;
    const TOTAL_MATERIAS_CARRERA = totalesCarrera?.materias || 72;

    // Cálculos basados en el progreso real del usuario logueado
    const porcentajeProgreso = TOTAL_UC_CARRERA > 0 ? Math.min(Math.round((ucAprobadas / TOTAL_UC_CARRERA) * 100), 100) : 0;
    const materiasCompletadas = materiasAprobadas ? materiasAprobadas.size : 0;

    // 🎓 LÓGICA DE GRADUACIÓN (Solo se activa con datos reales de la BDD)
    const esIngeniero = ucAprobadas >= TOTAL_UC_CARRERA && materiasAprobadas && materiasAprobadas.has('PAP-10020');
    const esCasiIngeniero = !esIngeniero && ucAprobadas >= (TOTAL_UC_CARRERA - 20) && materiasAprobadas && !materiasAprobadas.has('PAP-10020');

    const getMotivationalMessage = () => {
        if (esIngeniero) return "¡Misión Cumplida, Ingeniero! 🎓 Has aprobado el 100% del pensum académico.";
        if (esCasiIngeniero) return "¡Impresionante! 🎉 Solo te faltan las Pasantías Profesionales para culminar tu carrera.";
        if (porcentajeProgreso >= 50) return "¡Felicidades, ya superaste la mitad de la carrera! Mantén el buen ritmo. 📈";
        if (porcentajeProgreso > 0) return "Vas por buen camino. Cada materia aprobada te acerca más a tu meta. ⚓";
        return "Cada gran viaje comienza con un paso. ¡Mucho éxito en este nuevo inicio, Cadete! ⚓";
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-400 font-bold animate-pulse uppercase text-xs tracking-widest">Sincronizando con el Puerto...</p>
            </div>
        );
    }

    // Fallback en caso de que el objeto user no esté definido aún
    const userData = user || { name: "Cadete", code: "---", career: "Ingeniería", mencion: "---", avatar: "U" };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Banner de Bienvenida: Se mantiene rounded-2xl para evitar el efecto ovalado */}
            <div className={`rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group transition-colors duration-1000 ${
                esIngeniero
                    ? 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-700'
                    : 'bg-blue-900'
            }`}>
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    {esIngeniero ? <GraduationCap size={200} /> : <Anchor size={200} />}
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-1 italic">
                        {esIngeniero ? `¡Felicidades, Ingeniero ${userData.name.split(' ')[0]}!` : `¡Bienvenido a bordo, ${userData.name}!`}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`px-2.5 py-1 rounded-md font-mono text-xs shadow-sm tracking-wider border ${
                esIngeniero ? 'bg-yellow-700/50 border-yellow-400' : 'bg-blue-800/80 border-blue-700'
            }`}>
              {userData.code}
            </span>
                        <span className={`font-medium text-sm ${esIngeniero ? 'text-yellow-100' : 'text-blue-200'}`}>
              {userData.career} • <span className={`font-bold ${esIngeniero ? 'text-white' : 'text-blue-300'}`}>{userData.mencion}</span>
            </span>
                    </div>
                </div>
            </div>

            {/* Tarjeta de Progreso Académico */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <Target className={esIngeniero ? "text-yellow-500" : "text-blue-500"} size={20}/> Resumen de Progreso
                    </h3>
                    <span className={`text-3xl font-black ${esIngeniero ? 'text-yellow-500 drop-shadow-sm' : 'text-blue-600'}`}>
            {porcentajeProgreso}%
          </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200 shadow-inner">
                    <div
                        className={`h-full transition-all duration-1000 ${
                            esIngeniero
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                : 'bg-gradient-to-r from-blue-600 to-emerald-400'
                        }`}
                        style={{ width: `${porcentajeProgreso}%` }}
                    ></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className={`p-5 rounded-xl border transition-colors duration-500 ${
                        esIngeniero ? 'bg-yellow-50/50 border-yellow-100' : 'bg-gray-50 border-gray-100'
                    }`}>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1 tracking-widest">Unidades de Crédito</p>
                        <p className="text-2xl font-black text-gray-800">
                            {ucAprobadas} <span className="text-sm font-medium text-gray-400">/ {TOTAL_UC_CARRERA}</span>
                        </p>
                    </div>
                    <div className={`p-5 rounded-xl border transition-colors duration-500 ${
                        esIngeniero ? 'bg-yellow-50/50 border-yellow-100' : 'bg-gray-50 border-gray-100'
                    }`}>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1 tracking-widest">Materias Aprobadas</p>
                        <p className="text-2xl font-black text-gray-800">
                            {materiasCompletadas} <span className="text-sm font-medium text-gray-400">/ {TOTAL_MATERIAS_CARRERA}</span>
                        </p>
                    </div>
                </div>

                <div className={`mt-6 p-4 rounded-xl flex gap-3 items-start border shadow-sm transition-all duration-700 ${
                    esIngeniero
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300'
                        : esCasiIngeniero ? 'bg-orange-50 border-orange-100'
                            : 'bg-blue-50 border-blue-100'
                }`}>
                    {esIngeniero ? <Award className="text-yellow-600 shrink-0" size={28}/> :
                        esCasiIngeniero ? <Award className="text-orange-500 shrink-0" size={24}/> :
                            <Sparkles className="text-blue-500 shrink-0" size={24}/>}

                    <p className={`text-sm font-medium italic ${
                        esIngeniero ? 'text-yellow-900 text-base font-black not-italic' :
                            esCasiIngeniero ? 'text-orange-800' :
                                'text-blue-800'
                    }`}>{getMotivationalMessage()}</p>
                </div>
            </div>

            {/* Accesos Rápidos y Clases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-blue-950 text-lg mb-6 flex items-center gap-2">
                        <Calendar className="text-blue-600" size={22} /> Próximas Clases
                    </h3>
                    <div className="space-y-4">
                        {materiasInscritas && materiasInscritas.length > 0 ? (
                            materiasInscritas.slice(0, 3).map((m, idx) => (
                                <div key={m.codigo || m.code || idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden group hover:bg-white hover:shadow-md transition-all">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${m.color || 'bg-blue-500'}`}></div>
                                    <div className="text-center min-w-[50px]">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{m.day ? m.day.slice(0,3) : '---'}</p>
                                        <p className="text-sm font-black text-blue-600">{m.startTime || '--:--'}</p>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-gray-800 truncate">{m.nombre || m.name}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={12}/> {m.room || 'Aula Virtual'}
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 italic text-sm">
                                    {esIngeniero ? 'Pensum completado satisfactoriamente.' : 'No hay clases inscritas para este período.'}
                                </p>
                                {!esIngeniero && <Link to="/app/inscripciones" className="text-blue-600 text-xs font-bold hover:underline mt-2 inline-block">Ir a Inscripciones</Link>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-fit">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-emerald-200 transition-colors">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <TrendingUp className="text-emerald-500" size={24}/>
                        </div>
                        <span className="text-2xl font-black text-blue-950">15.5</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-wider">Promedio General</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-colors">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Book className="text-blue-500" size={24}/>
                        </div>
                        <span className="text-2xl font-black text-blue-950">{materiasInscritas ? materiasInscritas.length : 0}</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-wider">Materias en Curso</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;