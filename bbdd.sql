-- ========================================
-- 1. CREACIÓN DE BASE DE DATOS
-- ========================================
CREATE DATABASE IF NOT EXISTS solidarify
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE solidarify;

-- ========================================
-- 2. TABLAS
-- ========================================

CREATE TABLE `rol` (
  `Id_Rol` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tipobien` (
  `Id_Tipo_Bien` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id_Tipo_Bien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--La contraseña de todos los usuarios es 123456
CREATE TABLE `usuario` (
  `Id_Usuario` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Foto_Perfil` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id_Usuario`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuariorol` (
  `Id_Usuario` int NOT NULL,
  `Id_Rol` int NOT NULL,
  PRIMARY KEY (`Id_Usuario`,`Id_Rol`),
  KEY `fkUsuarioRolRol` (`Id_Rol`),
  CONSTRAINT `fkUsuarioRolRol` FOREIGN KEY (`Id_Rol`) REFERENCES `rol` (`Id_Rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fkUsuarioRolUsuario` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `perfilong` (
  `Id_Usuario` int NOT NULL,
  `Nombre_Legal` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CIF` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` text COLLATE utf8mb4_unicode_ci,
  `Direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Estado_Verificacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `isVerified` tinyint(1) DEFAULT NULL,
  `Telefono_Contacto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Fecha_Verificacion` datetime DEFAULT NULL,
  `Id_Admin_Verificador` int DEFAULT NULL,
  PRIMARY KEY (`Id_Usuario`),
  UNIQUE KEY `CIF_ONG` (`CIF`),
  CONSTRAINT `fkPerfilONGUsuario` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `organizador` (
  `Id_Usuario` int NOT NULL,
  `Nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CIF` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Telefono_Directo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Zona_Responsable` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Estado_Verificacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  PRIMARY KEY (`Id_Usuario`),
  UNIQUE KEY `CIF_ORG` (`CIF`),
  CONSTRAINT `fkOrganizadorUsuario` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `propuesta` (
  `Id_Propuesta` int NOT NULL AUTO_INCREMENT,
  `Id_Organizador` int NOT NULL,
  `Titulo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Descripcion` text COLLATE utf8mb4_unicode_ci,
  `Fecha_Inicio` datetime DEFAULT NULL,
  `Fecha_Fin` datetime DEFAULT NULL,
  `Estado_Propuesta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'borrador',
  `Lugar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Imagen` longtext COLLATE utf8mb4_unicode_ci,
  `Id_Ong_Asignada` int DEFAULT NULL,
  `Id_Tipo_Bien` int DEFAULT NULL,
  `Fecha_Publicacion` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Propuesta`),
  KEY `Id_Organizador` (`Id_Organizador`),
  KEY `Id_Ong_Asignada` (`Id_Ong_Asignada`),
  CONSTRAINT `fkPropuestaOngAsignada` FOREIGN KEY (`Id_Ong_Asignada`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fkPropuestaOrganizador` FOREIGN KEY (`Id_Organizador`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mensajepropuesta` (
  `Id_Mensaje` int NOT NULL AUTO_INCREMENT,
  `Id_Propuesta` int NOT NULL,
  `Id_Autor` int NOT NULL,
  `Contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Fecha_Envio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Leido` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Mensaje`),
  KEY `fkMensajePropuesta` (`Id_Propuesta`),
  KEY `fkMensajeUsuario` (`Id_Autor`),
  CONSTRAINT `fkMensajePropuesta` FOREIGN KEY (`Id_Propuesta`) REFERENCES `propuesta` (`Id_Propuesta`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fkMensajeUsuario` FOREIGN KEY (`Id_Autor`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. DATOS DE EJEMPLO
-- ========================================
-- ROL (Dejamos los 4 básicos más 6 extra para sumar 10)
INSERT INTO `rol` (`Id_Rol`, `Nombre`) VALUES
(1, 'ADMIN'),
(2, 'ORGANIZADOR'),
(3, 'ONG'),
(4, 'USUARIO'),
(5, 'MODERADOR'),
(6, 'VOLUNTARIO'),
(7, 'DONANTE'),
(8, 'COORDINADOR'),
(9, 'GESTOR_PROPUESTAS'),
(10, 'AUDITOR');

-- TIPO DE BIEN
INSERT INTO `tipobien` (`Id_Tipo_Bien`, `Nombre`, `Descripcion`) VALUES
(1, 'Alimentos', 'Comida no perecedera y agua'),
(2, 'Material Escolar', 'Libros, mochilas y papelería'),
(3, 'Ropa', 'Prendas de vestir para todas las edades'),
(4, 'Medicamentos', 'Suministros de primeros auxilios y medicinas'),
(5, 'Muebles', 'Mobiliario para hogares desfavorecidos'),
(6, 'Electrodomésticos', 'Aparatos de primera necesidad'),
(7, 'Juguetes', 'Juguetes nuevos o en buen estado para niños'),
(8, 'Higiene', 'Productos de limpieza personal y para el hogar'),
(9, 'Tecnología', 'Ordenadores y tablets para brecha digital'),
(10, 'Material Deportivo', 'Equipamiento para deporte inclusivo');

-- USUARIO (Creamos 30 usuarios: 1-10 ONGs, 11-20 Orgs, 21-30 Usuarios)
INSERT INTO `usuario` (`Id_Usuario`, `Nombre`, `Email`, `Password`, `Telefono`, `Foto_Perfil`) VALUES
(1, 'Admin ONG Manos Unidas', 'manos@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100001', NULL),
(2, 'Admin Cáritas', 'caritas@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100002', NULL),
(3, 'Admin Cruz Roja', 'cruzroja@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100003', NULL),
(4, 'Admin Banco Alimentos', 'banco@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100004', NULL),
(5, 'Admin Médicos Mundo', 'medicos@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100005', NULL),
(6, 'Admin Aldeas Inf.', 'aldeas@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100006', NULL),
(7, 'Admin Save Children', 'savethechildren@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100007', NULL),
(8, 'Admin Greenpeace', 'greenpeace@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100008', NULL),
(9, 'Admin Oxfam', 'oxfam@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100009', NULL),
(10, 'Admin Unicef', 'unicef@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600100010', NULL),

(11, 'Organizador Madrid', 'org.madrid@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200001', NULL),
(12, 'Organizador BCN', 'org.bcn@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200002', NULL),
(13, 'Organizador Valencia', 'org.vlc@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200003', NULL),
(14, 'Organizador Sevilla', 'org.sevilla@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200004', NULL),
(15, 'Organizador Bilbao', 'org.bilbao@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200005', NULL),
(16, 'Organizador Málaga', 'org.malaga@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200006', NULL),
(17, 'Organizador Galicia', 'org.galicia@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200007', NULL),
(18, 'Organizador Canarias', 'org.canarias@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200008', NULL),
(19, 'Organizador Baleares', 'org.baleares@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200009', NULL),
(20, 'Organizador Aragón', 'org.aragon@solidarify.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600200010', NULL),

(21, 'Usuario Carlos', 'carlos@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300001', NULL),
(22, 'Usuario María', 'maria@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300002', NULL),
(23, 'Usuario Juan', 'juan@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300003', NULL),
(24, 'Usuario Ana', 'ana@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300004', NULL),
(25, 'Usuario Luis', 'luis@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300005', NULL),
(26, 'Usuario Laura', 'laura@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300006', NULL),
(27, 'Usuario Pedro', 'pedro@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300007', NULL),
(28, 'Usuario Sofía', 'sofia@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300008', NULL),
(29, 'Usuario Javier', 'javier@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300009', NULL),
(30, 'Usuario Elena', 'elena@user.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600300010', NULL),

(31, 'Admin Principal', 'admin@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000001', NULL),
(32, 'Admin Sistema', 'admin2@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000002', NULL),
(33, 'Admin Seguridad', 'admin3@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000003', NULL),
(34, 'Admin Moderación', 'admin4@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000004', NULL),
(35, 'Admin ONG', 'admin5@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000005', NULL),
(36, 'Admin Organizador', 'admin6@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000006', NULL),
(37, 'Admin Contabilidad', 'admin7@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000007', NULL),
(38, 'Admin Soporte', 'admin8@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000008', NULL),
(39, 'Admin Legal', 'admin9@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000009', NULL),
(40, 'Admin Backup', 'admin10@donapp.com', '$2b$10$jnkc5H3zkERnbNKDJVdUzO9YxYnfy6I8eWkFzCvQSmT8./51RvTyq', '600000010', NULL);

-- USUARIOROL (Vinculando IDs con los roles: ONG=3, ORG=2, USUARIO=4)
INSERT INTO `usuariorol` (`Id_Usuario`, `Id_Rol`) VALUES
(1,3), (2,3), (3,3), (4,3), (5,3), (6,3), (7,3), (8,3), (9,3), (10,3),
(11,2), (12,2), (13,2), (14,2), (15,2), (16,2), (17,2), (18,2), (19,2), (20,2),
(21,4), (22,4), (23,4), (24,4), (25,4), (26,4), (27,4), (28,4), (29,4), (30,4),
(31,1), (32,1), (33,1), (34,1), (35,1), (36,1), (37,1), (38,1), (39,1), (40,1);

-- PERFILONG (Usuarios 1 al 10)
INSERT INTO `perfilong` (`Id_Usuario`, `Nombre_Legal`, `CIF`, `Descripcion`, `Direccion`, `Web`, `Telefono_Contacto`, `Estado_Verificacion`, `isVerified`, `Fecha_Verificacion`, `Id_Admin_Verificador`) VALUES
(1, 'Manos Unidas España', 'G11111111', 'Ayuda internacional y desarrollo en países empobrecidos', 'Calle Sol 1, Madrid', 'https://www.manosunidas.org', '912345678', 'verificado', 1, '2025-11-15', 1),
(2, 'Cáritas Española', 'G22222222', 'Acción social local y acompañamiento a personas vulnerables', 'Avenida Luna 2, Barcelona', 'https://www.caritas.es', '934567890', 'verificado', 1, '2025-12-01', 2),
(3, 'Cruz Roja Española', 'G33333333', 'Primeros auxilios, emergencias y cooperación internacional', 'Plaza Estrella 3, Sevilla', 'https://www.cruzroja.es', '954321098', 'verificado', 1, '2025-10-20', 1),
(4, 'Federación Española Banco Alimentos', 'G44444444', 'Redistribución de alimentos a personas necesitadas', 'Calle Nube 4, Valencia', 'https://www.bancoalimentos.org', '963214789', 'verificado', 1, '2026-01-10', 3),
(5, 'Médicos del Mundo España', 'G55555555', 'Salud global y atención a personas excluidas', 'Calle Viento 5, Bilbao', 'https://www.medicosdelmundo.org', '944567123', 'pendiente', 0, NULL, NULL),
(6, 'Aldeas Infantiles SOS España', 'G66666666', 'Protección y desarrollo de la infancia vulnerable', 'Paseo Mar 6, Málaga', 'https://www.aldeasinfantiles.org', '952345678', 'verificado', 1, '2025-12-15', 2),
(7, 'Save the Children España', 'G77777777', 'Defensa de los derechos de la infancia', 'Calle Río 7, Zaragoza', 'https://www.savethechildren.es', '976543210', 'verificado', 1, '2026-01-05', 1),
(8, 'Greenpeace España', 'G88888888', 'Protección del medioambiente y cambio climático', 'Avenida Bosque 8, Granada', 'https://www.greenpeace.org/espana', '958765432', 'pendiente', 0, NULL, NULL),
(9, 'Oxfam Intermón', 'G99999999', 'Lucha contra la desigualdad y la pobreza extrema', 'Calle Montaña 9, Valladolid', 'https://www.oxfamintermon.org', '983456789', 'verificado', 1, '2025-11-20', 3),
(10, 'UNICEF Comité Español', 'G10101010', 'Agencia ONU para la infancia y derechos del niño', 'Plaza Paz 10, Palma de Mallorca', 'https://www.unicef.es', '971234567', 'verificado', 1, '2025-12-28', 2);


-- ORGANIZADOR (Usuarios 11 al 20)
INSERT INTO `organizador` (`Id_Usuario`, `Nombre`, `CIF`, `Telefono_Directo`, `Zona_Responsable`, `Estado_Verificacion`) VALUES
(11, 'Org Centro Madrid', 'B11111111', '600200001', 'Madrid', 'verificado'),
(12, 'Org Catalunya', 'B22222222', '600200002', 'Cataluña', 'verificado'),
(13, 'Org Levante', 'B33333333', '600200003', 'Comunidad Valenciana', 'pendiente'),
(14, 'Org Andalucía Oeste', 'B44444444', '600200004', 'Andalucía', 'verificado'),
(15, 'Org Euskadi', 'B55555555', '600200005', 'País Vasco', 'verificado'),
(16, 'Org Andalucía Sur', 'B66666666', '600200006', 'Andalucía', 'pendiente'),
(17, 'Org Galicia', 'B77777777', '600200007', 'Galicia', 'verificado'),
(18, 'Org Canarias', 'B88888888', '600200008', 'Islas Canarias', 'verificado'),
(19, 'Org Baleares', 'B99999999', '600200009', 'Islas Baleares', 'pendiente'),
(20, 'Org Aragón', 'B10101010', '600200010', 'Aragón', 'verificado');

-- PROPUESTA (Organizadores del 11 al 20; ONGs asignadas del 1 al 10)
INSERT INTO `propuesta` (`Id_Propuesta`, `Id_Organizador`, `Titulo`, `Descripcion`, `Fecha_Inicio`, `Fecha_Fin`, `Estado_Propuesta`, `Lugar`, `Id_Ong_Asignada`, `Id_Tipo_Bien`, `Fecha_Publicacion`) VALUES
(1, 11, 'Campaña Alimentos Madrid', 'Recogida de conservas', '2026-03-01 10:00:00', '2026-03-15 10:00:00', 'publicada', 'Plaza Mayor', 1, 1, NOW()),
(2, 12, 'Material Escolar BCN', 'Libros y mochilas', '2026-04-01 10:00:00', '2026-04-15 10:00:00', 'asignada', 'Plaça Catalunya', 2, 2, NOW()),
(3, 13, 'Ropa de Invierno VLC', 'Abrigos y calzado', '2026-10-01 10:00:00', '2026-10-15 10:00:00', 'borrador', 'Ayuntamiento', 3, 3, NULL),
(4, 14, 'Botiquines Sevilla', 'Material de primeros auxilios', '2026-05-01 10:00:00', '2026-05-15 10:00:00', 'publicada', 'Centro Cívico', 4, 4, NOW()),
(5, 15, 'Mobiliario Solidario', 'Muebles hogar', '2026-06-01 10:00:00', '2026-06-15 10:00:00', 'pendiente_ong', 'Polideportivo', NULL, 5, NOW()),
(6, 16, 'Navidad con Juguetes', 'Juguetes nuevos', '2026-12-01 10:00:00', '2026-12-15 10:00:00', 'publicada', 'Calle Larios', 6, 7, NOW()),
(7, 17, 'Electrodomésticos Básicos', 'Lavadoras y neveras', '2026-07-01 10:00:00', '2026-07-15 10:00:00', 'asignada', 'Recinto Ferial', 7, 6, NOW()),
(8, 18, 'Limpieza Escuelas', 'Productos de higiene', '2026-08-01 10:00:00', '2026-08-15 10:00:00', 'borrador', 'Plaza del Pueblo', 8, 8, NULL),
(9, 19, 'Brecha Digital Cero', 'Ordenadores y tablets', '2026-09-01 10:00:00', '2026-09-15 10:00:00', 'publicada', 'Campus Univ', 9, 9, NOW()),
(10, 20, 'Deporte Inclusivo', 'Equipamiento deportivo', '2026-11-01 10:00:00', '2026-11-15 10:00:00', 'asignada', 'Estadio', 10, 10, NOW());

-- MENSAJEPROPUESTA (Propuestas de la 1 a la 10; Autores del 21 al 30)
INSERT INTO `mensajepropuesta` (`Id_Mensaje`, `Id_Propuesta`, `Id_Autor`, `Contenido`, `Fecha_Envio`, `Leido`) VALUES
(1, 1, 21, 'Tengo 5 kilos de arroz y 2 de lentejas. ¿Puedo llevarlos mañana?', NOW(), 1),
(2, 2, 22, 'Mi empresa quiere donar 50 mochilas nuevas.', NOW(), 0),
(3, 3, 23, '¿Aceptan ropa de niño de la talla 4 a la 8?', NOW(), 1),
(4, 4, 24, 'He preparado un botiquín con vendas, alcohol y tiritas.', NOW(), 0),
(5, 5, 25, 'Tengo un sofá de tres plazas casi nuevo. ¿Ofrecen recogida a domicilio?', NOW(), 0),
(6, 6, 26, 'Tengo varios juegos de mesa precintados.', NOW(), 1),
(7, 7, 27, 'Voy a sustituir mi microondas, funciona perfectamente.', NOW(), 0),
(8, 8, 28, 'Compré varias cajas de lejía industrial por error, os las dono.', NOW(), 1),
(9, 9, 29, 'Tengo 3 monitores y 2 torres i5 para donar.', NOW(), 0),
(10, 10, 30, 'Llevo 10 balones de baloncesto y redes nuevas.', NOW(), 1);
