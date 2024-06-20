const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ComplaintType = require("./complaint_type");

const ComplaintSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    type_id: {
        type: Schema.Types.ObjectId,
        ref: "type",
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
        // type: [String],
        lat:{
            type: Number,
            default: null
        },
        lon: {
            type: Number,
            default: null   
        },
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
