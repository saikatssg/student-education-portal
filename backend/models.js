const mongoose = require('mongoose');

// ==========================================
// 0. Counter Schema (for auto-incrementing IDs)
// ==========================================
const counterSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g., 'batch_seq', 'student_seq'
    seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// ==========================================
// 1. Course Schema
// ==========================================
const courseSchema = new mongoose.Schema({
    courseid: { type: String, required: true, unique: true },
    coursename: { type: String, required: true },
    course_type: { type: String, required: true }, // e.g., "01" for Certificate, "02" for Diploma
    course_abbr: { type: String, required: true }, // e.g., "ACAD"
    course_year: { type: String, required: true },
    price: { type: Number, required: true, default: 0.00 },
    duration: { type: Number, required: true } // Duration in hours
});
const Course = mongoose.model('Course', courseSchema);

// ==========================================
// 2. Batch Schema
// ==========================================
const batchSchema = new mongoose.Schema({
    batchcode: { type: String, required: true, unique: true }, // e.g. ACAD/01/092026/01
    courseid: { type: String, ref: 'Course', required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    year: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    created_at: { type: Date, default: Date.now }
});
const Batch = mongoose.model('Batch', batchSchema);

// ==========================================
// 3. Student Schema
// ==========================================
const studentSchema = new mongoose.Schema({
    sid: { type: String, required: true, unique: true }, // e.g. SID-001
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    city: { type: String },
    dob: { type: Date },
    photo: { type: String },
    role: { type: String, default: 'candidate' }, // admin or candidate
    batchcode: { type: String }, // Currently active batch
    crtid: { type: String }, // Current certificate ID
    prevCode: [{
        batchcode: { type: String },
        courseid: { type: String },
        crtid: { type: String }
    }]
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
const Student = mongoose.model('Student', studentSchema);

// ==========================================
// 4. Exam Schema
// ==========================================
const examSchema = new mongoose.Schema({
    examid: { type: String, required: true, unique: true }, // e.g. EXID/ACAD/0109202601/001
    batchcode: { type: String, ref: 'Batch', required: true },
    exam_date: { type: Date, required: true },
    semester: { type: Number },
    candidates: [{ type: String, ref: 'Student' }] // SIDs of candidates sitting for exam
});
const Exam = mongoose.model('Exam', examSchema);

// ==========================================
// 5. Result Schema
// ==========================================
const resultSchema = new mongoose.Schema({
    rsultid: { type: String, required: true, unique: true }, // e.g. RSID/EXID/batchcode/001/001
    examid: { type: String, ref: 'Exam', required: true },
    sid: { type: String, ref: 'Student', required: true },
    semester: { type: Number, required: true, default: 1 },
    marks: [{
        subject: { type: String, required: true },
        score: { type: Number, required: true },
        max_score: { type: Number, required: true, default: 100 }
    }],
    total_score: { type: Number, required: true },
    grade: { type: String, required: true },

    // Blockchain Specific Fields
    previous_hash: { type: String },
    current_hash: { type: String },
    transaction_details: { type: String },
    transaction_hash: { type: String },
    contract_address: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
const Result = mongoose.model('Result', resultSchema);

// ==========================================
// 6. Certificate Schema (With Blockchain Data)
// ==========================================
const certificateSchema = new mongoose.Schema({
    crtid: { type: String, required: true, unique: true },
    sid: { type: String, ref: 'Student', required: true },
    batchcode: { type: String, ref: 'Batch', required: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    examid: { type: String, ref: 'Exam' },
    coursename: { type: String, required: true },
    score: { type: String, required: true },
    grade: { type: String, required: true },

    // Blockchain Specific Fields
    previous_hash: { type: String, required: true },
    current_hash: { type: String, required: true },
    transaction_details: { type: String, required: true },
    contract_address: { type: String, required: true },
    transaction_hash: { type: String, required: false }
}, { timestamps: { createdAt: 'crt_generate_on', updatedAt: 'crt_update_on' } });
const Certificate = mongoose.model('Certificate', certificateSchema);

// ==========================================
// 7. Admin Schema
// ==========================================
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passkey: { type: String },
    email: { type: String },
    phone: { type: String }
});
const Admin = mongoose.model('Admin', adminSchema);

// ==========================================
// 8. ID Card Schema (Blockchain)
// ==========================================
const idCardSchema = new mongoose.Schema({
    idCardId: { type: String, required: true, unique: true },
    sid: { type: String, ref: 'Student', required: true },
    fullname: { type: String, required: true },
    courseName: { type: String, required: true },
    batchcode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    photoUrl: { type: String },

    // Status
    status: { type: String, enum: ['Pending', 'Minted'], default: 'Pending' },
    validUntil: { type: Date },

    // Blockchain Specific Fields
    previous_hash: { type: String },
    current_hash: { type: String },
    transaction_details: { type: String },
    transaction_hash: { type: String },
    contract_address: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
const IdCard = mongoose.model('IdCard', idCardSchema);

module.exports = { Counter, Course, Batch, Student, Exam, Result, Certificate, Admin, IdCard };
