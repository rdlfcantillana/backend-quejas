const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ComplaintType', ComplaintTypeSchema);
