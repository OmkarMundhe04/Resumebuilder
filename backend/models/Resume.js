const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required for saving a resume"]
  },

  personal: {
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    address: { type: String },
    summary: { type: String },
    image: { type: String }, // Optional: base64 or URL
  },

  experience: [
    {
      company: { type: String },
      role: { type: String },
      dates: { type: String },
      description: { type: String },
    },
  ],

  education: [
    {
      school: { type: String },
      degree: { type: String },
      dates: { type: String },
    },
  ],

  skills: [{ type: String }],

  projects: [
    {
      name: { type: String },
      link: { type: String },
      description: { type: String },
    },
  ],
},
{
  timestamps: true // ✅ Automatically adds createdAt and updatedAt
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
