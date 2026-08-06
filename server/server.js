const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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

    db.get("SELECT role, tags FROM company_admins WHERE admin_id = ? AND company_code = ?", [username, companyCode], (err, adminRow) => {
        if (err || !adminRow || adminRow.role !== 'employee_manager') {
            return callback(null);
        }

        const managerTags = adminRow.tags ? adminRow.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
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
app.post('/api/admin/login', (req, res) => {
    const { id, password, company_code } = req.body;
    if (!id || !password || !company_code) {
        return res.status(400).json({ error: '아이디, 비밀번호, 회사 코드를 모두 입력해 주세요.' });
    }

    const cleanCode = company_code.trim().toUpperCase();

    if (cleanCode === 'AUTON') {
        // Super Admin 로그인 (system_settings 인증)
        db.get("SELECT value FROM system_settings WHERE key = 'admin_id'", [], (err, idRow) => {
            if (err || !idRow) {
                return res.status(500).json({ error: '서버 설정 조회 실패' });
            }

            if (idRow.value !== id) {
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                    [cleanCode, id, '아이디 불일치', ip]);
                return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
            }

            db.get("SELECT value FROM system_settings WHERE key = 'admin_password'", [], async (err2, pwRow) => {
                if (err2 || !pwRow) {
                    return res.status(500).json({ error: '서버 설정 조회 실패' });
                }

                const pwOk = await verifyPassword(password, pwRow.value);
                if (!pwOk) {
                    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                    db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                        [cleanCode, id, '비밀번호 불일치', ip]);
                    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
                }

                // 레거시 SHA-256 해시를 bcrypt로 자동 마이그레이션
                if (!isBcryptHash(pwRow.value)) {
                    const newHash = await hashPassword(password);
                    db.run("UPDATE system_settings SET value = ? WHERE key = 'admin_password'", [newHash]);
                }

                // 세션 토큰 생성
                const token = crypto.randomBytes(16).toString('hex');
                activeSessions.set(token, { companyCode: 'auton', role: 'admin', username: id });
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_success', ?, ?)`,
                    ['auton', id, '통합관리자 로그인 성공', ip]);
                return res.json({ success: true, token, company_code: 'auton', role: 'admin' });
            });
        });
    } else {
        // 일반 회사 관리자 로그인 (company_admins & companies 조인 인증)
        db.get(
            "SELECT a.admin_password, a.company_code, a.role FROM company_admins a JOIN companies c ON a.company_code = c.company_code WHERE a.admin_id = ? AND a.company_code = ?",
            [id.trim(), cleanCode],
            (err, row) => {
                if (err) {
                    console.error('관리자 로그인 쿼리 에러:', err.message);
                    return res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
                }
                if (!row) {
                    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                    db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                        [cleanCode, id.trim(), '등록되지 않은 관리자 또는 회사코드 오류', ip]);
                    return res.status(401).json({ error: '등록되지 않은 회사 코드이거나 잘못된 관리자 정보입니다.' });
                }

                verifyPassword(password, row.admin_password).then(async (pwOk) => {
                    if (!pwOk) {
                        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                        db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_failure', ?, ?)`,
                            [cleanCode, id.trim(), '비밀번호 불일치', ip]);
                        return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
                    }

                    // 레거시 SHA-256 해시를 bcrypt로 자동 마이그레이션
                    if (!isBcryptHash(row.admin_password)) {
                        const newHash = await hashPassword(password);
                        db.run("UPDATE company_admins SET admin_password = ? WHERE admin_id = ? AND company_code = ?", [newHash, id.trim(), cleanCode]);
                    }

                    // 세션 토큰 생성
                    const token = crypto.randomBytes(16).toString('hex');
                    const role = row.role || 'admin';
                    activeSessions.set(token, { companyCode: cleanCode, role: role, username: id.trim() });
                    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                    db.run(`INSERT INTO admin_audit_logs (company_code, admin_username, action_type, details, ip_address) VALUES (?, ?, 'login_success', ?, ?)`,
                        [cleanCode, id.trim(), '회사 관리자 로그인 성공', ip]);
                    return res.json({ success: true, token, company_code: cleanCode, role: role });
                });
            }
        );
    }
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
        db.run("DELETE FROM companies WHERE company_code = ?", [targetCode], function(err) {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: '회사 삭제 중 오류가 발생했습니다: ' + err.message });
            }
            
            db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                    return res.status(500).json({ error: '트랜잭션 커밋 실패: ' + commitErr.message });
                }
                console.log(`[회사 영구 삭제] 통합관리자 요청으로 회사 ${targetCode}의 모든 로그, 사원, 관리자 정보가 삭제되었습니다.`);
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

// 서버 실행
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 직원 활동 모니터링 백엔드가 활성화되었습니다.`);
    console.log(` 포트: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
