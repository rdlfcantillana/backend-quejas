const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: "*", // Cambia esto al origen de tu frontend
        methods: ["GET", "POST"],
        //allowedHeaders: ["my-custom-header"],
      },
      transports: ["websocket", "polling"],
    });

    io.on('connection', (socket) => {
      console.log('Nuevo cliente conectado');

      socket.on('joinRoom', (room) => {
        socket.join(room);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });

      socket.on("testUnassinged", (complaintId) =>{

        io.emit('complaintUnassigned', complaintId);
      } )

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
