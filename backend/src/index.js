const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aws-cloud-project-secret-2024';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ─── In-memory DB ─────────────────────────────────────────────────────────────
const ADMIN_USERS = [
  { id: uuidv4(), nome: 'Milos', cognome: 'Kovacevic', email: 'milos.kovacevic@gmail.com', password: bcrypt.hashSync('Admin1234!', 10), role: 'admin' },
  { id: uuidv4(), nome: 'Elia', cognome: 'Sandrin', email: 'elia.sandrin@gmail.com', password: bcrypt.hashSync('Admin1234!', 10), role: 'admin' },
  { id: uuidv4(), nome: 'George', cognome: 'Dioane', email: 'george.dioane@gmail.com', password: bcrypt.hashSync('Admin1234!', 10), role: 'admin' },
  { id: uuidv4(), nome: 'George', cognome: 'Biriri', email: 'george.biriri@gmail.com', password: bcrypt.hashSync('Admin1234!', 10), role: 'admin' },
  { id: uuidv4(), nome: 'David', cognome: 'Carbone', email: 'david.carbone@gmail.com', password: bcrypt.hashSync('Admin1234!', 10), role: 'admin' },
];

let users = [...ADMIN_USERS];

// ─── Timeline Data ─────────────────────────────────────────────────────────────
let timelineData = [
  {
    id: 'node-1',
    month: 'Ottobre 2025',
    courses: [
      {
        id: 'c1',
        name: 'Gestione del processo formativo 1',
        professor: 'Centonze Valeria',
        technologies: ['Informazioni sul corso System Administrator', 'Domande effettuate dagli studenti']
      },
      {
        id: 'c2',
        name: 'Soft skills 1',
        professor: 'Pasti Eleonora',
        technologies: ['Gli abitanti del Villaggio - The Village', 'Affrontare un colloquio di lavoro', 'Simulazione colloquio di lavoro']
      },
      {
        id: 'c3',
        name: 'Fondamenti di programmazione',
        professor: 'Murgia Alberto',
        technologies: ['Introduzione alle variabili', 'Condizioni', 'Cicli', 'Funzioni', 'Liste', 'Tuple', 'Dictionaries', 'Moduli']
      }
    ]
  },
  {
    id: 'node-2',
    month: 'Novembre 2025',
    courses: [
      {
        id: 'c4',
        name: 'Networking',
        professor: 'Gobbo Daniele',
        technologies: ['VLAN', 'Subnetting', 'NAT', 'DNS', 'DHCP', 'Firewall']
      },
      {
        id: 'c5',
        name: 'Sicurezza e prevenzione',
        professor: 'Ferrari Luca',
        technologies: []
      },
      {
        id: 'c6',
        name: 'Inglese tecnico 1',
        professor: 'Cristopher Parks',
        technologies: []
      }
    ]
  },
  {
    id: 'node-3',
    month: 'Dicembre 2025',
    courses: [
      {
        id: 'c7',
        name: 'Sviluppo distibuito',
        professor: 'Giacomazzi Enrico',
        technologies: []
      },
      {
        id: 'c8',
        name: 'Win OS',
        professor: 'Gobbo Daniele',
        technologies: []
      }
    ]
  },
  {
    id: 'node-4',
    month: 'Gennaio 2026',
    courses: [
      {
        id: 'c9',
        name: 'Linguaggi Web',
        professor: 'Giacomazzi Enrico',
        technologies: []
      },
      {
        id: 'c10',
        name: 'Database',
        professor: 'Arciero Alessandro',
        technologies: []
      },
      {
        id: 'c11',
        name: 'Python',
        professor: 'Mungherli Cristian',
        technologies: []
      },
      {
        id: 'c12',
        name: 'Informatica giuridica',
        professor: 'Piva Antonio',
        technologies: []
      },
      {
        id: 'c13',
        name: 'Sistemi di virtualizzazione',
        professor: 'Gobbo Daniele',
        technologies: []
      }
    ]
  },
  {
    id: 'node-5',
    month: 'Febbraio 2026',
    courses: [
      {
        id: 'c14',
        name: 'Linux OS',
        professor: 'Piccin Mirco',
        technologies: []
      },
      {
        id: 'c15',
        name: 'Cloud Services',
        professor: 'Perin Xavier',
        technologies: []
      }
    ]
  },
  {
    id: 'node-6',
    month: 'Marzo 2026',
    courses: [
      {
        id: 'c16',
        name: 'Project Work 1',
        professor: 'Mazzetto Mauro',
        technologies: []
      },
      {
        id: 'c17',
        name: 'Security Fundamentals',
        professor: 'Giacomazzi Enrico',
        technologies: []
      },
      {
        id: 'c18',
        name: 'Architettura IT',
        professor: 'Quintadamo Simonluca',
        technologies: []
      },
      {
        id: 'c19',
        name: 'Storage',
        professor: 'Quintadamo Simonluca',
        technologies: []
      }
    ]
  },
  {
    id: 'node-7',
    month: 'Aprile 2026',
    courses: [
      {
        id: 'c20',
        name: 'Scripting: Power Shell e Bash',
        professor: 'Scaini Giovanni',
        technologies: []
      },
      {
        id: 'c21',
        name: 'Architettura IT',
        professor: 'Giacomini Marco',
        technologies: []
      }
    ]
  },
  {
    id: 'node-15',
    month: 'Maggio 2026',
    courses: [
      {
        id: 'c22',
        name: 'Stage',
        professor: 'Tutor',
        technologies: []
      }
    ]
  },
  {
    id: 'node-16',
    month: 'Giugno 2026',
    courses: [
      {
        id: 'c23',
        name: 'Stage',
        professor: 'Tutor',
        technologies: []
      }
    ]
  },
  {
    id: 'node-17',
    month: 'Luglio 2026',
    courses: [
      {
        id: 'c24',
        name: 'Stage',
        professor: 'Tutor',
        technologies: []
      }
    ]
  },
  {
    id: 'node-18',
    month: 'Agosto 2026',
    courses: [
      {
        id: 'c25',
        name: 'Vacanze',
        professor: 'Si spera 🙏',
        technologies: []
      }
    ]
  }
];

// ─── Middleware ────────────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token mancante' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accesso riservato agli admin' });
  next();
};

// ─── Auth Routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { nome, cognome, email, password } = req.body;
  if (!nome || !cognome || !email || !password)
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email già registrata' });
  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), nome, cognome, email, password: hashed, role: 'user' };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email, nome, cognome, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: newUser.id, nome, cognome, email, role: 'user' } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Credenziali non valide' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenziali non valide' });
  const token = jwt.sign(
    { id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, role: user.role },
    JWT_SECRET, { expiresIn: '24h' }
  );
  res.json({ token, user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, role: user.role } });
});

// ─── User Routes ───────────────────────────────────────────────────────────────
app.get('/api/user/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utente non trovato' });
  res.json({ id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, role: user.role });
});

app.put('/api/user/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utente non trovato' });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ error: 'Password attuale non corretta' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'La nuova password deve avere almeno 6 caratteri' });
  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ message: 'Password aggiornata con successo' });
});

// ─── Timeline Routes ───────────────────────────────────────────────────────────
app.get('/api/timeline', authenticate, (req, res) => {
  res.json(timelineData);
});

app.put('/api/timeline/:nodeId', authenticate, requireAdmin, (req, res) => {
  const { nodeId } = req.params;
  const { courses } = req.body;
  const node = timelineData.find(n => n.id === nodeId);
  if (!node) return res.status(404).json({ error: 'Nodo non trovato' });
  node.courses = courses;
  res.json(node);
});

app.post('/api/timeline/:nodeId/course', authenticate, requireAdmin, (req, res) => {
  const { nodeId } = req.params;
  const { name, professor, technologies } = req.body;
  const node = timelineData.find(n => n.id === nodeId);
  if (!node) return res.status(404).json({ error: 'Nodo non trovato' });
  const newCourse = { id: uuidv4(), name, professor, technologies: technologies || [] };
  node.courses.push(newCourse);
  res.status(201).json(node);
});

app.delete('/api/timeline/:nodeId/course/:courseId', authenticate, requireAdmin, (req, res) => {
  const { nodeId, courseId } = req.params;
  const node = timelineData.find(n => n.id === nodeId);
  if (!node) return res.status(404).json({ error: 'Nodo non trovato' });
  node.courses = node.courses.filter(c => c.id !== courseId);
  res.json(node);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
