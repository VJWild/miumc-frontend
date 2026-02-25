
export const USER = {
    name: "Victor J. Gonzalez",
    code: "INGINF-26327337",
    career: "Ing. Informática",
    mencion: "Redes y Telecomunicaciones",
    avatar: "VJ"
};

export const TOTAL_UC_CARRERA = 225;
export const TOTAL_MATERIAS_CARRERA = 71; // Promedio para culminar (Redes)

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
export const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 a 22:00
export const COLORS = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'];
export const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Base de Datos Central del Pensum: TODAS LAS MENCIONES Y ELECTIVAS
export const dbMaterias = [
    // SEMESTRE 1
    { semestre: 1, codigo: "LEN-113", nombre: "Lenguaje y Comunicación I", uc: 3, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "ING-113", nombre: "Inglés I", uc: 3, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "INF-102", nombre: "Informática Básica", uc: 2, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "CAL-114", nombre: "Cálculo I", uc: 4, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "CIE-102", nombre: "Ciencia e Ingeniería", uc: 2, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "LOG-103", nombre: "Lógica", uc: 3, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "TID-102", nombre: "Técnicas de Inv. Documental", uc: 2, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 1, codigo: "DPT-102", nombre: "Deporte", uc: 2, prelacion: null, mencion: "Todas", tipo: "Obligatoria" },

    // SEMESTRE 2
    { semestre: 2, codigo: "LEN-223", nombre: "Lenguaje y Comunicación II", uc: 3, prelacion: "LEN-113", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 2, codigo: "ING-223", nombre: "Inglés II", uc: 3, prelacion: "ING-113", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 2, codigo: "ALG-203", nombre: "Algebra Lineal", uc: 3, prelacion: "CAL-114", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 2, codigo: "CAL-224", nombre: "Cálculo II", uc: 4, prelacion: "CAL-114", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 2, codigo: "FIS-214", nombre: "Fisica I", uc: 4, prelacion: "CAL-114", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 2, codigo: "OAE-202", nombre: "Org. y Adm. de Empresas", uc: 2, prelacion: "INF-102", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 2, codigo: "EDD-203", nombre: "Estructura de Datos", uc: 3, prelacion: "INF-102/LOG-103", mencion: "Todas", tipo: "Obligatoria" },

    // SEMESTRE 3
    { semestre: 3, codigo: "ING-333", nombre: "Inglés III", uc: 3, prelacion: "ING-223", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 3, codigo: "LAF-312", nombre: "Laboratorio de Física I", uc: 2, prelacion: "FIS-214", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 3, codigo: "CAL-334", nombre: "Cálculo III", uc: 4, prelacion: "CAL-224", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 3, codigo: "FIS-324", nombre: "Física II", uc: 4, prelacion: "FIS-214", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 3, codigo: "MAT-302", nombre: "Matemática Discreta", uc: 2, prelacion: "ALG-203", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 3, codigo: "BDD-304", nombre: "Base de Datos", uc: 4, prelacion: "EDD-203", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 3, codigo: "TEC-303", nombre: "Teoria Económica", uc: 3, prelacion: "30 UC APROB", mencion: "Todas", tipo: "Obligatoria" },

    // SEMESTRE 4
    { semestre: 4, codigo: "ING-443", nombre: "Inglés IV", uc: 3, prelacion: "ING-333", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 4, codigo: "LAF-422", nombre: "Laboratorio de Física II", uc: 2, prelacion: "LAF-312/FIS-324", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 4, codigo: "CAL-444", nombre: "Cálculo IV", uc: 4, prelacion: "CAL-334", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 4, codigo: "FDR-403", nombre: "Fundamentos de Redes", uc: 3, prelacion: "BDD-304", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 4, codigo: "TDG-414", nombre: "Tecnologia Digital I", uc: 4, prelacion: "LOG-103/P-LAF-422", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 4, codigo: "PRO-413", nombre: "Programación I", uc: 3, prelacion: "EDD-203", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 4, codigo: "ADC-403", nombre: "Arquitectura del Computador", uc: 3, prelacion: "EDD-203", mencion: "Todas", tipo: "Obligatoria" },

    // SEMESTRE 5
    { semestre: 5, codigo: "ING-553", nombre: "Inglés V", uc: 3, prelacion: "ING-443", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "LAD-502", nombre: "Laboratorio de Datos", uc: 2, prelacion: "BDD-304", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "SSC-502", nombre: "Servicio Social Comunitario", uc: 2, prelacion: "50% UC", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "EYP-503", nombre: "Estadística y Probabilidad", uc: 3, prelacion: "CAL-334", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "TDG-524", nombre: "Tecnologia Digital II", uc: 4, prelacion: "TDG-414", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "PRO-523", nombre: "Programación II", uc: 3, prelacion: "PRO-413", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "SOP-513", nombre: "Sistemas Operativos I", uc: 3, prelacion: "ADC-403", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 5, codigo: "RYT-502", nombre: "Seminario de Redes", uc: 2, prelacion: "FDR-403/80UC", mencion: "Redes y Telecomunicaciones", tipo: "Obligatoria" },
    { semestre: 5, codigo: "GDT-502", nombre: "Seminario de Gestión de Datos", uc: 2, prelacion: "BDD-304/80UC", mencion: "Gestión de Datos", tipo: "Obligatoria" },
    { semestre: 5, codigo: "SSI-502", nombre: "Seminario de Seg. Informática", uc: 2, prelacion: "BDD-304/80UC", mencion: "Seguridad Informática", tipo: "Obligatoria" },
    { semestre: 5, codigo: "SAP-502", nombre: "Seminario de Automatización", uc: 2, prelacion: "TDG-414/80UC", mencion: "Automatización de Procesos", tipo: "Obligatoria" },
    { semestre: 5, codigo: "OYP-502", nombre: "Org. y Prog. del Trabajo", uc: 2, prelacion: null, mencion: "Todas", tipo: "Electiva" },
    { semestre: 5, codigo: "GRH-502", nombre: "Gestión de Relaciones Humanas", uc: 2, prelacion: "70 UC", mencion: "Todas", tipo: "Electiva" },
    { semestre: 5, codigo: "TYD-502", nombre: "Teorías y Técnicas de Decisión", uc: 2, prelacion: "70 UC", mencion: "Todas", tipo: "Electiva" },

    // SEMESTRE 6
    { semestre: 6, codigo: "ING-663", nombre: "Inglés VI", uc: 3, prelacion: "ING-553", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 6, codigo: "SOP-623", nombre: "Sistemas Operativos II", uc: 3, prelacion: "SOP-513", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 6, codigo: "ISF-614", nombre: "Ingeniería del Software I", uc: 4, prelacion: "PRO-523/SOP-513", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 6, codigo: "PRO-633", nombre: "Programación III", uc: 3, prelacion: "PRO-523", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 6, codigo: "CAL-604", nombre: "Cálculo Numérico", uc: 4, prelacion: "CAL-444", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 6, codigo: "MEI-612", nombre: "Metodología de la Investigación I", uc: 2, prelacion: "TID-102", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 6, codigo: "RCB-613", nombre: "Redes Cableadas I", uc: 3, prelacion: "RYT-502", mencion: "Redes y Telecomunicaciones", tipo: "Obligatoria" },
    { semestre: 6, codigo: "TCS-603", nombre: "Tecnologia Cliente/Servidor", uc: 3, prelacion: "GDT-502", mencion: "Gestión de Datos", tipo: "Obligatoria" },
    { semestre: 6, codigo: "ARD-603", nombre: "Análisis y Rec. Delitos Inf.", uc: 3, prelacion: "SSI-502", mencion: "Seguridad Informática", tipo: "Obligatoria" },
    { semestre: 6, codigo: "PGC-603", nombre: "Programación de Circuitos", uc: 3, prelacion: "SAP-502", mencion: "Automatización de Procesos", tipo: "Obligatoria" },
    { semestre: 6, codigo: "RMM-602", nombre: "Reparación y Mant. de Micros", uc: 2, prelacion: "ADC-403", mencion: "Todas", tipo: "Electiva" },
    { semestre: 6, codigo: "DAC-602", nombre: "Diseño Asistido por Computador", uc: 2, prelacion: "90 UC", mencion: "Todas", tipo: "Electiva" },

    // SEMESTRE 7
    { semestre: 7, codigo: "ISF-724", nombre: "Ingenieria de Software II", uc: 4, prelacion: "ISF-614", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 7, codigo: "PRW-703", nombre: "Programación Web", uc: 3, prelacion: "PRO-633", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 7, codigo: "ING-773", nombre: "Inglés VII", uc: 3, prelacion: "ING-663", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 7, codigo: "MEI-722", nombre: "Metodología de la Inv. II", uc: 2, prelacion: "MEI-612", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 7, codigo: "IOP-703", nombre: "Investigación de Operaciones", uc: 3, prelacion: "ALG-203/EYP-503", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 7, codigo: "SDS-703", nombre: "Sistemas de Señales", uc: 3, prelacion: "LAF-422/CAL-444", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 7, codigo: "RCB-723", nombre: "Redes Cableadas II", uc: 3, prelacion: "RCB-613", mencion: "Redes y Telecomunicaciones", tipo: "Obligatoria" },
    { semestre: 7, codigo: "SGD-703", nombre: "Seguridad de Datos", uc: 3, prelacion: "TCS-603", mencion: "Gestión de Datos", tipo: "Obligatoria" },
    { semestre: 7, codigo: "SIN-703", nombre: "Seguridad Informática", uc: 3, prelacion: "ARD-603", mencion: "Seguridad Informática", tipo: "Obligatoria" },
    { semestre: 7, codigo: "ELT-703", nombre: "Electrónica", uc: 3, prelacion: "PGC-603", mencion: "Automatización de Procesos", tipo: "Obligatoria" },
    { semestre: 7, codigo: "SAU-702", nombre: "Sistemas Automatizados", uc: 2, prelacion: "ISF-614", mencion: "Todas", tipo: "Electiva" },
    { semestre: 7, codigo: "TGR-702", nombre: "Técnicas Gerenciales", uc: 2, prelacion: "OYP-502", mencion: "Todas", tipo: "Electiva" },
    { semestre: 7, codigo: "ARH-702", nombre: "Adm. de Recursos Humanos", uc: 2, prelacion: "100 UC", mencion: "Todas", tipo: "Electiva" },

    // SEMESTRE 8
    { semestre: 8, codigo: "FEP-803", nombre: "Formulación de Proyectos", uc: 3, prelacion: "ISF-724", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 8, codigo: "IEN-803", nombre: "Ingeniería Económica", uc: 3, prelacion: "TEC-303", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 8, codigo: "FDD-802", nombre: "Fundamentos del derecho", uc: 2, prelacion: "120UC", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 8, codigo: "TRD-814", nombre: "Transmisión de Datos I", uc: 4, prelacion: "SDS-703", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 8, codigo: "CTB-803", nombre: "Contabilidad General", uc: 3, prelacion: "100 UC", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 8, codigo: "PRE-803", nombre: "Programación Emergente", uc: 3, prelacion: "PRW-703", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 8, codigo: "RIB-813", nombre: "Redes Inalámbricas I", uc: 3, prelacion: "RCB-723", mencion: "Redes y Telecomunicaciones", tipo: "Obligatoria" },
    { semestre: 8, codigo: "ABD-813", nombre: "Administración de BD I", uc: 3, prelacion: "SGD-703", mencion: "Gestión de Datos", tipo: "Obligatoria" },
    { semestre: 8, codigo: "CRP-803", nombre: "Criptografía", uc: 3, prelacion: "SIN-703", mencion: "Seguridad Informática", tipo: "Obligatoria" },
    { semestre: 8, codigo: "MET-803", nombre: "Mecatrónica", uc: 3, prelacion: "ELT-703", mencion: "Automatización de Procesos", tipo: "Obligatoria" },
    { semestre: 8, codigo: "SAM-802", nombre: "Seguridad y Medio Ambiente", uc: 2, prelacion: "ARH-702", mencion: "Todas", tipo: "Electiva" },
    { semestre: 8, codigo: "PRD-802", nombre: "Producción", uc: 2, prelacion: "130 UC", mencion: "Todas", tipo: "Electiva" },
    { semestre: 8, codigo: "MAD-802", nombre: "Modelos Administrativos", uc: 2, prelacion: "OYP-502", mencion: "Todas", tipo: "Electiva" },

    // SEMESTRE 9
    { semestre: 9, codigo: "AUS-904", nombre: "Auditoria de Sistemas", uc: 4, prelacion: "ISF-724", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 9, codigo: "ETP-902", nombre: "Ética Profesional", uc: 2, prelacion: "153 UC", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 9, codigo: "TEL-903", nombre: "Transacciones Electrónicas", uc: 3, prelacion: "TRD-814", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 9, codigo: "TRD-924", nombre: "Transmisión de Datos II", uc: 4, prelacion: "TRD-814", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 9, codigo: "PRO-903", nombre: "Programación Multimedia", uc: 3, prelacion: "PRE-803", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 9, codigo: "STG-903", nombre: "Sem. de Trabajo de Grado", uc: 3, prelacion: "FEP-803", mencion: "Todas", tipo: "Obligatoria" },
    { semestre: 9, codigo: "RIB-923", nombre: "Redes Inalámbricas II", uc: 3, prelacion: "RIB-813", mencion: "Redes y Telecomunicaciones", tipo: "Obligatoria" },
    { semestre: 9, codigo: "ABD-923", nombre: "Administración de BD II", uc: 3, prelacion: "ABD-813", mencion: "Gestión de Datos", tipo: "Obligatoria" },
    { semestre: 9, codigo: "AFO-903", nombre: "Análisis Forense", uc: 3, prelacion: "CRP-803", mencion: "Seguridad Informática", tipo: "Obligatoria" },
    { semestre: 9, codigo: "CPI-903", nombre: "Control de Proc. Industriales", uc: 3, prelacion: "MET-803", mencion: "Automatización de Procesos", tipo: "Obligatoria" },
    { semestre: 9, codigo: "RPV-902", nombre: "VPN Redes Privadas Virt.", uc: 2, prelacion: "RIB-813", mencion: "Todas", tipo: "Electiva" },
    { semestre: 9, codigo: "DCM-902", nombre: "Diseño y Control de Modelos", uc: 2, prelacion: "IOP-703", mencion: "Todas", tipo: "Electiva" },
    { semestre: 9, codigo: "CEP-902", nombre: "Control Estad. de Procesos", uc: 2, prelacion: "IOP-703", mencion: "Todas", tipo: "Electiva" },
    { semestre: 9, codigo: "TLP-902", nombre: "Teoría de Leng. de Prog.", uc: 2, prelacion: "158 UC", mencion: "Todas", tipo: "Electiva" },

    // SEMESTRE 10
    { semestre: 10, codigo: "PAP-10020", nombre: "Pasantias Profesionales", uc: 20, prelacion: "205 UC", mencion: "Todas", tipo: "Obligatoria" }
];