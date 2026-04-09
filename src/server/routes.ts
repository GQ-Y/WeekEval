import { Express, Request, Response } from 'express';
import multer from 'multer';
import { getDb } from './db.js';
import * as xlsx from 'xlsx';

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: Express) {
  // --- Auth ---
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE username = ? AND password = ?').get(username, password) as any;
    if (admin) {
      res.json({ success: true, token: 'fake-jwt-token', username: admin.username });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    res.json({ success: true });
  });

  // --- Upload ---
  app.post('/api/upload/attendance', upload.single('file'), async (req: Request, res: Response) => {
    const { week, year } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      const db = getDb();
      db.prepare('BEGIN TRANSACTION').run();
      
      // Clear existing for this week
      db.prepare('DELETE FROM weekly_attendance WHERE week = ? AND year = ?').run(week, year);
      
      const preview = [];
      const insertEmp = db.prepare('INSERT OR IGNORE INTO employees (emp_id, emp_name, department) VALUES (?, ?, ?)');
      const insertAtt = db.prepare(`
        INSERT INTO weekly_attendance (
          emp_id, week, year, late_count, early_count, absent_card_count, short_work_hour_count,
          overtime_work_hour, weekend_work_hour, weekend_work_type, is_full_attendance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of data as any[]) {
        const emp_id = row['员工ID'] || row['姓名'] || 'unknown';
        const emp_name = row['姓名'] || 'Unknown';
        const department = row['部门'] || 'Unknown';
        
        insertEmp.run(emp_id, emp_name, department);
        
        insertAtt.run(
          emp_id, week, year,
          row['迟到次数'] || 0,
          row['早退次数'] || 0,
          row['缺卡次数'] || 0,
          row['时长不足次数'] || 0,
          row['工作日加班时长'] || 0,
          row['周末加班时长'] || 0,
          row['周末加班类型'] || '',
          row['全勤'] === '是' ? 1 : 0
        );

        if (preview.length < 10) {
          preview.push({ emp_name, department, date: row['考勤日期'], time: row['打卡时间'], duration: row['工作时长'] });
        }
      }
      
      db.prepare('COMMIT').run();
      res.json({ success: true, preview });
    } catch (error) {
      const db = getDb();
      db.prepare('ROLLBACK').run();
      res.status(500).json({ success: false, message: String(error) });
    }
  });

  app.post('/api/upload/chat', upload.single('file'), async (req: Request, res: Response) => {
    const { week, year } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      const db = getDb();
      db.prepare('BEGIN TRANSACTION').run();
      
      db.prepare('DELETE FROM weekly_chat WHERE week = ? AND year = ?').run(week, year);
      
      const preview = [];
      const insertEmp = db.prepare('INSERT OR IGNORE INTO employees (emp_id, emp_name, department) VALUES (?, ?, ?)');
      const insertChat = db.prepare(`
        INSERT INTO weekly_chat (
          emp_id, week, year, avg_reply_time, total_msg_count, send_msg_count, receive_msg_count,
          replied_chat_ratio, chat_duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of data as any[]) {
        const emp_id = row['员工ID'] || row['姓名'] || 'unknown';
        const emp_name = row['姓名'] || 'Unknown';
        const department = row['部门'] || 'Unknown';
        
        insertEmp.run(emp_id, emp_name, department);
        
        insertChat.run(
          emp_id, week, year,
          row['平均首次回复时长'] || 0,
          row['收发消息总数'] || 0,
          row['发消息数'] || 0,
          row['收消息数'] || 0,
          row['已回复单聊占比'] || 0,
          row['会话总时长'] || 0
        );

        if (preview.length < 10) {
          preview.push({ emp_name, department, avg_reply_time: row['平均首次回复时长'], total_msg_count: row['收发消息总数'], replied_chat_ratio: row['已回复单聊占比'] });
        }
      }
      
      db.prepare('COMMIT').run();
      res.json({ success: true, preview });
    } catch (error) {
      const db = getDb();
      db.prepare('ROLLBACK').run();
      res.status(500).json({ success: false, message: String(error) });
    }
  });

  app.get('/api/upload/status', async (req: Request, res: Response) => {
    const { week, year } = req.query;
    const db = getDb();
    const att = db.prepare('SELECT COUNT(*) as count FROM weekly_attendance WHERE week = ? AND year = ?').get(week, year) as any;
    const chat = db.prepare('SELECT COUNT(*) as count FROM weekly_chat WHERE week = ? AND year = ?').get(week, year) as any;
    
    res.json({
      success: true,
      attendanceUploaded: att.count > 0,
      chatUploaded: chat.count > 0
    });
  });

  // --- Calculate ---
  app.post('/api/score/calculate', async (req: Request, res: Response) => {
    const { week, year } = req.body;
    const db = getDb();
    
    try {
      db.prepare('BEGIN TRANSACTION').run();
      
      const employees = db.prepare('SELECT * FROM employees').all() as any[];
      
      const getAtt = db.prepare('SELECT * FROM weekly_attendance WHERE emp_id = ? AND week = ? AND year = ?');
      const updateAtt = db.prepare('UPDATE weekly_attendance SET attendance_score = ? WHERE id = ?');
      const getChat = db.prepare('SELECT * FROM weekly_chat WHERE emp_id = ? AND week = ? AND year = ?');
      const updateChat = db.prepare('UPDATE weekly_chat SET chat_total_score = ? WHERE id = ?');
      const upsertEval = db.prepare(`
        INSERT INTO weekly_evaluation (emp_id, emp_name, department, week, year, attendance_score, chat_score, report_score, total_score, level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(emp_id, week, year) DO UPDATE SET
          attendance_score = excluded.attendance_score,
          chat_score = excluded.chat_score,
          total_score = excluded.attendance_score + excluded.chat_score + report_score,
          level = CASE 
            WHEN (excluded.attendance_score + excluded.chat_score + report_score) >= 225 THEN '优秀'
            WHEN (excluded.attendance_score + excluded.chat_score + report_score) >= 200 THEN '良好'
            WHEN (excluded.attendance_score + excluded.chat_score + report_score) >= 175 THEN '及格'
            WHEN (excluded.attendance_score + excluded.chat_score + report_score) >= 150 THEN '待改进'
            ELSE '不合格'
          END
      `);

      for (const emp of employees) {
        // Attendance Score
        const att = getAtt.get(emp.emp_id, week, year) as any;
        let attScore = 100;
        if (att) {
          attScore -= (att.late_count * 5);
          attScore -= (att.early_count * 5);
          attScore -= (att.absent_card_count * 10);
          attScore -= (att.short_work_hour_count * 5);
          
          let otScore = 0;
          if (att.overtime_work_hour > 0.5) {
            otScore += 2;
            let remaining = att.overtime_work_hour - 0.5;
            if (remaining > 0) {
              const next2h = Math.min(remaining, 2);
              otScore += Math.floor(next2h / 0.5) * 1;
              remaining -= next2h;
              if (remaining > 0) {
                const next1_5h = Math.min(remaining, 1.5);
                otScore += Math.floor(next1_5h / 1) * 1;
              }
            }
          }
          
          let weekendScore = 0;
          if (att.weekend_work_type === 'company') {
            if (att.weekend_work_hour >= 8) weekendScore += 5;
            else if (att.weekend_work_hour >= 4) weekendScore += 3;
            else if (att.weekend_work_hour >= 1) weekendScore += 2;
          } else if (att.weekend_work_type === 'home') {
            if (att.weekend_work_hour >= 8) weekendScore += 3;
            else if (att.weekend_work_hour >= 4) weekendScore += 2;
            else if (att.weekend_work_hour >= 1) weekendScore += 1;
          }
          weekendScore = Math.min(weekendScore, 10);
          
          attScore += otScore + weekendScore;
          if (att.is_full_attendance) attScore += 3;
          
          updateAtt.run(attScore, att.id);
        }

        // Chat Score (Simplified logic for prototype)
        const chat = getChat.get(emp.emp_id, week, year) as any;
        let chatScore = 100; // Default to 100 for prototype
        if (chat) {
          // In a real app, calculate based on ranking. Here we just use a baseline.
          chatScore = 90 + 10;
          updateChat.run(chatScore, chat.id);
        }

        // Initialize Evaluation
        upsertEval.run(emp.emp_id, emp.emp_name, emp.department, week, year, attScore, chatScore, 0, attScore + chatScore, '不合格');
      }
      
      db.prepare('COMMIT').run();
      res.json({ success: true });
    } catch (error) {
      const db = getDb();
      db.prepare('ROLLBACK').run();
      res.status(500).json({ success: false, message: String(error) });
    }
  });

  // --- Report ---
  app.get('/api/report/score/list', async (req: Request, res: Response) => {
    const { week, year, department } = req.query;
    const db = getDb();
    
    let query = `
      SELECT e.emp_id, e.emp_name, e.department, 
             COALESCE(r.submit_status, 'unsubmitted') as submit_status,
             COALESCE(r.feedback_depth, 0) as feedback_depth,
             COALESCE(r.progress_node, 0) as progress_node,
             COALESCE(r.plan_feasibility, 0) as plan_feasibility,
             COALESCE(r.work_continuity, 0) as work_continuity,
             COALESCE(r.report_score, 0) as report_score
      FROM employees e
      LEFT JOIN weekly_report r ON e.emp_id = r.emp_id AND r.week = ? AND r.year = ?
      WHERE 1=1
    `;
    const params: any[] = [week, year];
    
    if (department && department !== '全部') {
      query += ' AND e.department = ?';
      params.push(department);
    }
    
    const list = db.prepare(query).all(...params);
    res.json({ success: true, data: list });
  });

  app.post('/api/report/score/save', async (req: Request, res: Response) => {
    const { week, year, scoreList } = req.body;
    const db = getDb();
    
    try {
      db.prepare('BEGIN TRANSACTION').run();
      
      const upsertReport = db.prepare(`
        INSERT INTO weekly_report (emp_id, week, year, submit_status, feedback_depth, progress_node, plan_feasibility, work_continuity, report_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(emp_id, week, year) DO UPDATE SET
          submit_status = excluded.submit_status,
          feedback_depth = excluded.feedback_depth,
          progress_node = excluded.progress_node,
          plan_feasibility = excluded.plan_feasibility,
          work_continuity = excluded.work_continuity,
          report_score = excluded.report_score
      `);

      const updateEval = db.prepare(`
        UPDATE weekly_evaluation 
        SET report_score = ?,
            total_score = attendance_score + chat_score + ?,
            level = CASE 
              WHEN (attendance_score + chat_score + ?) >= 225 THEN '优秀'
              WHEN (attendance_score + chat_score + ?) >= 200 THEN '良好'
              WHEN (attendance_score + chat_score + ?) >= 175 THEN '及格'
              WHEN (attendance_score + chat_score + ?) >= 150 THEN '待改进'
              ELSE '不合格'
            END
        WHERE emp_id = ? AND week = ? AND year = ?
      `);

      for (const item of scoreList) {
        upsertReport.run(item.emp_id, week, year, item.submit_status, item.feedback_depth, item.progress_node, item.plan_feasibility, item.work_continuity, item.report_score);
        updateEval.run(item.report_score, item.report_score, item.report_score, item.report_score, item.report_score, item.report_score, item.emp_id, week, year);
      }
      
      db.prepare('COMMIT').run();
      res.json({ success: true });
    } catch (error) {
      db.prepare('ROLLBACK').run();
      res.status(500).json({ success: false, message: String(error) });
    }
  });

  // --- Evaluation ---
  app.get('/api/evaluation/list', async (req: Request, res: Response) => {
    const { week, year, department, level } = req.query;
    const db = getDb();
    
    let query = 'SELECT * FROM weekly_evaluation WHERE week = ? AND year = ?';
    const params: any[] = [week, year];
    
    if (department && department !== '全部') {
      query += ' AND department = ?';
      params.push(department);
    }
    if (level && level !== '全部') {
      query += ' AND level = ?';
      params.push(level);
    }
    
    query += ' ORDER BY total_score DESC';
    
    const list = db.prepare(query).all(...params);
    const stats = db.prepare('SELECT COUNT(*) as count, AVG(total_score) as avg FROM weekly_evaluation WHERE week = ? AND year = ?').get(week, year) as any;
    
    res.json({ success: true, data: list, stats: { count: stats.count, avg: stats.avg || 0 } });
  });

  app.post('/api/evaluation/save-all', async (req: Request, res: Response) => {
    const { week, year, evaluationList } = req.body;
    const db = getDb();
    
    try {
      db.prepare('BEGIN TRANSACTION').run();
      const updateEval = db.prepare(`
        UPDATE weekly_evaluation 
        SET attendance_score = ?, chat_score = ?, report_score = ?, total_score = ?, level = ?
        WHERE emp_id = ? AND week = ? AND year = ?
      `);
      for (const item of evaluationList) {
        updateEval.run(item.attendance_score, item.chat_score, item.report_score, item.total_score, item.level, item.emp_id, week, year);
      }
      db.prepare('COMMIT').run();
      res.json({ success: true });
    } catch (error) {
      db.prepare('ROLLBACK').run();
      res.status(500).json({ success: false, message: String(error) });
    }
  });

  // --- Publish ---
  app.post('/api/publish/week', async (req: Request, res: Response) => {
    const { week, year } = req.body;
    const db = getDb();
    db.prepare('UPDATE weekly_evaluation SET is_published = 1 WHERE week = ? AND year = ?').run(week, year);
    res.json({ success: true });
  });

  app.get('/api/publish/status', async (req: Request, res: Response) => {
    const { week, year } = req.query;
    const db = getDb();
    const result = db.prepare('SELECT is_published FROM weekly_evaluation WHERE week = ? AND year = ? LIMIT 1').get(week, year) as any;
    res.json({ success: true, is_published: result ? result.is_published === 1 : false });
  });

  app.get('/api/history/list', async (req: Request, res: Response) => {
    const db = getDb();
    const list = db.prepare(`
      SELECT week, year, MAX(is_published) as is_published, COUNT(*) as emp_count
      FROM weekly_evaluation
      GROUP BY week, year
      ORDER BY year DESC, week DESC
    `).all();
    res.json({ success: true, data: list });
  });

  // --- Public ---
  app.get('/api/public/ranking', async (req: Request, res: Response) => {
    const { week, year } = req.query;
    const db = getDb();
    
    const isPublished = db.prepare('SELECT is_published FROM weekly_evaluation WHERE week = ? AND year = ? LIMIT 1').get(week, year) as any;
    if (!isPublished || isPublished.is_published === 0) {
      return res.json({ success: true, data: [], deptRanking: [], message: 'Not published yet' });
    }
    
    const ranking = db.prepare('SELECT emp_name, department, total_score, level FROM weekly_evaluation WHERE week = ? AND year = ? ORDER BY total_score DESC').all(week, year);
    
    const deptRanking = db.prepare(`
      SELECT department, AVG(total_score) as avg_score, COUNT(*) as emp_count
      FROM weekly_evaluation
      WHERE week = ? AND year = ?
      GROUP BY department
      ORDER BY avg_score DESC
    `).all(week, year);
    
    res.json({ success: true, data: ranking, deptRanking });
  });
}
