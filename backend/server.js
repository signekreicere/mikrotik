const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.SECRET_KEY;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many login attempts. Please try again later.' }); // 5 attempts 15 mins
    },
});

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/checkAuth', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ user: { id: decoded.id, email: decoded.email, role: decoded.role } });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

app.get('/templates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM templates WHERE is_archived = FALSE');
        res.json({ templates: result.rows });
    } catch (err) {
        console.error('Error fetching templates:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/create-template', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    let created_by;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        created_by = decoded.email;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const { name, custom_fields } = req.body;

    if (!name || !custom_fields) {
        return res.status(400).json({ message: 'Name and custom fields are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO templates (name, fields, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, JSON.stringify(custom_fields), created_by]
        );

        res.status(201).json({ template: result.rows[0] });
    } catch (err) {
        console.error('Error creating template:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/archive-template/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE templates SET is_archived = TRUE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json({ message: 'Template archived successfully' });
    } catch (err) {
        console.error('Error archiving template:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server launched on http://localhost:${PORT}`);
});