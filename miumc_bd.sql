-- =========================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS: MiUMC (Versión Completa)
-- PROPIETARIO: Victor J. Gonzalez (Super Admin)
-- MOTOR: MySQL 8.0+
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Crear Base de Datos
CREATE DATABASE IF NOT EXISTS miumc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE miumc_db;

-- 2. Tabla de Carreras
CREATE TABLE IF NOT EXISTS careers (
                                       id INT AUTO_INCREMENT PRIMARY KEY,
                                       name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

-- 3. Tabla de Menciones
CREATE TABLE IF NOT EXISTS specializations (
                                               id INT AUTO_INCREMENT PRIMARY KEY,
                                               career_id INT NOT NULL,
                                               name VARCHAR(100) NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

-- 4. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                     student_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT 'Sin teléfono',
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    birth_date DATE,
    career_id INT,
    specialization_id INT,
    role ENUM('cadete', 'admin') DEFAULT 'cadete',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (career_id) REFERENCES careers(id),
    FOREIGN KEY (specialization_id) REFERENCES specializations(id)
    ) ENGINE=InnoDB;

-- 5. Tabla de Materias (Pensum)
CREATE TABLE IF NOT EXISTS subjects (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        code VARCHAR(15) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    uc INT NOT NULL,
    semester INT NOT NULL,
    prelacion_text TEXT,
    specialization_id INT DEFAULT NULL, -- NULL si es común (Todas)
    type ENUM('Obligatoria', 'Electiva') DEFAULT 'Obligatoria',
    FOREIGN KEY (specialization_id) REFERENCES specializations(id)
    ) ENGINE=InnoDB;

-- 6. Tabla de Récord Académico
CREATE TABLE IF NOT EXISTS academic_records (
                                                id INT AUTO_INCREMENT PRIMARY KEY,
                                                user_id INT NOT NULL,
                                                subject_id INT NOT NULL,
                                                grade DECIMAL(4,2) DEFAULT NULL,
    status ENUM('aprobada', 'reprobada', 'en_curso') DEFAULT 'aprobada',
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_subject (user_id, subject_id)
    ) ENGINE=InnoDB;

-- 7. TABLA DE INSCRIPCIONES
CREATE TABLE IF NOT EXISTS enrollments (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           user_id INT NOT NULL,
                                           subject_id INT NOT NULL,
                                           period VARCHAR(20) DEFAULT '2026-I',
    schedule_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;


-- =========================================================================
-- CARGA DE DATOS INICIALES (CARRERAS Y MENCIONES)
-- =========================================================================

INSERT INTO careers (code, name) VALUES
                                     ('INGINF', 'Ingeniería Informática'),
                                     ('INGM',   'Ingeniería Marítima'),
                                     ('INGAMB', 'Ingeniería Ambiental'),
                                     ('ADM',    'Administración'),
                                     ('TUR',    'Turismo'),
                                     ('TSUACU', 'TSU Transporte Acuático');

INSERT INTO specializations (id, career_id, name) VALUES
                                                      (1, 1, 'Redes y Telecomunicaciones'),
                                                      (2, 1, 'Seguridad Informática'),
                                                      (3, 1, 'Automatización de Procesos'),
                                                      (4, 1, 'Gestión de Datos');

-- =========================================================================
-- CARGA MASIVA DE MATERIAS (PENSUM UMC)
-- =========================================================================

-- SEMESTRE 1 (Común)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('LEN-113', 'Lenguaje y Comunicación I', 3, 1, NULL, 'Obligatoria'),
                                                                             ('ING-113', 'Inglés I', 3, 1, NULL, 'Obligatoria'),
                                                                             ('INF-102', 'Informática Básica', 2, 1, NULL, 'Obligatoria'),
                                                                             ('CAL-114', 'Cálculo I', 4, 1, NULL, 'Obligatoria'),
                                                                             ('CIE-102', 'Ciencia e Ingeniería', 2, 1, NULL, 'Obligatoria'),
                                                                             ('LOG-103', 'Lógica', 3, 1, NULL, 'Obligatoria'),
                                                                             ('TID-102', 'Técnicas de Inv. Documental', 2, 1, NULL, 'Obligatoria'),
                                                                             ('DPT-102', 'Deporte', 2, 1, NULL, 'Obligatoria');

-- SEMESTRE 2 (Común)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('LEN-223', 'Lenguaje y Comunicación II', 3, 2, NULL, 'Obligatoria'),
                                                                             ('ING-223', 'Inglés II', 3, 2, NULL, 'Obligatoria'),
                                                                             ('ALG-203', 'Algebra Lineal', 3, 2, NULL, 'Obligatoria'),
                                                                             ('CAL-224', 'Cálculo II', 4, 2, NULL, 'Obligatoria'),
                                                                             ('FIS-214', 'Fisica I', 4, 2, NULL, 'Obligatoria'),
                                                                             ('OAE-202', 'Org. y Adm. de Empresas', 2, 2, NULL, 'Obligatoria'),
                                                                             ('EDD-203', 'Estructura de Datos', 3, 2, NULL, 'Obligatoria');

-- SEMESTRE 3 (Común)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('ING-333', 'Inglés III', 3, 3, NULL, 'Obligatoria'),
                                                                             ('LAF-312', 'Laboratorio de Física I', 2, 3, NULL, 'Obligatoria'),
                                                                             ('CAL-334', 'Cálculo III', 4, 3, NULL, 'Obligatoria'),
                                                                             ('FIS-324', 'Física II', 4, 3, NULL, 'Obligatoria'),
                                                                             ('MAT-302', 'Matemática Discreta', 2, 3, NULL, 'Obligatoria'),
                                                                             ('BDD-304', 'Base de Datos', 4, 3, NULL, 'Obligatoria'),
                                                                             ('TEC-303', 'Teoria Económica', 3, 3, NULL, 'Obligatoria');

-- SEMESTRE 4 (Común)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('ING-443', 'Inglés IV', 3, 4, NULL, 'Obligatoria'),
                                                                             ('LAF-422', 'Laboratorio de Física II', 2, 4, NULL, 'Obligatoria'),
                                                                             ('CAL-444', 'Cálculo IV', 4, 4, NULL, 'Obligatoria'),
                                                                             ('FDR-403', 'Fundamentos de Redes', 3, 4, NULL, 'Obligatoria'),
                                                                             ('TDG-414', 'Tecnologia Digital I', 4, 4, NULL, 'Obligatoria'),
                                                                             ('PRO-413', 'Programación I', 3, 4, NULL, 'Obligatoria'),
                                                                             ('ADC-403', 'Arquitectura del Computador', 3, 4, NULL, 'Obligatoria');

-- SEMESTRE 5 (Comunes, Especialización y Electivas)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('ING-553', 'Inglés V', 3, 5, NULL, 'Obligatoria'),
                                                                             ('LAD-502', 'Laboratorio de Datos', 2, 5, NULL, 'Obligatoria'),
                                                                             ('SSC-502', 'Servicio Social Comunitario', 2, 5, NULL, 'Obligatoria'),
                                                                             ('EYP-503', 'Estadística y Probabilidad', 3, 5, NULL, 'Obligatoria'),
                                                                             ('TDG-524', 'Tecnologia Digital II', 4, 5, NULL, 'Obligatoria'),
                                                                             ('PRO-523', 'Programación II', 3, 5, NULL, 'Obligatoria'),
                                                                             ('SOP-513', 'Sistemas Operativos I', 3, 5, NULL, 'Obligatoria'),
-- Específicas Semestre 5
                                                                             ('RYT-502', 'Seminario de Redes', 2, 5, 1, 'Obligatoria'),
                                                                             ('GDT-502', 'Seminario de Gestión de Datos', 2, 5, 4, 'Obligatoria'),
                                                                             ('SSI-502', 'Seminario de Seg. Informática', 2, 5, 2, 'Obligatoria'),
                                                                             ('SAP-502', 'Seminario de Automatización', 2, 5, 3, 'Obligatoria'),
-- Electivas Semestre 5
                                                                             ('TYD-502', 'Teorías y Técnicas de Decisión', 2, 5, NULL, 'Electiva'),
                                                                             ('OYP-502', 'Org. y Prog. del Trabajo', 2, 5, NULL, 'Electiva'),
                                                                             ('GRH-502', 'Gestión de Relaciones Humanas', 2, 5, NULL, 'Electiva');

-- SEMESTRE 6 (Comunes, Especialización y Electivas)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('ING-663', 'Inglés VI', 3, 6, NULL, 'Obligatoria'),
                                                                             ('SOP-623', 'Sistemas Operativos II', 3, 6, NULL, 'Obligatoria'),
                                                                             ('ISF-614', 'Ingeniería del Software I', 4, 6, NULL, 'Obligatoria'),
                                                                             ('PRO-633', 'Programación III', 3, 6, NULL, 'Obligatoria'),
                                                                             ('CAL-604', 'Cálculo Numérico', 4, 6, NULL, 'Obligatoria'),
                                                                             ('MEI-612', 'Metodología de la Investigación I', 2, 6, NULL, 'Obligatoria'),
-- Específicas Semestre 6
                                                                             ('RCB-613', 'Redes Cableadas I', 3, 6, 1, 'Obligatoria'),
                                                                             ('TCS-603', 'Tecnologia Cliente/Servidor', 3, 6, 4, 'Obligatoria'),
                                                                             ('ARD-603', 'Análisis y Rec. Delitos Inf.', 3, 6, 2, 'Obligatoria'),
                                                                             ('PGC-603', 'Programación de Circuitos', 3, 6, 3, 'Obligatoria'),
-- Electivas Semestre 6
                                                                             ('RMM-602', 'Reparación y Mant. de Micros', 2, 6, NULL, 'Electiva'),
                                                                             ('DAC-602', 'Diseño Asistido por Computador', 2, 6, NULL, 'Electiva');

-- SEMESTRE 7 (Comunes, Especialización y Electivas)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('ISF-724', 'Ingenieria de Software II', 4, 7, NULL, 'Obligatoria'),
                                                                             ('PRW-703', 'Programación Web', 3, 7, NULL, 'Obligatoria'),
                                                                             ('ING-773', 'Inglés VII', 3, 7, NULL, 'Obligatoria'),
                                                                             ('MEI-722', 'Metodología de la Inv. II', 2, 7, NULL, 'Obligatoria'),
                                                                             ('IOP-703', 'Investigación de Operaciones', 3, 7, NULL, 'Obligatoria'),
                                                                             ('SDS-703', 'Sistemas de Señales', 3, 7, NULL, 'Obligatoria'),
-- Específicas Semestre 7
                                                                             ('RCB-723', 'Redes Cableadas II', 3, 7, 1, 'Obligatoria'),
                                                                             ('SGD-703', 'Seguridad de Datos', 3, 7, 4, 'Obligatoria'),
                                                                             ('SIN-703', 'Seguridad Informática', 3, 7, 2, 'Obligatoria'),
                                                                             ('ELT-703', 'Electrónica', 3, 7, 3, 'Obligatoria'),
-- Electivas Semestre 7
                                                                             ('TGR-702', 'Técnicas Gerenciales', 2, 7, NULL, 'Electiva'),
                                                                             ('SAU-702', 'Sistemas Automatizados', 2, 7, NULL, 'Electiva'),
                                                                             ('ARH-702', 'Adm. de Recursos Humanos', 2, 7, NULL, 'Electiva');

-- SEMESTRE 8 (Comunes, Especialización y Electivas)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('FEP-803', 'Formulación de Proyectos', 3, 8, NULL, 'Obligatoria'),
                                                                             ('IEN-803', 'Ingeniería Económica', 3, 8, NULL, 'Obligatoria'),
                                                                             ('FDD-802', 'Fundamentos del derecho', 2, 8, NULL, 'Obligatoria'),
                                                                             ('TRD-814', 'Transmisión de Datos I', 4, 8, NULL, 'Obligatoria'),
                                                                             ('CTB-803', 'Contabilidad General', 3, 8, NULL, 'Obligatoria'),
                                                                             ('PRE-803', 'Programación Emergente', 3, 8, NULL, 'Obligatoria'),
-- Específicas Semestre 8
                                                                             ('RIB-813', 'Redes Inalámbricas I', 3, 8, 1, 'Obligatoria'),
                                                                             ('ABD-813', 'Administración de BD I', 3, 8, 4, 'Obligatoria'),
                                                                             ('CRP-803', 'Criptografía', 3, 8, 2, 'Obligatoria'),
                                                                             ('MET-803', 'Mecatrónica', 3, 8, 3, 'Obligatoria'),
-- Electivas Semestre 8
                                                                             ('SAM-802', 'Seguridad y Medio Ambiente', 2, 8, NULL, 'Electiva'),
                                                                             ('PRD-802', 'Producción', 2, 8, NULL, 'Electiva'),
                                                                             ('MAD-802', 'Modelos Administrativos', 2, 8, NULL, 'Electiva');

-- SEMESTRE 9 (Comunes, Especialización y Electivas)
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
                                                                             ('AUS-904', 'Auditoria de Sistemas', 4, 9, NULL, 'Obligatoria'),
                                                                             ('ETP-902', 'Ética Profesional', 2, 9, NULL, 'Obligatoria'),
                                                                             ('TEL-903', 'Transacciones Electrónicas', 3, 9, NULL, 'Obligatoria'),
                                                                             ('TRD-924', 'Transmisión de Datos II', 4, 9, NULL, 'Obligatoria'),
                                                                             ('PRO-903', 'Programación Multimedia', 3, 9, NULL, 'Obligatoria'),
                                                                             ('STG-903', 'Sem. de Trabajo de Grado', 3, 9, NULL, 'Obligatoria'),
-- Específicas Semestre 9
                                                                             ('RIB-923', 'Redes Inalámbricas II', 3, 9, 1, 'Obligatoria'),
                                                                             ('ABD-923', 'Administración de BD II', 3, 9, 4, 'Obligatoria'),
                                                                             ('AFO-903', 'Análisis Forense', 3, 9, 2, 'Obligatoria'),
                                                                             ('CPI-903', 'Control de Proc. Industriales', 3, 9, 3, 'Obligatoria'),
-- Electivas Semestre 9
                                                                             ('RPV-902', 'VPN Redes Privadas Virt.', 2, 9, NULL, 'Electiva'),
                                                                             ('DCM-902', 'Diseño y Control de Modelos', 2, 9, NULL, 'Electiva'),
                                                                             ('CEP-902', 'Control Estad. de Procesos', 2, 9, NULL, 'Electiva'),
                                                                             ('TLP-902', 'Teoría de Leng. de Prog.', 2, 9, NULL, 'Electiva');

-- SEMESTRE 10
INSERT INTO subjects (code, name, uc, semester, specialization_id, type) VALUES
    ('PAP-10020', 'Pasantias Profesionales', 20, 10, NULL, 'Obligatoria');

-- =========================================================================
-- REGISTRO DE VICTOR J. GONZALEZ (ADMIN)
-- =========================================================================

INSERT INTO users (id, student_code, full_name, email, phone, password_hash, career_id, specialization_id, role, age, birth_date)
VALUES (1, 'INGINF-26327337', 'Victor J. Gonzalez', 'vjgg101@gmail.com', '0412-8226885', 'Vjgg+8544+', 1, 1, 'admin', 28, '2000-01-01');

-- =========================================================================
-- CARGA DE PROGRESO REAL DE VÍCTOR (70%)
-- =========================================================================

-- Aprobar todas las comunes de S1 a S4
INSERT INTO academic_records (user_id, subject_id)
SELECT 1, id FROM subjects WHERE semester <= 4;

-- Aprobar comunes de S5 a S8 y las específicas de REDES (ID 1)
INSERT INTO academic_records (user_id, subject_id)
SELECT 1, id FROM subjects WHERE semester BETWEEN 5 AND 8 AND (specialization_id IS NULL OR specialization_id = 1);

-- Aprobar Auditoría de Sistemas (S9)
INSERT INTO academic_records (user_id, subject_id)
SELECT 1, id FROM subjects WHERE code = 'AUS-904';

SET FOREIGN_KEY_CHECKS = 1;