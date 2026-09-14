import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x9a177C4a7383843cB91E8147F903B388bf0B3767';
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateMinted","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"marksScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBlockHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"string","name":"_marksScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"mintCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [batchMaster, setBatchMaster] = useState([]);
    const [exams, setExams] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [courseForm, setCourseForm] = useState({ coursename: '', course_type: '01', course_abbr: '', course_year: new Date().getFullYear().toString(), price: '', duration: '' });
    const [batchForm, setBatchForm] = useState({ courseid: '', start_date: '', end_date: '', year: new Date().getFullYear().toString() });
    const [examForm, setExamForm] = useState({ batchcode: '', exam_date: '', candidates: '' });
    const [resultForm, setResultForm] = useState({ batchcode: '', semester: 1 });
    const [resultStudents, setResultStudents] = useState([]);
    const [marksData, setMarksData] = useState({}); // { sid: ['80', '90', '70', '85', '88'] }
    const [availableSems, setAvailableSems] = useState([]);
    const [clearedSems, setClearedSems] = useState(new Set());
    const [batchResults, setBatchResults] = useState([]);

    const [mintForm, setMintForm] = useState({ courseid: '', batchcode: '' });
    const [mintStudents, setMintStudents] = useState([]);
    
    const [walletAddress, setWalletAddress] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    // Student View State
    const [svSearchSid, setSvSearchSid] = useState('');
    const [svStudent, setSvStudent] = useState(null);
    const [svResults, setSvResults] = useState([]);
    const [svExams, setSvExams] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchBatchMaster();
        fetchExams();
    }, []);

    const fetchCourses = async () => {
        const res = await fetch('http://localhost:5000/api/courses');
        setCourses(await res.json());
    };
    const fetchBatchMaster = async () => {
        const res = await fetch('http://localhost:5000/api/batchMaster');
        setBatchMaster(await res.json());
    };
    const fetchExams = async () => {
        const res = await fetch('http://localhost:5000/api/exams');
        setExams(await res.json());
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(courseForm) });
            if (res.ok) { setStatus({ type: 'success', message: 'Course created successfully!' }); fetchCourses(); }
        } catch (err) { setStatus({ type: 'danger', message: 'Error creating course' }); }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/batchMaster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(batchForm) });
            if (res.ok) { setStatus({ type: 'success', message: 'Batch generated successfully!' }); fetchBatchMaster(); }
        } catch (err) { setStatus({ type: 'danger', message: 'Error creating batch' }); }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            const stdRes = await fetch(`http://localhost:5000/api/students/batch/${encodeURIComponent(examForm.batchcode)}`);
            const students = await stdRes.json();
            const candidates = students.map(st => st.sid);

            const payload = { ...examForm, candidates };
            const res = await fetch('http://localhost:5000/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { setStatus({ type: 'success', message: `Exam scheduled successfully for ${candidates.length} candidates!` }); fetchExams(); }
        } catch (err) { setStatus({ type: 'danger', message: 'Error creating exam' }); }
    };

    const initializeMarksForSemester = (sem, students, results, isCert) => {
        const initialMarks = {};
        const numSubjects = isCert ? 2 : 5;
        students.forEach(s => {
            const existingResult = results.find(r => (r.sid === s.sid || r.sid?.sid === s.sid) && r.semester === sem);
            if (existingResult && existingResult.marks) {
                // If it's Cert, marks array has 2 items. Else 5 items.
                const mapped = existingResult.marks.map(m => m.score);
                // Ensure array size is correct (in case old data differs)
                while (mapped.length < numSubjects) mapped.push('');
                initialMarks[s.sid] = mapped.slice(0, numSubjects);
            } else {
                initialMarks[s.sid] = Array(numSubjects).fill('');
            }
        });
        setMarksData(initialMarks);
    };

    const handleResultBatchChange = async (e) => {
        const batchcode = e.target.value;
        setResultForm({ ...resultForm, batchcode, semester: '' });
        setAvailableSems([]);
        setClearedSems(new Set());
        setResultStudents([]);
        setMarksData({});
        setBatchResults([]);

        if (batchcode) {
            const batch = batchMaster.find(b => b.batchcode === batchcode);
            const courseTypeStr = String(batch?.courseid?.course_type).toLowerCase();
            const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
            const isDip = courseTypeStr === '02' || courseTypeStr.includes('diploma');
            const isDegree = courseTypeStr === '03' || courseTypeStr.includes('bachelor') || courseTypeStr.includes('degree');
            const reqSems = isCert ? 1 : isDip ? 2 : isDegree ? 6 : 4;
            
            let elapsedYears = 1;
            const match = batchcode.match(/\/(\d{2})(\d{4})\d{2}$/);
            if (match) {
                const month = parseInt(match[1], 10);
                const year = parseInt(match[2], 10);
                const batchDate = new Date(year, month - 1);
                elapsedYears = Math.floor((new Date() - batchDate) / (1000 * 60 * 60 * 24 * 365.25)) + 1;
                if (elapsedYears < 1) elapsedYears = 1;
            }
            const maxYearSems = isCert ? 1 : elapsedYears * 2;
            const finalSems = Math.min(reqSems, maxYearSems);
            const semsArray = Array.from({ length: finalSems }, (_, i) => i + 1);
            setAvailableSems(semsArray);

            const resRes = await fetch(`http://localhost:5000/api/results/batch/${encodeURIComponent(batchcode)}`);
            const results = resRes.ok ? await resRes.json() : [];
            setBatchResults(results);

            const stdRes = await fetch(`http://localhost:5000/api/students/batch/${encodeURIComponent(batchcode)}`);
            if (stdRes.ok) {
                const students = await stdRes.json();
                setResultStudents(students);
                
                // A semester is cleared for the batch if ALL students scored >= 50 on ALL subjects
                const cleared = new Set();
                semsArray.forEach(sem => {
                    if (students.length === 0) return;
                    const allCleared = students.every(st => {
                        const r = results.find(res => (res.sid === st.sid || res.sid?.sid === st.sid) && res.semester === sem);
                        if (!r || !r.marks) return false;
                        return r.marks.every(m => m.score >= 50);
                    });
                    if (allCleared) cleared.add(sem);
                });
                setClearedSems(cleared);
                
                if (isCert) {
                    setResultForm(prev => ({ ...prev, semester: 1 }));
                    initializeMarksForSemester(1, students, results, true);
                }
            }
        }
    };

    const handleSemesterChange = (e) => {
        const sem = Number(e.target.value);
        setResultForm(prev => ({ ...prev, semester: sem }));
        const batch = batchMaster.find(b => b.batchcode === resultForm.batchcode);
        const courseTypeStr = String(batch?.courseid?.course_type).toLowerCase();
        const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
        initializeMarksForSemester(sem, resultStudents, batchResults, isCert);
    };

    const handleMarkChange = (sid, index, value) => {
        const newMarks = { ...marksData };
        newMarks[sid][index] = value;
        setMarksData(newMarks);
    };

    const saveStudentResult = async (sid) => {
        const batch = batchMaster.find(b => b.batchcode === resultForm.batchcode);
        const courseTypeStr = String(batch?.courseid?.course_type).toLowerCase();
        const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
        
        let marks;
        if (isCert) {
            marks = [
                { subject: 'Theory', score: Number(marksData[sid][0]) || 0, max_score: 100 },
                { subject: 'Practical', score: Number(marksData[sid][1]) || 0, max_score: 100 }
            ];
        } else {
            marks = marksData[sid].map((score, i) => ({ subject: `Subject ${i+1}`, score: Number(score) || 0, max_score: 100 }));
        }

        try {
            const res = await fetch('http://localhost:5000/api/results', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ examid: `EX-${resultForm.batchcode}`, sid, semester: resultForm.semester, marks }) 
            });
            if (res.ok) { 
                setStatus({ type: 'success', message: `Result saved for ${sid}` }); 
                // Refetch batch results to update UI state
                const resRes = await fetch(`http://localhost:5000/api/results/batch/${encodeURIComponent(resultForm.batchcode)}`);
                const newResults = resRes.ok ? await resRes.json() : [];
                setBatchResults(newResults);
            }
        } catch (err) { setStatus({ type: 'danger', message: 'Error saving result' }); }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
                const accounts = await provider.send("eth_requestAccounts", []);
                setWalletAddress(accounts[0]);
            } catch (err) { setStatus({ type: 'danger', message: "User denied MetaMask access or closed the selection window." }); }
        } else {
            setStatus({ type: 'danger', message: "Please install MetaMask." });
        }
    };

    const handleMintBatchChange = async (batchcode) => {
        setMintForm({ ...mintForm, batchcode });
        if (batchcode) {
            const batch = batchMaster.find(b => b.batchcode === batchcode);
            const courseTypeStr = String(batch?.courseid?.course_type).toLowerCase();
            const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
            const isDip = courseTypeStr === '02' || courseTypeStr.includes('diploma');
            const isDegree = courseTypeStr === '03' || courseTypeStr.includes('bachelor') || courseTypeStr.includes('degree');
            const reqSems = isCert ? 1 : isDip ? 2 : isDegree ? 6 : 4;
            
            const stdRes = await fetch(`http://localhost:5000/api/students/batch/${encodeURIComponent(batchcode)}`);
            const students = await stdRes.json();
            
            const resRes = await fetch(`http://localhost:5000/api/results/batch/${encodeURIComponent(batchcode)}`);
            const results = await resRes.json();
            
            const certRes = await fetch(`http://localhost:5000/api/certificates/batch/${encodeURIComponent(batchcode)}`);
            const batchCerts = certRes.ok ? await certRes.json() : [];
            
            const aggregated = students.map(st => {
                const studentResults = results.filter(r => (r.sid === st.sid || r.sid?.sid === st.sid));
                const semsCompleted = new Set(studentResults.map(r => r.semester)).size;
                
                let totalMarks = 0;
                let maxMarks = 0;
                let semScores = {};
                
                studentResults.forEach(r => { 
                    totalMarks += r.total_score; 
                    maxMarks += (r.marks.length * 100); 
                    semScores[r.semester] = `${r.total_score}/${r.marks.length * 100}`;
                });
                
                let grade = 'N/A';
                if (semsCompleted > 0) {
                    const pct = (totalMarks / maxMarks) * 100;
                    if (pct >= 90) grade = 'A+';
                    else if (pct >= 80) grade = 'A';
                    else if (pct >= 70) grade = 'B';
                    else if (pct >= 60) grade = 'C';
                    else if (pct >= 50) grade = 'D';
                    else grade = 'F';
                }

                const existingCert = batchCerts.find(c => c.sid === st.sid);

                return { ...st, semsCompleted, reqSems, totalMarks, maxMarks, grade, semScores, courseName: batch?.courseid?.coursename, isCert, existingCert };
            });
            setMintStudents(aggregated);
        } else {
            setMintStudents([]);
        }
    };

    const handleMintCertificate = async (studentData) => {
        if (!walletAddress) return setStatus({ type: 'danger', message: "Connect MetaMask first." });
        setIsMinting(true); setStatus({ type: '', message: '' });

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            let detailedScore = `${studentData.totalMarks}/${studentData.maxMarks}`;
            if (!studentData.isCert && studentData.semScores) {
                const semsStr = Object.keys(studentData.semScores)
                    .sort((a,b) => Number(a) - Number(b))
                    .map(sem => `Sem ${sem}: ${studentData.semScores[sem]}`)
                    .join(', ');
                detailedScore = `${semsStr} | Overall: ${detailedScore}`;
            }

            const transactionDetails = `Minting cert for ${studentData.fname} ${studentData.lname} (${studentData.courseName})`;
            const tx = await contract.mintCertificate(
                transactionDetails, studentData.sid, `${studentData.fname} ${studentData.lname}`, 'TBD_IN_DB', 
                detailedScore, studentData.grade, studentData.courseName, studentData.phone, studentData.email
            );
            const receipt = await tx.wait();

            const dbResponse = await fetch('http://localhost:5000/api/certificates/save', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sid: studentData.sid,
                    batchcode: mintForm.batchcode,
                    fullname: `${studentData.fname} ${studentData.lname}`,
                    email: studentData.email,
                    phone: studentData.phone,
                    examid: `EX-${mintForm.batchcode}`,
                    coursename: studentData.courseName,
                    score: detailedScore,
                    grade: studentData.grade,
                    transactionHash: receipt.hash,
                    blockHash: receipt.blockHash,
                    contractAddress: CONTRACT_ADDRESS
                })
            });

            if (dbResponse.ok) {
                const dbData = await dbResponse.json();
                setStatus({ type: 'success', message: `Certificate ${dbData.crtid} minted and saved securely on chain!` });
            } else {
                setStatus({ type: 'danger', message: 'Minted on chain, but DB save failed.' });
            }
        } catch (err) {
            setStatus({ type: 'danger', message: `Transaction failed: ${err.message}` });
        } finally {
            setIsMinting(false);
        }
    };

    const handleStudentSearch = async (e) => {
        e.preventDefault();
        if (!svSearchSid) return;
        try {
            const stuRes = await fetch(`http://localhost:5000/api/students/${svSearchSid}`);
            if (!stuRes.ok) throw new Error('Student not found');
            setSvStudent(await stuRes.json());
            
            const resRes = await fetch(`http://localhost:5000/api/results/student/${svSearchSid}`);
            setSvResults(resRes.ok ? await resRes.json() : []);

            const examRes = await fetch(`http://localhost:5000/api/exams/student/${svSearchSid}`);
            setSvExams(examRes.ok ? await examRes.json() : []);
            
            setStatus({ type: 'success', message: 'Student fetched.' });
        } catch (err) {
            setSvStudent(null);
            setStatus({ type: 'danger', message: err.message });
        }
    };

    const navItemClass = (tab) => `list-group-item list-group-item-action py-3 px-4 fw-bold border-0 border-bottom ${activeTab === tab ? 'bg-light text-primary-custom border-start border-primary border-4' : 'text-muted'}`;

    return (
        <div className="container py-4">
            <h3 className="fw-bold mb-4">Administration Panel</h3>
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="list-group shadow-sm rounded-4 overflow-hidden">
                        <button className={navItemClass('courses')} onClick={() => setActiveTab('courses')}><i className="bi bi-book me-2"></i> Manage Courses</button>
                        <button className={navItemClass('batchMaster')} onClick={() => setActiveTab('batchMaster')}><i className="bi bi-collection me-2"></i> Manage batchMaster</button>
                        <button className={navItemClass('exams')} onClick={() => setActiveTab('exams')}><i className="bi bi-journal-text me-2"></i> Schedule Exams</button>
                        <button className={navItemClass('results')} onClick={() => setActiveTab('results')}><i className="bi bi-file-earmark-check me-2"></i> Add Results</button>
                        <button className={navItemClass('mint')} onClick={() => setActiveTab('mint')}><i className="bi bi-shield-check me-2"></i> Mint Certificate</button>
                        <button className={navItemClass('studentView')} onClick={() => setActiveTab('studentView')}><i className="bi bi-person-lines-fill me-2"></i> Student View</button>
                    </div>
                </div>
                
                <div className="col-md-9">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-body p-5">
                            <h4 className="fw-bold mb-4 text-dark text-capitalize">{activeTab.replace('-', ' ')}</h4>
                            
                            {status.message && (
                                <div className={`alert alert-${status.type} alert-dismissible fade show rounded-3`} role="alert">
                                    {status.message}
                                    <button type="button" className="btn-close" onClick={() => setStatus({type:'', message:''})}></button>
                                </div>
                            )}

                            {activeTab === 'courses' && (
                                <form onSubmit={handleCreateCourse}>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Course Name</label>
                                            <input type="text" className="form-control form-control-lg bg-light border-0" required onChange={e => setCourseForm({...courseForm, coursename: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Abbreviation</label>
                                            <input type="text" className="form-control form-control-lg bg-light border-0" placeholder="e.g. ACAD" required onChange={e => setCourseForm({...courseForm, course_abbr: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Course Year</label>
                                            <select className="form-select form-select-lg bg-light border-0" required onChange={e => setCourseForm({...courseForm, course_year: e.target.value})} defaultValue={new Date().getFullYear().toString()}>
                                                {[...Array(5)].map((_, i) => {
                                                    const yr = new Date().getFullYear() + i;
                                                    return <option key={yr} value={yr}>{yr}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Type</label>
                                            <select className="form-select form-select-lg bg-light border-0" onChange={e => setCourseForm({...courseForm, course_type: e.target.value})}>
                                                <option value="01">01 - Certificate</option>
                                                <option value="02">02 - Diploma</option>
                                                <option value="03">03 - Degree</option>
                                                <option value="04">04 - Master</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Price ($)</label>
                                            <input type="number" className="form-control form-control-lg bg-light border-0" required onChange={e => setCourseForm({...courseForm, price: e.target.value})} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Duration (Hours)</label>
                                            <input type="number" className="form-control form-control-lg bg-light border-0" required onChange={e => setCourseForm({...courseForm, duration: e.target.value})} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm">Create Course</button>
                                </form>
                            )}

                            {activeTab === 'batchMaster' && (
                                <form onSubmit={handleCreateBatch}>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Select Course</label>
                                            <select className="form-select form-select-lg bg-light border-0" required onChange={e => setBatchForm({...batchForm, courseid: e.target.value})}>
                                                <option value="">Choose...</option>
                                                {courses.map(c => <option key={c.courseid} value={c.courseid}>{c.coursename} ({c.courseid})</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Year</label>
                                            <select className="form-select form-select-lg bg-light border-0" required onChange={e => setBatchForm({...batchForm, year: e.target.value})} defaultValue={new Date().getFullYear().toString()}>
                                                {[...Array(5)].map((_, i) => {
                                                    const yr = new Date().getFullYear() + i;
                                                    return <option key={yr} value={yr}>{yr}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Start Date</label>
                                            <input type="date" className="form-control form-control-lg bg-light border-0" required onChange={e => setBatchForm({...batchForm, start_date: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">End Date</label>
                                            <input type="date" className="form-control form-control-lg bg-light border-0" required onChange={e => setBatchForm({...batchForm, end_date: e.target.value})} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm">Generate Batchcode</button>
                                </form>
                            )}

                            {activeTab === 'exams' && (
                                <form onSubmit={handleCreateExam}>
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Select Batch</label>
                                        <select className="form-select form-select-lg bg-light border-0" required onChange={e => {
                                            const selectedBatch = batchMaster.find(b => b.batchcode === e.target.value);
                                            setExamForm({...examForm, batchcode: e.target.value, selectedBatchDetail: selectedBatch});
                                        }}>
                                            <option value="">Choose Batch...</option>
                                            {batchMaster.map(b => (
                                                <option key={b.batchcode} value={b.batchcode}>{b.courseid?.coursename} ({b.batchcode})</option>
                                            ))}
                                        </select>
                                        {examForm.selectedBatchDetail && (
                                            <div className="mt-2 p-2 bg-white rounded border d-inline-block text-muted small">
                                                <i className="bi bi-calendar3 me-2 text-primary-custom"></i>
                                                <strong>Start Date:</strong> {new Date(examForm.selectedBatchDetail.start_date).toLocaleDateString()} &nbsp;|&nbsp; 
                                                <strong>End Date:</strong> {new Date(examForm.selectedBatchDetail.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Exam Date</label>
                                        <input type="date" className="form-control form-control-lg bg-light border-0" required onChange={e => setExamForm({...examForm, exam_date: e.target.value})} />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm">Generate Exam Slot</button>
                                </form>
                            )}

                            {activeTab === 'results' && (
                                <div>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Select Batch</label>
                                            <select className="form-select form-select-lg bg-light border-0" required onChange={handleResultBatchChange} value={resultForm.batchcode}>
                                                <option value="">Choose Batch...</option>
                                                {batchMaster.map(b => <option key={b.batchcode} value={b.batchcode}>{b.courseid?.coursename} ({b.batchcode})</option>)}
                                            </select>
                                        </div>
                                        {resultForm.batchcode && (() => {
                                            const courseTypeStr = String(batchMaster.find(b => b.batchcode === resultForm.batchcode)?.courseid?.course_type).toLowerCase();
                                            const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
                                            return !isCert;
                                        })() && (
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-bold text-uppercase">Semester</label>
                                                <select className="form-select form-select-lg bg-light border-0" required onChange={handleSemesterChange} value={resultForm.semester}>
                                                    <option value="">Choose Semester...</option>
                                                    {availableSems.map(sem => (
                                                        <option key={sem} value={sem} disabled={clearedSems.has(sem)}>
                                                            Semester {sem} {clearedSems.has(sem) ? '(Cleared)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {resultStudents.length > 0 && resultForm.semester && (
                                        <div className="table-responsive mt-4">
                                            <table className="table align-middle border">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Student ID</th>
                                                        <th>Name</th>
                                                        <th>Subject Marks (out of 100)</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {resultStudents.map(student => {
                                                        const batch = batchMaster.find(b => b.batchcode === resultForm.batchcode);
                                                        const courseTypeStr = String(batch?.courseid?.course_type).toLowerCase();
                                                        const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
                                                        const existingResult = batchResults.find(r => (r.sid === student.sid || r.sid?.sid === student.sid) && r.semester === resultForm.semester);
                                                        
                                                        return (
                                                            <tr key={student.sid}>
                                                                <td className="fw-bold">{student.sid}</td>
                                                                <td>{student.fname} {student.lname}</td>
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        {marksData[student.sid]?.map((mark, i) => {
                                                                            const isPassed = existingResult && existingResult.marks && existingResult.marks[i] && existingResult.marks[i].score >= 50;
                                                                            const placeholder = isCert ? (i === 0 ? "Theory" : "Practical") : `S${i+1}`;
                                                                            return (
                                                                                <input key={i} type="number" 
                                                                                    className="form-control form-control-sm text-center" 
                                                                                    style={{ width: isCert ? '90px' : '60px' }} 
                                                                                    placeholder={placeholder} 
                                                                                    value={mark} 
                                                                                    disabled={isPassed}
                                                                                    onChange={e => handleMarkChange(student.sid, i, e.target.value)} 
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-success rounded-pill fw-bold" onClick={() => saveStudentResult(student.sid)}>Save</button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'mint' && (
                                <div>
                                    <div className="mb-4 d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                                        <span className="fw-bold text-dark"><i className="bi bi-wallet2 me-2"></i> Web3 Identity</span>
                                        {walletAddress ? (
                                            <span className="badge bg-success px-3 py-2 rounded-pill"><i className="bi bi-check-circle me-1"></i> Connected: {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span>
                                        ) : (
                                            <button className="btn btn-warning rounded-pill fw-bold" onClick={connectWallet}>Connect MetaMask</button>
                                        )}
                                    </div>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Select Course</label>
                                            <select className="form-select form-select-lg bg-light border-0" required onChange={e => setMintForm({...mintForm, courseid: e.target.value})}>
                                                <option value="">Choose Course...</option>
                                                {courses.map(c => <option key={c.courseid} value={c.courseid}>{c.coursename}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Select Batch</label>
                                            <select className="form-select form-select-lg bg-light border-0" required onChange={e => handleMintBatchChange(e.target.value)} value={mintForm.batchcode}>
                                                <option value="">Choose Batch...</option>
                                                {batchMaster.filter(b => b.courseid?.courseid === mintForm.courseid).map(b => (
                                                    <option key={b.batchcode} value={b.batchcode}>{b.batchcode}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {mintStudents.length > 0 && (
                                        <div className="table-responsive mt-4">
                                            <table className="table align-middle border">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Student ID</th>
                                                        <th>Name</th>
                                                        <th>Course Progress</th>
                                                        <th>Score Details</th>
                                                        <th>Grade</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mintStudents.map(student => (
                                                        <tr key={student.sid}>
                                                            <td className="fw-bold">{student.sid}</td>
                                                            <td>{student.fname} {student.lname}</td>
                                                            <td>
                                                                <span className={`badge ${student.semsCompleted === student.reqSems ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                    {student.isCert ? 'N/A' : `${student.semsCompleted} / ${student.reqSems} Sems`}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {!student.isCert && student.semScores && (
                                                                    <div className="mb-1">
                                                                        {Object.keys(student.semScores).map(sem => (
                                                                            <span key={sem} className="badge bg-secondary me-1" style={{ fontSize: '0.75rem' }}>
                                                                                Sem {sem}: {student.semScores[sem]}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                                                    Overall: {student.totalMarks} / {student.maxMarks}
                                                                </div>
                                                            </td>
                                                            <td className="fw-bold text-primary-custom">{student.grade}</td>
                                                            <td>
                                                                {student.existingCert ? (
                                                                    <div>
                                                                        <span className="badge bg-success mb-2 d-block"><i className="bi bi-patch-check-fill me-1"></i>Minted</span>
                                                                        <a href={`/verify/${student.existingCert.crtid}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill fw-bold w-100">
                                                                            <i className="bi bi-file-earmark-pdf me-1"></i> Preview PDF
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        className="btn btn-sm btn-dark rounded-pill fw-bold" 
                                                                        disabled={isMinting || !walletAddress || student.semsCompleted < student.reqSems}
                                                                        onClick={() => handleMintCertificate(student)}
                                                                    >
                                                                        {isMinting ? <span className="spinner-border spinner-border-sm"></span> : 'Mint Cert'}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'studentView' && (
                                <div>
                                    <form onSubmit={handleStudentSearch} className="mb-4">
                                        <div className="input-group">
                                            <input type="text" className="form-control form-control-lg bg-light border-0" placeholder="Enter Student ID (e.g. SID-001)" value={svSearchSid} onChange={e => setSvSearchSid(e.target.value)} required />
                                            <button type="submit" className="btn btn-primary px-4 fw-bold">Search</button>
                                        </div>
                                    </form>

                                    {svStudent && (
                                        <div>
                                            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-light">
                                                <div className="card-body">
                                                    <h5 className="fw-bold"><i className="bi bi-person-circle me-2"></i>{svStudent.fname} {svStudent.lname} ({svStudent.sid})</h5>
                                                </div>
                                            </div>

                                            {/* Exam Status */}
                                            <h5 className="fw-bold mb-3 mt-4">Exam Status</h5>
                                            <div className="card shadow-sm border-0 rounded-4 mb-4">
                                                <div className="card-body">
                                                    {svExams.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <table className="table table-hover align-middle mb-0">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>Exam ID</th>
                                                                        <th>Batch Code</th>
                                                                        <th>Exam Date & Time</th>
                                                                        <th>Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {svExams.map(exam => {
                                                                        const examDate = new Date(exam.exam_date);
                                                                        const isPast = examDate < new Date();
                                                                        const appeared = svResults.some(r => r.examid === exam.examid);
                                                                        return (
                                                                            <tr key={exam.examid}>
                                                                                <td><strong>{exam.examid}</strong></td>
                                                                                <td>{exam.batchcode}</td>
                                                                                <td>{examDate.toLocaleString()}</td>
                                                                                <td>
                                                                                    {isPast ? (
                                                                                        appeared ? <span className="badge bg-success">Appeared</span> : <span className="badge bg-danger">Missed</span>
                                                                                    ) : (
                                                                                        <span className="badge bg-warning text-dark">Upcoming</span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted mb-0">No exams found for this student.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Result Status */}
                                            <h5 className="fw-bold mb-3 mt-4">Result Status</h5>
                                            {svStudent.prevCode?.length > 0 || svStudent.current_batch ? (
                                                [...(svStudent.prevCode || []), svStudent.current_batch].filter(Boolean).map((batch, idx) => {
                                                    const batchResults = svResults.filter(r => r.exam?.batchcode === batch.batchcode);
                                                    if (batchResults.length === 0) return null;
                                                    
                                                    const sems = [...new Set(batchResults.map(r => r.semester))].sort();
                                                    const isDiploma = batch.courseDetails?.course_type === '02';
                                                    const requiredSems = isDiploma ? 2 : 1;
                                                    
                                                    let totalAvg = 0;

                                                    return (
                                                        <div key={`res-${idx}`} className="card shadow-sm border-0 rounded-4 mb-4">
                                                            <div className="card-header bg-dark text-white p-3">
                                                                <h6 className="mb-0 fw-bold">{batch.courseDetails?.coursename || batch.batchcode}</h6>
                                                            </div>
                                                            <div className="card-body">
                                                                {sems.map(sem => {
                                                                    const semResult = batchResults.find(r => r.semester === sem);
                                                                    const pct = (semResult.total_score / (semResult.marks.length * 100)) * 100;
                                                                    totalAvg += pct;
                                                                    return (
                                                                        <div key={`sem-${sem}`} className="mb-4">
                                                                            <h6 className="fw-bold text-secondary">Semester {sem}</h6>
                                                                            <div className="table-responsive">
                                                                                <table className="table table-bordered table-sm mb-2">
                                                                                    <thead className="table-light">
                                                                                        <tr>
                                                                                            <th>Subject</th>
                                                                                            <th>Score</th>
                                                                                            <th>Max Score</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {semResult.marks.map((m, midx) => (
                                                                                            <tr key={midx}>
                                                                                                <td>{m.subject}</td>
                                                                                                <td>{m.score}</td>
                                                                                                <td>{m.max_score}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                            <p className="small mb-0"><strong>Total Score:</strong> {semResult.total_score} | <strong>Percentage:</strong> {pct.toFixed(2)}% | <strong>Grade:</strong> {semResult.grade}</p>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {sems.length >= requiredSems && (
                                                                    <div className="alert alert-success mt-3 mb-0">
                                                                        <h6 className="fw-bold mb-1">Final Aggregate Result</h6>
                                                                        <p className="mb-0">Average Percentage: <strong>{(totalAvg / requiredSems).toFixed(2)}%</strong></p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-muted">No results available.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
