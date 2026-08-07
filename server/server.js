const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const http = require('http');
const https = require('https');

// 비밀번호 해시 처리 헬퍼
// - 신규 저장: bcrypt (소금 처리)
// - 기존 저장: 레거시 무소금 SHA-256 해시 (로그인 성공 시 bcrypt로 자동 마이그레이션)
function isBcryptHash(h) {
    return typeof h === 'string' && h.startsWith('$2');
}

function hashPassword(pw) {
    return bcrypt.hash(pw, 10);
}

function verifyPassword(pw, stored) {
    if (!isBcryptHash(stored)) {
        return Promise.resolve(crypto.createHash('sha256').update(pw).digest('hex') === stored);
    }
    return bcrypt.compare(pw, stored);
}

const app = express();
const PORT = 3000;

// 관리자 세션 토큰 보관용 인메모리 Map (token -> { companyCode })
const activeSessions = new Map();

// 미들웨어 설정
app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
});
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dashboard')));

// SQLite Database 초기화
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite 데이터베이스 연결 오류:', err.message);
    } else {
        console.log('SQLite 데이터베이스에 성공적으로 연결되었습니다. 경로:', dbPath);
        initializeDatabase();
    }
});

// 테이블 스키마 초기화
function initializeDatabase() {
    db.serialize(() => {
        // 회사 정보 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS companies (
                company_code TEXT PRIMARY KEY,
                company_name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (!err) {
                db.run(`INSERT OR IGNORE INTO companies (company_code, company_name) VALUES ('PGUARD1234', '피가드 데모 컴퍼니')`);
            }
        });

        // 회사 관리자 계정 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS company_admins (
                admin_id TEXT PRIMARY KEY,
                admin_password TEXT NOT NULL,
                company_code TEXT NOT NULL,
                role TEXT DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_code) REFERENCES companies(company_code)
            )
        `, (err) => {
            if (!err) {
                db.run(`INSERT OR IGNORE INTO company_admins (admin_id, admin_password, company_code) VALUES ('admin', '392200f7e4ee3aa7312b6ac5679fafd1b5b656fd3edb0ef4d24b47b7fcbbe6bf', 'PGUARD1234')`);
            }
        });

        // 직원 정보 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS employees (
                employee_id TEXT PRIMARY KEY,
                employee_name TEXT NOT NULL,
                company_code TEXT NOT NULL DEFAULT 'PGUARD1234',
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // PC 활동 로그 테이블
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

        // 시스템 환경 설정 및 보안 자격증명 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `, (err) => {
            if (!err) {
                // 초기값 설정 (이미 있으면 INSERT OR IGNORE 로 무시)
                db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('company_code', 'PGUARD1234')`);
                db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('admin_id', 'admin')`);
                db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('admin_password', '392200f7e4ee3aa7312b6ac5679fafd1b5b656fd3edb0ef4d24b47b7fcbbe6bf')`); // pguard1234 의 SHA256 해시
            }
        });

        // 컬럼 마이그레이션 점검 (기존 생성된 DB 에 회사 코드 컬럼이 누락된 경우 동적 추가)
        db.all("PRAGMA table_info(employees)", (err, columns) => {
            if (!err && columns) {
                const hasCompanyCode = columns.some(col => col.name === 'company_code');
                if (!hasCompanyCode) {
                    db.run("ALTER TABLE employees ADD COLUMN company_code TEXT DEFAULT 'PGUARD1234'", (alterErr) => {
                        if (alterErr) console.error("employees 테이블 마이그레이션 실패:", alterErr.message);
                        else console.log("employees 테이블 company_code 컬럼 마이그레이션 완료.");
                    });
                }
                const hasTags = columns.some(col => col.name === 'tags');
                if (!hasTags) {
                    db.run("ALTER TABLE employees ADD COLUMN tags TEXT", (alterErr) => {
                        if (alterErr) console.error("employees 테이블 tags 컬럼 마이그레이션 실패:", alterErr.message);
                        else console.log("employees 테이블 tags 컬럼 마이그레이션 완료.");
                    });
                }
                const hasLoginId = columns.some(col => col.name === 'login_id');
                if (!hasLoginId) {
                    db.run("ALTER TABLE employees ADD COLUMN login_id TEXT", (alterErr) => {
                        if (alterErr) console.error("employees 테이블 login_id 컬럼 마이그레이션 실패:", alterErr.message);
                        else console.log("employees 테이블 login_id 컬럼 마이그레이션 완료.");
                    });
                }
                const hasPasswordHash = columns.some(col => col.name === 'password_hash');
                if (!hasPasswordHash) {
                    db.run("ALTER TABLE employees ADD COLUMN password_hash TEXT", (alterErr) => {
                        if (alterErr) console.error("employees 테이블 password_hash 컬럼 마이그레이션 실패:", alterErr.message);
                        else console.log("employees 테이블 password_hash 컬럼 마이그레이션 완료.");
                    });
                }
                const hasIsLoginEnabled = columns.some(col => col.name === 'is_login_enabled');
                if (!hasIsLoginEnabled) {
                    db.run("ALTER TABLE employees ADD COLUMN is_login_enabled INTEGER DEFAULT 0", (alterErr) => {
                        if (alterErr) console.error("employees 테이블 is_login_enabled 컬럼 마이그레이션 실패:", alterErr.message);
                        else console.log("employees 테이블 is_login_enabled 컬럼 마이그레이션 완료.");
                    });
                }
                // 직원에게 부여된 관리 권한 역할 (NULL/빈값=일반직원, 'sub_admin'/'employee_manager'=관리권한)
                const hasAdminRole = columns.some(col => col.name === 'admin_role');
                if (!hasAdminRole) {
                    db.run("ALTER TABLE employees ADD COLUMN admin_role TEXT", (alterErr) => {
                        if (alterErr) console.error("employees 테이블 admin_role 컬럼 마이그레이션 실패:", alterErr.message);
                        else console.log("employees 테이블 admin_role 컬럼 마이그레이션 완료.");
                    });
                }
            }
        });

        db.all("PRAGMA table_info(activities)", (err, columns) => {
            if (!err && columns) {
                const hasCompanyCode = columns.some(col => col.name === 'company_code');
                if (!hasCompanyCode) {
                    db.run("ALTER TABLE activities ADD COLUMN company_code TEXT DEFAULT 'PGUARD1234'", (alterErr) => {
                        if (alterErr) console.error("activities 테이블 마이그레이션 실패:", alterErr.message);
                        else console.log("activities 테이블 company_code 컬럼 마이그레이션 완료.");
                    });
                }
            }
        });

        db.all("PRAGMA table_info(company_admins)", (err, columns) => {
            if (!err && columns) {
                const hasRole = columns.some(col => col.name === 'role');
                if (!hasRole) {
                    db.run("ALTER TABLE company_admins ADD COLUMN role TEXT DEFAULT 'admin'", (alterErr) => {
                        if (alterErr) console.error("company_admins 테이블 마이그레이션 실패:", alterErr.message);
                        else console.log("company_admins 테이블 role 컬럼 마이그레이션 완료.");
                    });
                }
                const hasTags = columns.some(col => col.name === 'tags');
                if (!hasTags) {
                    db.run("ALTER TABLE company_admins ADD COLUMN tags TEXT", (alterErr) => {
                        if (alterErr) console.error("company_admins 테이블 tags 컬럼 마이그레이션 실패:", alterErr.message);
                        else console.log("company_admins 테이블 tags 컬럼 마이그레이션 완료.");
                    });
                }
            }
        });

        // activities 테이블 idle_reason, idle_detailed_reason 컬럼 마이그레이션
        db.all("PRAGMA table_info(activities)", [], (err, columns) => {
            if (err) { console.error('activities 테이블 정보 조회 오류:', err.message); return; }
            const colNames = columns.map(c => c.name);
            if (!colNames.includes('idle_reason')) {
                db.run("ALTER TABLE activities ADD COLUMN idle_reason TEXT", [], (err) => {
                    if (err) console.error('idle_reason 컬럼 추가 오류:', err.message);
                    else console.log('activities 테이블 idle_reason 컬럼 마이그레이션 완료.');
                });
            }
            if (!colNames.includes('idle_detailed_reason')) {
                db.run("ALTER TABLE activities ADD COLUMN idle_detailed_reason TEXT", [], (err) => {
                    if (err) console.error('idle_detailed_reason 컬럼 추가 오류:', err.message);
                    else console.log('activities 테이블 idle_detailed_reason 컬럼 마이그레이션 완료.');
                });
            }
        });

        // agent_commands 테이블 (관리자 → 에이전트 명령)
        db.run(`
            CREATE TABLE IF NOT EXISTS agent_commands (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                employee_id TEXT,
                type TEXT NOT NULL DEFAULT 'message',
                payload TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // company_settings 테이블 (회사별 에이전트 설정)
        db.run(`
            CREATE TABLE IF NOT EXISTS company_settings (
                company_code TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (company_code, key)
            )
        `, (err) => {
            if (!err) {
                // 기존 회사들에 기본 idle_threshold 설정 삽입
                db.run(`
                    INSERT OR IGNORE INTO company_settings (company_code, key, value)
                    SELECT company_code, 'idle_threshold_seconds', '600' FROM companies
                `);
                // 기존 회사들에 기본 agent_scan_interval 설정 삽입
                db.run(`
                    INSERT OR IGNORE INTO company_settings (company_code, key, value)
                    SELECT company_code, 'agent_scan_interval_seconds', '60' FROM companies
                `);
                // 기존 회사들에 기본 agent_send_interval 설정 삽입
                db.run(`
                    INSERT OR IGNORE INTO company_settings (company_code, key, value)
                    SELECT company_code, 'agent_send_interval_seconds', '600' FROM companies
                `);
            }
        });

        // admin_audit_logs 테이블 (관리자 활동 로그)
        db.run(`
            CREATE TABLE IF NOT EXISTS admin_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                admin_username TEXT NOT NULL,
                action_type TEXT NOT NULL,
                details TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // activity_patterns 테이블 (활동 분류 패턴)
        db.run(`
            CREATE TABLE IF NOT EXISTS activity_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                pattern_type TEXT NOT NULL,
                pattern_value TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (!err) {
                console.log('activity_patterns 테이블 생성 완료.');
            }
        });

        // ── 전자결재 시스템 테이블 ──

        db.run(`
            CREATE TABLE IF NOT EXISTS approval_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'general',
                title TEXT NOT NULL,
                body_schema TEXT NOT NULL DEFAULT '[]',
                default_approval_line TEXT DEFAULT '[]',
                default_agreement_line TEXT DEFAULT '[]',
                default_cc_line TEXT DEFAULT '[]',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS approval_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                template_id INTEGER,
                doc_number TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'general',
                body_schema TEXT DEFAULT '[]',
                body_data TEXT NOT NULL DEFAULT '{}',
                body_data_translated TEXT,
                original_language TEXT NOT NULL DEFAULT 'ko',
                status TEXT NOT NULL DEFAULT 'draft',
                submitted_by TEXT NOT NULL,
                submitted_by_name TEXT,
                submitted_by_type TEXT NOT NULL DEFAULT 'admin',
                submitted_at DATETIME,
                completed_at DATETIME,
                rejection_reason TEXT,
                priority TEXT NOT NULL DEFAULT 'normal',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS approval_lines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                line_type TEXT NOT NULL DEFAULT 'approval',
                approver_id TEXT NOT NULL,
                approver_name TEXT,
                approver_type TEXT NOT NULL DEFAULT 'admin',
                step_order INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'pending',
                comment TEXT,
                acted_at DATETIME,
                read_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS approval_attachments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                original_name TEXT NOT NULL,
                stored_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT,
                uploaded_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS approval_activity_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                company_code TEXT NOT NULL,
                actor_id TEXT NOT NULL,
                actor_type TEXT NOT NULL DEFAULT 'admin',
                action TEXT NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS approval_settings (
                company_code TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (company_code, key)
            )
        `);

        db.run(`CREATE INDEX IF NOT EXISTS idx_approval_docs_company_status ON approval_documents(company_code, status)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_approval_docs_submitted_by ON approval_documents(company_code, submitted_by)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_approval_lines_document ON approval_lines(document_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_approval_lines_approver ON approval_lines(approver_id, status)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_approval_attachments_document ON approval_attachments(document_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_approval_log_document ON approval_activity_log(document_id)`);

        // approval_documents body_schema 컬럼 마이그레이션 (기존 DB 대응)
        db.all("PRAGMA table_info(approval_documents)", [], (err, columns) => {
            if (!err && columns && !columns.some(c => c.name === 'body_schema')) {
                db.run("ALTER TABLE approval_documents ADD COLUMN body_schema TEXT DEFAULT '[]'", (e) => {
                    if (e) console.error('approval_documents body_schema 마이그레이션 실패:', e.message);
                    else console.log('approval_documents body_schema 컬럼 마이그레이션 완료.');
                });
            }
        });

        console.log('데이터베이스 스키마 및 테이블 생성 완료.');
        provisionAgentTokens();
    });
}

// 등록된 회사에 에이전트 인증 토큰이 없으면 자동 생성 (기존 회사 마이그레이션 포함)
function provisionAgentTokens() {
    db.all("SELECT company_code FROM companies", [], (err, rows) => {
        if (err || !rows) return;
        rows.forEach(({ company_code }) => {
            db.get("SELECT value FROM company_settings WHERE company_code = ? AND key = 'api_token'", [company_code], (e2, r2) => {
                if (e2 || r2) return;
                const token = crypto.randomBytes(24).toString('hex');
                db.run("INSERT INTO company_settings (company_code, key, value) VALUES (?, 'api_token', ?)", [company_code, token], (e3) => {
                    if (e3) {
                        console.error('에이전트 토큰 생성 실패:', company_code, e3.message);
                    } else {
                        console.log(`[보안] ${company_code} 에이전트 토큰 생성 완료. 대시보드 설정 탭에서 확인 가능합니다.`);
                    }
                });
            });
        });
    });
}

// 에이전트 인증 토큰 추출 (Authorization: Bearer 또는 X-Agent-Token 헤더)
function getAgentTokenFromReq(req) {
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
    return (req.headers['x-agent-token'] || '').trim();
}

// 상수 시간 비교 헬퍼
function safeEqual(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

// 에이전트 토큰 인증 미들웨어 (company_code는 body 또는 query에서 수집)
function agentAuth(req, res, next) {
    const companyCode = (req.body && req.body.company_code) || req.query.company_code;
    if (!companyCode) {
        return res.status(400).json({ error: 'company_code가 필요합니다.' });
    }
    const cleanCode = String(companyCode).trim().toUpperCase();
    const token = getAgentTokenFromReq(req);
    if (!token) {
        return res.status(401).json({ error: '에이전트 인증 토큰(X-Agent-Token)이 필요합니다.' });
    }
    db.get("SELECT value FROM company_settings WHERE company_code = ? AND key = 'api_token'", [cleanCode], (err, row) => {
        if (err) return res.status(500).json({ error: '토큰 검증 중 오류가 발생했습니다.' });
        if (!row || !safeEqual(row.value, token)) {
            return res.status(401).json({ error: '유효하지 않은 에이전트 토큰입니다.' });
        }
        req.agentCompanyCode = cleanCode;
        next();
    });
}

// ------------------------------------------------------------------
// 회사 코드 검증 API (에이전트 최초 설정용)
// ------------------------------------------------------------------
app.get('/api/companies/validate/:company_code', (req, res) => {
    const { company_code } = req.params;
    if (!company_code) {
        return res.status(400).json({ error: '회사 코드를 입력해 주세요.' });
    }
    const cleanCode = company_code.trim().toUpperCase();
    if (cleanCode === '' || cleanCode === 'AUTON') {
        return res.status(400).json({ error: '유효하지 않은 회사 코드입니다.' });
    }

    db.get("SELECT company_name FROM companies WHERE company_code = ?", [cleanCode], (err, row) => {
        if (err) {
            console.error('회사 검증 오류:', err.message);
            return res.status(500).json({ error: '서버 데이터베이스 오류가 발생했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '등록되지 않은 회사 코드입니다.' });
        }
        return res.json({ success: true, company_name: row.company_name });
    });
});

// ------------------------------------------------------------------
// 에이전트 데이터 수집 API
// ------------------------------------------------------------------
app.post('/api/activity', agentAuth, (req, res) => {
    const { company_code, employee_id, employee_name, activities } = req.body;

    if (!employee_id || !employee_name || !Array.isArray(activities) || !company_code) {
        return res.status(400).json({ error: '필수 필드가 누락되었거나 데이터 포맷이 잘못되었습니다.' });
    }

    const cleanCompanyCode = company_code.trim().toUpperCase();
    if (cleanCompanyCode === '' || cleanCompanyCode === 'AUTON') {
        return res.status(400).json({ error: '유효하지 않은 회사 코드입니다.' });
    }

    // 등록된 회사인지 실시간 검증
    db.get("SELECT company_code FROM companies WHERE company_code = ?", [cleanCompanyCode], (err, row) => {
        if (err) {
            console.error('회사 검증 중 데이터베이스 에러:', err.message);
            return res.status(500).json({ error: '데이터베이스 검증 중 오류가 발생했습니다.' });
        }
        if (!row) {
            console.warn(`[수집 거부] 등록되지 않은 회사 코드 전송 시도: ${cleanCompanyCode}`);
            return res.status(403).json({ error: '등록되지 않은 회사 코드입니다.' });
        }

        const nowIso = new Date().toISOString();

        // 1. 직원 정보 등록 및 최종 활동 시간 갱신 (UPSERT)
        db.run(
            `INSERT INTO employees (employee_id, employee_name, company_code, last_seen)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(employee_id) DO UPDATE SET
                employee_name = excluded.employee_name,
                company_code = excluded.company_code,
                last_seen = excluded.last_seen`,
            [employee_id, employee_name, cleanCompanyCode, nowIso],
            (err) => {
                if (err) {
                    console.error('직원 정보 저장 에러:', err.message);
                }
            }
        );

        // 2. 활동 상세 로그 Bulk Insert (패턴 조회 후 트랜잭션 처리)
        db.all("SELECT pattern_type, pattern_value, category FROM activity_patterns WHERE company_code = ?", [cleanCompanyCode], (err, patterns) => {
            const activePatterns = err ? [] : (patterns || []);

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                const stmt = db.prepare(`
                    INSERT INTO activities (employee_id, company_code, timestamp, duration, process_name, window_title, category, domain, idle_reason, idle_detailed_reason)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                activities.forEach((act) => {
                    let finalCategory = act.category;
                    let matched = false;

                    // 패턴 매칭 점검
                    for (const pat of activePatterns) {
                        const type = pat.pattern_type;
                        const val = pat.pattern_value.toLowerCase();
                        const cat = pat.category;

                        if (type === 'process' && act.process_name) {
                            if (act.process_name.toLowerCase().includes(val)) {
                                finalCategory = cat;
                                matched = true;
                                break;
                            }
                        } else if (type === 'domain' && act.domain) {
                            if (act.domain.toLowerCase().includes(val)) {
                                finalCategory = cat;
                                matched = true;
                                break;
                            }
                        } else if (type === 'title' && act.window_title) {
                            if (act.window_title.toLowerCase().includes(val)) {
                                finalCategory = cat;
                                matched = true;
                                break;
                            }
                        }
                    }

                    // 패턴 매칭이 되지 않은 경우 기존 자리비움 사유 분류 대입
                    if (!matched && act.idle_reason) {
                        const NON_WORK_IDLE_REASONS = [
                            '휴식', '식사', '화장실', '담배', 
                            'rest', 'meal', 'restroom', 'smoking', 'toilet', 'smoke', 
                            'พัก', 'ทานข้าว', 'ห้องน้ำ', 'สูบบุหรี่', 
                            'ພັກ', 'ກິນເຂົ້າ', 'ຫ້ອງນ້ຳ', 'ສູບຢາ'
                        ];
                        const WORK_IDLE_REASONS = [
                            '출근', '회의', '외부업무', 
                            'clock in', 'commute', 'start work', 'meeting', 'external work', 'external',
                            'เข้างาน', 'เริ่มงาน', 'ประชุม', 'งานนอก', 
                            'ເຂົ້າວຽກ', 'ເລີ່ມວຽກ', 'ປະຊຸມ', 'ວຽກນອກ'
                        ];
                        const trimmedReason = act.idle_reason.trim().toLowerCase();
                        if (NON_WORK_IDLE_REASONS.some(r => r.toLowerCase() === trimmedReason)) {
                            finalCategory = 'non-work';
                        } else if (WORK_IDLE_REASONS.some(r => r.toLowerCase() === trimmedReason)) {
                            finalCategory = 'work';
                        }
                    }

                    stmt.run([
                        employee_id,
                        cleanCompanyCode,
                        act.timestamp,
                        act.duration_seconds,
                        act.process_name,
                        act.window_title,
                        finalCategory,
                        act.domain || '',
                        act.idle_reason || null,
                        act.idle_detailed_reason || null
                    ]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('활동 로그 준비 오류:', err.message);
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: '데이터를 데이터베이스에 삽입하는 데 실패했습니다.' });
                    } else {
                        db.run("COMMIT");
                        console.log(`[수집 완료] 회사: ${cleanCompanyCode}, 사원: ${employee_name} (${employee_id}) - ${activities.length}개의 활동 기록 적재 완료.`);
                        return res.status(201).json({ success: true, count: activities.length });
                    }
                });
            });
        });
    });
});


// ------------------------------------------------------------------
// 관리자 보안 및 세션 관리
// ------------------------------------------------------------------

// 관리자 인증 미들웨어
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '인증되지 않은 요청입니다. 로그인이 필요합니다.' });
    }
    const token = authHeader.split(' ')[1];
    if (!activeSessions.has(token)) {
        return res.status(401).json({ error: '유효하지 않거나 만료된 세션입니다.' });
    }
    const session = activeSessions.get(token);
    req.companyCode = session.companyCode;
    req.role = session.role;
    req.adminUsername = session.username || 'unknown';
    req.employeeId = session.employeeId || null;
    req.employeeName = session.employeeName || null;
    req.submitterType = session.submitterType || 'admin';
    next();
}

// 직원 관리자 태그 매칭용 직원 ID 검색 헬퍼 함수
function getAllowedEmployeeIds(req, callback) {
    const companyCode = req.companyCode;
    const username = req.adminUsername;
    const role = req.role;

    if (companyCode === 'auton') {
        return callback(null);
    }

    // employee_manager 권한이 아니면 필터링 없음 (전체 접근)
    if (role !== 'employee_manager') {
        return callback(null);
    }

    // 관리자 태그 조회: 정식 company_admins 계정 또는 관리 권한이 부여된 직원(admin_role) 모두 지원
    const resolveManagerTags = (cb) => {
        db.get("SELECT tags FROM company_admins WHERE admin_id = ? AND company_code = ?", [username, companyCode], (err, adminRow) => {
            if (!err && adminRow) return cb(adminRow.tags);
            // 승격된 직원(employee_manager)인 경우 employees 테이블의 태그 사용
            db.get("SELECT tags FROM employees WHERE login_id = ? AND company_code = ?", [username, companyCode], (err2, empRow) => {
                if (err2 || !empRow) return cb(null);
                return cb(empRow.tags);
            });
        });
    };

    resolveManagerTags((tagsStr) => {
        const managerTags = tagsStr ? tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
        if (managerTags.length === 0) {
            return callback([]);
        }

        db.all("SELECT employee_id, tags FROM employees WHERE company_code = ?", [companyCode], (err2, empRows) => {
            if (err2 || !empRows) {
                return callback([]);
            }

            const allowedIds = empRows.filter(emp => {
                const empTags = emp.tags ? emp.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
                return empTags.some(t => managerTags.includes(t));
            }).map(emp => emp.employee_id);

            callback(allowedIds);
        });
    });
}

// 관리자 활동 로그(Audit Log) 적재 도우미 함수
function logAdminAction(req, actionType, details) {
    const companyCode = req.companyCode || 'unknown';
    const adminUsername = req.adminUsername || 'unknown';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    
    db.run(
        `INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [companyCode, adminUsername, actionType, typeof details === 'object' ? JSON.stringify(details) : details, ipAddress],
        (err) => {
            if (err) {
                console.error('[AUDIT LOG ERROR] Failed to save audit log:', err.message);
            }
        }
    );
}

// 1. 관리자 로그인 API
// 단일 회사 운영: 회사 코드는 선택 입력. 미입력 시 admin_id 로 회사를 자동 판별한다.
app.post('/api/admin/login', (req, res) => {
    const { id, password, company_code } = req.body;
    if (!id || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해 주세요.' });
    }
    const getIp = () => req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    // Super Admin(system_settings) 로그인 처리
    const loginSuperAdmin = () => {
        db.get("SELECT value FROM system_settings WHERE key = 'admin_id'", [], (err, idRow) => {
            if (err || !idRow) {
                return res.status(500).json({ error: '서버 설정 조회 실패' });
            }
            if (idRow.value !== id) {
                db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                    ['AUTON', id, '아이디 불일치', getIp()]);
                return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
            }
            db.get("SELECT value FROM system_settings WHERE key = 'admin_password'", [], async (err2, pwRow) => {
                if (err2 || !pwRow) {
                    return res.status(500).json({ error: '서버 설정 조회 실패' });
                }
                const pwOk = await verifyPassword(password, pwRow.value);
                if (!pwOk) {
                    db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                        ['AUTON', id, '비밀번호 불일치', getIp()]);
                    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
                }
                if (!isBcryptHash(pwRow.value)) {
                    const newHash = await hashPassword(password);
                    db.run("UPDATE system_settings SET value = ? WHERE key = 'admin_password'", [newHash]);
                }
                const token = crypto.randomBytes(16).toString('hex');
                activeSessions.set(token, { companyCode: 'auton', role: 'admin', username: id });
                db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_success', ?, ?)`,
                    ['auton', id, '통합관리자 로그인 성공', getIp()]);
                return res.json({ success: true, token, company_code: 'auton', role: 'admin' });
            });
        });
    };

    // 회사 관리자(company_admins) 로그인 처리
    const loginCompanyAdmin = (cleanCode) => {
        db.get(
            "SELECT a.admin_password, a.company_code, a.role FROM company_admins a JOIN companies c ON a.company_code = c.company_code WHERE a.admin_id = ? AND a.company_code = ?",
            [id.trim(), cleanCode],
            (err, row) => {
                if (err) {
                    console.error('관리자 로그인 쿼리 에러:', err.message);
                    return res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
                }
                if (!row) {
                    db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                        [cleanCode, id.trim(), '등록되지 않은 관리자', getIp()]);
                    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
                }
                verifyPassword(password, row.admin_password).then(async (pwOk) => {
                    if (!pwOk) {
                        db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                            [cleanCode, id.trim(), '비밀번호 불일치', getIp()]);
                        return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
                    }
                    if (!isBcryptHash(row.admin_password)) {
                        const newHash = await hashPassword(password);
                        db.run("UPDATE company_admins SET admin_password = ? WHERE admin_id = ? AND company_code = ?", [newHash, id.trim(), cleanCode]);
                    }
                    const token = crypto.randomBytes(16).toString('hex');
                    const role = row.role || 'admin';
                    activeSessions.set(token, { companyCode: cleanCode, role: role, username: id.trim() });
                    db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_success', ?, ?)`,
                        [cleanCode, id.trim(), '회사 관리자 로그인 성공', getIp()]);
                    return res.json({ success: true, token, company_code: cleanCode, role: role });
                });
            }
        );
    };

    // 회사 코드가 명시된 경우: 기존 방식 유지
    if (company_code && company_code.trim()) {
        const cleanCode = company_code.trim().toUpperCase();
        if (cleanCode === 'AUTON') return loginSuperAdmin();
        return loginCompanyAdmin(cleanCode);
    }

    // 회사 코드 미입력(단일 회사 모드): admin_id 로 소속 회사 자동 판별
    db.get("SELECT company_code FROM company_admins WHERE admin_id = ?", [id.trim()], (err, row) => {
        if (!err && row) {
            return loginCompanyAdmin(row.company_code);
        }
        // company_admins 에 없으면 통합관리자(super admin)로 시도
        return loginSuperAdmin();
    });
});

// 1.5. 관리자 로그아웃 API
app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const session = activeSessions.get(token);
        if (session) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
            db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'logout', '로그아웃', ?)`,
                [session.companyCode, session.username || 'unknown', ip]);
            activeSessions.delete(token);
        }
    }
    return res.json({ success: true });
});

// 2. 회사 설정 조회 API
app.get('/api/admin/settings', authMiddleware, (req, res) => {
    return res.json({ company_code: req.companyCode });
});

// 3. 회사 설정 및 관리자 비밀번호 변경 API
app.post('/api/admin/settings', authMiddleware, async (req, res) => {
    const { company_code, new_password } = req.body;
    const companyCode = req.companyCode;
    const role = req.role;
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        let updates = [];
        
        if (role === 'admin') {
            if (company_code && companyCode === 'auton') {
                updates.push(new Promise((resolve, reject) => {
                    db.run("UPDATE system_settings SET value = ? WHERE key = 'company_code'", [company_code], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                }));
            }
            
            if (new_password) {
                updates.push(hashPassword(new_password).then(hash => {
                    return new Promise((resolve, reject) => {
                        db.run("UPDATE system_settings SET value = ? WHERE key = 'admin_password'", [hash], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }));
            }
        } else {
            // sub_admin or employee_manager changing their own password
            if (new_password) {
                updates.push(hashPassword(new_password).then(hash => {
                    return new Promise((resolve, reject) => {
                        db.run("UPDATE company_admins SET admin_password = ? WHERE admin_id = ? AND company_code = ?", [hash, req.adminUsername, companyCode], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }));
            }
        }
        
        Promise.all(updates)
            .then(() => {
                db.run("COMMIT");
                logAdminAction(req, 'settings_update', '비밀번호 또는 설정 변경');
                return res.json({ success: true, message: '설정이 성공적으로 업데이트되었습니다.' });
            })
            .catch((err) => {
                db.run("ROLLBACK");
                return res.status(500).json({ error: '설정 저장 중 오류가 발생했습니다: ' + err.message });
            });
    });
});

// 3.5. 서브 관리자 및 직원 관리자 관리 API
app.get('/api/admin/sub_admins', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') return res.status(403).json({ error: '권한이 없습니다.' });
    const rolesToQuery = req.role === 'sub_admin' ? "('employee_manager')" : "('sub_admin', 'employee_manager')";
    db.all(`SELECT admin_id, role, tags, created_at FROM company_admins WHERE company_code = ? AND role IN ${rolesToQuery}`, [req.companyCode], (err, rows) => {
        if (err) return res.status(500).json({ error: '관리자 목록 조회 실패' });
        res.json({ sub_admins: rows });
    });
});

app.post('/api/admin/sub_admins', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') return res.status(403).json({ error: '권한이 없습니다.' });
    const { admin_id, password, role, tags } = req.body;
    
    if (req.role === 'sub_admin' && role !== 'employee_manager') {
        return res.status(403).json({ error: '서브 관리자는 직원 관리자만 생성할 수 있습니다.' });
    }
    
    if (!admin_id || !password) return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요.' });
    
    db.get("SELECT admin_id FROM company_admins WHERE admin_id = ?", [admin_id], async (err, row) => {
        if (err) return res.status(500).json({ error: '조회 실패' });
        if (row) return res.status(400).json({ error: '이미 존재하는 관리자 ID 입니다.' });
        
        const hash = await hashPassword(password);
        const adminRole = role === 'employee_manager' ? 'employee_manager' : 'sub_admin';
        const adminTags = role === 'employee_manager' ? (tags || '') : '';
        
        db.run("INSERT INTO company_admins (admin_id, admin_password, company_code, role, tags) VALUES (?, ?, ?, ?, ?)",
            [admin_id, hash, req.companyCode, adminRole, adminTags], (insertErr) => {
            if (insertErr) return res.status(500).json({ error: '관리자 생성 실패' });
            logAdminAction(req, 'sub_admin_create', `${adminRole === 'employee_manager' ? '직원관리자' : '서브관리자'} 계정 생성: ${admin_id}`);
            res.json({ success: true });
        });
    });
});

app.delete('/api/admin/sub_admins/:admin_id', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') return res.status(403).json({ error: '권한이 없습니다.' });
    const { admin_id } = req.params;
    const rolesToDelete = req.role === 'sub_admin' ? "('employee_manager')" : "('sub_admin', 'employee_manager')";
    db.run(`DELETE FROM company_admins WHERE admin_id = ? AND company_code = ? AND role IN ${rolesToDelete}`, [admin_id, req.companyCode], function(err) {
        if (err) return res.status(500).json({ error: '관리자 삭제 실패' });
        if (this.changes === 0) return res.status(404).json({ error: '대상을 찾을 수 없습니다.' });
        logAdminAction(req, 'sub_admin_delete', `관리자 계정 삭제: ${admin_id}`);
        res.json({ success: true });
    });
});

// 태그 선택을 위한 직원관리자 태그 목록 API
app.get('/api/admin/manager_tags', authMiddleware, (req, res) => {
    db.all("SELECT tags FROM company_admins WHERE company_code = ? AND role = 'employee_manager'", [req.companyCode], (err, rows) => {
        if (err) return res.status(500).json({ error: '태그 조회 실패' });
        let allTags = new Set();
        rows.forEach(row => {
            if (row.tags) {
                row.tags.split(',').forEach(t => allTags.add(t.trim()));
            }
        });
        res.json({ tags: Array.from(allTags).filter(t => t.length > 0) });
    });
});

// ------------------------------------------------------------------
// 4. Super Admin 관리 기능 (auton 계정 전용)관리자 관리 API
// ------------------------------------------------------------------

// 통합관리자 전용 권한 미들웨어
function superAdminOnly(req, res, next) {
    if (req.companyCode !== 'auton') {
        return res.status(403).json({ error: '통합관리자만 접근 가능한 서비스입니다.' });
    }
    next();
}

// 1. 등록된 회사 목록 조회
app.get('/api/super/companies', authMiddleware, superAdminOnly, (req, res) => {
    db.all("SELECT company_code, company_name, created_at FROM companies ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(rows);
    });
});

// 2. 신규 회사 등록
app.post('/api/super/companies', authMiddleware, superAdminOnly, (req, res) => {
    const { company_code, company_name } = req.body;
    if (!company_code || !company_name) {
        return res.status(400).json({ error: '회사 코드와 회사명을 모두 입력해 주세요.' });
    }
    const cleanCode = company_code.trim().toUpperCase();
    if (cleanCode === 'AUTON' || cleanCode === '') {
        return res.status(400).json({ error: '사용할 수 없는 회사 코드입니다.' });
    }
    db.run(
        "INSERT INTO companies (company_code, company_name) VALUES (?, ?)",
        [cleanCode, company_name.trim()],
        (err) => {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(400).json({ error: '이미 등록된 회사 코드입니다.' });
                }
                return res.status(500).json({ error: err.message });
            }
            logAdminAction(req, 'company_create', `회사 등록: ${cleanCode} (${company_name.trim()})`);
            return res.status(201).json({ success: true });
        }
    );
});

// 3. 기존 회사명 수정
app.put('/api/super/companies/:company_code', authMiddleware, superAdminOnly, (req, res) => {
    const { company_name } = req.body;
    const { company_code } = req.params;
    if (!company_name) {
        return res.status(400).json({ error: '회사명을 입력해 주세요.' });
    }
    db.run(
        "UPDATE companies SET company_name = ? WHERE company_code = ?",
        [company_name.trim(), company_code.toUpperCase()],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: '존재하지 않는 회사입니다.' });
            logAdminAction(req, 'company_edit', `회사명 수정: ${company_code} -> ${company_name.trim()}`);
            return res.json({ success: true });
        }
    );
});

// 4. 회사 영구 삭제 (연관 사원, 활동 로그, 관리자까지 일괄 청소)
app.delete('/api/super/companies/:company_code', authMiddleware, superAdminOnly, (req, res) => {
    const { company_code } = req.params;
    const targetCode = company_code.toUpperCase();
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        db.run("DELETE FROM activities WHERE company_code = ?", [targetCode]);
        db.run("DELETE FROM employees WHERE company_code = ?", [targetCode]);
        db.run("DELETE FROM company_admins WHERE company_code = ?", [targetCode]);
        // 전자결재 데이터 일괄 삭제
        db.run("DELETE FROM approval_attachments WHERE document_id IN (SELECT id FROM approval_documents WHERE company_code = ?)", [targetCode]);
        db.run("DELETE FROM approval_lines WHERE document_id IN (SELECT id FROM approval_documents WHERE company_code = ?)", [targetCode]);
        db.run("DELETE FROM approval_activity_log WHERE company_code = ?", [targetCode]);
        db.run("DELETE FROM approval_documents WHERE company_code = ?", [targetCode]);
        db.run("DELETE FROM approval_templates WHERE company_code = ?", [targetCode]);
        db.run("DELETE FROM approval_settings WHERE company_code = ?", [targetCode]);
        db.run("DELETE FROM companies WHERE company_code = ?", [targetCode], function(err) {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: '회사 삭제 중 오류가 발생했습니다: ' + err.message });
            }
            
            db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                    return res.status(500).json({ error: '트랜잭션 커밋 실패: ' + commitErr.message });
                }
                // 첨부파일 디스크 디렉토리 삭제
                try {
                    const dir = path.join(UPLOAD_ROOT, targetCode);
                    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
                } catch (rmErr) { console.warn('[회사 삭제] 업로드 디렉토리 삭제 실패:', rmErr.message); }
                console.log(`[회사 영구 삭제] 통합관리자 요청으로 회사 ${targetCode}의 모든 로그, 사원, 관리자, 결재 정보가 삭제되었습니다.`);
                logAdminAction(req, 'company_delete', `회사 영구 삭제: ${targetCode}`);
                return res.json({ success: true });
            });
        });
    });
});

// 5. 회사 관리자 목록 조회
app.get('/api/super/admins', authMiddleware, superAdminOnly, (req, res) => {
    db.all(
        "SELECT a.admin_id, a.company_code, c.company_name, a.created_at FROM company_admins a JOIN companies c ON a.company_code = c.company_code ORDER BY a.created_at DESC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        }
    );
});

// 6. 회사 관리자 계정 생성
app.post('/api/super/admins', authMiddleware, superAdminOnly, (req, res) => {
    const { admin_id, password, company_code } = req.body;
    if (!admin_id || !password || !company_code) {
        return res.status(400).json({ error: '관리자 ID, 비밀번호, 소속 회사를 모두 입력해 주세요.' });
    }
    const cleanCode = company_code.trim().toUpperCase();
    
    db.get("SELECT company_code FROM companies WHERE company_code = ?", [cleanCode], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: '존재하지 않는 회사 코드입니다.' });
        
        const hashedPw = crypto.createHash('sha256').update(password).digest('hex');
        db.run(
            "INSERT INTO company_admins (admin_id, admin_password, company_code) VALUES (?, ?, ?)",
            [admin_id.trim(), hashedPw, cleanCode],
            (err2) => {
                if (err2) {
                    if (err2.message.includes("UNIQUE")) {
                        return res.status(400).json({ error: '이미 존재하는 관리자 ID입니다.' });
                    }
                    return res.status(500).json({ error: err2.message });
                }
                logAdminAction(req, 'admin_create', `회사 관리자 계정 생성: ${admin_id.trim()} (회사: ${cleanCode})`);
                return res.status(201).json({ success: true });
            }
        );
    });
});

// 7. 회사 관리자 계정 삭제
app.delete('/api/super/admins/:admin_id', authMiddleware, superAdminOnly, (req, res) => {
    const { admin_id } = req.params;
    db.run("DELETE FROM company_admins WHERE admin_id = ?", [admin_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: '존재하지 않는 관리자입니다.' });
        logAdminAction(req, 'admin_delete', `회사 관리자 계정 삭제: ${admin_id}`);
        return res.json({ success: true });
    });
});

// ------------------------------------------------------------------
// 대시보드 요약 통계 API
// ------------------------------------------------------------------
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
    const stats = {};
    const companyCode = req.companyCode;

    getAllowedEmployeeIds(req, (allowedIds) => {
        if (allowedIds !== null && allowedIds.length === 0) {
            return res.json({
                employees: [],
                categoryDist: { work: 0, 'non-work': 0, idle: 0 },
                programs: [],
                nonWorkDomains: []
            });
        }

        db.serialize(() => {
            // 1. 실시간 활성 직원 조회 (최근 10분 이내에 활동이 보고된 직원)
            const tz = req.query.tz || 'Asia/Seoul';
            const offsetHours = tz === 'Asia/Vientiane' ? 7 : 9;
            const offsetStr = `+${offsetHours} hours`;

            let empQuery = `
                SELECT e.employee_id, e.employee_name, e.company_code, e.last_seen, e.tags,
                       (strftime('%s', 'now') - strftime('%s', e.last_seen)) as sec_diff,
                       (SELECT MIN(timestamp) FROM activities WHERE employee_id = e.employee_id AND date(timestamp, ?) = date(e.last_seen, ?)) as first_seen
                FROM employees e
            `;
            const empParams = [offsetStr, offsetStr];
            let hasWhere = false;
            if (companyCode !== 'auton') {
                empQuery += ` WHERE e.company_code = ?`;
                empParams.push(companyCode);
                hasWhere = true;
            }

            if (allowedIds !== null) {
                empQuery += hasWhere ? ` AND e.employee_id IN (${allowedIds.map(() => '?').join(',')})` : ` WHERE e.employee_id IN (${allowedIds.map(() => '?').join(',')})`;
                empParams.push(...allowedIds);
            }

            db.all(empQuery, empParams, (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                
                stats.employees = rows.map(r => {
                    const diffMin = Math.floor(Math.abs(new Date() - new Date(r.last_seen)) / 60000);
                    return {
                        employee_id: r.employee_id,
                        employee_name: r.employee_name,
                        company_code: r.company_code,
                        last_seen: r.last_seen,
                        first_seen: r.first_seen,
                        tags: r.tags || '',
                        status: diffMin <= 10 ? 'active' : 'away'
                    };
                });

                // 2. 전체 통계: 카테고리별 시간 배분
                let catQuery = `SELECT category, SUM(duration) as total_duration FROM activities`;
                const catParams = [];
                let hasWhereCat = false;
                if (companyCode !== 'auton') {
                    catQuery += ` WHERE company_code = ?`;
                    catParams.push(companyCode);
                    hasWhereCat = true;
                }

                if (allowedIds !== null) {
                    catQuery += hasWhereCat ? ` AND employee_id IN (${allowedIds.map(() => '?').join(',')})` : ` WHERE employee_id IN (${allowedIds.map(() => '?').join(',')})`;
                    catParams.push(...allowedIds);
                }
                catQuery += ` GROUP BY category`;

                db.all(catQuery, catParams, (err, catRows) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    stats.categoryDist = {
                        work: 0,
                        'non-work': 0,
                        idle: 0
                    };
                    catRows.forEach(r => {
                        stats.categoryDist[r.category] = r.total_duration;
                    });

                    // 3. 프로그램별 사용 시간 비중
                    let progQuery = `SELECT 
                                        CASE 
                                            WHEN process_name LIKE '%excel%' THEN 'Excel'
                                            WHEN process_name LIKE '%powerpoint%' OR process_name LIKE '%powerpnt%' THEN 'PowerPoint'
                                            WHEN process_name LIKE '%word%' OR process_name LIKE '%winword%' THEN 'Word'
                                            WHEN process_name LIKE '%code%' THEN 'VS Code'
                                            WHEN process_name LIKE '%chrome%' OR process_name LIKE '%edge%' OR process_name LIKE '%safari%' THEN 'Web Browser'
                                            ELSE '기타 유틸리티'
                                        END as program_group,
                                        SUM(duration) as total_duration
                                     FROM activities
                                     WHERE category != 'idle'`;
                    const progParams = [];
                    if (companyCode !== 'auton') {
                        progQuery += ` AND company_code = ?`;
                        progParams.push(companyCode);
                    }

                    if (allowedIds !== null) {
                        progQuery += ` AND employee_id IN (${allowedIds.map(() => '?').join(',')})`;
                        progParams.push(...allowedIds);
                    }
                    progQuery += ` GROUP BY program_group ORDER BY total_duration DESC`;

                    db.all(progQuery, progParams, (err, progRows) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        stats.programs = progRows;

                        // 4. 비업무 사이트 누적 랭킹
                        let domainQuery = `SELECT domain, SUM(duration) as total_duration, COUNT(id) as visit_count
                                           FROM activities
                                           WHERE category = 'non-work' AND domain != ''`;
                        const domainParams = [];
                        if (companyCode !== 'auton') {
                            domainQuery += ` AND company_code = ?`;
                            domainParams.push(companyCode);
                        }

                        if (allowedIds !== null) {
                            domainQuery += ` AND employee_id IN (${allowedIds.map(() => '?').join(',')})`;
                            domainParams.push(...allowedIds);
                        }
                        domainQuery += ` GROUP BY domain ORDER BY total_duration DESC LIMIT 5`;

                        db.all(domainQuery, domainParams, (err, domainRows) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            stats.nonWorkDomains = domainRows;
                            
                            return res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

// ------------------------------------------------------------------
// 사원별 활동 통계 조회 API
// ------------------------------------------------------------------
app.get('/api/employees/:employee_id/stats', authMiddleware, (req, res) => {
    const { employee_id } = req.params;
    const companyCode = req.companyCode;

    getAllowedEmployeeIds(req, (allowedIds) => {
        if (allowedIds !== null && !allowedIds.includes(employee_id)) {
            return res.status(403).json({ error: '해당 사원의 정보에 접근할 권한이 없습니다.' });
        }

        db.get("SELECT employee_name, company_code, tags FROM employees WHERE employee_id = ?", [employee_id], (err, empRow) => {
            if (err) {
                return res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
            }
            if (!empRow) {
                return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
            }
            if (companyCode !== 'auton' && empRow.company_code !== companyCode) {
                return res.status(403).json({ error: '해당 사원의 정보에 접근할 권한이 없습니다.' });
            }

            const stats = {
                employee_id: employee_id,
                employee_name: empRow.employee_name,
                company_code: empRow.company_code,
                tags: empRow.tags || '',
                categoryDist: { work: 0, 'non-work': 0, idle: 0 },
                focusScore: 0,
                programs: [],
                nonWorkDomains: []
            };

            db.all("SELECT category, SUM(duration) as total_duration FROM activities WHERE employee_id = ? GROUP BY category", [employee_id], (err, catRows) => {
                if (err) return res.status(500).json({ error: err.message });

                catRows.forEach(r => {
                    if (r.category in stats.categoryDist) {
                        stats.categoryDist[r.category] = r.total_duration;
                    }
                });

                const workTime = stats.categoryDist.work;
                const nonWorkTime = stats.categoryDist['non-work'];
                const totalActive = workTime + nonWorkTime;
                if (totalActive > 0) {
                    stats.focusScore = Math.round((workTime / totalActive) * 100);
                }

                const progQuery = `
                    SELECT 
                        CASE 
                            WHEN process_name LIKE '%excel%' THEN 'Excel'
                            WHEN process_name LIKE '%powerpoint%' OR process_name LIKE '%powerpnt%' THEN 'PowerPoint'
                            WHEN process_name LIKE '%word%' OR process_name LIKE '%winword%' THEN 'Word'
                            WHEN process_name LIKE '%code%' THEN 'VS Code'
                            WHEN process_name LIKE '%chrome%' OR process_name LIKE '%edge%' OR process_name LIKE '%safari%' THEN 'Web Browser'
                            ELSE '기타 유틸리티'
                        END as program_group,
                        SUM(duration) as total_duration
                    FROM activities
                    WHERE employee_id = ? AND category != 'idle'
                    GROUP BY program_group 
                    ORDER BY total_duration DESC 
                    LIMIT 5
                `;

                db.all(progQuery, [employee_id], (err, progRows) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.programs = progRows;

                    const domainQuery = `
                        SELECT domain, SUM(duration) as total_duration, COUNT(*) as visit_count
                        FROM activities
                        WHERE employee_id = ? AND category = 'non-work' AND domain != ''
                        GROUP BY domain 
                        ORDER BY total_duration DESC 
                        LIMIT 5
                    `;

                    db.all(domainQuery, [employee_id], (err, domainRows) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.nonWorkDomains = domainRows;

                        return res.json(stats);
                    });
                });
            });
        });
    });
});

// ------------------------------------------------------------------
// 사원별 상세 활동 로그 엑셀 다운로드용 API (날짜 지정)
// ------------------------------------------------------------------
app.get('/api/employees/:employee_id/activities', authMiddleware, (req, res) => {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;
    const companyCode = req.companyCode;

    getAllowedEmployeeIds(req, (allowedIds) => {
        if (allowedIds !== null && !allowedIds.includes(employee_id)) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        if (!start_date || !end_date) {
            return res.status(400).json({ error: '시작일(start_date)과 종료일(end_date)을 모두 지정해 주세요.' });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);
        
        // 최대 7일 제한 검증
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 7) {
            return res.status(400).json({ error: '최대 7일까지만 조회할 수 있습니다.' });
        }

        // 1. 사원 존재 여부 및 권한 검증
        db.get("SELECT company_code FROM employees WHERE employee_id = ?", [employee_id], (err, empRow) => {
            if (err) return res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
            if (!empRow) return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
            if (companyCode !== 'auton' && empRow.company_code !== companyCode) {
                return res.status(403).json({ error: '권한이 없습니다.' });
            }

            // 2. 활동 로그 조회 (지정된 기간, 시간 기준)
            const query = `
                SELECT timestamp, duration, process_name, window_title, category, domain
                FROM activities
                WHERE employee_id = ? 
                  AND timestamp >= ?
                  AND timestamp <= ?
                ORDER BY timestamp ASC
            `;
            const startIso = start_date + "T00:00:00.000Z";
            const endIso = end_date + "T23:59:59.999Z";

            db.all(query, [employee_id, startIso, endIso], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.json(rows);
            });
        });
    });
});

// ------------------------------------------------------------------
// 사원 정보 영구 삭제 API (연관 활동 로그 일괄 연쇄 삭제)
// ------------------------------------------------------------------
app.delete('/api/admin/employees/:employee_id', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원관리자는 사원 삭제 권한이 없습니다.' });
    }
    const { employee_id } = req.params;
    const companyCode = req.companyCode;

    if (!employee_id) {
        return res.status(400).json({ error: '삭제할 사원 번호가 유효하지 않습니다.' });
    }

    // 1. 사원의 테넌트(회사) 소유권 검증 (일반 관리자는 본인 회사 사원만 삭제 가능, Super Admin인 auton은 전체 가능)
    db.get("SELECT company_code, employee_name FROM employees WHERE employee_id = ?", [employee_id], (err, empRow) => {
        if (err) {
            return res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다: ' + err.message });
        }
        if (!empRow) {
            return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
        }
        if (companyCode !== 'auton' && empRow.company_code !== companyCode) {
            return res.status(403).json({ error: '해당 사원을 삭제할 수 있는 권한이 없습니다.' });
        }

        const empName = empRow.employee_name;

        // 2. 단일 데이터베이스 트랜잭션으로 연쇄 삭제 실행
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // 활동 상세 로그 연쇄 영구 삭제
            db.run("DELETE FROM activities WHERE employee_id = ?", [employee_id], (err1) => {
                if (err1) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: '활동 로그 연쇄 삭제 실패: ' + err1.message });
                }

                // 사원 정보 영구 삭제
                db.run("DELETE FROM employees WHERE employee_id = ?", [employee_id], function(err2) {
                    if (err2) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: '사원 레코드 삭제 실패: ' + err2.message });
                    }

                    db.run("COMMIT", (commitErr) => {
                        if (commitErr) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: '트랜잭션 커밋 실패: ' + commitErr.message });
                        }

                        console.log(`[사원 삭제 완료] 사원번호: ${employee_id}, 이름: ${empName} (소속: ${empRow.company_code})의 모든 이력 및 사원 정보가 영구 파기되었습니다.`);
                        logAdminAction(req, 'employee_delete', `사원 영구 삭제 | 사번: ${employee_id} | 이름: ${empName} | 소속: ${empRow.company_code}`);
                        
                        return res.json({ success: true, message: '사원 및 활동 데이터가 완전히 삭제되었습니다.' });
                    });
                });
            });
        });
    });
});

// ------------------------------------------------------------------
// 상세 감지 로그 API (비업무 사이트 감지 필터 지원)
// ------------------------------------------------------------------
app.get('/api/dashboard/logs', authMiddleware, (req, res) => {
    const { non_work_only, today_only, category, start_date, end_date, employee_id, tz } = req.query;
    const companyCode = req.companyCode;

    getAllowedEmployeeIds(req, (allowedIds) => {
        if (allowedIds !== null && allowedIds.length === 0) {
            return res.json([]);
        }
        if (allowedIds !== null && employee_id && !allowedIds.includes(employee_id)) {
            return res.json([]);
        }
        
        let query = `
            SELECT a.id, a.employee_id, e.employee_name, a.company_code, a.timestamp, a.duration, a.process_name, a.window_title, a.category, a.domain, a.idle_reason, a.idle_detailed_reason
            FROM activities a
            JOIN employees e ON a.employee_id = e.employee_id
        `;
        const params = [];
        const conditions = [];
        
        if (companyCode !== 'auton') {
            conditions.push(`a.company_code = ?`);
            params.push(companyCode);
        }
        if (employee_id) {
            conditions.push(`a.employee_id = ?`);
            params.push(employee_id);
        } else if (allowedIds !== null) {
            conditions.push(`a.employee_id IN (${allowedIds.map(() => '?').join(',')})`);
            params.push(...allowedIds);
        }
        
        if (category) {
            conditions.push(`a.category = ?`);
            params.push(category);
        } else if (non_work_only === 'true') {
            conditions.push(`a.category = 'non-work'`);
        }

        if (start_date) {
            conditions.push(`a.timestamp >= ?`);
            params.push(`${start_date}T00:00:00.000Z`);
        }
        if (end_date) {
            conditions.push(`a.timestamp <= ?`);
            params.push(`${end_date}T23:59:59.999Z`);
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        
        query += ` ORDER BY a.timestamp DESC`;
        if (!start_date && !end_date) {
            query += ` LIMIT 100`;
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (today_only === 'true') {
                const tzToUse = tz || 'Asia/Seoul';
                const todayStr = new Date().toLocaleDateString('en-US', { timeZone: tzToUse });
                rows = rows.filter(r => {
                    const rowDate = new Date(r.timestamp).toLocaleDateString('en-US', { timeZone: tzToUse });
                    return rowDate === todayStr;
                });
            }
            return res.json(rows);
        });
    });
});

// 로그 카테고리 수정 API (관리자/서브관리자)
app.put('/api/dashboard/logs/:id/category', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원관리자는 활동 분류 수정 권한이 없습니다.' });
    }
    const { id } = req.params;
    const { category, reason } = req.body;
    const companyCode = req.companyCode;

    if (!['work', 'non-work'].includes(category)) {
        return res.status(400).json({ error: '유효하지 않은 카테고리입니다. (work 또는 non-work)' });
    }

    if (!reason || !reason.trim()) {
        return res.status(400).json({ error: '변경 사유를 입력해 주세요.' });
    }

    const whereClause = companyCode === 'auton' ? 'WHERE id = ?' : 'WHERE id = ? AND company_code = ?';
    const params = companyCode === 'auton' ? [id] : [id, companyCode];

    db.run(`UPDATE activities SET category = ?, idle_reason = ? ${whereClause}`, [category, reason.trim(), ...params], function(err) {
        if (err) return res.status(500).json({ error: '카테고리 변경 실패: ' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '해당 로그를 찾을 수 없습니다.' });
        logAdminAction(req, 'category_update', `활동 분류 수정 | 로그 ID: ${id} | 변경 후: ${category} | 사유: ${reason.trim()}`);
        res.json({ success: true });
    });
});

// ------------------------------------------------------------------
// 데이터베이스 활동 로그 완전 초기화 API
// ------------------------------------------------------------------// 8. 데이터베이스 초기화(리셋) API
app.delete('/api/dashboard/reset', authMiddleware, (req, res) => {
    if (req.role === 'sub_admin' || req.role === 'employee_manager') {
        return res.status(403).json({ error: '서브 관리자 및 직원 관리자는 데이터베이스 초기화 권한이 없습니다.' });
    }
    const companyCode = req.companyCode;
    
    db.serialize(() => {
        if (companyCode === 'auton') {
            db.run("DELETE FROM activities", (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                db.run("DELETE FROM employees", (err2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    
                    console.log("[초기화 완료] 통합 관리자 요청으로 모든 활동 및 사원 데이터가 데이터베이스에서 삭제되었습니다.");
                    logAdminAction(req, 'reset_data', '모든 활동 및 사원 데이터 전체 초기화');
                    return res.json({ success: true, message: '모든 데이터가 성공적으로 초기화되었습니다.' });
                });
            });
        } else {
            db.run("DELETE FROM activities WHERE company_code = ?", [companyCode], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                db.run("DELETE FROM employees WHERE company_code = ?", [companyCode], (err2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    
                    console.log(`[초기화 완료] ${companyCode} 관리자 요청으로 해당 회사의 활동 및 사원 데이터가 삭제되었습니다.`);
                    logAdminAction(req, 'reset_data', `회사 데이터 초기화 (회사: ${companyCode})`);
                    return res.json({ success: true, message: '해당 회사의 모든 데이터가 성공적으로 초기화되었습니다.' });
                });
            });
        }
    });
});

// ------------------------------------------------------------------
// 관리자 → 에이전트 메시지 전송 API
// ------------------------------------------------------------------
app.post('/api/admin/messages', authMiddleware, (req, res) => {
    const { employee_id, message } = req.body;
    const companyCode = req.companyCode;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: '메시지 내용을 입력해 주세요.' });
    }

    getAllowedEmployeeIds(req, (allowedIds) => {
        if (allowedIds !== null) {
            if (!employee_id || !allowedIds.includes(employee_id)) {
                return res.status(403).json({ error: '해당 직원에게 메시지를 전송할 권한이 없습니다.' });
            }
        }

        const payload = JSON.stringify({ message: message.trim() });
        const targetEmployeeId = employee_id || null;

        db.run(
            `INSERT INTO agent_commands (company_code, employee_id, type, payload, status) VALUES (?, ?, 'message', ?, 'pending')`,
            [companyCode, targetEmployeeId, payload],
            function(err) {
                if (err) return res.status(500).json({ error: '메시지 저장 실패: ' + err.message });
                console.log(`[메시지 발송] 회사: ${companyCode}, 대상: ${targetEmployeeId || '전체'}, 내용: ${message.trim()}`);
                return res.json({ success: true, id: this.lastID });
            }
        );
    });
});

// ------------------------------------------------------------------
// 에이전트 명령 폴링 API (에이전트가 주기적으로 호출)
// ------------------------------------------------------------------
app.get('/api/agent/commands', agentAuth, (req, res) => {
    const { company_code, employee_id } = req.query;
    if (!company_code || !employee_id) {
        return res.status(400).json({ error: 'company_code와 employee_id가 필요합니다.' });
    }
    const cleanCode = company_code.trim().toUpperCase();

    // 해당 직원 또는 전체 대상(employee_id IS NULL) 중 pending 상태인 명령 조회
    db.all(
        `SELECT id, type, payload FROM agent_commands
         WHERE company_code = ? AND status = 'pending'
         AND (employee_id = ? OR employee_id IS NULL)
         ORDER BY created_at ASC LIMIT 10`,
        [cleanCode, employee_id.trim()],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (rows.length > 0) {
                const ids = rows.map(r => r.id);
                const placeholders = ids.map(() => '?').join(',');
                db.run(
                    `UPDATE agent_commands SET status = 'delivered' WHERE id IN (${placeholders})`,
                    ids,
                    (updateErr) => {
                        if (updateErr) console.error('명령 상태 업데이트 오류:', updateErr.message);
                    }
                );
            }

            return res.json(rows.map(r => ({
                id: r.id,
                type: r.type,
                payload: JSON.parse(r.payload)
            })));
        }
    );
});

// ------------------------------------------------------------------
// 에이전트 설정 조회 API (에이전트가 자리비움 임계값 등 설정 수신)
// ------------------------------------------------------------------
app.get('/api/agent/settings', agentAuth, (req, res) => {
    const { company_code } = req.query;
    if (!company_code) {
        return res.status(400).json({ error: 'company_code가 필요합니다.' });
    }
    const cleanCode = company_code.trim().toUpperCase();

    db.all(
        `SELECT key, value FROM company_settings WHERE company_code = ?`,
        [cleanCode],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            const settings = { 
                idle_threshold_seconds: 600,
                agent_scan_interval_seconds: 60,
                agent_send_interval_seconds: 600
            }; // 기본값
            rows.forEach(r => {
                if (r.key === 'idle_threshold_seconds') {
                    settings.idle_threshold_seconds = parseInt(r.value, 10);
                } else if (r.key === 'agent_scan_interval_seconds') {
                    settings.agent_scan_interval_seconds = parseInt(r.value, 10);
                } else if (r.key === 'agent_send_interval_seconds') {
                    settings.agent_send_interval_seconds = parseInt(r.value, 10);
                }
            });
            return res.json(settings);
        }
    );
});

// ------------------------------------------------------------------
// 관리자 회사 설정 조회/저장 API
// ------------------------------------------------------------------
app.get('/api/admin/company-settings', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    if (companyCode === 'auton') {
        return res.json({ 
            idle_threshold_seconds: 600,
            agent_scan_interval_seconds: 60,
            agent_send_interval_seconds: 600
        });
    }
    db.all(
        `SELECT key, value FROM company_settings WHERE company_code = ?`,
        [companyCode],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const settings = { 
                idle_threshold_seconds: 600,
                agent_scan_interval_seconds: 60,
                agent_send_interval_seconds: 600,
                api_token: null
            };
            rows.forEach(r => {
                if (r.key === 'idle_threshold_seconds') {
                    settings.idle_threshold_seconds = parseInt(r.value, 10);
                } else if (r.key === 'agent_scan_interval_seconds') {
                    settings.agent_scan_interval_seconds = parseInt(r.value, 10);
                } else if (r.key === 'agent_send_interval_seconds') {
                    settings.agent_send_interval_seconds = parseInt(r.value, 10);
                } else if (r.key === 'api_token') {
                    settings.api_token = r.value;
                }
            });
            return res.json(settings);
        }
    );
});

app.put('/api/admin/company-settings', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    if (companyCode === 'auton') {
        return res.status(400).json({ error: '통합관리자는 개별 회사 설정을 직접 변경할 수 없습니다.' });
    }
    const { idle_threshold_seconds, agent_scan_interval_seconds, agent_send_interval_seconds, regenerate_token } = req.body;
    
    if (idle_threshold_seconds === undefined || idle_threshold_seconds === null ||
        agent_scan_interval_seconds === undefined || agent_scan_interval_seconds === null ||
        agent_send_interval_seconds === undefined || agent_send_interval_seconds === null) {
        return res.status(400).json({ error: '모든 설정값(idle_threshold_seconds, agent_scan_interval_seconds, agent_send_interval_seconds)이 필요합니다.' });
    }

    const idleVal = parseInt(idle_threshold_seconds, 10);
    const scanVal = parseInt(agent_scan_interval_seconds, 10);
    const sendVal = parseInt(agent_send_interval_seconds, 10);

    if (isNaN(idleVal) || idleVal < 60 || idleVal > 3600) {
        return res.status(400).json({ error: '자리비움 시간은 1분(60초) ~ 60분(3600초) 사이여야 합니다.' });
    }
    if (isNaN(scanVal) || scanVal < 1 || scanVal > 300) {
        return res.status(400).json({ error: '스캔 주기는 1초 ~ 300초 사이여야 합니다.' });
    }
    if (isNaN(sendVal) || sendVal < 10 || sendVal > 3600) {
        return res.status(400).json({ error: '전송 주기는 10초 ~ 3600초(60분) 사이여야 합니다.' });
    }

    const newApiToken = regenerate_token ? crypto.randomBytes(24).toString('hex') : null;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        let hasError = false;
        
        const queries = [
            { key: 'idle_threshold_seconds', val: idleVal.toString() },
            { key: 'agent_scan_interval_seconds', val: scanVal.toString() },
            { key: 'agent_send_interval_seconds', val: sendVal.toString() }
        ];

        if (newApiToken) {
            queries.push({ key: 'api_token', val: newApiToken });
        }

        let completed = 0;
        queries.forEach(q => {
            db.run(
                `INSERT INTO company_settings (company_code, key, value) VALUES (?, ?, ?)
                 ON CONFLICT(company_code, key) DO UPDATE SET value = excluded.value`,
                [companyCode, q.key, q.val],
                function(err) {
                    if (err) {
                        hasError = true;
                    }
                    completed++;
                    if (completed === queries.length) {
                        if (hasError) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: '설정 저장 중 오류가 발생했습니다.' });
                        } else {
                            db.run("COMMIT");
                            console.log(`[설정 변경] 회사: ${companyCode} | idle_threshold_seconds = ${idleVal}, agent_scan_interval_seconds = ${scanVal}, agent_send_interval_seconds = ${sendVal}${newApiToken ? ' | 에이전트 토큰 재발급' : ''}`);
                            logAdminAction(req, 'company_settings_update', `자리비움: ${idleVal}초, 스캔주기: ${scanVal}초, 전송주기: ${sendVal}초 설정 변경${newApiToken ? ', 에이전트 토큰 재발급' : ''}`);
                            return res.json({ 
                                success: true, 
                                idle_threshold_seconds: idleVal,
                                agent_scan_interval_seconds: scanVal,
                                agent_send_interval_seconds: sendVal,
                                api_token: newApiToken || null
                            });
                        }
                    }
                }
            );
        });
    });
});

// ------------------------------------------------------------------
// 관리자 활동 로그 조회 API (페이지네이션 및 필터 지원)
// ------------------------------------------------------------------
app.get('/api/admin/audit-logs', authMiddleware, (req, res) => {
    const { start_date, end_date, admin_username, action_type, page = 1, limit = 20 } = req.query;
    const companyCode = req.companyCode;

    let query = `
        SELECT id, company_code, admin_username, action_type, details, ip_address, created_at
        FROM admin_audit_logs
    `;
    let countQuery = `
        SELECT COUNT(*) as total FROM admin_audit_logs
    `;
    const params = [];
    const countParams = [];
    const conditions = [];

    // 일반 회사는 본인 회사 로그만 조회 가능, auton(통합관리자)은 전체 조회 가능
    if (companyCode !== 'auton') {
        conditions.push(`company_code = ?`);
        params.push(companyCode);
        countParams.push(companyCode);
    }

    if (admin_username) {
        conditions.push(`admin_username LIKE ?`);
        params.push(`%${admin_username}%`);
        countParams.push(`%${admin_username}%`);
    }

    if (action_type) {
        conditions.push(`action_type = ?`);
        params.push(action_type);
        countParams.push(action_type);
    }

    if (start_date) {
        conditions.push(`created_at >= ?`);
        params.push(`${start_date} 00:00:00`);
        countParams.push(`${start_date} 00:00:00`);
    }
    if (end_date) {
        conditions.push(`created_at <= ?`);
        params.push(`${end_date} 23:59:59`);
        countParams.push(`${end_date} 23:59:59`);
    }

    if (conditions.length > 0) {
        const condStr = ` WHERE ` + conditions.join(' AND ');
        query += condStr;
        countQuery += condStr;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;
    params.push(limitNum, offset);

    db.get(countQuery, countParams, (err, countRow) => {
        if (err) return res.status(500).json({ error: err.message });
        const total = countRow ? countRow.total : 0;

        db.all(query, params, (err2, rows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
                success: true,
                logs: rows,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            });
        });
    });
});

// ------------------------------------------------------------------
// 활동 분류 패턴 관리 API
// ------------------------------------------------------------------
app.get('/api/admin/patterns', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원관리자는 분류 패턴 관리 권한이 없습니다.' });
    }
    const companyCode = req.companyCode;
    
    db.all(
        `SELECT id, pattern_type, pattern_value, category, created_at FROM activity_patterns
         WHERE company_code = ? ORDER BY id DESC`,
        [companyCode],
        (err, rows) => {
            if (err) return res.status(500).json({ error: '패턴 조회 실패: ' + err.message });
            return res.json(rows);
        }
    );
});

app.post('/api/admin/patterns', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원관리자는 분류 패턴 관리 권한이 없습니다.' });
    }
    const companyCode = req.companyCode;
    const { pattern_type, pattern_value, category } = req.body;

    if (!pattern_type || !pattern_value || !category) {
        return res.status(400).json({ error: '모든 필드를 입력해 주세요.' });
    }

    if (!['process', 'title', 'domain'].includes(pattern_type)) {
        return res.status(400).json({ error: '유효하지 않은 패턴 유형입니다.' });
    }

    if (!['work', 'non-work'].includes(category)) {
        return res.status(400).json({ error: '유효하지 않은 분류입니다.' });
    }

    const cleanValue = pattern_value.trim();
    if (!cleanValue) {
        return res.status(400).json({ error: '패턴 값을 입력해 주세요.' });
    }

    db.run(
        `INSERT INTO activity_patterns (company_code, pattern_type, pattern_value, category) VALUES (?, ?, ?, ?)`,
        [companyCode, pattern_type, cleanValue, category],
        function(err) {
            if (err) return res.status(500).json({ error: '패턴 등록 실패: ' + err.message });
            logAdminAction(req, 'pattern_create', `분류 패턴 등록 | 유형: ${pattern_type}, 값: ${cleanValue}, 분류: ${category}`);
            return res.json({ success: true, id: this.lastID });
        }
    );
});

app.delete('/api/admin/patterns/:id', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원관리자는 분류 패턴 관리 권한이 없습니다.' });
    }
    const companyCode = req.companyCode;
    const { id } = req.params;

    const whereClause = companyCode === 'auton' ? 'WHERE id = ?' : 'WHERE id = ? AND company_code = ?';
    const params = companyCode === 'auton' ? [id] : [id, companyCode];

    db.run(`DELETE FROM activity_patterns ${whereClause}`, params, function(err) {
        if (err) return res.status(500).json({ error: '패턴 삭제 실패: ' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '해당 패턴을 찾을 수 없거나 권한이 없습니다.' });
        logAdminAction(req, 'pattern_delete', `분류 패턴 삭제 | ID: ${id}`);
        return res.json({ success: true });
    });
});

// ------------------------------------------------------------------
// 사원 태그 수정 API (관리자/서브관리자 전용)
// ------------------------------------------------------------------
app.put('/api/admin/employees/:employee_id/tags', authMiddleware, (req, res) => {
    if (req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원관리자는 태그를 수정할 권한이 없습니다.' });
    }
    const { employee_id } = req.params;
    const { tags } = req.body;
    const companyCode = req.companyCode;

    db.get("SELECT company_code FROM employees WHERE employee_id = ?", [employee_id], (err, empRow) => {
        if (err) return res.status(500).json({ error: '사원 조회 실패' });
        if (!empRow) return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
        if (companyCode !== 'auton' && empRow.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        const cleanTags = tags !== undefined && tags !== null ? tags.trim() : '';

        db.run("UPDATE employees SET tags = ? WHERE employee_id = ?", [cleanTags, employee_id], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: '태그 업데이트 실패: ' + updateErr.message });
            logAdminAction(req, 'employee_tags_update', `사원 태그 수정 | 사번: ${employee_id} | 변경 후 태그: ${cleanTags}`);
            return res.json({ success: true, tags: cleanTags });
        });
    });
});

// 직원 신규 등록 (관리자, 에이전트 없이 수동 추가)
app.post('/api/admin/employees', authMiddleware, (req, res) => {
    if (req.role === 'employee' || req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원 등록 권한이 없습니다.' });
    }
    const employee_id = (req.body.employee_id || '').trim();
    const employee_name = (req.body.employee_name || '').trim();
    const tags = (req.body.tags || '').trim();
    const companyCode = req.companyCode === 'auton' ? (req.body.company_code || '').trim().toUpperCase() : req.companyCode;

    if (!employee_id || !employee_name) return res.status(400).json({ error: '사번과 이름을 입력해 주세요.' });
    if (!companyCode) return res.status(400).json({ error: '회사 코드가 필요합니다.' });

    db.get("SELECT employee_id FROM employees WHERE employee_id = ?", [employee_id], (err, dup) => {
        if (err) return res.status(500).json({ error: '조회 실패' });
        if (dup) return res.status(400).json({ error: '이미 존재하는 사번입니다.' });
        db.run(
            "INSERT INTO employees (employee_id, employee_name, company_code, tags) VALUES (?, ?, ?, ?)",
            [employee_id, employee_name, companyCode, tags],
            function(insErr) {
                if (insErr) return res.status(500).json({ error: '직원 등록 실패: ' + insErr.message });
                logAdminAction(req, 'employee_create', `직원 등록 | 사번: ${employee_id} | 이름: ${employee_name}`);
                return res.status(201).json({ success: true });
            }
        );
    });
});

// 직원 정보 수정 (이름/태그)
app.put('/api/admin/employees/:employee_id', authMiddleware, (req, res) => {
    if (req.role === 'employee' || req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원 정보 수정 권한이 없습니다.' });
    }
    const { employee_id } = req.params;
    const employee_name = (req.body.employee_name || '').trim();
    const tags = req.body.tags !== undefined ? String(req.body.tags).trim() : null;
    const companyCode = req.companyCode;

    if (!employee_name) return res.status(400).json({ error: '이름을 입력해 주세요.' });

    db.get("SELECT company_code FROM employees WHERE employee_id = ?", [employee_id], (err, emp) => {
        if (err) return res.status(500).json({ error: '조회 실패' });
        if (!emp) return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
        if (companyCode !== 'auton' && emp.company_code !== companyCode) return res.status(403).json({ error: '권한이 없습니다.' });

        const sets = ["employee_name = ?"];
        const params = [employee_name];
        if (tags !== null) { sets.push("tags = ?"); params.push(tags); }
        params.push(employee_id);

        db.run(`UPDATE employees SET ${sets.join(', ')} WHERE employee_id = ?`, params, function(uErr) {
            if (uErr) return res.status(500).json({ error: '직원 수정 실패: ' + uErr.message });
            logAdminAction(req, 'employee_update', `직원 정보 수정 | 사번: ${employee_id} | 이름: ${employee_name}`);
            return res.json({ success: true });
        });
    });
});

// ------------------------------------------------------------------
// 전자결재: 직원 로그인/로그아웃 API
// ------------------------------------------------------------------

app.post('/api/employee/login', (req, res) => {
    // 단일 회사 운영: 회사 코드는 선택 입력. 미입력 시 전역 고유한 login_id 로 회사를 자동 판별.
    const { login_id, password, company_code } = req.body;
    if (!login_id || !password) {
        return res.status(400).json({ error: '직원 ID와 비밀번호를 입력해 주세요.' });
    }
    const cleanCode = (company_code && company_code.trim()) ? company_code.trim().toUpperCase() : null;

    const baseSelect = `SELECT e.employee_id, e.employee_name, e.login_id, e.password_hash, e.is_login_enabled, e.company_code, e.admin_role
         FROM employees e JOIN companies c ON e.company_code = c.company_code
         WHERE e.login_id = ?`;
    const query = cleanCode ? baseSelect + " AND e.company_code = ?" : baseSelect;
    const queryParams = cleanCode ? [login_id.trim(), cleanCode] : [login_id.trim()];

    db.get(
        query,
        queryParams,
        async (err, row) => {
            if (err) {
                return res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
            }
            if (!row || !row.is_login_enabled || !row.password_hash) {
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'employee_login_failure', ?, ?)`,
                    [cleanCode || '-', login_id.trim(), '등록되지 않은 직원 또는 비활성 계정', ip]);
                return res.status(401).json({ error: '등록되지 않은 직원이거나 로그인이 비활성화된 계정입니다.' });
            }

            const pwOk = await verifyPassword(password, row.password_hash);
            if (!pwOk) {
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'employee_login_failure', ?, ?)`,
                    [row.company_code, login_id.trim(), '비밀번호 불일치', ip]);
                return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
            }

            if (!isBcryptHash(row.password_hash)) {
                const newHash = await hashPassword(password);
                db.run("UPDATE employees SET password_hash = ? WHERE employee_id = ?", [newHash, row.employee_id]);
            }

            // 부여된 관리 권한이 있으면 실효 역할로 승격 (없으면 일반 직원)
            // 보안상 'admin'(최고 권한)은 직원에게 부여 불가 — sub_admin/employee_manager만 허용
            const grantedRole = (row.admin_role && ['sub_admin', 'employee_manager'].includes(row.admin_role)) ? row.admin_role : null;
            const effectiveRole = grantedRole || 'employee';
            const resolvedCode = row.company_code; // 세션/응답에는 실제 소속 회사 코드 사용

            const token = crypto.randomBytes(16).toString('hex');
            activeSessions.set(token, {
                companyCode: resolvedCode,
                role: effectiveRole,
                username: row.login_id,
                employeeId: row.employee_id,
                employeeName: row.employee_name,
                submitterType: 'employee'
            });
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
            db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'employee_login_success', ?, ?)`,
                [resolvedCode, row.login_id, `직원 로그인 성공 (권한: ${effectiveRole})`, ip]);
            return res.json({
                success: true,
                token,
                company_code: resolvedCode,
                role: effectiveRole,
                employee_id: row.employee_id,
                employee_name: row.employee_name
            });
        }
    );
});

app.post('/api/employee/logout', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const session = activeSessions.get(token);
        if (session) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
            db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'employee_logout', '직원 로그아웃', ?)`,
                [session.companyCode, session.username || 'unknown', ip]);
            activeSessions.delete(token);
        }
    }
    return res.json({ success: true });
});

// ------------------------------------------------------------------
// 전자결재: 직원 계정 관리 API (Admin 전용)
// ------------------------------------------------------------------

app.post('/api/admin/employees/:employee_id/account', authMiddleware, (req, res) => {
    if (req.role === 'employee' || req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원 계정 관리 권한이 없습니다.' });
    }
    const { employee_id } = req.params;
    const { login_id, password } = req.body;
    const companyCode = req.companyCode;

    if (!login_id || !password) {
        return res.status(400).json({ error: '로그인 ID와 비밀번호를 모두 입력해 주세요.' });
    }
    if (password.length < 4) {
        return res.status(400).json({ error: '비밀번호는 최소 4자 이상이어야 합니다.' });
    }

    db.get("SELECT employee_id, company_code FROM employees WHERE employee_id = ?", [employee_id], (err, emp) => {
        if (err) return res.status(500).json({ error: '사원 조회 실패' });
        if (!emp) return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
        if (companyCode !== 'auton' && emp.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        db.get("SELECT employee_id FROM employees WHERE login_id = ? AND employee_id != ?", [login_id.trim(), employee_id], async (err2, dup) => {
            if (err2) return res.status(500).json({ error: '중복 확인 실패' });
            if (dup) return res.status(400).json({ error: '이미 사용 중인 로그인 ID입니다.' });

            const pwHash = await hashPassword(password);
            db.run(
                "UPDATE employees SET login_id = ?, password_hash = ?, is_login_enabled = 1 WHERE employee_id = ?",
                [login_id.trim(), pwHash, employee_id],
                function(updateErr) {
                    if (updateErr) return res.status(500).json({ error: '계정 생성 실패: ' + updateErr.message });
                    logAdminAction(req, 'employee_account_create', `직원 로그인 계정 생성/수정 | 사번: ${employee_id} | login_id: ${login_id.trim()}`);
                    return res.json({ success: true });
                }
            );
        });
    });
});

app.delete('/api/admin/employees/:employee_id/account', authMiddleware, (req, res) => {
    if (req.role === 'employee' || req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원 계정 관리 권한이 없습니다.' });
    }
    const { employee_id } = req.params;
    const companyCode = req.companyCode;

    db.get("SELECT employee_id, company_code FROM employees WHERE employee_id = ?", [employee_id], (err, emp) => {
        if (err) return res.status(500).json({ error: '사원 조회 실패' });
        if (!emp) return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
        if (companyCode !== 'auton' && emp.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        db.run(
            "UPDATE employees SET is_login_enabled = 0 WHERE employee_id = ?",
            [employee_id],
            function(updateErr) {
                if (updateErr) return res.status(500).json({ error: '계정 비활성화 실패: ' + updateErr.message });
                logAdminAction(req, 'employee_account_disable', `직원 로그인 비활성화 | 사번: ${employee_id}`);
                return res.json({ success: true });
            }
        );
    });
});

// 직원 계정/권한 목록 조회 (관리자 전용)
app.get('/api/admin/employees/accounts', authMiddleware, (req, res) => {
    if (req.role === 'employee' || req.role === 'employee_manager') {
        return res.status(403).json({ error: '직원 계정 관리 권한이 없습니다.' });
    }
    const companyCode = req.companyCode;

    let sql, params;
    if (companyCode === 'auton') {
        sql = "SELECT employee_id, employee_name, company_code, login_id, is_login_enabled, admin_role, tags FROM employees ORDER BY company_code, employee_name";
        params = [];
    } else {
        sql = "SELECT employee_id, employee_name, company_code, login_id, is_login_enabled, admin_role, tags FROM employees WHERE company_code = ? ORDER BY employee_name";
        params = [companyCode];
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: '직원 목록 조회 실패: ' + err.message });
        return res.json(rows || []);
    });
});

// 직원에게 관리 권한 부여/해제 (최고 관리자 또는 회사 admin 전용)
// - 부여 가능 권한: 'sub_admin'(서브 관리자), 'employee_manager'(직원 관리자)
// - 'admin'(최고 권한)은 직원에게 부여 불가
// - 권한 해제: admin_role 을 빈 값/null 로 전달
app.put('/api/admin/employees/:employee_id/admin-role', authMiddleware, (req, res) => {
    // 관리 권한 부여는 회사 최고관리자(admin) 또는 통합관리자(auton)만 가능
    if (req.companyCode !== 'auton' && req.role !== 'admin') {
        return res.status(403).json({ error: '관리 권한을 부여할 수 있는 권한이 없습니다. (최고 관리자 전용)' });
    }
    const { employee_id } = req.params;
    const { admin_role } = req.body;
    const companyCode = req.companyCode;

    const ALLOWED_ROLES = ['sub_admin', 'employee_manager'];
    let newRole = (admin_role && typeof admin_role === 'string') ? admin_role.trim() : '';

    if (newRole && !ALLOWED_ROLES.includes(newRole)) {
        return res.status(400).json({ error: "부여 가능한 권한은 'sub_admin' 또는 'employee_manager' 입니다." });
    }

    db.get("SELECT employee_id, company_code, login_id, is_login_enabled FROM employees WHERE employee_id = ?", [employee_id], (err, emp) => {
        if (err) return res.status(500).json({ error: '사원 조회 실패' });
        if (!emp) return res.status(404).json({ error: '존재하지 않는 사원입니다.' });
        if (companyCode !== 'auton' && emp.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }
        // 관리 권한을 부여하려면 먼저 로그인 계정이 활성화되어 있어야 함
        if (newRole && (!emp.login_id || !emp.is_login_enabled)) {
            return res.status(400).json({ error: '먼저 직원 로그인 계정을 생성/활성화한 후 관리 권한을 부여할 수 있습니다.' });
        }

        const roleToStore = newRole || null;
        db.run(
            "UPDATE employees SET admin_role = ? WHERE employee_id = ?",
            [roleToStore, employee_id],
            function(updateErr) {
                if (updateErr) return res.status(500).json({ error: '권한 변경 실패: ' + updateErr.message });
                logAdminAction(req, 'employee_admin_role_update',
                    `직원 관리 권한 ${newRole ? '부여' : '해제'} | 사번: ${employee_id} | 권한: ${newRole || '없음'}`);
                return res.json({ success: true, admin_role: roleToStore });
            }
        );
    });
});

// ==================================================================
// 전자결재 Phase 2: 템플릿 CRUD + 참여자(participants) 조회
// ==================================================================

// 결재 관리 권한 확인 미들웨어 (admin / sub_admin / 통합관리자만 허용)
function approvalAdminOnly(req, res, next) {
    if (req.companyCode === 'auton' || req.role === 'admin' || req.role === 'sub_admin') {
        return next();
    }
    return res.status(403).json({ error: '전자결재 관리 권한이 없습니다.' });
}

// JSON 문자열 정규화 헬퍼: 객체/배열이면 stringify, 문자열이면 파싱 검증 후 그대로, 실패 시 기본값
function normalizeJson(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string') {
        try { JSON.parse(value); return value; } catch (e) { return fallback; }
    }
    return fallback;
}

const APPROVAL_CATEGORIES = ['general', 'leave', 'expense', 'purchase', 'report', 'hr', 'it_request', 'other'];

// 0. 문서 작성용 활성 템플릿 목록 (모든 로그인 사용자 — 직원 포함, 읽기 전용)
app.get('/api/approval/templates-available', authMiddleware, (req, res) => {
    const companyCode = req.companyCode === 'auton' ? (req.query.company_code || '').trim().toUpperCase() : req.companyCode;
    if (!companyCode) return res.json([]);
    db.all("SELECT id, category, title, body_schema, default_approval_line, default_agreement_line, default_cc_line FROM approval_templates WHERE company_code = ? AND is_active = 1 ORDER BY updated_at DESC", [companyCode], (err, rows) => {
        if (err) return res.status(500).json({ error: '템플릿 조회 실패: ' + err.message });
        return res.json(rows || []);
    });
});

// 1. 템플릿 목록 조회 (관리자 모드)
app.get('/api/approval/templates', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode;
    const includeInactive = req.query.include_inactive === '1';

    let sql, params;
    if (companyCode === 'auton') {
        sql = "SELECT * FROM approval_templates" + (includeInactive ? "" : " WHERE is_active = 1") + " ORDER BY company_code, updated_at DESC";
        params = [];
    } else {
        sql = "SELECT * FROM approval_templates WHERE company_code = ?" + (includeInactive ? "" : " AND is_active = 1") + " ORDER BY updated_at DESC";
        params = [companyCode];
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: '템플릿 목록 조회 실패: ' + err.message });
        return res.json(rows || []);
    });
});

// 2. 템플릿 단건 조회
app.get('/api/approval/templates/:id', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode;
    db.get("SELECT * FROM approval_templates WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: '템플릿 조회 실패: ' + err.message });
        if (!row) return res.status(404).json({ error: '존재하지 않는 템플릿입니다.' });
        if (companyCode !== 'auton' && row.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }
        return res.json(row);
    });
});

// 3. 템플릿 생성
app.post('/api/approval/templates', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode === 'auton' ? (req.body.company_code || '').trim().toUpperCase() : req.companyCode;
    if (!companyCode) {
        return res.status(400).json({ error: '회사 코드가 필요합니다.' });
    }
    const { title } = req.body;
    let { category } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: '템플릿 제목을 입력해 주세요.' });
    }
    if (!category || !APPROVAL_CATEGORIES.includes(category)) category = 'general';

    const bodySchema = normalizeJson(req.body.body_schema, '[]');
    const approvalLine = normalizeJson(req.body.default_approval_line, '[]');
    const agreementLine = normalizeJson(req.body.default_agreement_line, '[]');
    const ccLine = normalizeJson(req.body.default_cc_line, '[]');
    const createdBy = req.employeeId || req.adminUsername || 'unknown';

    db.run(
        `INSERT INTO approval_templates
         (company_code, category, title, body_schema, default_approval_line, default_agreement_line, default_cc_line, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyCode, category, title.trim(), bodySchema, approvalLine, agreementLine, ccLine, createdBy],
        function(err) {
            if (err) return res.status(500).json({ error: '템플릿 생성 실패: ' + err.message });
            logAdminAction(req, 'approval_template_create', `결재 템플릿 생성 | ID: ${this.lastID} | 제목: ${title.trim()}`);
            return res.status(201).json({ success: true, id: this.lastID });
        }
    );
});

// 4. 템플릿 수정
app.put('/api/approval/templates/:id', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode;
    const id = req.params.id;

    db.get("SELECT company_code FROM approval_templates WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: '템플릿 조회 실패' });
        if (!row) return res.status(404).json({ error: '존재하지 않는 템플릿입니다.' });
        if (companyCode !== 'auton' && row.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        const { title } = req.body;
        let { category } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ error: '템플릿 제목을 입력해 주세요.' });
        }
        if (!category || !APPROVAL_CATEGORIES.includes(category)) category = 'general';

        const bodySchema = normalizeJson(req.body.body_schema, '[]');
        const approvalLine = normalizeJson(req.body.default_approval_line, '[]');
        const agreementLine = normalizeJson(req.body.default_agreement_line, '[]');
        const ccLine = normalizeJson(req.body.default_cc_line, '[]');

        db.run(
            `UPDATE approval_templates
             SET category = ?, title = ?, body_schema = ?, default_approval_line = ?, default_agreement_line = ?, default_cc_line = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [category, title.trim(), bodySchema, approvalLine, agreementLine, ccLine, id],
            function(updateErr) {
                if (updateErr) return res.status(500).json({ error: '템플릿 수정 실패: ' + updateErr.message });
                logAdminAction(req, 'approval_template_update', `결재 템플릿 수정 | ID: ${id} | 제목: ${title.trim()}`);
                return res.json({ success: true });
            }
        );
    });
});

// 5. 템플릿 삭제 (soft-delete: is_active=0)
app.delete('/api/approval/templates/:id', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode;
    const id = req.params.id;

    db.get("SELECT company_code FROM approval_templates WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: '템플릿 조회 실패' });
        if (!row) return res.status(404).json({ error: '존재하지 않는 템플릿입니다.' });
        if (companyCode !== 'auton' && row.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        db.run("UPDATE approval_templates SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: '템플릿 삭제 실패: ' + updateErr.message });
            logAdminAction(req, 'approval_template_delete', `결재 템플릿 비활성화 | ID: ${id}`);
            return res.json({ success: true });
        });
    });
});

// 6. 결재 참여자 조회 (결재선/합의선/참조선에 추가 가능한 사용자 목록)
//    - company_admins (관리자) + 로그인 활성 employees (직원, 승격 권한 포함)
app.get('/api/approval/participants', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    if (companyCode === 'auton') {
        // 통합관리자는 회사 지정 필요
        const target = (req.query.company_code || '').trim().toUpperCase();
        if (!target) return res.status(400).json({ error: 'company_code 쿼리가 필요합니다.' });
        return collectParticipants(target, res);
    }
    return collectParticipants(companyCode, res);
});

function collectParticipants(companyCode, res) {
    const participants = [];
    db.all(
        "SELECT admin_id, role FROM company_admins WHERE company_code = ? ORDER BY admin_id",
        [companyCode],
        (err, admins) => {
            if (err) return res.status(500).json({ error: '관리자 조회 실패: ' + err.message });
            (admins || []).forEach(a => {
                participants.push({
                    id: a.admin_id,
                    name: a.admin_id,
                    type: 'admin',
                    role: a.role || 'admin'
                });
            });

            db.all(
                "SELECT employee_id, employee_name, login_id, admin_role FROM employees WHERE company_code = ? AND is_login_enabled = 1 AND login_id IS NOT NULL ORDER BY employee_name",
                [companyCode],
                (err2, emps) => {
                    if (err2) return res.status(500).json({ error: '직원 조회 실패: ' + err2.message });
                    (emps || []).forEach(e => {
                        participants.push({
                            id: e.login_id,
                            name: e.employee_name || e.login_id,
                            type: 'employee',
                            employee_id: e.employee_id,
                            role: e.admin_role || 'employee'
                        });
                    });
                    return res.json(participants);
                }
            );
        }
    );
}

// ==================================================================
// 전자결재 Phase 3: 문서 생애주기 + 결재 상태 머신 + 개인 뷰
// ==================================================================

const DOC_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

// 현재 로그인 사용자의 결재 행위자(actor) 정보
function getActor(req) {
    const type = req.submitterType === 'employee' ? 'employee' : 'admin';
    const id = req.adminUsername;
    const name = type === 'employee' ? (req.employeeName || req.adminUsername) : req.adminUsername;
    return { id, type, name };
}

// 결재 활동 로그 기록
function recordApprovalActivity(documentId, companyCode, actor, action, details) {
    db.run(
        `INSERT INTO approval_activity_log (document_id, company_code, actor_id, actor_type, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [documentId, companyCode, actor.id, actor.type, action, details || null],
        (err) => { if (err) console.error('[APPROVAL LOG ERROR]', err.message); }
    );
}

// 문서 번호 자동 채번: PREFIX-YYYYMMDD-NNN (회사별 일자별 순번)
function generateDocNumber(companyCode, cb) {
    db.get("SELECT value FROM approval_settings WHERE company_code = ? AND key = 'doc_number_prefix'", [companyCode], (err, row) => {
        const prefix = (row && row.value) ? row.value : 'APPR';
        const now = new Date();
        const ymd = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
        const like = `${prefix}-${ymd}-%`;
        db.get("SELECT COUNT(*) AS cnt FROM approval_documents WHERE company_code = ? AND doc_number LIKE ?", [companyCode, like], (err2, cntRow) => {
            const seq = ((cntRow && cntRow.cnt) ? cntRow.cnt : 0) + 1;
            cb(`${prefix}-${ymd}-${String(seq).padStart(3, '0')}`);
        });
    });
}

// 결재선/합의선/참조선 라인들을 approval_lines 에 삽입
// lines: [{id, type, name}], lineType: 'approval'|'agreement'|'cc'
function insertApprovalLines(documentId, lines, lineType, cb) {
    if (!Array.isArray(lines) || lines.length === 0) return cb();
    const stmt = db.prepare(
        `INSERT INTO approval_lines (document_id, line_type, approver_id, approver_name, approver_type, step_order, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    );
    lines.forEach((ln, idx) => {
        const stepOrder = lineType === 'approval' ? (idx + 1) : 0;
        stmt.run([documentId, lineType, ln.id, ln.name || ln.id, ln.type || 'admin', stepOrder]);
    });
    stmt.finalize(cb);
}

// 제출 시 라인 활성화: 결재선 1단계 → current, 합의선 전원 → current
function activateLinesOnSubmit(documentId, cb) {
    db.serialize(() => {
        // 결재선: 가장 낮은 step_order 를 current 로
        db.get("SELECT MIN(step_order) AS minStep FROM approval_lines WHERE document_id = ? AND line_type = 'approval'", [documentId], (err, row) => {
            if (!err && row && row.minStep != null) {
                db.run("UPDATE approval_lines SET status = 'current' WHERE document_id = ? AND line_type = 'approval' AND step_order = ?", [documentId, row.minStep]);
            }
            // 합의선: 전원 current
            db.run("UPDATE approval_lines SET status = 'current' WHERE document_id = ? AND line_type = 'agreement'", [documentId], () => {
                if (cb) cb();
            });
        });
    });
}

// 완료 판정: 결재선/합의선에 미완료(pending/current)가 없으면 approved 처리
function checkAndFinalize(documentId, companyCode, actor, cb) {
    db.get(
        `SELECT
            SUM(CASE WHEN line_type IN ('approval','agreement') AND status IN ('pending','current') THEN 1 ELSE 0 END) AS remaining,
            SUM(CASE WHEN line_type IN ('approval','agreement') THEN 1 ELSE 0 END) AS total
         FROM approval_lines WHERE document_id = ?`,
        [documentId],
        (err, row) => {
            if (err) return cb && cb(err);
            const remaining = (row && row.remaining) ? row.remaining : 0;
            const total = (row && row.total) ? row.total : 0;
            // 결재/합의 라인이 하나라도 있고 남은 것이 없으면 승인 완료
            if (total > 0 && remaining === 0) {
                db.run("UPDATE approval_documents SET status = 'approved', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status NOT IN ('rejected','withdrawn')", [documentId], function() {
                    if (this.changes > 0) recordApprovalActivity(documentId, companyCode, actor, 'completed', '최종 승인 완료');
                    cb && cb(null, 'approved');
                });
            } else {
                cb && cb(null, 'in_review');
            }
        }
    );
}

// ── 문서 생성 (draft 또는 submit) ──
app.post('/api/approval/documents', authMiddleware, (req, res) => {
    const companyCode = req.companyCode === 'auton' ? (req.body.company_code || '').trim().toUpperCase() : req.companyCode;
    if (!companyCode) return res.status(400).json({ error: '회사 코드가 필요합니다.' });

    const actor = getActor(req);
    const { title, template_id } = req.body;
    let { category, priority, action } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: '제목을 입력해 주세요.' });
    if (!priority || !DOC_PRIORITIES.includes(priority)) priority = 'normal';
    if (!category) category = 'general';
    const doSubmit = action === 'submit';

    const bodyData = normalizeJson(req.body.body_data, '{}');
    const bodySchema = normalizeJson(req.body.body_schema, '[]');
    const approvalLine = Array.isArray(req.body.approval_line) ? req.body.approval_line : [];
    const agreementLine = Array.isArray(req.body.agreement_line) ? req.body.agreement_line : [];
    const ccLine = Array.isArray(req.body.cc_line) ? req.body.cc_line : [];

    if (doSubmit && approvalLine.length === 0 && agreementLine.length === 0) {
        return res.status(400).json({ error: '제출하려면 결재선 또는 합의선을 1명 이상 지정해야 합니다.' });
    }

    generateDocNumber(companyCode, (docNumber) => {
        const status = doSubmit ? 'in_review' : 'draft';
        const submittedAt = doSubmit ? new Date().toISOString() : null;
        db.run(
            `INSERT INTO approval_documents
             (company_code, template_id, doc_number, title, category, body_schema, body_data, original_language, status, submitted_by, submitted_by_name, submitted_by_type, submitted_at, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [companyCode, template_id || null, docNumber, title.trim(), category, bodySchema, bodyData, req.body.original_language || 'ko',
             status, actor.id, actor.name, actor.type, submittedAt, priority],
            function(err) {
                if (err) return res.status(500).json({ error: '문서 생성 실패: ' + err.message });
                const docId = this.lastID;

                insertApprovalLines(docId, approvalLine, 'approval', () => {
                    insertApprovalLines(docId, agreementLine, 'agreement', () => {
                        insertApprovalLines(docId, ccLine, 'cc', () => {
                            recordApprovalActivity(docId, companyCode, actor, 'created', `문서 생성: ${docNumber}`);
                            if (doSubmit) {
                                activateLinesOnSubmit(docId, () => {
                                    recordApprovalActivity(docId, companyCode, actor, 'submitted', '문서 제출');
                                    checkAndFinalize(docId, companyCode, actor, () => {
                                        maybeAutoTranslate(docId, companyCode);
                                        return res.status(201).json({ success: true, id: docId, doc_number: docNumber });
                                    });
                                });
                            } else {
                                return res.status(201).json({ success: true, id: docId, doc_number: docNumber });
                            }
                        });
                    });
                });
            }
        );
    });
});

// ── 문서 목록 조회 (전체 문서 = 관리자 전용, 필터: status, category, search) ──
app.get('/api/approval/documents', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode;
    const { status, category, search } = req.query;

    const where = [];
    const params = [];
    if (companyCode !== 'auton') { where.push("d.company_code = ?"); params.push(companyCode); }
    if (status) { where.push("d.status = ?"); params.push(status); }
    if (category) { where.push("d.category = ?"); params.push(category); }
    if (search) { where.push("(d.title LIKE ? OR d.doc_number LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    db.all(`SELECT d.* FROM approval_documents d ${whereSql} ORDER BY d.created_at DESC LIMIT 500`, params, (err, rows) => {
        if (err) return res.status(500).json({ error: '문서 목록 조회 실패: ' + err.message });
        return res.json(rows || []);
    });
});

// ── 문서 상세 (결재선 + 활동로그 포함) + 읽음 처리 ──
app.get('/api/approval/documents/:id', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    const id = req.params.id;
    const actor = getActor(req);

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err) return res.status(500).json({ error: '문서 조회 실패: ' + err.message });
        if (!doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (companyCode !== 'auton' && doc.company_code !== companyCode) {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }

        // 열람 권한: 관리자/기안자/결재선 참여자만 (임의 문서 id 열람 차단)
        const isAdminViewer = companyCode === 'auton' || req.role === 'admin' || req.role === 'sub_admin';
        const isDrafter = doc.submitted_by === actor.id && doc.submitted_by_type === actor.type;
        const proceed = () => loadDocumentDetail(id, doc, actor, res);
        if (isAdminViewer || isDrafter) return proceed();
        db.get("SELECT 1 FROM approval_lines WHERE document_id = ? AND approver_id = ? AND approver_type = ? LIMIT 1", [id, actor.id, actor.type], (e, row) => {
            if (e) return res.status(500).json({ error: 'DB 오류' });
            if (!row) return res.status(403).json({ error: '이 문서를 열람할 권한이 없습니다.' });
            return proceed();
        });
    });
});

// 문서 상세 로드 + 읽음 처리 (권한 확인 후 호출)
function loadDocumentDetail(id, doc, actor, res) {
    {
        // 읽음 처리 먼저: 현재 사용자가 라인에 포함되고 read_at 이 없으면 기록 (응답 라인에 반영되도록 선행)
        db.run(
            "UPDATE approval_lines SET read_at = CURRENT_TIMESTAMP WHERE document_id = ? AND approver_id = ? AND approver_type = ? AND read_at IS NULL",
            [id, actor.id, actor.type],
            function() {
                if (this.changes > 0) recordApprovalActivity(id, doc.company_code, actor, 'read', '문서 열람');

                db.all("SELECT * FROM approval_lines WHERE document_id = ? ORDER BY line_type, step_order, id", [id], (err2, lines) => {
                    if (err2) return res.status(500).json({ error: '결재선 조회 실패' });
                    db.all("SELECT id, original_name, file_size, mime_type, uploaded_by, created_at FROM approval_attachments WHERE document_id = ? ORDER BY id", [id], (errA, attachments) => {
                        db.all("SELECT * FROM approval_activity_log WHERE document_id = ? ORDER BY created_at ASC, id ASC", [id], (err3, logs) => {
                            return res.json({
                                document: doc,
                                lines: lines || [],
                                attachments: attachments || [],
                                activity_log: logs || [],
                                viewer: actor
                            });
                        });
                    });
                });
            }
        );
    }
}

// ── 초안 수정 (기안자 + draft 상태에서만) ──
app.put('/api/approval/documents/:id', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    const id = req.params.id;
    const actor = getActor(req);

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err) return res.status(500).json({ error: '문서 조회 실패' });
        if (!doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (companyCode !== 'auton' && doc.company_code !== companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        if (doc.submitted_by !== actor.id || doc.submitted_by_type !== actor.type) return res.status(403).json({ error: '기안자만 수정할 수 있습니다.' });
        if (doc.status !== 'draft') return res.status(400).json({ error: '초안 상태에서만 수정할 수 있습니다.' });

        const { title } = req.body;
        let { category, priority } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: '제목을 입력해 주세요.' });
        if (!priority || !DOC_PRIORITIES.includes(priority)) priority = doc.priority;
        if (!category) category = doc.category;
        const bodyData = normalizeJson(req.body.body_data, doc.body_data);
        const bodySchema = req.body.body_schema !== undefined ? normalizeJson(req.body.body_schema, doc.body_schema || '[]') : (doc.body_schema || '[]');

        const approvalLine = Array.isArray(req.body.approval_line) ? req.body.approval_line : null;
        const agreementLine = Array.isArray(req.body.agreement_line) ? req.body.agreement_line : null;
        const ccLine = Array.isArray(req.body.cc_line) ? req.body.cc_line : null;

        db.run(
            `UPDATE approval_documents SET title = ?, category = ?, body_schema = ?, body_data = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [title.trim(), category, bodySchema, bodyData, priority, id],
            function(updErr) {
                if (updErr) return res.status(500).json({ error: '문서 수정 실패: ' + updErr.message });

                // 결재선이 전달된 경우 기존 라인 교체
                if (approvalLine !== null || agreementLine !== null || ccLine !== null) {
                    db.run("DELETE FROM approval_lines WHERE document_id = ?", [id], () => {
                        insertApprovalLines(id, approvalLine || [], 'approval', () => {
                            insertApprovalLines(id, agreementLine || [], 'agreement', () => {
                                insertApprovalLines(id, ccLine || [], 'cc', () => {
                                    recordApprovalActivity(id, doc.company_code, actor, 'updated', '초안 수정');
                                    return res.json({ success: true });
                                });
                            });
                        });
                    });
                } else {
                    recordApprovalActivity(id, doc.company_code, actor, 'updated', '초안 수정');
                    return res.json({ success: true });
                }
            }
        );
    });
});

// ── 초안 제출 ──
app.post('/api/approval/documents/:id/submit', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    const id = req.params.id;
    const actor = getActor(req);

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err) return res.status(500).json({ error: '문서 조회 실패' });
        if (!doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (companyCode !== 'auton' && doc.company_code !== companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        if (doc.submitted_by !== actor.id || doc.submitted_by_type !== actor.type) return res.status(403).json({ error: '기안자만 제출할 수 있습니다.' });
        if (doc.status !== 'draft') return res.status(400).json({ error: '초안 상태에서만 제출할 수 있습니다.' });

        db.get("SELECT COUNT(*) AS cnt FROM approval_lines WHERE document_id = ? AND line_type IN ('approval','agreement')", [id], (cErr, cRow) => {
            if (!cRow || cRow.cnt === 0) return res.status(400).json({ error: '결재선 또는 합의선을 1명 이상 지정해야 제출할 수 있습니다.' });

            db.run("UPDATE approval_documents SET status = 'in_review', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id], (uErr) => {
                if (uErr) return res.status(500).json({ error: '제출 실패: ' + uErr.message });
                activateLinesOnSubmit(id, () => {
                    recordApprovalActivity(id, doc.company_code, actor, 'submitted', '문서 제출');
                    checkAndFinalize(id, doc.company_code, actor, () => {
                        maybeAutoTranslate(id, doc.company_code);
                        res.json({ success: true });
                    });
                });
            });
        });
    });
});

// ── 회수 (기안자, submitted/in_review 상태) ──
app.post('/api/approval/documents/:id/withdraw', authMiddleware, (req, res) => {
    const companyCode = req.companyCode;
    const id = req.params.id;
    const actor = getActor(req);

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err) return res.status(500).json({ error: '문서 조회 실패' });
        if (!doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (companyCode !== 'auton' && doc.company_code !== companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        if (doc.submitted_by !== actor.id || doc.submitted_by_type !== actor.type) return res.status(403).json({ error: '기안자만 회수할 수 있습니다.' });
        if (!['submitted', 'in_review'].includes(doc.status)) return res.status(400).json({ error: '진행 중인 문서만 회수할 수 있습니다.' });

        db.serialize(() => {
            db.run("UPDATE approval_lines SET status = 'skipped' WHERE document_id = ? AND status IN ('pending','current')", [id]);
            db.run("UPDATE approval_documents SET status = 'withdrawn', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id], (uErr) => {
                if (uErr) return res.status(500).json({ error: '회수 실패: ' + uErr.message });
                recordApprovalActivity(id, doc.company_code, actor, 'withdrawn', '문서 회수');
                return res.json({ success: true });
            });
        });
    });
});

// ── 결재 액션 공통: 현재 사용자의 해당 라인 조회 ──
function findActionableLine(documentId, actor, lineTypes, cb) {
    const placeholders = lineTypes.map(() => '?').join(',');
    db.get(
        `SELECT * FROM approval_lines WHERE document_id = ? AND approver_id = ? AND approver_type = ? AND line_type IN (${placeholders}) AND status = 'current'`,
        [documentId, actor.id, actor.type, ...lineTypes],
        cb
    );
}

// ── 승인 (현재 결재자) ──
app.post('/api/approval/documents/:id/approve', authMiddleware, (req, res) => {
    const id = req.params.id;
    const actor = getActor(req);
    const comment = (req.body.comment || '').trim();

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err || !doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (req.companyCode !== 'auton' && doc.company_code !== req.companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        if (doc.status !== 'in_review') return res.status(400).json({ error: '결재 진행 중인 문서가 아닙니다.' });

        findActionableLine(id, actor, ['approval'], (e, line) => {
            if (e) return res.status(500).json({ error: 'DB 오류' });
            if (!line) return res.status(403).json({ error: '현재 결재할 차례가 아니거나 결재 권한이 없습니다.' });

            db.run("UPDATE approval_lines SET status = 'approved', comment = ?, acted_at = CURRENT_TIMESTAMP WHERE id = ?", [comment, line.id], () => {
                recordApprovalActivity(id, doc.company_code, actor, 'approved', comment || '승인');
                // 다음 결재 단계 활성화
                db.get("SELECT MIN(step_order) AS nextStep FROM approval_lines WHERE document_id = ? AND line_type = 'approval' AND status = 'pending' AND step_order > ?", [id, line.step_order], (ne, nr) => {
                    const proceed = () => checkAndFinalize(id, doc.company_code, actor, () => res.json({ success: true }));
                    if (!ne && nr && nr.nextStep != null) {
                        db.run("UPDATE approval_lines SET status = 'current' WHERE document_id = ? AND line_type = 'approval' AND step_order = ?", [id, nr.nextStep], proceed);
                    } else {
                        proceed();
                    }
                });
            });
        });
    });
});

// ── 합의 (합의선 참여자) ──
app.post('/api/approval/documents/:id/agree', authMiddleware, (req, res) => {
    const id = req.params.id;
    const actor = getActor(req);
    const comment = (req.body.comment || '').trim();

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err || !doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (req.companyCode !== 'auton' && doc.company_code !== req.companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        if (doc.status !== 'in_review') return res.status(400).json({ error: '결재 진행 중인 문서가 아닙니다.' });

        findActionableLine(id, actor, ['agreement'], (e, line) => {
            if (e) return res.status(500).json({ error: 'DB 오류' });
            if (!line) return res.status(403).json({ error: '합의 권한이 없거나 이미 처리했습니다.' });

            db.run("UPDATE approval_lines SET status = 'approved', comment = ?, acted_at = CURRENT_TIMESTAMP WHERE id = ?", [comment, line.id], () => {
                recordApprovalActivity(id, doc.company_code, actor, 'agreed', comment || '합의');
                checkAndFinalize(id, doc.company_code, actor, () => res.json({ success: true }));
            });
        });
    });
});

// ── 반려 (결재자 또는 합의자) ──
app.post('/api/approval/documents/:id/reject', authMiddleware, (req, res) => {
    const id = req.params.id;
    const actor = getActor(req);
    const reason = (req.body.comment || req.body.reason || '').trim();
    if (!reason) return res.status(400).json({ error: '반려 사유를 입력해 주세요.' });

    db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (err, doc) => {
        if (err || !doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (req.companyCode !== 'auton' && doc.company_code !== req.companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        if (doc.status !== 'in_review') return res.status(400).json({ error: '결재 진행 중인 문서가 아닙니다.' });

        findActionableLine(id, actor, ['approval', 'agreement'], (e, line) => {
            if (e) return res.status(500).json({ error: 'DB 오류' });
            if (!line) return res.status(403).json({ error: '반려 권한이 없거나 현재 차례가 아닙니다.' });

            db.serialize(() => {
                db.run("UPDATE approval_lines SET status = 'rejected', comment = ?, acted_at = CURRENT_TIMESTAMP WHERE id = ?", [reason, line.id]);
                db.run("UPDATE approval_lines SET status = 'skipped' WHERE document_id = ? AND status IN ('pending','current') AND id != ?", [id, line.id]);
                db.run("UPDATE approval_documents SET status = 'rejected', rejection_reason = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [reason, id], (uErr) => {
                    if (uErr) return res.status(500).json({ error: '반려 처리 실패: ' + uErr.message });
                    recordApprovalActivity(id, doc.company_code, actor, 'rejected', reason);
                    return res.json({ success: true });
                });
            });
        });
    });
});

// ── 읽음 표시 (명시적) ──
app.post('/api/approval/documents/:id/read', authMiddleware, (req, res) => {
    const id = req.params.id;
    const actor = getActor(req);
    db.run(
        "UPDATE approval_lines SET read_at = CURRENT_TIMESTAMP WHERE document_id = ? AND approver_id = ? AND approver_type = ? AND read_at IS NULL",
        [id, actor.id, actor.type],
        function(err) {
            if (err) return res.status(500).json({ error: '읽음 처리 실패' });
            return res.json({ success: true, marked: this.changes });
        }
    );
});

// ── 개인 뷰: 내가 처리해야 할 문서 (현재 결재/합의 차례) ──
app.get('/api/approval/pending', authMiddleware, (req, res) => {
    const actor = getActor(req);
    const companyCode = req.companyCode;
    const scope = companyCode === 'auton' ? '' : 'AND d.company_code = ?';
    const params = [actor.id, actor.type];
    if (companyCode !== 'auton') params.push(companyCode);

    db.all(
        `SELECT DISTINCT d.* FROM approval_documents d
         JOIN approval_lines l ON l.document_id = d.id
         WHERE l.approver_id = ? AND l.approver_type = ? AND l.status = 'current'
           AND l.line_type IN ('approval','agreement') AND d.status = 'in_review' ${scope}
         ORDER BY d.submitted_at DESC`,
        params,
        (err, rows) => {
            if (err) return res.status(500).json({ error: '대기 문서 조회 실패: ' + err.message });
            return res.json(rows || []);
        }
    );
});

// ── 개인 뷰: 내가 올린 문서 ──
app.get('/api/approval/my-docs', authMiddleware, (req, res) => {
    const actor = getActor(req);
    const companyCode = req.companyCode;
    const scope = companyCode === 'auton' ? '' : 'AND company_code = ?';
    const params = [actor.id, actor.type];
    if (companyCode !== 'auton') params.push(companyCode);

    db.all(
        `SELECT * FROM approval_documents WHERE submitted_by = ? AND submitted_by_type = ? ${scope} ORDER BY created_at DESC`,
        params,
        (err, rows) => {
            if (err) return res.status(500).json({ error: '내 문서 조회 실패: ' + err.message });
            return res.json(rows || []);
        }
    );
});

// ── 개인 뷰: 참조로 받은 문서 (읽음 여부 포함) ──
app.get('/api/approval/cc-docs', authMiddleware, (req, res) => {
    const actor = getActor(req);
    const companyCode = req.companyCode;
    const scope = companyCode === 'auton' ? '' : 'AND d.company_code = ?';
    const params = [actor.id, actor.type];
    if (companyCode !== 'auton') params.push(companyCode);

    db.all(
        `SELECT d.*, l.read_at FROM approval_documents d
         JOIN approval_lines l ON l.document_id = d.id
         WHERE l.approver_id = ? AND l.approver_type = ? AND l.line_type = 'cc' ${scope}
         ORDER BY d.submitted_at DESC`,
        params,
        (err, rows) => {
            if (err) return res.status(500).json({ error: '참조 문서 조회 실패: ' + err.message });
            return res.json(rows || []);
        }
    );
});

// ── 개인 뷰: 월간 통계 ──
app.get('/api/approval/stats', authMiddleware, (req, res) => {
    const actor = getActor(req);
    const companyCode = req.companyCode;
    const stats = {};

    // 내가 대기 중 처리해야 할 건수
    const pendParams = [actor.id, actor.type];
    let pendScope = '';
    if (companyCode !== 'auton') { pendScope = 'AND d.company_code = ?'; pendParams.push(companyCode); }

    db.get(
        `SELECT COUNT(DISTINCT d.id) AS cnt FROM approval_documents d
         JOIN approval_lines l ON l.document_id = d.id
         WHERE l.approver_id = ? AND l.approver_type = ? AND l.status = 'current'
           AND l.line_type IN ('approval','agreement') AND d.status = 'in_review' ${pendScope}`,
        pendParams,
        (e1, r1) => {
            stats.pending = (r1 && r1.cnt) ? r1.cnt : 0;

            const myParams = [actor.id, actor.type];
            let myScope = '';
            if (companyCode !== 'auton') { myScope = 'AND company_code = ?'; myParams.push(companyCode); }

            db.all(
                `SELECT status, COUNT(*) AS cnt FROM approval_documents WHERE submitted_by = ? AND submitted_by_type = ? ${myScope} GROUP BY status`,
                myParams,
                (e2, rows) => {
                    stats.my_total = 0;
                    stats.my_draft = 0; stats.my_in_review = 0; stats.my_approved = 0; stats.my_rejected = 0; stats.my_withdrawn = 0;
                    (rows || []).forEach(r => {
                        stats.my_total += r.cnt;
                        if (r.status === 'draft') stats.my_draft = r.cnt;
                        else if (r.status === 'in_review' || r.status === 'submitted') stats.my_in_review += r.cnt;
                        else if (r.status === 'approved') stats.my_approved = r.cnt;
                        else if (r.status === 'rejected') stats.my_rejected = r.cnt;
                        else if (r.status === 'withdrawn') stats.my_withdrawn = r.cnt;
                    });
                    return res.json(stats);
                }
            );
        }
    );
});

// ==================================================================
// 전자결재 Phase 5: 첨부파일 (multer 디스크 저장)
// ==================================================================

const UPLOAD_ROOT = path.join(__dirname, 'uploads', 'approval');
const ALLOWED_MIME = [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/zip'
];

// 원본 파일명 디코딩 (multipart latin1 → utf8, 한글 파일명 복원)
function decodeOriginalName(name) {
    try { return Buffer.from(name, 'latin1').toString('utf8'); } catch (e) { return name; }
}

const approvalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const docId = req.params.id;
        db.get("SELECT company_code FROM approval_documents WHERE id = ?", [docId], (err, doc) => {
            if (err || !doc) return cb(new Error('존재하지 않는 문서입니다.'));
            const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
            const dir = path.join(UPLOAD_ROOT, doc.company_code, ym);
            fs.mkdir(dir, { recursive: true }, (mkErr) => {
                if (mkErr) return cb(mkErr);
                cb(null, dir);
            });
        });
    },
    filename: (req, file, cb) => {
        const uuid = crypto.randomBytes(8).toString('hex');
        const decoded = decodeOriginalName(file.originalname);
        const safe = decoded.replace(/[^\w.\-가-힣ㄱ-ㅎㅏ-ㅣ ]/g, '_').slice(0, 120);
        cb(null, `${uuid}_${safe}`);
    }
});

const uploadApproval = multer({
    storage: approvalStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 파일당 20MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
        else cb(new Error('허용되지 않는 파일 형식입니다. (문서/이미지/PDF만 가능)'));
    }
});

// 첨부 업로드 (기안자, draft/submitted/in_review 상태)
app.post('/api/approval/documents/:id/attachments', authMiddleware, (req, res) => {
    uploadApproval.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: '업로드할 파일이 없습니다.' });

        const id = req.params.id;
        const actor = getActor(req);
        const cleanup = () => { try { fs.unlinkSync(req.file.path); } catch (x) {} };

        db.get("SELECT * FROM approval_documents WHERE id = ?", [id], (e, doc) => {
            if (e || !doc) { cleanup(); return res.status(404).json({ error: '존재하지 않는 문서입니다.' }); }
            if (req.companyCode !== 'auton' && doc.company_code !== req.companyCode) { cleanup(); return res.status(403).json({ error: '권한이 없습니다.' }); }
            if (doc.submitted_by !== actor.id || doc.submitted_by_type !== actor.type) { cleanup(); return res.status(403).json({ error: '기안자만 첨부할 수 있습니다.' }); }
            if (!['draft', 'submitted', 'in_review'].includes(doc.status)) { cleanup(); return res.status(400).json({ error: '진행 중이거나 작성 중인 문서에만 첨부할 수 있습니다.' }); }

            const originalName = decodeOriginalName(req.file.originalname);
            db.run(
                `INSERT INTO approval_attachments (document_id, original_name, stored_name, file_path, file_size, mime_type, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, originalName, req.file.filename, req.file.path, req.file.size, req.file.mimetype, actor.id],
                function(insErr) {
                    if (insErr) { cleanup(); return res.status(500).json({ error: '첨부 저장 실패: ' + insErr.message }); }
                    recordApprovalActivity(id, doc.company_code, actor, 'attached', `첨부파일 추가: ${originalName}`);
                    return res.status(201).json({ success: true, id: this.lastID, original_name: originalName, file_size: req.file.size, mime_type: req.file.mimetype });
                }
            );
        });
    });
});

// 첨부 다운로드 (같은 회사 사용자, Bearer 인증 → 프론트에서 blob 처리)
app.get('/api/approval/attachments/:id/download', authMiddleware, (req, res) => {
    db.get(
        `SELECT a.*, d.company_code FROM approval_attachments a JOIN approval_documents d ON a.document_id = d.id WHERE a.id = ?`,
        [req.params.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
            if (req.companyCode !== 'auton' && row.company_code !== req.companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
            if (!fs.existsSync(row.file_path)) return res.status(404).json({ error: '파일이 서버에 존재하지 않습니다.' });
            return res.download(row.file_path, row.original_name);
        }
    );
});

// 첨부 삭제 (기안자, draft/submitted/in_review 상태)
app.delete('/api/approval/attachments/:id', authMiddleware, (req, res) => {
    const actor = getActor(req);
    db.get(
        `SELECT a.*, d.company_code, d.submitted_by, d.submitted_by_type, d.status FROM approval_attachments a JOIN approval_documents d ON a.document_id = d.id WHERE a.id = ?`,
        [req.params.id],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
            if (req.companyCode !== 'auton' && row.company_code !== req.companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
            if (row.submitted_by !== actor.id || row.submitted_by_type !== actor.type) return res.status(403).json({ error: '기안자만 삭제할 수 있습니다.' });
            if (!['draft', 'submitted', 'in_review'].includes(row.status)) return res.status(400).json({ error: '완료된 문서의 첨부는 삭제할 수 없습니다.' });

            db.run("DELETE FROM approval_attachments WHERE id = ?", [req.params.id], function(delErr) {
                if (delErr) return res.status(500).json({ error: '첨부 삭제 실패: ' + delErr.message });
                try { if (fs.existsSync(row.file_path)) fs.unlinkSync(row.file_path); } catch (x) {}
                recordApprovalActivity(row.document_id, row.company_code, actor, 'attachment_deleted', `첨부파일 삭제: ${row.original_name}`);
                return res.json({ success: true });
            });
        }
    );
});

// ==================================================================
// 전자결재 Phase 6: LibreTranslate 번역 통합
// ==================================================================

const APPROVAL_SETTING_DEFAULTS = {
    libretranslate_url: '',
    libretranslate_api_key: '',
    auto_translate_enabled: 'false',
    translate_target_languages: 'en,th,lo',
    doc_number_prefix: 'APPR'
};

// 회사별 결재 설정 조회 (기본값 병합)
function getApprovalSettings(companyCode, cb) {
    db.all("SELECT key, value FROM approval_settings WHERE company_code = ?", [companyCode], (err, rows) => {
        const settings = Object.assign({}, APPROVAL_SETTING_DEFAULTS);
        if (!err && rows) rows.forEach(r => { settings[r.key] = r.value; });
        cb(settings);
    });
}

// LibreTranslate HTTP 요청 (Node 내장 http/https, 추가 의존성 없음)
function libreRequest(method, baseUrl, pathname, payload, cb) {
    let u;
    try { u = new URL(pathname, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'); }
    catch (e) { return cb(new Error('LibreTranslate URL이 올바르지 않습니다.')); }
    const lib = u.protocol === 'https:' ? https : http;
    const body = payload ? JSON.stringify(payload) : null;
    const opts = {
        method,
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + (u.search || ''),
        headers: { 'Accept': 'application/json' },
        timeout: 10000
    };
    if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = lib.request(opts, (resp) => {
        let data = '';
        resp.on('data', c => data += c);
        resp.on('end', () => {
            let json = null;
            try { json = JSON.parse(data); } catch (e) {}
            cb(null, json, resp.statusCode);
        });
    });
    req.on('error', (e) => cb(e));
    req.on('timeout', () => req.destroy(new Error('LibreTranslate 응답 시간 초과')));
    if (body) req.write(body);
    req.end();
}

// 단건 번역
function translateText(text, source, target, settings, cb) {
    const payload = { q: text, source, target, format: 'text' };
    if (settings.libretranslate_api_key) payload.api_key = settings.libretranslate_api_key;
    libreRequest('POST', settings.libretranslate_url, 'translate', payload, (err, json, status) => {
        if (err) return cb(err);
        if (status && status >= 400) return cb(new Error(json && json.error ? json.error : ('HTTP ' + status)));
        if (json && typeof json.translatedText === 'string') return cb(null, json.translatedText);
        cb(new Error('번역 응답이 올바르지 않습니다.'));
    });
}

// 폴백 번역: 직접 실패 시 영어 경유 2단계 (라오어 등 미지원 언어 대응)
function translateWithFallback(text, source, target, settings, cb) {
    translateText(text, source, target, settings, (err, out) => {
        if (!err && out != null) return cb(null, out);
        if (target !== 'en' && source !== 'en') {
            translateText(text, source, 'en', settings, (e2, mid) => {
                if (e2 || mid == null) return cb(e2 || new Error('번역 실패'));
                translateText(mid, 'en', target, settings, (e3, fin) => {
                    if (e3 || fin == null) return cb(e3 || new Error('번역 실패'));
                    cb(null, fin);
                });
            });
        } else {
            cb(err || new Error('번역 실패'));
        }
    });
}

// 문서 본문 번역 → body_data_translated 저장
function translateDocumentInternal(docId, cb) {
    db.get("SELECT * FROM approval_documents WHERE id = ?", [docId], (err, doc) => {
        if (err || !doc) return cb(err || new Error('존재하지 않는 문서입니다.'));
        getApprovalSettings(doc.company_code, (settings) => {
            if (!settings.libretranslate_url) return cb(new Error('LibreTranslate URL이 설정되지 않았습니다.'));
            const source = doc.original_language || 'ko';
            const targets = (settings.translate_target_languages || 'en,th,lo')
                .split(',').map(s => s.trim()).filter(Boolean).filter(t => t !== source);

            let bodyData = {};
            try { bodyData = JSON.parse(doc.body_data || '{}'); } catch (e) {}
            const entries = Object.entries(bodyData).filter(([k, v]) => typeof v === 'string' && v.trim());
            const items = [['_title', doc.title], ...entries];

            const result = { _status: {} };
            const doTarget = (ti) => {
                if (ti >= targets.length) {
                    db.run("UPDATE approval_documents SET body_data_translated = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                        [JSON.stringify(result), docId], () => cb(null, result));
                    return;
                }
                const target = targets[ti];
                const obj = {};
                let status = 'ok';
                const doItem = (ii) => {
                    if (ii >= items.length) {
                        result[target] = obj;
                        result._status[target] = status;
                        return doTarget(ti + 1);
                    }
                    const [key, text] = items[ii];
                    translateWithFallback(text, source, target, settings, (e, translated) => {
                        if (e) { status = 'unavailable'; }
                        else { obj[key] = translated; }
                        doItem(ii + 1);
                    });
                };
                doItem(0);
            };
            doTarget(0);
        });
    });
}

// 자동 번역 (제출 시, 설정 활성화된 경우 fire-and-forget)
function maybeAutoTranslate(docId, companyCode) {
    getApprovalSettings(companyCode, (settings) => {
        if (settings.auto_translate_enabled === 'true' && settings.libretranslate_url) {
            translateDocumentInternal(docId, (err) => {
                if (err) console.warn('[AUTO TRANSLATE]', docId, err.message);
            });
        }
    });
}

// 문서 번역 트리거 (같은 회사 사용자)
app.post('/api/approval/translate', authMiddleware, (req, res) => {
    const docId = req.body.id || req.body.document_id;
    if (!docId) return res.status(400).json({ error: '문서 ID가 필요합니다.' });
    db.get("SELECT company_code FROM approval_documents WHERE id = ?", [docId], (err, doc) => {
        if (err || !doc) return res.status(404).json({ error: '존재하지 않는 문서입니다.' });
        if (req.companyCode !== 'auton' && doc.company_code !== req.companyCode) return res.status(403).json({ error: '권한이 없습니다.' });
        translateDocumentInternal(docId, (e, result) => {
            if (e) return res.status(502).json({ error: e.message });
            return res.json({ success: true, translated: result });
        });
    });
});

// 결재 설정 조회 (관리자)
app.get('/api/approval/settings', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode === 'auton' ? (req.query.company_code || '').trim().toUpperCase() : req.companyCode;
    if (!companyCode) return res.status(400).json({ error: '회사 코드가 필요합니다.' });
    getApprovalSettings(companyCode, (settings) => {
        // API 키는 마스킹하여 노출
        const out = Object.assign({}, settings);
        out.libretranslate_api_key = settings.libretranslate_api_key ? '********' : '';
        return res.json(out);
    });
});

// 결재 설정 변경 (관리자)
app.put('/api/approval/settings', authMiddleware, approvalAdminOnly, (req, res) => {
    const companyCode = req.companyCode === 'auton' ? (req.body.company_code || '').trim().toUpperCase() : req.companyCode;
    if (!companyCode) return res.status(400).json({ error: '회사 코드가 필요합니다.' });

    const allowed = ['libretranslate_url', 'libretranslate_api_key', 'auto_translate_enabled', 'translate_target_languages', 'doc_number_prefix'];
    const updates = [];
    allowed.forEach(key => {
        if (req.body[key] !== undefined) {
            // 마스킹된 API 키가 그대로 전송되면 변경하지 않음
            if (key === 'libretranslate_api_key' && req.body[key] === '********') return;
            updates.push([key, String(req.body[key])]);
        }
    });
    if (updates.length === 0) return res.json({ success: true });

    const stmt = db.prepare("INSERT INTO approval_settings (company_code, key, value) VALUES (?, ?, ?) ON CONFLICT(company_code, key) DO UPDATE SET value = excluded.value");
    updates.forEach(([k, v]) => stmt.run([companyCode, k, v]));
    stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: '설정 저장 실패: ' + err.message });
        logAdminAction(req, 'approval_settings_update', `결재 설정 변경: ${updates.map(u => u[0]).join(', ')}`);
        return res.json({ success: true });
    });
});

// LibreTranslate 연결 테스트 (관리자)
app.post('/api/approval/translate/test', authMiddleware, approvalAdminOnly, (req, res) => {
    const url = (req.body.url || '').trim();
    if (!url) return res.status(400).json({ error: 'LibreTranslate URL을 입력해 주세요.' });
    libreRequest('GET', url, 'languages', null, (err, json, status) => {
        if (err) return res.status(502).json({ error: '연결 실패: ' + err.message });
        if (status && status >= 400) return res.status(502).json({ error: 'HTTP ' + status });
        if (Array.isArray(json)) {
            return res.json({ success: true, languages: json.map(l => l.code) });
        }
        return res.status(502).json({ error: '응답 형식이 올바르지 않습니다.' });
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 직원 활동 모니터링 백엔드가 활성화되었습니다.`);
    console.log(` 포트: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
