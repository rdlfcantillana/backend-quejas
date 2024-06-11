const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        enum: ['admin', 'support', 'ciudadano', 'se']
    }
});

module.exports = mongoose.model('Role', RoleSchema);
