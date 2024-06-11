const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    type_id: {
        type: Schema.Types.ObjectId,
        ref: 'ComplaintType',
        required: true
    },
    status_id: {
        type: Schema.Types.ObjectId,
        ref: 'Status',
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location_type: {
        type: String,
        required: true,
        enum: ['Point'],
        default: 'Point'
    },
    location_coordinates: {
        type: [Number],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ComplaintSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Complaint', ComplaintSchema);
