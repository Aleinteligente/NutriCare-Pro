const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory store for demo purposes
const conversations = {
  default: []
};

// Simple JWT handling for demo
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const NO_AUTH = process.env.NO_AUTH === '1';

function verifyToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Get messages for a conversation (demo)
app.get('/conversations/:id/messages', (req, res) => {
  const id = req.params.id || 'default';
  res.json(conversations[id] || []);
});

// Simple message POST (also broadcasts via socket)
app.post('/conversations/:id/messages', (req, res) => {
  const id = req.params.id || 'default';
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : null;
  const decoded = verifyToken(token);
  if (!decoded && !NO_AUTH) return res.status(401).json({ error: 'unauthorized' });

  const msg = {
    id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8),
    conversationId: id,
    authorId: (decoded && (decoded.sub || decoded.id)) || 'anonymous',
    text,
    timestamp: new Date().toISOString()
  };

  conversations[id] = conversations[id] || [];
  conversations[id].push(msg);

  // broadcast to room
  io.to(id).emit('message', msg);

  res.status(201).json(msg);
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  // validate token from handshake.auth.token
  const token = socket.handshake && socket.handshake.auth && socket.handshake.auth.token;
  const decoded = verifyToken(token);
  if (!decoded && !NO_AUTH) {
    console.log('unauthorized socket, disconnecting', socket.id);
    socket.emit('error', { message: 'unauthorized' });
    socket.disconnect(true);
    return;
  }
  socket.data.user = decoded || null;

  socket.on('join', (conversationId) => {
    const room = conversationId || 'default';
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
    // send existing history
    const history = conversations[room] || [];
    socket.emit('history', history);
  });

  socket.on('message', (payload) => {
    // payload should include { conversationId, text }
    const id = (payload && payload.conversationId) || 'default';
    const author = (socket.data.user && (socket.data.user.sub || socket.data.user.id)) || payload.authorId || 'anonymous';
    const msg = {
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8),
      conversationId: id,
      authorId: author,
      text: payload.text || '',
      timestamp: new Date().toISOString()
    };
    conversations[id] = conversations[id] || [];
    conversations[id].push(msg);
    io.to(id).emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket server listening on port ${PORT}`));
