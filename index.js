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

const ADMIN_ID = 'admin'; // 관리자 아이디

// [회원가입]
app.post('/api/signup', async (req, res) => {
  const { userid, password } = req.body;
  try {
    await pool.query('INSERT INTO users (userid, password) VALUES ($1, $2)', [userid, password]);
    res.send('가입 성공');
  } catch (err) { res.status(400).send('이미 존재하는 아이디입니다.'); }
});

// [로그인 체크] (실습용으로 아주 단순하게 구현)
app.post('/api/login', async (req, res) => {
  const { userid, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE userid = $1 AND password = $2', [userid, password]);
  if (user.rows.length > 0) res.json({ userid: user.rows[0].userid });
  else res.status(401).send('로그인 실패');
});

// [목록 가져오기]
app.get('/api/items', async (req, res) => {
  const result = await pool.query('SELECT * FROM lost_items ORDER BY found_date DESC');
  res.json(result.rows);
});

// [글 쓰기]
app.post('/api/items', async (req, res) => {
  const { name, date, f_loc, s_loc, userid } = req.body;
  await pool.query(
    'INSERT INTO lost_items (item_name, found_date, found_location, storage_location, owner_id) VALUES ($1, $2, $3, $4, $5)',
    [name, date, f_loc, s_loc, userid]
  );
  res.send('저장 완료');
});

// [글 수정하기]
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, f_loc, s_loc, userid } = req.body;
  
  const item = await pool.query('SELECT owner_id FROM lost_items WHERE id = $1', [id]);
  if (userid === item.rows[0].owner_id || userid === ADMIN_ID) {
    await pool.query(
      'UPDATE lost_items SET item_name=$1, found_location=$2, storage_location=$3 WHERE id=$4',
      [name, f_loc, s_loc, id]
    );
    res.send('수정 성공');
  } else res.status(403).send('권한 없음');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
