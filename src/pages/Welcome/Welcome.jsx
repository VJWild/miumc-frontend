import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ChevronRight } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-animate text-white p-6">

            {/* Elementos decorativos de fondo (Sutiles y elegantes) */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-10 animate-in fade-in zoom-in duration-700">

                {/* Icono Central (Logo temporal de la UMC) */}
                <div className="flex justify-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl group-hover:bg-blue-400/20 transition-colors duration-500"></div>
                        <div className="relative bg-white p-6 rounded-3xl shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
                            <Anchor size={64} className="text-blue-950" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Títulos principales */}
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic drop-shadow-sm">
                        Mi<span className="text-blue-400 font-light">UMC</span>
                    </h1>
                    {/* Refrán actualizado: Más académico, menos náutico */}
                    <p className="text-xl md:text-2xl text-blue-100/80 font-medium max-w-lg mx-auto leading-relaxed italic">
                        Tu aula virtual acompañandote a tu destino.
                    </p>
                </div>

                {/* Botón de Acción con Efecto Fill */}
                <div className="pt-6">
                    <button
                        onClick={() => navigate('/auth')}
                        className="btn-fill group relative inline-flex items-center justify-center px-12 py-5 font-black text-xl bg-white text-blue-950 rounded-2xl shadow-2xl transition-all overflow-hidden border-2 border-white hover:border-blue-600"
                    >
            <span className="relative z-10 flex items-center gap-3">
              INGRESAR
              <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </span>
                    </button>
                </div>
            </div>

            {/* Footer minimalista e institucional */}
            <div className="absolute bottom-8 text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
                © 2026 Universidad Nacional Experimental Marítima del Caribe
            </div>

        </div>
    );
};

export default Welcome;