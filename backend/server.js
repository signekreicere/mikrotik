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

const generalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

app.use('/create-tickets', generalLimiter);
app.use('/update-ticket/:id', generalLimiter);
app.use('/archive-ticket/:id', generalLimiter);
app.use('/create-template', generalLimiter);
app.use('/templates/:id', generalLimiter);
app.use('/archive-template/:id', generalLimiter);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
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

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, role FROM users');
        res.json({ users: result.rows });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/statuses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ticket_statuses');
        res.json({ statuses: result.rows });
    } catch (err) {
        console.error('Error fetching statuses:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/templates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
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

app.get('/templates/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, name, fields, created_at, created_by, is_archived 
             FROM templates 
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const template = result.rows[0];

        if (typeof template.fields === 'string') {
            try {
                template.fields = JSON.parse(template.fields);
            } catch (err) {
                console.error('Failed to parse template fields:', err);
                template.fields = [];
            }
        }

        res.json({ template });
    } catch (err) {
        console.error('Failed to fetch template:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/tickets', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.id,
                t.title,
                ts.name AS status,
                t.created_at,
                u_creator.email AS creator_email,
                u_assignee.email AS assignee_email,
                te.name AS template_name,
                t.is_archived
            FROM tickets t
                LEFT JOIN users u_creator ON t.creator_id = u_creator.id
                LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
                LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
                LEFT JOIN templates te ON t.template_id = te.id
            ORDER BY t.created_at DESC
        `);

        res.json({ tickets: result.rows });
    } catch (err) {
        console.error('Error fetching tickets:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/create-tickets', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.id;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const tickets = req.body;

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({ message: 'Invalid ticket data' });
    }

    try {
        const values = tickets.map(ticket => [
            ticket.title,
            ticket.description,
            1,
            ticket.assignee_id || null,
            userId,
            ticket.template_id,
            JSON.stringify(ticket.custom_fields)
        ]);

        const query = `
            INSERT INTO tickets (title, description, status_id, assignee_id, creator_id, template_id, custom_fields) 
            VALUES ${values.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(',')}
            RETURNING *;
        `;

        const params = values.flat();

        const result = await pool.query(query, params);

        res.status(201).json({ tickets: result.rows });
    } catch (error) {
        console.error('Error creating tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/tickets/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT
                 t.id, t.title, t.description, ts.name AS status, t.created_at, t.assignee_id,
                 u.email AS creator_email,
                 te.name AS template_name,
                 t.custom_fields
             FROM tickets t
                  LEFT JOIN users u ON t.creator_id = u.id
                  LEFT JOIN templates te ON t.template_id = te.id
                  LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
             WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const ticket = result.rows[0];

        if (typeof ticket.custom_fields === 'string') {
            try {
                ticket.custom_fields = JSON.parse(ticket.custom_fields);
            } catch {
                ticket.custom_fields = null;
            }
        }

        res.json({ ticket });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/update-ticket/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, status_id, assignee_id, custom_fields } = req.body;

    if (
        !title?.trim() ||
        !status_id ||
        typeof status_id !== 'number' ||
        (custom_fields && typeof custom_fields !== 'object')
    ) {
        return res.status(400).json({ message: 'Invalid input: Make sure all fields are properly filled out' });
    }

    try {
        const serializedFields =
            typeof custom_fields === 'string'
                ? custom_fields
                : JSON.stringify(custom_fields);

        const result = await pool.query(
            `UPDATE tickets
             SET title = $1, description = $2, status_id = $3, assignee_id = $4, custom_fields = $5
             WHERE id = $6
             RETURNING *`,
            [title, description, status_id, assignee_id || null, serializedFields, Number(id)]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ticket not found or no changes made' });
        }

        res.status(200).json({ ticket: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/archive-ticket/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE tickets SET is_archived = TRUE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({ message: 'Ticket archived successfully' });
    } catch (err) {
        console.error('Error archiving ticket:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server launched on http://localhost:${PORT}`);
});