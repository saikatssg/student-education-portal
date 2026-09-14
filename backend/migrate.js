const mongoose = require('mongoose');

function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

async function migrate() {
    await mongoose.connect('mongodb://127.0.0.1:27017/studentPortal');
    console.log('Connected to DB');

    // Re-declare models dynamically to avoid strict schema constraints during migration
    const Course = mongoose.model('Course', new mongoose.Schema({
        courseid: String, coursename: String, course_type: String, course_abbr: String, price: Number, duration: Number, course_year: String
    }, { strict: false }));
    const Batch = mongoose.model('Batch', new mongoose.Schema({
        batchcode: String, courseid: String, start_date: Date, end_date: Date, year: String, status: String
    }, { strict: false }));
    const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
    const Exam = mongoose.model('Exam', new mongoose.Schema({}, { strict: false }));
    const Result = mongoose.model('Result', new mongoose.Schema({}, { strict: false }));
    const Certificate = mongoose.model('Certificate', new mongoose.Schema({}, { strict: false }));
    const Counter = mongoose.model('Counter', new mongoose.Schema({ id: String, seq: Number }, { strict: false }));

    const courseMap = {}; // oldCourseId -> newCourseId
    const batchMap = {}; // oldBatchCode -> newBatchCode
    const examMap = {}; // oldExamId -> newExamId

    // Reset counters for a clean slate
    await Counter.deleteMany({ id: { $regex: /^course_seq_/ } });
    await Counter.deleteMany({ id: { $regex: /^batch_/ } });

    // 1. Migrate Courses
    console.log('Migrating Courses...');
    const courses = await Course.find();
    
    const typeMapping = {
        'Certificate': '01',
        'Diploma': '02',
        'Degree': '03',
        'Bachelor of Computer Application': '03',
        'Master': '04',
        'Master of Computer Application': '04',
        'Master of Data Science': '04'
    };

    for (const c of courses) {
        const oldId = c.courseid;
        
        let cType = c.course_type;
        if (typeMapping[cType]) {
            cType = typeMapping[cType];
        } else if (!['01', '02', '03', '04'].includes(cType)) {
            cType = '01'; // Default
        }

        // Get sequence
        const counter = await Counter.findOneAndUpdate(
            { id: `course_seq_${c.course_abbr}_${cType}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const newId = `CID/${c.course_abbr}/${cType}/${pad(counter.seq, 3)}`;
        courseMap[oldId] = newId;

        await Course.updateOne({ _id: c._id }, {
            $set: { courseid: newId, course_type: cType, course_year: "2026" }
        });
        console.log(`Course ${oldId} -> ${newId}`);
    }

    // 2. Migrate Batches
    console.log('Migrating Batches...');
    const batches = await Batch.find();
    for (const b of batches) {
        const oldBatch = b.batchcode;
        const newCourseId = courseMap[b.courseid] || b.courseid;
        
        let mmyyyy = "092026";
        if (b.start_date) {
            const date = new Date(b.start_date);
            mmyyyy = `${pad(date.getMonth() + 1, 2)}${date.getFullYear()}`;
        }
        
        const ctype = newCourseId.split('/')[2] || "01";
        const cabbr = newCourseId.split('/')[1] || "UNK";
        
        const counter = await Counter.findOneAndUpdate(
            { id: `batch_${cabbr}_${ctype}_${mmyyyy}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const prefix = newCourseId.split('/').slice(0, 3).join('/');
        const newBatch = `${prefix}/${mmyyyy}/${pad(counter.seq, 3)}`;
        batchMap[oldBatch] = newBatch;

        await Batch.updateOne({ _id: b._id }, {
            $set: { batchcode: newBatch, courseid: newCourseId }
        });
        console.log(`Batch ${oldBatch} -> ${newBatch}`);
    }

    // 3. Migrate Exams
    console.log('Migrating Exams...');
    const exams = await Exam.find();
    for (const e of exams) {
        const newBatch = batchMap[e.batchcode] || e.batchcode;
        const newExamId = `EX-${newBatch.replace(/\//g, '-')}`;
        examMap[e.examid] = newExamId;

        await Exam.updateOne({ _id: e._id }, {
            $set: { batchcode: newBatch, examid: newExamId }
        });
    }

    // 4. Migrate Results
    console.log('Migrating Results...');
    const results = await Result.find();
    for (const r of results) {
        const newExamId = examMap[r.examid] || r.examid;
        await Result.updateOne({ _id: r._id }, {
            $set: { examid: newExamId }
        });
    }

    // 5. Migrate Certificates
    console.log('Migrating Certificates...');
    const certs = await Certificate.find();
    for (const c of certs) {
        const newBatch = batchMap[c.batchcode] || c.batchcode;
        const newExamId = examMap[c.examid] || c.examid;
        
        // Fix crtid if needed
        let newCrtId = c.crtid;
        if (c.crtid && c.batchcode && c.crtid.includes(c.batchcode) && c.batchcode !== newBatch) {
            newCrtId = c.crtid.replace(c.batchcode, newBatch);
        }

        await Certificate.updateOne({ _id: c._id }, {
            $set: { batchcode: newBatch, examid: newExamId, crtid: newCrtId }
        });
    }

    // 6. Migrate Students
    console.log('Migrating Students...');
    const students = await Student.find();
    for (const s of students) {
        const update = {};
        let modified = false;

        const oldBatch = s.batchcode;
        if (oldBatch && batchMap[oldBatch]) {
            update.batchcode = batchMap[oldBatch];
            modified = true;
        }

        if (s.crtid && oldBatch) {
            if (s.crtid.includes(oldBatch) && batchMap[oldBatch]) {
                update.crtid = s.crtid.replace(oldBatch, batchMap[oldBatch]);
                modified = true;
            }
        }

        if (s.prevCode && s.prevCode.length > 0) {
            update.prevCode = s.prevCode.map(pc => {
                let updatedPc = { ...pc };
                if (pc.batchcode && batchMap[pc.batchcode]) updatedPc.batchcode = batchMap[pc.batchcode];
                if (pc.courseid && courseMap[pc.courseid]) updatedPc.courseid = courseMap[pc.courseid];
                if (pc.crtid && pc.batchcode && pc.crtid.includes(pc.batchcode) && batchMap[pc.batchcode]) {
                    updatedPc.crtid = pc.crtid.replace(pc.batchcode, batchMap[pc.batchcode]);
                }
                return updatedPc;
            });
            modified = true;
        }

        if (modified) {
            await Student.updateOne({ _id: s._id }, { $set: update });
        }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
}

migrate().catch(console.error);
