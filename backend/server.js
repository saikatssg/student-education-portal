const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers } = require('ethers');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Counter, Course, Batch, Student, Exam, Result, Certificate, Admin } = require('./models');

const app = express();
// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded files statically

// ==========================================
// Ethereum Setup
// ==========================================
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
const adminPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
const wallet = new ethers.Wallet(adminPrivateKey, provider);

const contractAddress = '0x9a177C4a7383843cB91E8147F903B388bf0B3767';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateMinted","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"marksScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBlockHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"string","name":"_marksScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"mintCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const certificateContract = new ethers.Contract(contractAddress, contractABI, wallet);

// ==========================================
// Helpers
// ==========================================
async function getNextSequence(id) {
    const counter = await Counter.findOneAndUpdate(
        { id: id },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}
function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// ==========================================
// Auth API
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    const adminUser = await Admin.findOne({ username, password });
    if (adminUser) {
        return res.json({ 
            role: 'admin', 
            admin: { name: adminUser.username, email: adminUser.email, phone: adminUser.phone } 
        });
    }
    const student = await Student.findOne({ username, password });
    if (student) {
        return res.json({ role: 'candidate', student });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/signup', upload.single('photo'), async (req, res) => {
    try {
        const seq = await getNextSequence('student_seq');
        const sid = `SID-${pad(seq, 3)}`;
        
        const photoPath = req.file ? req.file.filename : null;
        const student = new Student({ ...req.body, sid, photo: photoPath });
        
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Course & Batch API
// ==========================================
app.get('/api/courses', async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
});

app.post('/api/courses', async (req, res) => {
    try {
        const { coursename, course_type, course_abbr, course_year, price, duration } = req.body;
        const seq = await getNextSequence(`course_seq_${course_abbr}_${course_type}`);
        const courseid = `CID/${course_abbr}/${course_type}/${pad(seq, 3)}`;
        
        const course = new Course({ courseid, coursename, course_type, course_abbr, course_year, price, duration });
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/batchMaster', async (req, res) => {
    try {
        const { courseid, start_date, end_date, year } = req.body;
        const course = await Course.findOne({ courseid });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const date = new Date();
        const mmyyyy = `${pad(date.getMonth() + 1, 2)}${date.getFullYear()}`;
        const seq = await getNextSequence(`batch_${course.course_abbr}_${course.course_type}_${mmyyyy}`);
        
        const prefix = course.courseid.split('/').slice(0, 3).join('/'); // e.g. CID/CSD/02
        const batchcode = `${prefix}/${mmyyyy}/${pad(seq, 3)}`;

        const batch = new Batch({ batchcode, courseid: course.courseid, start_date, end_date, year });
        await batch.save();
        res.json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/batchMaster', async (req, res) => {
    try {
        const batches = await Batch.find().lean();
        // Manually populate course info since courseid is a string, not an ObjectId
        const courseIds = [...new Set(batches.map(b => b.courseid))];
        const courses = await Course.find({ courseid: { $in: courseIds } }).lean();
        const courseMap = {};
        courses.forEach(c => courseMap[c.courseid] = c);
        
        const populatedBatches = batches.map(b => ({
            ...b,
            courseid: courseMap[b.courseid] || { coursename: 'Unknown Course', courseid: b.courseid }
        }));
        
        res.json(populatedBatches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Exam & Result API
// ==========================================
app.post('/api/exams', async (req, res) => {
    try {
        const { batchcode, exam_date, candidates } = req.body;
        const seq = await getNextSequence(`exam_${batchcode}`);
        const examid = `EXID/${batchcode}/${pad(seq, 3)}`;
        
        const exam = new Exam({ examid, batchcode, exam_date, candidates });
        await exam.save();
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/exams', async (req, res) => {
    const exams = await Exam.find();
    res.json(exams);
});

app.post('/api/results', async (req, res) => {
    try {
        const { examid, sid, semester, marks } = req.body;
        
        let total = 0;
        let max_total = 0;
        marks.forEach(m => { total += Number(m.score); max_total += Number(m.max_score); });
        
        const pct = (total / max_total) * 100;
        let grade = 'F';
        if (pct >= 90) grade = 'A+';
        else if (pct >= 80) grade = 'A';
        else if (pct >= 70) grade = 'B';
        else if (pct >= 60) grade = 'C';
        else if (pct >= 50) grade = 'D';

        let result = await Result.findOne({ examid, sid, semester: semester || 1 });
        if (result) {
            result.marks = marks;
            result.total_score = total;
            result.grade = grade;
            await result.save();
        } else {
            const seq = await getNextSequence(`result_${examid}`);
            const rsultid = `RSID/${examid}/${pad(seq, 3)}`;
            result = new Result({ rsultid, examid, sid, semester: semester || 1, marks, total_score: total, grade });
            await result.save();
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/results/batch/:batchcode', async (req, res) => {
    try {
        const exams = await Exam.find({ batchcode: req.params.batchcode });
        const examIds = exams.map(e => e.examid);
        examIds.push(`EX-${req.params.batchcode}`);
        
        const results = await Result.find({ examid: { $in: examIds } }).lean();
        
        // Manually fetch student info since sid is a string, not an ObjectId
        const studentSids = [...new Set(results.map(r => r.sid))];
        const students = await Student.find({ sid: { $in: studentSids } }, 'sid fname lname email phone').lean();
        const studentMap = {};
        students.forEach(s => studentMap[s.sid] = s);
        
        const populatedResults = results.map(r => ({
            ...r,
            sid: studentMap[r.sid] || { sid: r.sid, fname: 'Unknown', lname: 'Student' }
        }));
        
        res.json(populatedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/results/student/:sid', async (req, res) => {
    try {
        const results = await Result.find({ sid: req.params.sid }).lean();
        // Also we might want the exam details so we know which batch it was
        const examIds = [...new Set(results.map(r => r.examid))];
        const exams = await Exam.find({ examid: { $in: examIds } }).lean();
        const examMap = {};
        exams.forEach(e => examMap[e.examid] = e);
        
        const populatedResults = results.map(r => ({
            ...r,
            exam: examMap[r.examid] || null
        }));
        res.json(populatedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/exams/student/:sid', async (req, res) => {
    try {
        const student = await Student.findOne({ sid: req.params.sid });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        const batchcodes = [student.batchcode];
        if (student.prevCode && student.prevCode.length > 0) {
            student.prevCode.forEach(pc => batchcodes.push(pc.batchcode));
        }
        
        const exams = await Exam.find({ batchcode: { $in: batchcodes } }).lean();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Student Dashboard API
// ==========================================
app.post('/api/students/enroll', async (req, res) => {
    try {
        const { sid, batchcode } = req.body;
        const student = await Student.findOne({ sid });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        if (student.batchcode) {
            const oldBatch = await Batch.findOne({ batchcode: student.batchcode }).lean();
            student.prevCode.push({
                batchcode: student.batchcode,
                courseid: oldBatch ? oldBatch.courseid : null,
                crtid: student.crtid || null
            });
        }
        
        student.batchcode = batchcode;
        student.crtid = null;
        await student.save();
        res.json({ message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/students/:sid', async (req, res) => {
    try {
        const student = await Student.findOne({ sid: req.params.sid }).lean();
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Manually populate current batch
        if (student.batchcode) {
            const batch = await Batch.findOne({ batchcode: student.batchcode }).lean();
            if (batch) {
                const course = await Course.findOne({ courseid: batch.courseid }).lean();
                batch.courseid = course;
                student.current_batch = batch; // keep current_batch in response for frontend compatibility
            }
        }

        // Manually populate prevCode details if needed by frontend
        if (student.prevCode && student.prevCode.length > 0) {
            const courseIds = [...new Set(student.prevCode.map(p => p.courseid).filter(Boolean))];
            const courses = await Course.find({ courseid: { $in: courseIds } }).lean();
            const courseMap = {};
            courses.forEach(c => courseMap[c.courseid] = c);
            
            student.prevCode = student.prevCode.map(p => ({
                ...p,
                courseDetails: courseMap[p.courseid] || null
            }));
        }

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/students/batch/:batchcode', async (req, res) => {
    try {
        const students = await Student.find({ batchcode: req.params.batchcode });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Blockchain & Certificate API
// ==========================================
app.get('/api/certificates/:sid', async (req, res) => {
    const certs = await Certificate.find({ sid: req.params.sid });
    res.json(certs);
});

app.get('/api/certificates/batch/:batchcode', async (req, res) => {
    try {
        const certs = await Certificate.find({ batchcode: req.params.batchcode });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/certificates/save', async (req, res) => {
    try {
        const { sid, batchcode, fullname, email, phone, examid, coursename, score, grade, transactionHash, blockHash, contractAddress } = req.body;
        
        // Prevent duplicate minting
        const existingCert = await Certificate.findOne({ sid, batchcode });
        if (existingCert) {
            return res.status(400).json({ error: 'Certificate already generated for this student and batch.' });
        }

        const seq = await getNextSequence(`crt_${batchcode}_${sid}`);
        const crtid = `CRT/${batchcode}/${sid}/${pad(seq, 3)}`;

        const newCertificate = new Certificate({
            crtid, sid, batchcode, fullname, email, phone, examid, coursename, score, grade,
            previous_hash: 'Handled internally by Solidity state', 
            current_hash: blockHash,
            transaction_details: transactionHash,
            contract_address: contractAddress
        });

        await newCertificate.save();
        
        // Update the student with the new certificate ID
        await Student.updateOne({ sid }, { 
            $set: { crtid: crtid }
        });

        res.status(201).json({ message: 'Certificate saved to database successfully.', crtid });

    } catch (error) {
        res.status(500).json({ error: 'Database save failed', details: error.message });
    }
});

app.get('/api/certificates/verify/:crtid', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ crtid: req.params.crtid }).lean();
        if (!certificate) return res.status(404).json({ message: 'Certificate not found in database.' });
        
        const student = await Student.findOne({ sid: certificate.sid }, 'fname lname email').lean();
        certificate.sid = student;
        
        res.status(200).json(certificate);
    } catch (error) {
        res.status(500).json({ error: 'Verification fetch failed', details: error.message });
    }
});

// ==========================================
// Startup
// ==========================================
const PORT = process.env.PORT || 5000;
mongoose.connect('mongodb://127.0.0.1:27017/studentPortal')
    .then(async () => {
        console.log('Connected to MongoDB Student Portal Database.');
        
        // Seed Admin User
        const adminExists = await Admin.findOne({ username: 'saikat' });
        if (!adminExists) {
            const defaultAdmin = new Admin({
                username: 'saikat',
                password: 'Saikat@123',
                passkey: 'Saikat@1234',
                email: 'rccsaikat@gmail.com',
                phone: '9873214568'
            });
            await defaultAdmin.save();
            console.log('Default Admin seeded.');
        }

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }).catch(err => console.error('Database connection error:', err));