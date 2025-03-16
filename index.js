const db = require('./db.json');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Statik dosyaları sunmak için
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/db', (req, res) => {
    let msg = req.query.content;
    
    try{
        db.push(msg);
        res.sendFile(path.join(__dirname, 'db.json'));
    }catch(error){
        res.send(`Error: ${error}`)
    }
});

// Socket.io bağlantısı
io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı');

    // Kullanıcı sohbete katıldığında
    socket.on('join', (username) => {
        socket.username = username;
        io.emit('chat message', { user: 'Sistem', message: `${username} sohbete katıldı` });
    });

    // Mesaj geldiğinde
    socket.on('chat message', (msg) => {
        io.emit('chat message', { user: socket.username, message: msg });
    });

    // Kullanıcı ayrıldığında
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('chat message', { user: 'Sistem', message: `${socket.username} sohbetten ayrıldı` });
        }
    });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
