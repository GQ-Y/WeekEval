import Database from 'better-sqlite3';

let dbInstance: Database.Database | null = null;

export async function initDb() {
  dbInstance = new Database('./database.sqlite');

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT NOT NULL UNIQUE,
      emp_name TEXT NOT NULL,
      department TEXT NOT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT NOT NULL,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      late_count INTEGER DEFAULT 0,
      early_count INTEGER DEFAULT 0,
      absent_card_count INTEGER DEFAULT 0,
      short_work_hour_count INTEGER DEFAULT 0,
      overtime_work_hour REAL DEFAULT 0.0,
      weekend_work_hour REAL DEFAULT 0.0,
      weekend_work_type TEXT DEFAULT '',
      is_full_attendance INTEGER DEFAULT 0,
      attendance_score INTEGER DEFAULT 100,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_chat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT NOT NULL,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      avg_reply_time INTEGER DEFAULT 0,
      total_msg_count INTEGER DEFAULT 0,
      send_msg_count INTEGER DEFAULT 0,
      receive_msg_count INTEGER DEFAULT 0,
      replied_chat_ratio REAL DEFAULT 0.00,
      chat_duration INTEGER DEFAULT 0,
      work_hour_chat_score INTEGER DEFAULT 0,
      non_work_hour_chat_score INTEGER DEFAULT 0,
      chat_total_score INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_report (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT NOT NULL,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      submit_status TEXT NOT NULL,
      feedback_depth INTEGER DEFAULT 0,
      progress_node INTEGER DEFAULT 0,
      plan_feasibility INTEGER DEFAULT 0,
      work_continuity INTEGER DEFAULT 0,
      report_score INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(emp_id, week, year)
    );

    CREATE TABLE IF NOT EXISTS weekly_evaluation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT NOT NULL,
      emp_name TEXT NOT NULL,
      department TEXT NOT NULL,
      week INTEGER NOT NULL,
      year INTEGER NOT NULL,
      attendance_score INTEGER NOT NULL,
      chat_score INTEGER NOT NULL,
      report_score INTEGER NOT NULL,
      total_score INTEGER NOT NULL,
      level TEXT NOT NULL,
      is_published INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(emp_id, week, year)
    );

    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default admin if not exists
  const admin = dbInstance.prepare('SELECT * FROM admin WHERE username = ?').get('admin');
  if (!admin) {
    dbInstance.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', '123456');
  }

  console.log('Database initialized');
}

export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
}
