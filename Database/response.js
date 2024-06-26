const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
  complaint_id: {
    type: Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  response: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
},
});

module.exports = mongoose.model('Response', ResponseSchema);
