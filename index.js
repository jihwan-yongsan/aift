const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_PW = '1234'; // 관리자 마스터 비밀번호

// 1. 목록 가져오기
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, item_name, found_date, found_location, storage_location FROM lost_items ORDER BY found_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

// 2. 글 등록하기 (누구나 가능, 본인 비번 설정)
app.post('/api/items', async (req, res) => {
  const { name, date, f_loc, s_loc, pw } = req.body;
  try {
    await pool.query(
      'INSERT INTO lost_items (item_name, found_date, found_location, storage_location, password) VALUES ($1, $2, $3, $4, $5)',
      [name, date, f_loc, s_loc, pw]
    );
    res.status(201).send('저장 완료');
  } catch (err) {
    res.status(500).send('저장 실패');
  }
});

// 3. 글 삭제하기 (본인 비번 OR 관리자 비번)
app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { pw } = req.body;

  try {
    const item = await pool.query('SELECT password FROM lost_items WHERE id = $1', [id]);
    if (item.rows.length === 0) return res.status(404).send('항목 없음');

    // 본인 비번이거나 관리자 비번이면 삭제 허용
    if (pw === item.rows[0].password || pw === ADMIN_PW) {
      await pool.query('DELETE FROM lost_items WHERE id = $1', [id]);
      res.send('삭제 성공');
    } else {
      res.status(403).send('비밀번호 불일치');
    }
  } catch (err) {
    res.status(500).send('삭제 오류');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
