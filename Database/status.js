const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatusSchema = new Schema({
    name: {
        type: String,
        required: true,
        enum: ['pendiente', 'en proceso', 'realizado']
    }
});

module.exports = mongoose.model('Status', StatusSchema);
