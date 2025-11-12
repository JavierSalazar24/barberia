-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, precio, duracion, orden) VALUES
('Corte de Cabello', 'Corte clásico o moderno adaptado a tu estilo personal con técnicas profesionales', 120.00, 30, 1),
('Arreglo de Barba', 'Perfilado, recorte y estilizado de barba con productos premium', 100.00, 30, 2),
('Corte + Barba', 'Servicio completo que incluye corte de cabello y arreglo de barba', 200.00, 60, 3),
('Fade Profesional', 'Degradado perfecto con transiciones suaves y precisas', 150.00, 30, 4),
('Afeitado Clásico', 'Afeitado tradicional con navaja, toalla caliente y productos de lujo', 120.00, 30, 5),
('Mascarilla Facial', 'Tratamiento facial revitalizante para una piel saludable', 140.00, 30, 6);

-- Insertar imágenes de galería de ejemplo
INSERT INTO galeria (titulo, imagen_url, orden) VALUES
('Corte Clásico', '/images/gallery-1.jpg', 1),
('Arreglo de Barba', '/images/gallery-2.jpg', 2),
('Fade Moderno', '/images/gallery-3.jpg', 3),
('Afeitado Clásico', '/images/gallery-4.jpg', 4),
('Nuestro Espacio', '/images/gallery-5.jpg', 5),
('Productos Premium', '/images/gallery-6.jpg', 6);

-- Insertar perfiles de usuarios administradores 
INSERT INTO admin_profiles (id, nombre, telefono, is_admin)
VALUES
('uuid-admin-1', 'Administrador General', '6180000000', true),
('uuid-admin-2', 'Barbero Juan', '6181111111', false),
('uuid-admin-3', 'Barbero Luis', '6182222222', false),
('uuid-admin-4', 'Recepcionista Ana', '6183333333', false);

-- Insertar servicios adicionales
INSERT INTO servicios (nombre, descripcion, precio, duracion, orden) VALUES
('Tinte Capilar', 'Coloración completa o parcial con productos de alta calidad y asesoría personalizada', 250.00, 60, 7),
('Depilación de Cejas', 'Definición y limpieza de cejas con técnica de navaja o cera', 80.00, 15, 8),
('Exfoliación Facial', 'Limpieza profunda que elimina impurezas y mejora la textura de la piel', 160.00, 30, 9),
('Masaje Relajante de Cuello y Hombros', 'Masaje breve con aceites esenciales para liberar la tensión muscular', 100.00, 20, 10);