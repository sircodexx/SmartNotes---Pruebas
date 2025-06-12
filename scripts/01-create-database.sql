-- Crear la base de datos SmartNotes
CREATE DATABASE IF NOT EXISTS smartnotes;
USE smartnotes;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    career VARCHAR(255),
    semester INT,
    university VARCHAR(255),
    avatar_url VARCHAR(500),
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tareas
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
    category VARCHAR(100),
    estimated_time INT, -- en minutos
    actual_time INT DEFAULT 0, -- en minutos
    points_reward INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de recordatorios
CREATE TABLE reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    reminder_time DATETIME NOT NULL,
    message TEXT,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de logros/insignias
CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    points_required INT,
    badge_type ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze'
);

-- Tabla de logros de usuarios
CREATE TABLE user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Tabla de estadísticas diarias
CREATE TABLE daily_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    time_studied INT DEFAULT 0, -- en minutos
    points_earned INT DEFAULT 0,
    focus_sessions INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);

-- Tabla de configuraciones de usuario
CREATE TABLE user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    focus_mode_duration INT DEFAULT 25, -- en minutos
    daily_goal_tasks INT DEFAULT 5,
    daily_goal_time INT DEFAULT 120, -- en minutos
    moodle_integration BOOLEAN DEFAULT FALSE,
    moodle_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de sesiones de enfoque
CREATE TABLE focus_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    task_id INT,
    duration INT NOT NULL, -- en minutos
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
