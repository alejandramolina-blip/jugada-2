-- ============================================================
-- SCRIPT DE BASE DE DATOS - CLUB JUGADA MAESTRA
-- Asignatura: Desarrollo de Soluciones Tecnológicas Asistidas por IA
-- Profesores: Boris Bugueño - Alejandro Paolini
-- ============================================================

-- 1. CREACIÓN DE TABLAS (DDL)

-- Tabla de Categorías Deportivas
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL -- Infantil, Juvenil, Adulto
);

-- Tabla de Jugadores
CREATE TABLE jugadores (
    id_jugador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- Tabla de Registro de Asistencia
CREATE TABLE asistencia (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_jugador INT,
    fecha DATE NOT NULL,
    estado_asistencia VARCHAR(20) NOT NULL, -- Presente, Ausente, Justificado
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador) ON DELETE CASCADE
);

-- Tabla de Control de Pagos y Cuotas Mensuales
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_jugador INT,
    mes_correspondiente VARCHAR(20) NOT NULL,
    monto INT NOT NULL,
    estado_pago VARCHAR(20) NOT NULL, -- Pagado, Pendiente, Atrasado
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador) ON DELETE CASCADE
);

-- ============================================================
-- 2. POBLAMIENTO INICIAL CON DATOS DE PRUEBA (DML)

-- Insertar Categorías obligatorias
INSERT INTO categorias (nombre_categoria) VALUES 
('Infantil'), 
('Juvenil'), 
('Adulto');

-- Insertar Jugadores de prueba
INSERT INTO jugadores (nombre, apellido, rut, id_categoria) VALUES 
('Carlos', 'González', '21.345.678-9', 1),
('Matías', 'Rodríguez', '19.876.543-2', 2),
('Sebastián', 'Muñoz', '18.456.123-K', 3),
('Diego', 'Silva', '22.112.334-5', 1),
('Lucas', 'Pérez', '20.556.778-1', 2);

-- Insertar Registros de Asistencia
INSERT INTO asistencia (id_jugador, fecha, estado_asistencia) VALUES 
(1, '2026-06-15', 'Presente'),
(2, '2026-06-15', 'Presente'),
(3, '2026-06-15', 'Ausente'),
(4, '2026-06-15', 'Presente'),
(5, '2026-06-15', 'Justificado');

-- Insertar Control de Pagos Mensuales
INSERT INTO pagos (id_jugador, mes_correspondiente, monto, estado_pago) VALUES 
(1, 'Junio 2026', 15000, 'Pagado'),
(2, 'Junio 2026', 15000, 'Pendiente'),
(3, 'Junio 2026', 20000, 'Atrasado'),
(4, 'Junio 2026', 15000, 'Pagado'),
(5, 'Junio 2026', 15000, 'Pendiente');
