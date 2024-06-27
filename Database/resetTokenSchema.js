const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResetTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // 1 hour
  },
  used: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('ResetToken', ResetTokenSchema);
