const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    console.log("실제 실행 데이터만 보존하기 위해 데모(시드) 데이터를 정리합니다...");
    
    // EMP202605 (실제 전은석 에이전트) 데이터만 남기고 김태희, 이민우, 박지성 모의 데이터 제거
    db.run("DELETE FROM activities WHERE employee_id IN ('EMP202601', 'EMP202602', 'EMP202603')", function(err) {
        if (err) console.error("활동 로그 정리 오류:", err.message);
        else console.log(`활동 로그 정리 완료: ${this.changes}건 삭제됨.`);
    });

    db.run("DELETE FROM employees WHERE employee_id IN ('EMP202601', 'EMP202602', 'EMP202603')", function(err) {
        if (err) console.error("사원 정보 정리 오류:", err.message);
        else console.log(`사원 정보 정리 완료: ${this.changes}건 삭제됨.`);
    });

    db.close(() => {
        console.log("데이터베이스 정리 완료. 이제 실제 작동하는 에이전트 데이터만 모니터링됩니다.");
    });
});
