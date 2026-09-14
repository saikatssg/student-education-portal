const mongoose=require('mongoose'); 
function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
mongoose.connect('mongodb://127.0.0.1:27017/studentPortal').then(async () => { 
    const Exam = mongoose.model('Exam', new mongoose.Schema({}, {strict: false})); 
    const Result = mongoose.model('Result', new mongoose.Schema({}, {strict: false})); 
    const Counter = mongoose.model('Counter', new mongoose.Schema({}, {strict: false}));
    const batchcode = 'CID/CCWD/01/012026/001'; 
    const examid = 'EXID/CID/CCWD/01/012026/001/001'; 
    await Exam.updateOne({examid}, {$set: {batchcode, exam_date: new Date('2026-05-15'), created_at: new Date()}}, {upsert: true}); 
    const students = ['SID-002', 'SID-003', 'SID-004', 'SID-005', 'SID-006']; 
    for(const sid of students) { 
        const seq = await Counter.findOneAndUpdate(
            { id: `result_seq_${batchcode}_${sid}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const rsultid = `RES/${batchcode}/${sid}/${pad(seq.seq, 3)}`;
        await Result.updateOne({sid, examid, semester: '1'}, {$set: {rsultid, batchcode, marks: [{subject: 'Web Design Basics', score: 85, max_score: 100}], total_score: 85, grade: 'A', created_at: new Date()}}, {upsert: true}); 
    } 
    console.log('Exams and results added'); 
    process.exit(0); 
});
