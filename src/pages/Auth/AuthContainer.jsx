import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, User, Lock, Mail, ChevronRight, ArrowLeft, Info, AlertCircle, Loader2 } from 'lucide-react';
import { usePensum } from '../../context/PensumContext';

/**
 * Componente de entrada con Label Flotante.
 * Mantiene la coherencia visual con el resto de la suite MiUMC.
 */
const FloatingInput = ({ label, name, type = "text", icon: Icon, value, onChange, required = false }) => (
    <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-blue-600 transition-colors z-10 pointer-events-none">
            {Icon && <Icon size={18} />}
        </div>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder=" "
            required={required}
            className="peer w-full pl-12 pr-4 py-4 bg-white border border-gray-300 focus:border-blue-600 rounded-xl outline-none transition-all font-bold text-blue-950 placeholder-transparent"
        />
        <label className="absolute left-11 top-4 text-gray-400 font-medium transition-all pointer-events-none px-1 bg-white peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-black peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600 peer-[:not(:placeholder-shown)]:font-black uppercase tracking-widest">
            {label}
        </label>
    </div>
);

const AuthContainer = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showLoginContent, setShowLoginContent] = useState(true);
    const [showPassInfo, setShowPassInfo] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Conexión real con el contexto local
    const { login } = usePensum();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        studentCode: '',
        password: '',
        email: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleAuthMode = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setIsLogin(!isLogin);

        // Sincronización de la animación del panel azul
        setTimeout(() => {
            setShowLoginContent(!showLoginContent);
        }, 350);

        setTimeout(() => {
            setIsAnimating(false);
        }, 700);
    };

    const handleAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (showLoginContent) {
            // --- INICIO DE SESIÓN (SESSION START) ---
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentCode: formData.studentCode,
                        password: formData.password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Guardamos el usuario en el contexto y sessionStorage
                    login(data.user);
                    navigate('/app');
                } else {
                    alert(data.message || "Credenciales incorrectas.");
                }
            } catch (err) {
                alert("Error de conexión con el servidor MySQL local.");
                console.error("Error en login:", err);
            } finally {
                setIsLoading(false);
            }
        } else {
            // --- REGISTRO (PASO 1) ---
            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    // Guardamos el código para el siguiente paso del Onboarding
                    sessionStorage.setItem('pending_student_code', formData.studentCode);
                    navigate('/onboarding');
                } else {
                    alert(data.message || "Error al crear la cuenta base.");
                }
            } catch (err) {
                alert("Error de conexión con el servidor MySQL local.");
                console.error("Error en registro:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-animate">

            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 font-bold z-30 transition-colors"
            >
                <ArrowLeft size={20} /> Volver
            </button>

            {/* 🌟 AJUSTE MÓVIL: min-h-[650px] evita cortes cuando se abre el teclado */}
            <div className="w-full max-w-[1000px] min-h-[650px] md:h-[600px] md:min-h-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 transition-all duration-500">

                {/* Panel Azul Deslizable (Oculto en móvil) */}
                <div className={`hidden md:flex w-2/5 bg-blue-900 p-12 text-white flex-col justify-center relative transition-all duration-700 ease-in-out z-20 ${!isLogin ? 'md:translate-x-[150%]' : ''}`}>
                    <div className="relative z-10 space-y-6">
                        <Anchor size={48} className="text-blue-400 mb-4 animate-pulse" />
                        <h2 className="text-3xl font-black italic leading-tight">
                            {isLogin ? '¡Hola de nuevo, Cadete!' : 'Únete a la Tripulación'}
                        </h2>
                        <p className="text-blue-200 font-medium leading-relaxed opacity-80 italic">
                            {isLogin
                                ? 'Ingresa tus credenciales para acceder a tu control académico y aula virtual.'
                                : 'Crea tu cuenta base para empezar tu registro formal en la UMC.'}
                        </p>
                        <button
                            onClick={toggleAuthMode}
                            disabled={isAnimating}
                            className="mt-8 px-8 py-3 border-2 border-white/30 rounded-xl font-black text-xs tracking-widest hover:bg-white hover:text-blue-950 transition-all active:scale-95 disabled:opacity-50 uppercase"
                        >
                            {isLogin ? 'Crear Cuenta' : 'Ya tengo cuenta'}
                        </button>
                    </div>
                    <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"></div>
                </div>

                {/* Lado del Formulario */}
                <div className={`flex-1 flex flex-col bg-white transition-all duration-700 ease-in-out overflow-y-auto overflow-x-hidden ${!isLogin ? 'md:-translate-x-[66.6%]' : ''}`}>

                    <div className="max-w-md mx-auto w-full h-full flex flex-col px-8 py-10 md:py-12 justify-center">
                        {showLoginContent ? (
                            /* FORMULARIO DE LOGIN */
                            <form onSubmit={handleAction} className="my-auto space-y-2 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="mb-10 text-center md:text-left">
                                    <h1 className="text-4xl font-black text-blue-950 mb-2 italic">Iniciar Sesión</h1>
                                    <p className="text-gray-400 font-medium italic uppercase tracking-widest text-[10px]">Portal MiUMC ⚓</p>
                                </div>

                                <FloatingInput label="Código de Estudiante" name="studentCode" icon={User} value={formData.studentCode} onChange={handleChange} required />

                                <div className="relative">
                                    <FloatingInput label="Contraseña" name="password" type="password" icon={Lock} value={formData.password} onChange={handleChange} required />
                                    <button
                                        type="button"
                                        onMouseEnter={() => setShowPassInfo(true)}
                                        onMouseLeave={() => setShowPassInfo(false)}
                                        className="absolute right-4 top-[24px] text-gray-300 hover:text-blue-600 transition-colors z-10"
                                    >
                                        <Info size={18} />
                                    </button>

                                    {showPassInfo && (
                                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-blue-950 text-white p-4 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95">
                                            <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> REQUISITOS:</p>
                                            <ul className="space-y-1 opacity-80 text-[11px]">
                                                <li>• Mínimo 8 caracteres</li>
                                                <li>• Al menos 1 Mayúscula</li>
                                                <li>• 1 Carácter especial</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pb-4">
                                    <button type="button" className="text-sm font-bold text-blue-600 hover:underline">¿Olvidaste tu contraseña?</button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-fill w-full py-5 border-2 border-blue-950 text-blue-950 rounded-2xl font-black text-lg shadow-xl transition-all uppercase flex justify-center items-center gap-2 overflow-hidden disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? <><Loader2 size={20} className="animate-spin" /> Procesando...</> : 'Iniciar Sesión'}
                                    </span>
                                </button>

                                {/* 🌟 Botón de cambio de vista exclusivo para MÓVILES */}
                                <div className="md:hidden pt-8 text-center border-t border-gray-100 mt-8">
                                    <p className="text-sm text-gray-500 mb-2">¿No tienes una cuenta aún?</p>
                                    <button
                                        type="button"
                                        onClick={toggleAuthMode}
                                        disabled={isAnimating}
                                        className="text-blue-600 font-black uppercase tracking-widest text-sm active:scale-95 transition-transform"
                                    >
                                        Crear Cuenta Nueva
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* FORMULARIO DE REGISTRO */
                            <form onSubmit={handleAction} className="my-auto space-y-6 animate-in fade-in slide-in-from-left-8 duration-500">
                                <div className="mb-8 text-center md:text-left">
                                    <h1 className="text-4xl font-black text-blue-950 mb-2 italic">Crear Cuenta</h1>
                                    <p className="text-gray-400 font-medium tracking-tight">Paso 1: Credenciales base</p>
                                </div>

                                <div className="space-y-1">
                                    <FloatingInput label="Código Estudiante (ID)" name="studentCode" icon={User} value={formData.studentCode} onChange={handleChange} required />
                                    <FloatingInput label="Correo Electrónico" name="email" type="email" icon={Mail} value={formData.email} onChange={handleChange} required />
                                    <FloatingInput label="Establecer Contraseña" name="password" type="password" icon={Lock} value={formData.password} onChange={handleChange} required />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-fill w-full py-5 border-2 border-blue-950 text-blue-950 rounded-2xl font-black text-lg transition-all uppercase flex justify-center items-center gap-2 overflow-hidden disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? <><Loader2 size={20} className="animate-spin" /> Procesando...</> : <>Continuar Registro <ChevronRight size={20} /></>}
                                    </span>
                                </button>

                                {/* 🌟 Botón de cambio de vista exclusivo para MÓVILES */}
                                <div className="md:hidden pt-8 text-center border-t border-gray-100 mt-6">
                                    <p className="text-sm text-gray-500 mb-2">¿Ya estás registrado en MiUMC?</p>
                                    <button
                                        type="button"
                                        onClick={toggleAuthMode}
                                        disabled={isAnimating}
                                        className="text-blue-600 font-black uppercase tracking-widest text-sm active:scale-95 transition-transform"
                                    >
                                        Iniciar Sesión
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .btn-fill { position: relative; z-index: 1; background: transparent; overflow: hidden; }
                .btn-fill::before { 
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
                .btn-fill:hover::before { transform: scaleX(1); }
                .btn-fill:hover { color: white !important; border-color: transparent !important; }
            `}</style>
        </div>
    );
};

export default AuthContainer;