const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    console.log("실제 운영 환경 데이터베이스 초기화를 시작합니다...");

    // 테이블 생성
    db.run(`
        CREATE TABLE IF NOT EXISTS companies (
            company_code TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS company_admins (
            admin_id TEXT PRIMARY KEY,
            admin_password TEXT NOT NULL,
            company_code TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_code) REFERENCES companies(company_code)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id TEXT PRIMARY KEY,
            employee_name TEXT NOT NULL,
            company_code TEXT NOT NULL DEFAULT 'PGUARD1234',
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            company_code TEXT NOT NULL DEFAULT 'PGUARD1234',
            timestamp DATETIME NOT NULL,
            duration INTEGER NOT NULL,
            process_name TEXT,
            window_title TEXT,
            category TEXT CHECK(category IN ('work', 'non-work', 'idle')),
            domain TEXT,
            FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);

    // 기존 데이터 삭제 (실제 데이터 구동 환경 제공)
    db.run("DELETE FROM activities");
    db.run("DELETE FROM employees");
    db.run("DELETE FROM company_admins");
    db.run("DELETE FROM companies");
    db.run("DELETE FROM system_settings");

    // 기본 설정 데이터 적재
    const defaultPassword = 'pguard1234';
    const defaultHash = bcrypt.hashSync(defaultPassword, 10);
    const defaultToken = crypto.randomBytes(24).toString('hex');

    db.run(`INSERT INTO system_settings (key, value) VALUES ('company_code', 'PGUARD1234')`);
    db.run(`INSERT INTO system_settings (key, value) VALUES ('admin_id', 'admin')`);
    db.run(`INSERT INTO system_settings (key, value) VALUES ('admin_password', ?)`, [defaultHash]); // bcrypt
    db.run(`INSERT INTO system_settings (key, value) VALUES ('api_token', ?)`, [defaultToken]);   // 에이전트 인증 토큰
    
    // 회사 및 회사 관리자 데이터 적재
    db.run(`INSERT INTO companies (company_code, company_name) VALUES ('PGUARD1234', '피가드 데모 컴퍼니')`);
    db.run(`INSERT INTO company_admins (admin_id, admin_password, company_code) VALUES ('admin', ?, 'PGUARD1234')`, [defaultHash]);

    // 회사별 에이전트 인증 토큰 적재
    db.run(`INSERT INTO company_settings (company_code, key, value) VALUES ('PGUARD1234', 'api_token', ?)`, [defaultToken]);

    console.log("기본 시스템 설정 및 관리자 보안 설정 생성 완료.");
    console.log("모의 데이터가 정상 소거되었습니다.");
    db.close();
});

