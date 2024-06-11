const mongoose = require('mongoose');
const ComplaintType = require('./Database/complaint_type'); 

const complaintTypes = [
  { name: 'Apagones' },
  { name: 'Distorsión armónica' },
  { name: 'Bajo Factor de Potencia' },
  { name: 'Picos de Voltaje' },
  { name: 'Variación del Voltaje' }
];

async function addComplaintTypes() {
  try {
    await mongoose.connect('mongodb+srv://cantillanarodolf:musubi88@quejasciudadanas.fwfz1hc.mongodb.net/?retryWrites=true&w=majority&appName=quejasciudadanas', { useNewUrlParser: true, useUnifiedTopology: true }); // Ajusta la cadena de conexión a tu base de datos
    await ComplaintType.insertMany(complaintTypes);
    console.log('Complaint types added successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding complaint types:', error);
    mongoose.disconnect();
  }
}

addComplaintTypes();
