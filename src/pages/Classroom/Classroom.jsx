import React from 'react';
import { MessageSquare, Book, User, MapPin, FileText, Upload } from 'lucide-react';
import { usePensum } from '../../context/PensumContext';

const Classroom = () => {
    const { materiasInscritas } = usePensum();

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-950 mb-1">Aula Virtual</h2>
                <p className="text-gray-500 text-sm">Accede al material de las materias inscritas.</p>
            </div>

            {materiasInscritas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
                    <MessageSquare size={64} className="text-gray-200 mb-4"/>
                    <p className="text-gray-500 font-medium text-lg">Inscribe materias en el pensum para ver tus aulas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
                    {materiasInscritas.map(m => (
                        <div key={m.codigo} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                            <div className={`h-24 w-full ${m.color} p-4 flex justify-between items-start relative overflow-hidden`}>
                                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform"><Book size={100}/></div>
                                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm relative z-10">{m.codigo}</span>
                                {Math.random() > 0.5 && <span className="bg-red-500 text-white text-[0.6rem] font-bold px-2 py-1 rounded-full relative z-10 shadow-sm border border-white">Nueva Tarea</span>}
                            </div>
                            <div className="p-5 pt-3 relative flex-1 flex flex-col">
                                <div className="absolute -top-8 right-4 w-14 h-14 bg-gray-100 rounded-full border-4 border-white overflow-hidden shadow-sm flex items-center justify-center text-gray-400">
                                    <User size={24}/>
                                </div>
                                <h3 className="font-bold text-gray-800 text-base leading-tight mb-1 pr-12">{m.nombre}</h3>
                                <p className="text-xs text-gray-500 mb-4 font-medium flex items-center gap-1"><MapPin size={12}/> {m.room} • {m.day}</p>

                                <div className="mt-auto grid grid-cols-2 gap-2">
                                    <button className="bg-blue-50 text-blue-600 rounded-lg py-2.5 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"><FileText size={14}/> Material</button>
                                    <button className="bg-orange-50 text-orange-600 rounded-lg py-2.5 text-xs font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-1.5"><Upload size={14}/> Entregas</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Classroom;