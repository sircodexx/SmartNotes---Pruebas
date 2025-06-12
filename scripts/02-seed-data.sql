-- Insertar logros predefinidos
INSERT INTO achievements (name, description, icon, points_required, badge_type) VALUES
('Primera Tarea', 'Completa tu primera tarea', '🎯', 0, 'bronze'),
('Racha de 3', 'Completa tareas 3 días seguidos', '🔥', 50, 'bronze'),
('Estudiante Dedicado', 'Estudia 10 horas en una semana', '📚', 100, 'silver'),
('Maestro del Tiempo', 'Completa 50 tareas a tiempo', '⏰', 200, 'silver'),
('Enfoque Total', 'Completa 20 sesiones de enfoque', '🎯', 150, 'silver'),
('Leyenda Académica', 'Alcanza 1000 puntos', '👑', 1000, 'gold'),
('Perfeccionista', 'Completa 100 tareas', '💎', 500, 'gold'),
('Madrugador', 'Completa tareas antes de las 8 AM por 7 días', '🌅', 300, 'platinum');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_time ON reminders(reminder_time);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);
