const { Client } = require('pg');

// Render의 환경 변수 DATABASE_URL을 가져옵니다.
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon/Render 연결 시 SSL 설정이 필요합니다.
  }
});

async function getName() {
  try {
    await client.connect();

    // 'test' 테이블에서 이름 하나를 조회합니다.
    // 여기서는 가장 최근 혹은 임의의 레코드 하나를 가져오도록 처리했습니다.
    const res = await client.query('SELECT name FROM test LIMIT 1');

    if (res.rows.length > 0) {
      const name = res.rows[0].name;
      console.log(`HELLO ${name}`);
    } else {
      console.log('데이터가 없습니다.');
    }
  } catch (err) {
    console.error('에러 발생:', err.stack);
  } finally {
    await client.end();
  }
}

getName();
