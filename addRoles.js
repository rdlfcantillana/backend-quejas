const mongoose = require('mongoose');
const Role = require('./Database/roles'); // Asegúrate de que la ruta sea correcta

mongoose.connect('mongodb+srv://cantillanarodolf:musubi88@quejasciudadanas.fwfz1hc.mongodb.net/?retryWrites=true&w=majority&appName=quejasciudadanas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected...');
  addRoles();
})
.catch(err => console.log(err));

async function addRoles() {
  try {
    const roles = ['admin', 'support', 'ciudadano', 'se'];

    for (const role of roles) {
      const roleExists = await Role.findOne({ name: role });
      if (!roleExists) {
        const newRole = new Role({ name: role });
        await newRole.save();
        console.log(`Role ${role} added to the database`);
      }
    }
    
    console.log('Roles added successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding roles:', error);
  }
}
