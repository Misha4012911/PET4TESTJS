const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = 'SecretKey1337';

const app = express();

app.use(cors(),bodyParser.json());

// Конфигурация базы данных PostgreSQL
const pool = new Pool({
  user: 'postgres', // Пользователь базы данных
  host: 'localhost', // Хост базы данных (обычно localhost)
  database: 'pet', // Название базы данных, которую мы создали
  password: '123', // Пароль пользователя postgres
  schema: 'public',
  port: 5432, // Порт PostgreSQL (по умолчанию 5432)
});

// Простой запрос к базе данных для проверки
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Ошибка выполнения запроса:', err);
  } else {
    console.log('Результат запроса:', result.rows[0]);
  }
});

// РОУТИНГ НАЧИНАЕТСЯ ТУТ
app.get('/api/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, login, username FROM public."Users"');
    console.log('Результат запроса:', result.rows[0]);
    res.status(200).json(result.rows);
  } finally {
    client.release(express.json);
  }
});

// Обработчик POST запроса по маршруту '/api/register'
app.post('/api/register', (req, res) => {
  const { login, username, password, email } = req.body;
  // проверка логина и емейла на уникальность
  pool.query('SELECT * FROM public."Users" WHERE login = $1 OR email = $2', [login, email], (error, result) => {
    if (error) {
      res.status(500).send('Error checking user');
    } else if (result.rows.length > 0) {
      res.status(400).send('User with such login or email already exists');
    } else {
      // Хешируем пароль с использованием bcrypt
      bcrypt.hash(password, 10, (err, password_hash) => {
        if (err) {
          res.status(500).send('Error hashing password');
        } else {
          // Дополнительная проверка пароля
          if (password.length < 8) {
            res.status(400).send('Password should be at least 8 characters long');
          } else {
            // Заносим в БД информацию о новом пользователе
            pool.query('INSERT INTO public."Users" (login, username, password_hash, email) VALUES ($1, $2, $3, $4)', [login, username, password_hash, email], (error, result) => {
              if (error) {
                res.status(500).send('Error registering user');
              } else {
                res.status(200).send('User registered successfully');
                console.log('Результат запроса:', result.rows[0]);
              }
            });
          }
        }
      });
    }
  });
});


// Роут для аутентификации и генерации JWT токена
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  pool.query('SELECT * FROM public."Users" WHERE login = $1', [login], (error, result) => {
    if (error) {
      res.status(500).send('Error querying user');
    } else if (result.rows.length === 0) {
      res.status(401).send('User not found');
    } else {
      const user = result.rows[0];
      // Проверяем введенный пароль с зашифрованным паролем в базе данных
      bcrypt.compare(password, user.password_hash, (err, passwordMatch) => {
        if (err) {
          res.status(500).send('Error comparing passwords');
        } else if (!passwordMatch) {
          res.status(401).send('Incorrect password');
        } else {
          // Пароль верный, генерируем JWT токен
          const token = jwt.sign({ login }, secretKey);
          pool.query('UPDATE public."Users" SET token = $1 WHERE login = $2', [token, login], (error, result) => {
            if (error) {
              res.status(500).json({ error: 'Ошибка сохранения токена в базе данных' });
            } else {
              res.json({ token });
            }
          });
        }
      });
    }
  });
});



app.listen(5000, () => {
  console.log('Server is running on port 5000');
});