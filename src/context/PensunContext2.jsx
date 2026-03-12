import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';

const PensumContext = createContext();

export const usePensum = () => useContext(PensumContext);

// 🌟 Definimos la URL base para el backend de Laravel
const API_URL = 'http://localhost:8000/api';

export const PensumProvider = ({ children }) => {
    // 1. Inicializar el usuario desde sessionStorage para persistencia al recargar
    const [user, setUser] = useState(() => {
        try {
            const savedSession = sessionStorage.getItem('miumc_session');
            return savedSession ? JSON.parse(savedSession) : null;
        } catch (error) {
            return null;
        }
    });

    const [materiasAprobadas, setMateriasAprobadas] = useState(new Set());
    const [allSubjects, setAllSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [materiasInscritas, setMateriasInscritas] = useState([]);

    // 🌟 NUEVO: Estado global para notificaciones del Aula Virtual (Campanita)
    const [pendingTasksCount, setPendingTasksCount] = useState(0);

    // Totales iniciales por defecto (se sobreescriben con la DB)
    const [totalesCarrera, setTotalesCarrera] = useState({ uc: 225, materias: 71 });

    // 🔄 FUNCIÓN DE CARGA DINÁMICA: Obtiene el pensum y el progreso real del servidor
    const fetchUserData = useCallback(async (userData) => {
        if (!userData || !userData.code) return;

        setLoading(true);

        // Mapeo dinámico para las rutas de la API
        const mencionToId = {
            'Redes y Telecomunicaciones': 1,
            'Seguridad Informática': 2,
            'Automatización de Procesos': 3,
            'Gestión de Datos': 4
        };
        const specId = mencionToId[userData.mencion] || 1;

        try {
            // 🌟 Consultamos progreso, pensum y ahora INSCRIPCIONES en paralelo
            // 🚨 CAMBIO APLICADO: Puerto 8000 y nueva ruta de especializaciones/materias
            const [progressRes, subjectsRes, enrollmentsRes] = await Promise.all([
                fetch(`${API_URL}/progress/${userData.code}`),
                fetch(`${API_URL}/specializations/${specId}/subjects`), // <--- Ruta actualizada según la imagen
                fetch(`${API_URL}/enrollments/${userData.code}`)
            ]);

            if (!progressRes.ok || !subjectsRes.ok) throw new Error("Error en la conexión con el servidor");

            const approvedCodes = await progressRes.json();
            const subjectsDB = await subjectsRes.json();

            // 🌟 Capturamos y seteamos las materias inscritas en la BDD
            if (enrollmentsRes.ok) {
                const enrolledData = await enrollmentsRes.json();
                // Adaptamos las claves de BDD al Frontend para que coincidan (codigo, nombre, etc)
                const formattedEnrollments = enrolledData.map(m => ({
                    ...m,
                    codigo: m.code,
                    nombre: m.name
                }));
                setMateriasInscritas(formattedEnrollments);

                // 🌟 SIMULACIÓN TEMPORAL: Notificaciones de tareas pendientes en el Aula Virtual
                if (formattedEnrollments.length > 0) {
                    setPendingTasksCount(Math.floor(Math.random() * 4) + 1); // Entre 1 y 4 tareas pendientes
                } else {
                    setPendingTasksCount(0);
                }
            }

            // Guardamos la lista completa de materias para cálculos posteriores
            setAllSubjects(subjectsDB);
            // Actualizamos el Set de materias aprobadas del usuario
            setMateriasAprobadas(new Set(approvedCodes));

            // 🧮 CÁLCULO MATEMÁTICO REAL DEL PENSUM
            if (Array.isArray(subjectsDB) && subjectsDB.length > 0) {
                // Filtramos obligatorias de la mención + comunes
                const obligatorias = subjectsDB.filter(m => m.type === 'Obligatoria');
                const totalUcObligatorias = obligatorias.reduce((sum, m) => sum + m.uc, 0);

                // Calculamos cuántas electivas requiere (1 por semestre que tenga electivas)
                const semestresConElectivas = new Set(subjectsDB.filter(m => m.type === 'Electiva').map(m => m.semester));
                const cantidadElectivasReq = semestresConElectivas.size;
                const ucElectivasReq = cantidadElectivasReq * 2; // Las electivas en el pensum UMC suelen valer 2 UC

                setTotalesCarrera({
                    uc: totalUcObligatorias + ucElectivasReq,
                    materias: obligatorias.length + cantidadElectivasReq
                });
            }
        } catch (err) {
            console.error("⚓ Error sincronizando progreso con MySQL:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔔 FUNCIÓN DE NOTIFICACIÓN GLOBAL (Para sincronización inmediata desde el Panel Admin)
    const syncGlobalData = (targetUserCode, newRecords) => {
        const currentCode = user?.code || user?.student_code;
        if (currentCode === targetUserCode) {
            setMateriasAprobadas(new Set(newRecords));
        }
    };

    // Efecto para recargar datos cada vez que el usuario cambia o inicia sesión
    useEffect(() => {
        if (user) {
            fetchUserData(user);
        } else {
            setMateriasAprobadas(new Set());
            setAllSubjects([]);
            setMateriasInscritas([]);
            setPendingTasksCount(0);
        }
    }, [user, fetchUserData]);

    // Función de Login centralizada
    const login = (userData) => {
        const avatar = (userData.full_name || "UM").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        const sessionData = {
            id: userData.id,
            name: userData.full_name || userData.name,
            code: userData.student_code || userData.code,
            role: userData.role || 'cadete',
            career: "Ingeniería Informática",
            mencion: userData.mencion_name || userData.mencion || "Redes y Telecomunicaciones",
            avatar: avatar
        };

        setUser(sessionData);
        sessionStorage.setItem('miumc_session', JSON.stringify(sessionData));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('miumc_session');
        setMateriasAprobadas(new Set());
        setAllSubjects([]);
        setMateriasInscritas([]);
        setTotalesCarrera({ uc: 225, materias: 71 });
        setPendingTasksCount(0);
    };

    // 📈 CÁLCULO DE UC APROBADAS EN TIEMPO REAL
    const ucAprobadas = useMemo(() => {
        let sum = 0;
        if (!allSubjects.length) return 0;

        materiasAprobadas.forEach(code => {
            const subject = allSubjects.find(s => s.code === code);
            if (subject) sum += subject.uc;
        });
        return sum;
    }, [materiasAprobadas, allSubjects]);

    return (
        <PensumContext.Provider value={{
            user, login, logout, loading,
            materiasAprobadas, setMateriasAprobadas,
            materiasInscritas, setMateriasInscritas,
            ucAprobadas, totalesCarrera,
            allSubjects, syncGlobalData,
            pendingTasksCount, setPendingTasksCount
        }}>
            {children}
        </PensumContext.Provider>
    );
};