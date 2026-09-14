const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

async function seed() {
    await mongoose.connect('mongodb://127.0.0.1:27017/studentPortal');
    console.log('Connected to DB');

    const Course = mongoose.model('Course', new mongoose.Schema({
        courseid: String, coursename: String, course_type: String, course_abbr: String, price: Number, duration: Number, course_year: String
    }, { strict: false }));
    const Batch = mongoose.model('Batch', new mongoose.Schema({
        batchcode: String, courseid: String, start_date: Date, end_date: Date, year: String, status: String, created_at: Date
    }, { strict: false }));
    const Student = mongoose.model('Student', new mongoose.Schema({
        sid: String, fname: String, lname: String, username: String, password: String, email: String, 
        phone: String, city: String, dob: Date, photo: String, role: String, batchcode: String, 
        crtid: String, prevCode: Array, completed_batches: Array, created_at: Date
    }, { strict: false }));
    const Counter = mongoose.model('Counter', new mongoose.Schema({ id: String, seq: Number }, { strict: false }));

    // 1. Get Course
    const course = await Course.findOne({ courseid: 'CID/CCWD/01/001' });
    if (!course) {
        console.error("Course CID/CCWD/01/001 not found");
        process.exit(1);
    }
    console.log(`Found course: ${course.coursename}`);

    // 2. Create Batch
    const mmyyyy = "012026";
    let batch = await Batch.findOne({ courseid: course.courseid, start_date: new Date('2026-01-01') });
    
    if (!batch) {
        const counter = await Counter.findOneAndUpdate(
            { id: `batch_${course.course_abbr}_${course.course_type}_${mmyyyy}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const prefix = course.courseid.split('/').slice(0, 3).join('/');
        const batchcode = `${prefix}/${mmyyyy}/${pad(counter.seq, 3)}`;

        batch = new Batch({
            batchcode,
            courseid: course.courseid,
            start_date: new Date('2026-01-01'),
            end_date: new Date('2026-05-14'),
            year: '2026',
            status: 'Completed',
            created_at: new Date()
        });
        await batch.save();
        console.log(`Created batch: ${batchcode}`);
    } else {
        console.log(`Batch already exists: ${batch.batchcode}`);
    }

    // 3. Copy Images
    const uploadDir = path.join(__dirname, 'uploads');
    const sourceDir = 'C:\\Users\\nieli\\.gemini\\antigravity-ide\\brain\\2cc0bbd3-8efb-41f1-8d0b-0210fdd968fa\\.user_uploaded';
    
    const imageFiles = [
        'media_1789200576388.jpg',
        'media_1789200576417.jpg',
        'media_1789200576442.jpg',
        'media_1789200576489.jpg',
        'media_1789200576519.jpg'
    ];

    const copiedImages = [];
    for (const file of imageFiles) {
        const newName = Date.now() + '_' + file;
        fs.copyFileSync(path.join(sourceDir, file), path.join(uploadDir, newName));
        copiedImages.push(newName);
        // Add a small delay so Date.now() changes
        await new Promise(r => setTimeout(r, 10));
    }

    // 4. Create Students
    const studentsData = [
        { fname: 'Sophia', lname: 'Smith', gender: 'F' },
        { fname: 'Emma', lname: 'Johnson', gender: 'F' },
        { fname: 'Olivia', lname: 'Williams', gender: 'F' },
        { fname: 'Noah', lname: 'Brown', gender: 'M' },
        { fname: 'Liam', lname: 'Jones', gender: 'M' }
    ];

    for (let i = 0; i < 5; i++) {
        const data = studentsData[i];
        const existing = await Student.findOne({ username: data.fname.toLowerCase() });
        if (existing) {
            console.log(`Student ${data.fname} already exists`);
            continue;
        }

        const seq = await Counter.findOneAndUpdate(
            { id: 'student_seq' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const sid = `SID-${pad(seq.seq, 3)}`;
        const username = data.fname.toLowerCase();
        const password = `${data.fname}@123`;
        const email = `${username}@gmail.com`;

        const student = new Student({
            sid,
            fname: data.fname,
            lname: data.lname,
            username,
            password,
            email,
            phone: '999999999' + i,
            city: 'New York',
            dob: new Date('2000-01-01'),
            photo: copiedImages[i],
            role: 'candidate',
            batchcode: batch.batchcode, // Current batch
            crtid: null,
            prevCode: [],
            completed_batches: [],
            created_at: new Date()
        });

        await student.save();
        console.log(`Created student: ${sid} (${data.fname})`);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
}

seed().catch(console.error);
