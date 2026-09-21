import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"idCardId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"IdCardMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"resultId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"ResultMinted","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"marksScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"idCards","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"batchCode","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"string","name":"photoUrl","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBlockHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"string","name":"_marksScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"mintCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_idCardId","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_batchCode","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_photoUrl","type":"string"}],"name":"mintIdCard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_resultId","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_batchCode","type":"string"},{"internalType":"string","name":"_examId","type":"string"},{"internalType":"string","name":"_semester","type":"string"},{"internalType":"string","name":"_marksData","type":"string"},{"internalType":"string","name":"_totalScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"}],"name":"mintResult","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"results","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"resultId","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"batchCode","type":"string"},{"internalType":"string","name":"examId","type":"string"},{"internalType":"string","name":"semester","type":"string"},{"internalType":"string","name":"marksData","type":"string"},{"internalType":"string","name":"totalScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"}];
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [batchMaster, setBatchMaster] = useState([]);
    const [exams, setExams] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [courseForm, setCourseForm] = useState({ coursename: '', course_type: '01', course_abbr: '', course_year: new Date().getFullYear().toString(), price: '', duration: '' });
    const [batchForm, setBatchForm] = useState({ courseid: '', start_date: '', end_date: '', year: new Date().getFullYear().toString() });
    const [examForm, setExamForm] = useState({ batchcode: '', exam_date: '', exam_time: '', candidates: '', semester: '' });
    const [examFormStudents, setExamFormStudents] = useState([]);
    const [resultForm, setResultForm] = useState({ batchcode: '', semester: 1 });
    const [resultStudents, setResultStudents] = useState([]);
    const [marksData, setMarksData] = useState({}); // { sid: ['80', '90', '70', '85', '88'] }
    const [availableSems, setAvailableSems] = useState([]);
    const [clearedSems, setClearedSems] = useState(new Set());
    const [batchResults, setBatchResults] = useState([]);
    const [viewResultSid, setViewResultSid] = useState(null);

    const [mintForm, setMintForm] = useState({ courseid: '', batchcode: '' });
    const [mintStudents, setMintStudents] = useState([]);
    
    const [walletAddress, setWalletAddress] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    // ID Card Requests State
    const [pendingIdCards, setPendingIdCards] = useState([]);
    const [approvedIdCard, setApprovedIdCard] = useState(null); // stores the newly minted card data for immediate summary UI
    const approvedIdCardRef = React.useRef(null);

    // Student View State
    const [svSearchCourse, setSvSearchCourse] = useState('');
    const [svSearchBatch, setSvSearchBatch] = useState('');
    const [svBatchStudents, setSvBatchStudents] = useState([]);
    const [svSearchSid, setSvSearchSid] = useState('');
    const [svStudent, setSvStudent] = useState(null);
    const [svResults, setSvResults] = useState([]);
    const [svExams, setSvExams] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchBatchMaster();
        fetchExams();
        fetchPendingIdCards();
    }, []);

    useEffect(() => {
        if (activeTab === 'idCardRequests') {
            fetchPendingIdCards();
        }
    }, [activeTab]);

    const fetchPendingIdCards = async () => {
        const res = await fetch('http://localhost:5000/api/idcards/admin/pending');
        if (res.ok) setPendingIdCards(await res.json());
    };

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
            if (res.ok) { 
                setStatus({ type: 'success', message: 'Course created successfully!' }); 
                fetchCourses(); 
            } else {
                const data = await res.json();
                setStatus({ type: 'danger', message: data.error || 'Error creating course' });
            }
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
            const isCert = String(examForm.selectedBatchDetail?.courseid?.course_type).toLowerCase() === '01' || String(examForm.selectedBatchDetail?.courseid?.course_type).toLowerCase().includes('certificate');
            const effectiveSemester = isCert ? undefined : examForm.semester;
            
            const unenrolled = examFormStudents.filter(st => {
                const isEnrolled = exams.some(ex => ex.batchcode === examForm.batchcode && (isCert || String(ex.semester) === String(effectiveSemester)) && ex.candidates?.includes(st.sid));
                return !isEnrolled;
            });
            
            const candidates = unenrolled.map(st => st.sid);
            if (candidates.length === 0) {
                setStatus({ type: 'warning', message: 'All students are already enrolled for this exam slot.' });
                return;
            }

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
        if (!window.ethereum) return setStatus({ type: 'danger', message: "MetaMask is not installed." });
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

        setStatus({ type: '', message: 'Initiating blockchain transaction...' });
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const examId = `EX-${resultForm.batchcode}`;
            const resultId = `RSID/${examId}/${sid}/${resultForm.semester}`;
            const transactionDetails = `Minting result for ${sid}, Semester ${resultForm.semester}`;
            const marksDataStr = JSON.stringify(marks);

            const tx = await contract.mintResult(
                transactionDetails,
                resultId,
                sid,
                resultForm.batchcode,
                examId,
                resultForm.semester.toString(),
                marksDataStr,
                total.toString(),
                grade
            );
            const receipt = await tx.wait();

            const res = await fetch('http://localhost:5000/api/results/mint', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    resultId,
                    examid: examId, 
                    sid, 
                    semester: resultForm.semester, 
                    marks,
                    transactionHash: receipt.hash,
                    blockHash: receipt.blockHash,
                    contractAddress: CONTRACT_ADDRESS
                }) 
            });
            if (res.ok) { 
                setStatus({ type: 'success', message: `Result saved securely on blockchain for ${sid}` }); 
                // Refetch batch results to update UI state
                const resRes = await fetch(`http://localhost:5000/api/results/batch/${encodeURIComponent(resultForm.batchcode)}`);
                const newResults = resRes.ok ? await resRes.json() : [];
                setBatchResults(newResults);
            } else {
                setStatus({ type: 'danger', message: 'Minted on chain, but failed to save to database.' });
            }
        } catch (err) { setStatus({ type: 'danger', message: 'Error saving result: ' + err.message }); }
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
                let failedSubjects = [];
                
                studentResults.forEach(r => { 
                    totalMarks += r.total_score; 
                    maxMarks += (r.marks.length * 100); 
                    semScores[r.semester] = `${r.total_score}/${r.marks.length * 100}`;
                    
                    if (r.marks) {
                        r.marks.forEach(m => {
                            if (m.score < 50) {
                                failedSubjects.push(m.subject);
                            }
                        });
                    }
                });
                
                let grade = 'N/A';
                if (semsCompleted > 0) {
                    const pct = (totalMarks / maxMarks) * 100;
                    if (failedSubjects.length > 0) grade = 'F';
                    else if (pct >= 90) grade = 'A+';
                    else if (pct >= 80) grade = 'A';
                    else if (pct >= 70) grade = 'B';
                    else if (pct >= 60) grade = 'C';
                    else if (pct >= 50) grade = 'D';
                    else grade = 'F';
                }

                const existingCert = batchCerts.find(c => c.sid === st.sid);

                return { ...st, semsCompleted, reqSems, totalMarks, maxMarks, grade, semScores, courseName: batch?.courseid?.coursename, isCert, existingCert, failedSubjects };
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
                setMintStudents(prev => prev.map(s => s.sid === studentData.sid ? { ...s, existingCert: dbData } : s));
            } else {
                setStatus({ type: 'danger', message: 'Minted on chain, but DB save failed.' });
            }
        } catch (err) {
            setStatus({ type: 'danger', message: `Transaction failed: ${err.message}` });
        } finally {
            setIsMinting(false);
        }
    };

    const handleStudentSearch = async (e, forceSid = null) => {
        if (e) e.preventDefault();
        const searchId = forceSid || svSearchSid;
        if (!searchId) return;
        setSvSearchSid(searchId);
        try {
            const stuRes = await fetch(`http://localhost:5000/api/students/${searchId}`);
            if (!stuRes.ok) throw new Error('Student not found');
            setSvStudent(await stuRes.json());
            
            const resRes = await fetch(`http://localhost:5000/api/results/student/${searchId}`);
            setSvResults(resRes.ok ? await resRes.json() : []);

            const examRes = await fetch(`http://localhost:5000/api/exams/student/${searchId}`);
            setSvExams(examRes.ok ? await examRes.json() : []);

            const certRes = await fetch(`http://localhost:5000/api/certificates/${searchId}`);
            const certs = certRes.ok ? await certRes.json() : [];
            
            const idRes = await fetch(`http://localhost:5000/api/idcards/${searchId}`);
            const ids = idRes.ok ? await idRes.json() : [];
            
            setSvStudent(prev => ({ ...prev, certificates: certs, idCards: ids }));
            setApprovedIdCard(null); // Clear any previous success modal
            
            setStatus({ type: 'success', message: 'Student fetched.' });
        } catch (err) {
            setSvStudent(null);
            setStatus({ type: 'danger', message: err.message });
        }
    };

    const handleApproveIdCard = async (reqCard) => {
        if (!window.ethereum) return setStatus({ type: 'danger', message: "MetaMask is not installed." });
        
        setIsMinting(true);
        setStatus({ type: '', message: '' });

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const transactionDetails = `Minting ID Card for ${reqCard.fullname} (${reqCard.courseName})`;
            const sidStr = typeof reqCard.sid === 'object' ? reqCard.sid.sid : reqCard.sid;

            const tx = await contract.mintIdCard(
                transactionDetails, reqCard.idCardId, sidStr, reqCard.fullname, reqCard.courseName, reqCard.batchcode, reqCard.phone, reqCard.email, reqCard.photoUrl || 'N/A'
            );
            
            const receipt = await tx.wait();

            const dbResponse = await fetch('http://localhost:5000/api/idcards/mint', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idCardId: reqCard.idCardId,
                    transactionHash: receipt.hash,
                    blockHash: receipt.blockHash,
                    contractAddress: CONTRACT_ADDRESS
                })
            });

            if (dbResponse.ok) {
                const updatedCard = await dbResponse.json();
                setStatus({ type: 'success', message: 'ID Card approved and minted on Blockchain!' });
                setApprovedIdCard(updatedCard.card);
                fetchPendingIdCards();
            } else {
                setStatus({ type: 'danger', message: 'Minted on chain, but failed to save status.' });
            }
        } catch (err) {
            setStatus({ type: 'danger', message: `Transaction failed: ${err.message}` });
        } finally {
            setIsMinting(false);
        }
    };

    const handleAdminProactiveIdMint = async (studentData, activeBatch) => {
        if (!window.ethereum) return setStatus({ type: 'danger', message: "MetaMask is not installed." });
        
        setIsMinting(true);
        setStatus({ type: '', message: '' });
        
        const idCardId = `ID-${activeBatch.batchcode}-${studentData.sid}`;
        
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const transactionDetails = `Minting ID Card for ${studentData.fname} ${studentData.lname}`;
            
            await fetch('http://localhost:5000/api/idcards/request', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idCardId,
                    sid: studentData.sid,
                    fullname: `${studentData.fname} ${studentData.lname}`,
                    courseName: activeBatch.courseid?.coursename || 'Unknown',
                    batchcode: activeBatch.batchcode,
                    phone: studentData.phone,
                    email: studentData.email,
                    photoUrl: studentData.photo,
                    validUntil: activeBatch.end_date || null
                })
            });
            
            const tx = await contract.mintIdCard(
                transactionDetails, idCardId, studentData.sid, `${studentData.fname} ${studentData.lname}`, activeBatch.courseid?.coursename || 'Unknown', activeBatch.batchcode, studentData.phone, studentData.email, studentData.photo || 'N/A'
            );
            
            const receipt = await tx.wait();

            const dbResponse = await fetch('http://localhost:5000/api/idcards/mint', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idCardId,
                    transactionHash: receipt.hash,
                    blockHash: receipt.blockHash,
                    contractAddress: CONTRACT_ADDRESS
                })
            });

            if (dbResponse.ok) {
                const updatedCard = await dbResponse.json();
                setStatus({ type: 'success', message: 'ID Card generated securely on the blockchain!' });
                setApprovedIdCard(updatedCard.card);
                
                // Update the local student state with the new ID cards directly to avoid clearing approvedIdCard
                const idRes = await fetch(`http://localhost:5000/api/idcards/${studentData.sid}`);
                if (idRes.ok) {
                    const ids = await idRes.json();
                    setSvStudent(prev => ({ ...prev, idCards: ids }));
                }
            }
        } catch (err) {
            setStatus({ type: 'danger', message: `Transaction failed: ${err.message}` });
        } finally {
            setIsMinting(false);
        }
    };

    const handleSvBatchChange = async (batchcode) => {
        setSvSearchBatch(batchcode);
        setSvStudent(null);
        if (batchcode) {
            try {
                const res = await fetch(`http://localhost:5000/api/students/batch/${encodeURIComponent(batchcode)}`);
                if (res.ok) {
                    setSvBatchStudents(await res.json());
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            setSvBatchStudents([]);
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
                        <button className={navItemClass('idCardRequests')} onClick={() => setActiveTab('idCardRequests')}><i className="bi bi-person-badge me-2"></i> ID Card Requests</button>
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
                                <>
                                    <div className="mb-5">
                                        <h5 className="fw-bold mb-3">Existing Batches</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle border">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Batch Code</th>
                                                        <th>Course Name</th>
                                                        <th>Start Date</th>
                                                        <th>End Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {batchMaster.map(batch => (
                                                        <tr key={batch.batchcode}>
                                                            <td className="fw-bold">{batch.batchcode}</td>
                                                            <td>{batch.courseid?.coursename || 'N/A'}</td>
                                                            <td>{new Date(batch.start_date).toLocaleDateString()}</td>
                                                            <td>{new Date(batch.end_date).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                    {batchMaster.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center text-muted py-3">No batches found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <h5 className="fw-bold mb-3">Create New Batch</h5>
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
                                </>
                            )}

                            {activeTab === 'exams' && (
                                <>
                                    <form onSubmit={handleCreateExam}>
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Select Batch</label>
                                        <select className="form-select form-select-lg bg-light border-0" required onChange={async e => {
                                            const val = e.target.value;
                                            const selectedBatch = batchMaster.find(b => b.batchcode === val);
                                            setExamForm({...examForm, batchcode: val, selectedBatchDetail: selectedBatch});
                                            if (val) {
                                                try {
                                                    const stdRes = await fetch(`http://localhost:5000/api/students/batch/${encodeURIComponent(val)}`);
                                                    const students = await stdRes.json();
                                                    setExamFormStudents(students);
                                                } catch (err) { console.error(err); }
                                            } else {
                                                setExamFormStudents([]);
                                            }
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
                                    {examForm.selectedBatchDetail && (() => {
                                        const courseTypeStr = String(examForm.selectedBatchDetail.courseid?.course_type).toLowerCase();
                                        const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
                                        if (isCert) return null;

                                        const isDip = courseTypeStr === '02' || courseTypeStr.includes('diploma');
                                        const isDegree = courseTypeStr === '03' || courseTypeStr.includes('bachelor') || courseTypeStr.includes('degree');
                                        const reqSems = isCert ? 1 : isDip ? 2 : isDegree ? 6 : 4;
                                        
                                        let elapsedYears = 1;
                                        const match = examForm.batchcode.match(/\/(\d{2})(\d{4})\d{2}$/);
                                        if (match) {
                                            const month = parseInt(match[1], 10);
                                            const year = parseInt(match[2], 10);
                                            const batchDate = new Date(year, month - 1);
                                            elapsedYears = Math.floor((new Date() - batchDate) / (1000 * 60 * 60 * 24 * 365.25)) + 1;
                                            if (elapsedYears < 1) elapsedYears = 1;
                                        }
                                        const maxYearSems = elapsedYears * 2;
                                        const finalSems = Math.min(reqSems, maxYearSems);
                                        const semsArray = Array.from({ length: finalSems }, (_, i) => i + 1);

                                        return (
                                            <div className="mb-4">
                                                <label className="form-label text-muted small fw-bold text-uppercase">Semester</label>
                                                <select className="form-select form-select-lg bg-light border-0" required onChange={e => setExamForm({...examForm, semester: e.target.value})} value={examForm.semester}>
                                                    <option value="">Choose Semester...</option>
                                                    {semsArray.map(sem => (
                                                        <option key={sem} value={sem}>Semester {sem}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })()}
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Exam Date</label>
                                        <input type="date" className="form-control form-control-lg bg-light border-0" required onChange={e => setExamForm({...examForm, exam_date: e.target.value})} value={examForm.exam_date} />
                                    </div>
                                    {examForm.selectedBatchDetail && (() => {
                                        const courseTypeStr = String(examForm.selectedBatchDetail.courseid?.course_type).toLowerCase();
                                        const isCert = courseTypeStr === '01' || courseTypeStr.includes('certificate');
                                        const timeSlots = isCert 
                                            ? ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "01:00 PM - 03:00 PM", "03:00 PM - 05:00 PM"]
                                            : ["09:00 AM - 12:00 PM", "10:00 AM - 01:00 PM", "11:00 AM - 02:00 PM", "12:00 PM - 03:00 PM", "01:00 PM - 04:00 PM", "02:00 PM - 05:00 PM"];
                                        
                                        return (
                                            <div className="mb-4">
                                                <label className="form-label text-muted small fw-bold text-uppercase">Exam Time</label>
                                                <select className="form-select form-select-lg bg-light border-0" required onChange={e => setExamForm({...examForm, exam_time: e.target.value})} value={examForm.exam_time}>
                                                    <option value="">Choose Time Slot...</option>
                                                    {timeSlots.map(slot => (
                                                        <option key={slot} value={slot}>{slot}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })()}
                                    {examForm.batchcode && examForm.selectedBatchDetail && (() => {
                                        const isCert = String(examForm.selectedBatchDetail.courseid?.course_type).toLowerCase() === '01' || String(examForm.selectedBatchDetail.courseid?.course_type).toLowerCase().includes('certificate');
                                        const effectiveSemester = isCert ? undefined : examForm.semester;

                                        const unenrolled = examFormStudents.filter(st => {
                                            const isEnrolled = exams.some(ex => ex.batchcode === examForm.batchcode && (isCert || String(ex.semester) === String(effectiveSemester)) && ex.candidates?.includes(st.sid));
                                            return !isEnrolled;
                                        });

                                        return (
                                            <div className="mb-4">
                                                <label className="form-label text-muted small fw-bold text-uppercase">Candidates Not Enrolled ({unenrolled.length})</label>
                                                {unenrolled.length > 0 ? (
                                                    <div className="border rounded p-2 bg-white" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                                        <ul className="list-group list-group-flush">
                                                            {unenrolled.map(st => (
                                                                <li key={st.sid} className="list-group-item py-1 px-2 small">{st.sid} - {st.fullname}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <div className="alert alert-success py-2 mb-0 small">All students are already enrolled for this exam slot.</div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                    <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm">Generate Exam Slot</button>
                                </form>
                                <div className="mt-5">
                                    <h5 className="fw-bold mb-3">Created Exam Slots</h5>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle border">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Exam ID</th>
                                                    <th>Batch Code</th>
                                                    <th>Semester</th>
                                                    <th>Exam Date & Time</th>
                                                    <th>Candidates</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.filter(ex => !examForm.batchcode || ex.batchcode === examForm.batchcode).map(ex => (
                                                    <tr key={ex.examid}>
                                                        <td className="fw-bold">{ex.examid}</td>
                                                        <td>{ex.batchcode}</td>
                                                        <td>{ex.semester || 'N/A'}</td>
                                                        <td>{new Date(ex.exam_date).toLocaleDateString()} {ex.exam_time && <><br/><small className="text-muted">{ex.exam_time}</small></>}</td>
                                                        <td>{ex.candidates?.length || 0}</td>
                                                    </tr>
                                                ))}
                                                {exams.filter(ex => !examForm.batchcode || ex.batchcode === examForm.batchcode).length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-muted py-3">No exam slots found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                </>
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
                                                        <th>Photo</th>
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
                                                        const numSubjects = isCert ? 2 : 5;
                                                        const existingResult = batchResults.find(r => (r.sid === student.sid || r.sid?.sid === student.sid) && r.semester === resultForm.semester);
                                                        const isAllPassed = existingResult && existingResult.marks && existingResult.marks.every(m => m.score >= 50) && existingResult.marks.length >= numSubjects;
                                                        const hasMinted = !!(existingResult && existingResult.transaction_details);
                                                        const shouldDisableSave = isAllPassed && hasMinted;
                                                        
                                                        return (
                                                            <React.Fragment key={student.sid}>
                                                                <tr>
                                                                    <td>
                                                                        {student.photo ? (
                                                                            <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Student" className="rounded-circle border object-fit-cover" style={{width: '40px', height: '40px'}} />
                                                                        ) : (
                                                                            <i className="bi bi-person-circle fs-3 text-secondary"></i>
                                                                        )}
                                                                    </td>
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
                                                                        <button className="btn btn-sm btn-success rounded-pill fw-bold" disabled={shouldDisableSave} onClick={() => saveStudentResult(student.sid)}>Save</button>
                                                                        {existingResult && (
                                                                            <button className="btn btn-sm btn-outline-info rounded-pill fw-bold ms-2" onClick={() => setViewResultSid(viewResultSid === student.sid ? null : student.sid)}>
                                                                                {viewResultSid === student.sid ? 'Hide' : 'View'}
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                {viewResultSid === student.sid && existingResult && (
                                                                    <tr>
                                                                        <td colSpan="5">
                                                                            <div className="p-3 bg-white rounded border shadow-sm my-2">
                                                                                <h6 className="fw-bold text-secondary mb-3">Result Info for {student.fname} {!isCert && `(Semester ${existingResult.semester})`}</h6>
                                                                                <div className="table-responsive">
                                                                                    <table className="table table-bordered table-sm mb-2">
                                                                                        <thead className="table-light">
                                                                                            <tr>
                                                                                                <th>Subject</th>
                                                                                                <th>Score</th>
                                                                                                <th>Max Score</th>
                                                                                                <th>Status</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {existingResult.marks.map((m, midx) => (
                                                                                                <tr key={midx}>
                                                                                                    <td>{m.subject}</td>
                                                                                                    <td>{m.score}</td>
                                                                                                    <td>{m.max_score}</td>
                                                                                                    <td>{m.score >= 50 ? <span className="badge bg-success">Passed</span> : <span className="badge bg-danger">Failed</span>}</td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                                <p className="small mb-1"><strong>Total Score:</strong> {existingResult.total_score} | <strong>Grade:</strong> {existingResult.grade}</p>
                                                                                {existingResult.transaction_details && (
                                                                                    <p className="small text-muted mb-0"><i className="bi bi-link-45deg"></i> Blockchain TX: {existingResult.transaction_details}</p>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
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
                                                        <th>Photo</th>
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
                                                            <td>
                                                                {student.photo ? (
                                                                    <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Student" className="rounded-circle border object-fit-cover" style={{width: '40px', height: '40px'}} />
                                                                ) : (
                                                                    <i className="bi bi-person-circle fs-3 text-secondary"></i>
                                                                )}
                                                            </td>
                                                            <td className="fw-bold">{student.sid}</td>
                                                            <td>{student.fname} {student.lname}</td>
                                                            <td>
                                                                <span className={`badge ${student.semsCompleted === student.reqSems && student.failedSubjects.length === 0 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                    {student.isCert ? (student.failedSubjects.length > 0 ? 'Failed' : 'N/A') : `${student.semsCompleted} / ${student.reqSems} Sems`}
                                                                </span>
                                                                {student.failedSubjects && student.failedSubjects.length > 0 && (
                                                                    <div className="mt-1" style={{ fontSize: '0.75rem' }}>
                                                                        <span className="text-danger fw-bold">Failed/Pending: </span>
                                                                        {student.failedSubjects.join(', ')}
                                                                    </div>
                                                                )}
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
                                                                        <div className="mb-2 text-center bg-white p-1 rounded d-inline-block">
                                                                            <QRCodeSVG value={`http://localhost:5173/verify/${student.existingCert.crtid}`} size={64} />
                                                                        </div>
                                                                        <a href={`/verify/${student.existingCert.crtid}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill fw-bold w-100">
                                                                            <i className="bi bi-file-earmark-pdf me-1"></i> Preview PDF
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        className="btn btn-sm btn-dark rounded-pill fw-bold" 
                                                                        disabled={isMinting || !walletAddress || student.semsCompleted < student.reqSems || (student.failedSubjects && student.failedSubjects.length > 0)}
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

                            {activeTab === 'idCardRequests' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Pending ID Card Requests</h5>
                                        <button className="btn btn-outline-primary btn-sm rounded-pill fw-bold" onClick={fetchPendingIdCards}><i className="bi bi-arrow-clockwise me-1"></i> Refresh</button>
                                    </div>
                                    
                                    {approvedIdCard && (
                                        <div className="alert alert-success border-2 shadow-sm rounded-4 mb-4">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h5 className="fw-bold mb-1"><i className="bi bi-check-circle-fill me-2"></i>Minted Successfully!</h5>
                                                    <p className="mb-0 small">Transaction Hash: <span className="font-monospace text-muted">{approvedIdCard.transaction_hash}</span></p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="bg-white p-1 rounded shadow-sm d-inline-block mb-1">
                                                        <QRCodeSVG value={`http://localhost:5173/verify-id/${approvedIdCard.idCardId}`} size={50} />
                                                    </div>
                                                    <br/>
                                                    <a href={`http://localhost:5000/api/idcards/verify/${approvedIdCard.idCardId}`} className="btn btn-sm btn-dark rounded-pill" target="_blank" rel="noopener noreferrer">View Data</a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {pendingIdCards.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                            <p className="fw-bold">No pending requests.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light text-muted small text-uppercase">
                                                    <tr>
                                                        <th>Student</th>
                                                        <th>Course / Batch</th>
                                                        <th>Contact</th>
                                                        <th>Request Date</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingIdCards.map(req => (
                                                        <tr key={req._id}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    {req.photoUrl ? (
                                                                        <img src={`http://localhost:5000/uploads/${req.photoUrl}`} alt="Student" className="rounded-circle border object-fit-cover me-3" style={{width: '40px', height: '40px'}} />
                                                                    ) : (
                                                                        <i className="bi bi-person-circle fs-3 text-secondary me-3"></i>
                                                                    )}
                                                                    <div>
                                                                        <div className="fw-bold text-dark">{req.fullname}</div>
                                                                        <div className="small text-muted">{typeof req.sid === 'object' ? req.sid.sid : req.sid}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="fw-bold">{req.courseName}</div>
                                                                <div className="small text-muted">{req.batchcode}</div>
                                                            </td>
                                                            <td>
                                                                <div className="small"><i className="bi bi-telephone-fill text-muted me-1"></i>{req.phone}</div>
                                                                <div className="small"><i className="bi bi-envelope-fill text-muted me-1"></i>{req.email}</div>
                                                            </td>
                                                            <td className="small">{new Date(req.created_at).toLocaleDateString()}</td>
                                                            <td>
                                                                <button 
                                                                    className="btn btn-sm btn-primary rounded-pill fw-bold" 
                                                                    disabled={isMinting}
                                                                    onClick={() => handleApproveIdCard(req)}
                                                                >
                                                                    {isMinting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-cpu me-1"></i>Approve & Mint</>}
                                                                </button>
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
                                    <div className="row g-4 mb-4 pb-4 border-bottom">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Select Course</label>
                                            <select className="form-select form-select-lg bg-light border-0" onChange={e => { setSvSearchCourse(e.target.value); handleSvBatchChange(''); }} value={svSearchCourse}>
                                                <option value="">Choose Course...</option>
                                                {courses.map(c => <option key={c.courseid} value={c.courseid}>{c.coursename}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Select Batch</label>
                                            <select className="form-select form-select-lg bg-light border-0" onChange={e => handleSvBatchChange(e.target.value)} value={svSearchBatch} disabled={!svSearchCourse}>
                                                <option value="">Choose Batch...</option>
                                                {batchMaster.filter(b => b.courseid?.courseid === svSearchCourse).map(b => (
                                                    <option key={b.batchcode} value={b.batchcode}>{b.batchcode}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <h6 className="text-muted text-center mb-4">OR SEARCH BY ID</h6>
                                    <form onSubmit={handleStudentSearch} className="mb-4">
                                        <div className="input-group">
                                            <input type="text" className="form-control form-control-lg bg-light border-0" placeholder="Enter Student ID (e.g. SID-001)" value={svSearchSid} onChange={e => setSvSearchSid(e.target.value)} />
                                            <button type="submit" className="btn btn-primary px-4 fw-bold">Search</button>
                                        </div>
                                    </form>

                                    {!svStudent && svBatchStudents.length > 0 && (
                                        <div className="table-responsive mt-4">
                                            <h5 className="fw-bold mb-3">Students in {svSearchBatch}</h5>
                                            <table className="table table-hover align-middle border">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Photo</th>
                                                        <th>Student ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {svBatchStudents.map(student => (
                                                        <tr key={student.sid}>
                                                            <td>
                                                                {student.photo ? (
                                                                    <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Student" className="rounded-circle border object-fit-cover" style={{width: '40px', height: '40px'}} />
                                                                ) : (
                                                                    <i className="bi bi-person-circle fs-3 text-secondary"></i>
                                                                )}
                                                            </td>
                                                            <td className="fw-bold">{student.sid}</td>
                                                            <td>{student.fname} {student.lname}</td>
                                                            <td>{student.email}</td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-primary rounded-pill fw-bold" onClick={() => handleStudentSearch(null, student.sid)}>
                                                                    View Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {svStudent && (
                                        <div>
                                            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-light">
                                                <div className="card-body">
                                                    <h5 className="fw-bold"><i className="bi bi-person-circle me-2"></i>{svStudent.fname} {svStudent.lname} ({svStudent.sid})</h5>
                                                </div>
                                            </div>

                                            {/* Certificates */}
                                            <h5 className="fw-bold mb-3 mt-4">Certificates</h5>
                                            {svStudent.certificates && svStudent.certificates.length > 0 ? (
                                                <div className="row g-3 mb-4">
                                                    {svStudent.certificates.map(cert => (
                                                        <div key={cert.crtid} className="col-md-6">
                                                            <div className="card shadow-sm border-success border-2 rounded-4">
                                                                <div className="card-body">
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div>
                                                                            <h6 className="fw-bold mb-1 text-success"><i className="bi bi-patch-check-fill me-2"></i>{cert.coursename}</h6>
                                                                            <p className="small text-muted mb-1">ID: {cert.crtid}</p>
                                                                            <p className="small fw-bold mb-2">Grade: {cert.grade}</p>
                                                                            <a href={`/verify/${cert.crtid}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill fw-bold mt-2">
                                                                                <i className="bi bi-file-earmark-pdf me-1"></i> Preview PDF
                                                                            </a>
                                                                        </div>
                                                                        <div className="bg-white p-1 rounded border">
                                                                            <QRCodeSVG value={`http://localhost:5173/verify/${cert.crtid}`} size={80} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted mb-4">No certificates found.</p>
                                            )}

                                            {/* ID Cards */}
                                            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                                                <h5 className="fw-bold mb-0">ID Cards</h5>
                                                {(!svStudent.idCards || svStudent.idCards.length === 0) && svStudent.current_batch && (
                                                    <button 
                                                        className="btn btn-sm btn-primary rounded-pill fw-bold shadow-sm"
                                                        disabled={isMinting}
                                                        onClick={() => {
                                                            const activeBatch = batchMaster.find(b => b.batchcode === svStudent.current_batch.batchcode);
                                                            handleAdminProactiveIdMint(svStudent, activeBatch);
                                                        }}
                                                    >
                                                        {isMinting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-cpu me-1"></i>Proactive Generate ID</>}
                                                    </button>
                                                )}
                                            </div>

                                            {approvedIdCard && activeTab === 'studentView' && (
                                                <div className="alert alert-success border-2 shadow-sm rounded-4 mb-4">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h5 className="fw-bold mb-1"><i className="bi bi-check-circle-fill me-2"></i>Minted Successfully!</h5>
                                                            <p className="mb-0 small">Transaction Hash: <span className="font-monospace text-muted">{approvedIdCard.transaction_hash}</span></p>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="bg-white p-1 rounded shadow-sm d-inline-block mb-1">
                                                                <QRCodeSVG value={`http://localhost:5173/verify-id/${approvedIdCard.idCardId}`} size={50} />
                                                            </div>
                                                            <br/>
                                                            <a href={`http://localhost:5000/api/idcards/verify/${approvedIdCard.idCardId}`} className="btn btn-sm btn-dark rounded-pill" target="_blank" rel="noopener noreferrer">View Data</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {svStudent.idCards && svStudent.idCards.length > 0 ? (
                                                <div className="row g-3 mb-4">
                                                    {svStudent.idCards.map(idCard => (
                                                        <div key={idCard.idCardId} className="col-md-6">
                                                            <div className={`card shadow-sm border-2 rounded-4 ${idCard.status === 'Minted' ? 'border-primary' : 'border-warning'}`}>
                                                                <div className="card-body">
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div>
                                                                            <h6 className={`fw-bold mb-1 ${idCard.status === 'Minted' ? 'text-primary' : 'text-warning text-dark'}`}>
                                                                                {idCard.status === 'Minted' ? <><i className="bi bi-shield-check me-2"></i>Minted ID</> : <><i className="bi bi-hourglass-split me-2"></i>Pending Request</>}
                                                                            </h6>
                                                                            <p className="small text-muted mb-1">ID: {idCard.idCardId}</p>
                                                                            <p className="small text-muted mb-1">Batch: {idCard.batchcode}</p>
                                                                            {idCard.validUntil && (
                                                                                <p className="small fw-bold text-danger mb-2">Valid Until: {new Date(idCard.validUntil).toLocaleDateString()}</p>
                                                                            )}
                                                                            {idCard.status === 'Minted' && (
                                                                                <a href={`http://localhost:5000/api/idcards/verify/${idCard.idCardId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill fw-bold mt-2">
                                                                                    <i className="bi bi-eye me-1"></i> View Data
                                                                                </a>
                                                                            )}
                                                                            {idCard.status === 'Pending' && (
                                                                                <button className="btn btn-sm btn-primary rounded-pill fw-bold mt-2" disabled={isMinting} onClick={() => handleApproveIdCard(idCard)}>
                                                                                    {isMinting ? <span className="spinner-border spinner-border-sm"></span> : 'Approve & Mint'}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        {idCard.status === 'Minted' && (
                                                                            <div className="bg-white p-1 rounded border">
                                                                                <QRCodeSVG value={`http://localhost:5173/verify-id/${idCard.idCardId}`} size={80} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted mb-4">No ID cards generated.</p>
                                            )}

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
                                                                                <td>{examDate.toLocaleDateString()} {exam.exam_time && <><br/><small className="text-muted">{exam.exam_time}</small></>}</td>
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
                                            {(() => {
                                                const batches = [...(svStudent.prevCode || []), svStudent.current_batch].filter(Boolean);
                                                if (batches.length === 0 || svResults.length === 0) return <p className="text-muted">No results available.</p>;

                                                const renderedBatches = batches.map((batch, idx) => {
                                                    const batchResults = svResults.filter(r => r.exam?.batchcode === batch.batchcode || r.examid === `EX-${batch.batchcode}` || r.examid.includes(batch.batchcode));
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
                                                });
                                                
                                                return renderedBatches.every(b => b === null) ? <p className="text-muted">No results available.</p> : renderedBatches;
                                            })()}
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
