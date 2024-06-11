const mongoose = require('mongoose');
const Status = require('./Database/status'); // Asegúrate de que la ruta es correcta
require('dotenv').config();

mongoose.connect(process.env.DB_CONNECT)
  .then(async () => {
    console.log('MongoDB connected...');

    const statuses = ['pendiente', 'en proceso', 'realizado'];
    for (const status of statuses) {
      const newStatus = new Status({ name: status });
      await newStatus.save();
    }

    console.log('Statuses inserted successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });
