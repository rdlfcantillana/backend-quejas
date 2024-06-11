const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server);
    io.on('connection', (socket) => {
      console.log('Nuevo cliente conectado');
      socket.on('joinRoom', (room) => {
        socket.join(room);
      });
      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io no está inicializado');
    }
    return io;
  }
};
