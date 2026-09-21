import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"idCardId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"IdCardMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"resultId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"ResultMinted","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"marksScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"idCards","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"batchCode","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"string","name":"photoUrl","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBlockHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"string","name":"_marksScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"mintCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_idCardId","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_batchCode","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_photoUrl","type":"string"}],"name":"mintIdCard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_resultId","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_batchCode","type":"string"},{"internalType":"string","name":"_examId","type":"string"},{"internalType":"string","name":"_semester","type":"string"},{"internalType":"string","name":"_marksData","type":"string"},{"internalType":"string","name":"_totalScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"}],"name":"mintResult","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"results","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"resultId","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"batchCode","type":"string"},{"internalType":"string","name":"examId","type":"string"},{"internalType":"string","name":"semester","type":"string"},{"internalType":"string","name":"marksData","type":"string"},{"internalType":"string","name":"totalScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"}];

const CandidateDashboard = () => {
    const [student, setStudent] = useState(null);
    const [batchMaster, setBatchMaster] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [idCards, setIdCards] = useState([]);
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCertBatch, setSelectedCertBatch] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isMintingId, setIsMintingId] = useState(false);
    const idCardRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const sessionStudent = JSON.parse(localStorage.getItem('student'));
        if (!sessionStudent) {
            navigate('/');
            return;
        }
        fetchStudentData(sessionStudent.sid);
        fetchAvailableBatchMaster();
        fetchCertificates(sessionStudent.sid);
        fetchIdCards(sessionStudent.sid);
        fetchResults(sessionStudent.sid);
        fetchExams(sessionStudent.sid);
    }, [navigate]);

    const fetchStudentData = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/students/${sid}`);
        if (res.ok) setStudent(await res.json());
    };

    const fetchAvailableBatchMaster = async () => {
        const res = await fetch('http://localhost:5000/api/batchMaster');
        if (res.ok) setBatchMaster(await res.json());
    };

    const fetchCertificates = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/certificates/${sid}`);
        if (res.ok) setCertificates(await res.json());
    };

    const fetchIdCards = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/idcards/${sid}`);
        if (res.ok) setIdCards(await res.json());
    };

    const fetchResults = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/results/student/${sid}`);
        if (res.ok) setResults(await res.json());
    };

    const fetchExams = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/exams/student/${sid}`);
        if (res.ok) setExams(await res.json());
    };

    const handleRequestIdCard = async () => {
        if (!student || !student.batchcode) return setStatus({ type: 'danger', message: "No active enrollment." });
        
        setIsMintingId(true);
        setStatus({ type: '', message: '' });

        try {
            const activeBatch = batchMaster.find(b => b.batchcode === student.batchcode);
            const courseName = activeBatch?.courseid?.coursename || 'Unknown Course';
            const idCardId = `ID-${student.batchcode}-${student.sid}`;

            const dbResponse = await fetch('http://localhost:5000/api/idcards/request', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idCardId,
                    sid: student.sid,
                    fullname: `${student.fname} ${student.lname}`,
                    courseName,
                    batchcode: student.batchcode,
                    phone: student.phone,
                    email: student.email,
                    photoUrl: student.photo,
                    validUntil: activeBatch?.end_date || null
                })
            });

            if (dbResponse.ok) {
                setStatus({ type: 'success', message: 'ID Card requested successfully! Pending Admin approval.' });
                fetchIdCards(student.sid);
            } else {
                const errData = await dbResponse.json();
                setStatus({ type: 'danger', message: errData.error || 'Failed to request ID Card.' });
            }
        } catch (err) {
            setStatus({ type: 'danger', message: `Request failed: ${err.message}` });
        } finally {
            setIsMintingId(false);
        }
    };
    
    const handleDownloadId = async () => {
        if (!idCardRef.current) return;
        try {
            const canvas = await html2canvas(idCardRef.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('portrait', 'mm', [54, 86]); // standard ID card size
            pdf.addImage(imgData, 'PNG', 0, 0, 54, 86);
            pdf.save(`IDCard_${student.sid}.pdf`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/students/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sid: student.sid, batchcode: selectedBatch })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: 'Successfully enrolled in course!' });
                fetchStudentData(student.sid);
            } else {
                setStatus({ type: 'danger', message: data.error });
            }
        } catch (err) {
            setStatus({ type: 'danger', message: 'Enrollment failed.' });
        }
    };

    if (!student) return (
        <div className="text-center mt-5" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="row g-4">
                {/* Profile Sidebar */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-4 text-center overflow-hidden h-100">
                        <div className="bg-dark" style={{ height: '100px' }}></div>
                        <div className="card-body px-4 pb-4" style={{ marginTop: '-50px' }}>
                            {student.photo ? (
                                <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Profile" className="rounded-circle d-inline-block mb-3 shadow border border-4 border-white" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            ) : (
                                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow border border-4 border-white" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                    {student.fname.charAt(0)}{student.lname.charAt(0)}
                                </div>
                            )}
                            <h4 className="fw-bold text-dark">{student.fname} {student.lname}</h4>
                            <p className="text-primary-custom fw-semibold mb-2">ID : {student.sid}</p>
                            <hr className="my-3 text-muted mt-4" />
                            <ul className="list-unstyled text-start mb-0 mt-4">
                                <li className="mb-2"><i className="bi bi-envelope text-primary-custom me-2"></i> <span className='text-dark fw-medium me-2'>Email : </span> {student.email}</li>
                                <li className="mb-2"><i className="bi bi-telephone text-primary-custom me-2"></i> <span className='text-dark fw-medium me-2'>Phone : </span>{student.phone}</li>
                                <li><i className="bi bi-geo-alt text-primary-custom me-2"></i><span className='text-dark fw-medium me-2'>City : </span> {student.city}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Dashboard Main Content */}
                <div className="col-lg-8">

                    {/* Enrollment Section */}
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3"><i className="bi bi-plus-circle text-primary-custom me-2"></i>Enroll in a New Course</h4>
                            {student.current_batch && !certificates.some(c => c.batchcode === student.current_batch.batchcode) ? (
                                <div className="alert alert-info border-0 shadow-sm bg-light text-dark">
                                    <i className="bi bi-info-circle-fill text-primary-custom me-2"></i>
                                    You are currently enrolled in an active course. Complete it to unlock new enrollments.
                                </div>
                            ) : (
                                <form onSubmit={handleEnroll}>
                                    {status.message && <div className={`alert alert-${status.type} border-0 shadow-sm`}>{status.message}</div>}
                                    <div className="row g-3 align-items-center">
                                        <div className="col-md-9">
                                            <select className="form-select form-select-lg bg-light border-0 text-muted" required onChange={e => setSelectedBatch(e.target.value)}>
                                                <option value="">-- Browse Available Batches --</option>
                                                {batchMaster.filter(b => {
                                                    const courseName = b.courseid?.coursename;
                                                    const isCompleted = certificates.some(c => c.coursename === courseName);
                                                    const isActive = student.current_batch?.courseid?.coursename === courseName;
                                                    return !isCompleted && !isActive;
                                                }).map(b => (
                                                    <option key={b.batchcode} value={b.batchcode}>{b.courseid?.coursename} ({b.batchcode})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold">Enroll</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Active Course */}
                    {student.current_batch && !certificates.some(c => c.batchcode === student.current_batch.batchcode) && (
                        <div className="mb-5">
                            <h4 className="fw-bold mb-3 text-dark">Active Course</h4>
                            <div className="card shadow-sm border-0 rounded-4 card-hover-shadow overflow-hidden">
                                <div className="row g-0">
                                    <div className="col-md-4">
                                        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop" className="img-fluid h-100" alt="Course" style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card-body p-4 position-relative">
                                            <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill">In Progress</span>
                                            <h5 className="card-title fw-bold text-dark mb-2">{student.current_batch.courseid?.coursename}</h5>
                                            <p className="text-muted small mb-3">Batch Code: <strong>{student.current_batch.batchcode}</strong></p>
                                            <div className="d-flex align-items-center text-secondary-custom small fw-semibold">
                                                <i className="bi bi-clock me-2"></i>{student.current_batch.courseid?.duration} Hours
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ID Card Section */}
                    {student.current_batch && (
                        <div className="mb-5">
                            <h4 className="fw-bold mb-3 text-dark">Web3 ID Card</h4>
                            {idCards.some(id => id.batchcode === student.current_batch.batchcode) ? (
                                (() => {
                                    const activeIdCard = idCards.find(id => id.batchcode === student.current_batch.batchcode);
                                    if (activeIdCard.status === 'Pending') {
                                        return (
                                            <div className="card shadow-sm border-0 rounded-4 bg-light text-center py-5">
                                                <div className="card-body">
                                                    <i className="bi bi-hourglass-split text-warning mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                                                    <h5 className="fw-bold">ID Card Request Pending</h5>
                                                    <p className="text-muted mb-0">Your request is currently awaiting admin approval and blockchain minting.</p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="card shadow-sm border-0 rounded-4">
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h5 className="fw-bold text-success mb-0"><i className="bi bi-patch-check-fill me-2"></i>Minted on Blockchain</h5>
                                                    <button className="btn btn-outline-primary btn-sm rounded-pill fw-bold px-3" onClick={handleDownloadId}>
                                                        <i className="bi bi-download me-2"></i>Download PDF
                                                    </button>
                                                </div>
                                                <div className="d-flex justify-content-center">
                                                    {/* ID Card Render Frame */}
                                                    <div ref={idCardRef} className="card shadow border-2" style={{ width: '350px', height: '550px', background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)', overflow: 'hidden', position: 'relative' }}>
                                                        <div className="bg-primary text-white text-center py-3">
                                                            <h5 className="fw-bold mb-0 tracking-wide text-uppercase">Student ID Card</h5>
                                                            <small className="opacity-75">Web3 Verified</small>
                                                        </div>
                                                        <div className="text-center mt-3 px-3">
                                                            {student.photo ? (
                                                                <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Student" className="rounded-circle shadow-sm border border-4 border-white mx-auto mb-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div className="bg-secondary text-white rounded-circle shadow-sm border border-4 border-white mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                                                    <i className="bi bi-person"></i>
                                                                </div>
                                                            )}
                                                            <h4 className="fw-bold text-dark mb-1 fs-5">{student.fname} {student.lname}</h4>
                                                            <p className="text-primary-custom fw-bold mb-1 small">ID: {student.sid}</p>
                                                            <p className="text-muted small fw-semibold mb-2">{activeIdCard.courseName}</p>
                                                        </div>
                                                        <div className="px-4">
                                                            <div className="row g-1 small text-start" style={{ fontSize: '0.8rem' }}>
                                                                <div className="col-4 fw-bold text-muted">Batch:</div><div className="col-8 text-dark fw-semibold text-break">{activeIdCard.batchcode}</div>
                                                                <div className="col-4 fw-bold text-muted">Phone:</div><div className="col-8 text-dark fw-semibold text-break">{student.phone}</div>
                                                                <div className="col-4 fw-bold text-muted">Email:</div><div className="col-8 text-dark fw-semibold text-break">{student.email}</div>
                                                                {activeIdCard.transaction_hash && (
                                                                    <>
                                                                        <div className="col-4 fw-bold text-muted mt-1">Tx Hash:</div>
                                                                        <div className="col-8 text-primary fw-semibold mt-1" style={{ fontSize: '0.7rem' }}>
                                                                            {activeIdCard.transaction_hash.slice(0, 12)}...{activeIdCard.transaction_hash.slice(-8)}
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {activeIdCard.validUntil && (
                                                                    <>
                                                                        <div className="col-4 fw-bold text-danger mt-1">Valid Until:</div>
                                                                        <div className="col-8 text-danger fw-bold mt-1">{new Date(activeIdCard.validUntil).toLocaleDateString()}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="position-absolute bottom-0 w-100 text-center pb-2">
                                                            <div className="d-inline-block bg-white p-1 rounded shadow-sm border">
                                                                <QRCodeSVG value={`http://localhost:5173/verify-id/${activeIdCard.idCardId}`} size={65} />
                                                            </div>
                                                            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.6rem' }}>Scan to Verify Authenticity</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="card shadow-sm border-0 rounded-4 bg-light text-center py-5">
                                    <div className="card-body">
                                        <i className="bi bi-person-badge text-primary-custom mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                                        <h5 className="fw-bold">No ID Card Generated Yet</h5>
                                        <p className="text-muted mb-4">Request your tamper-proof Web3 ID Card for {student.current_batch.courseid?.coursename}</p>
                                        <button className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm px-5" onClick={handleRequestIdCard} disabled={isMintingId}>
                                            {isMintingId ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Requesting...</>
                                            ) : (
                                                <><i className="bi bi-send me-2"></i>Request ID Card</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completed Courses */}
                    <div>
                        <h4 className="fw-bold mb-3 text-dark">Completed Courses & Certificates</h4>
                        {certificates?.length > 0 ? (
                            <div className="row g-4">
                                {certificates.map((cert, index) => (
                                    <div key={index} className="col-md-6">
                                        <div className="card shadow-sm border-0 rounded-4 h-100 card-hover-shadow">
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h5 className="fw-bold text-dark">{cert.coursename || 'Unknown Course'}</h5>
                                                    <i className="bi bi-patch-check-fill text-success fs-3"></i>
                                                </div>
                                                <p className="text-muted small mb-2">Batch: <strong>{cert.batchcode}</strong></p>
                                                <p className="text-muted small mb-3">Certificate ID: <strong>{cert.crtid}</strong></p>

                                                <button
                                                    className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold"
                                                    onClick={() => window.open(`/verify/${encodeURIComponent(cert.crtid)}`, '_blank')}
                                                >
                                                    <i className="bi bi-eye me-2"></i>View Certificate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-5 bg-white rounded-4 shadow-sm text-muted">
                                <i className="bi bi-award fs-1 text-light mb-3"></i>
                                <p className="mb-0">You haven't completed any courses yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Exam Status */}
                    <div className="mt-5">
                        <h4 className="fw-bold mb-3 text-dark">Exam Status</h4>
                        <div className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-body p-4">
                                {exams.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Exam ID</th>
                                                    <th>Batch Code</th>
                                                    <th>Exam Date & Time</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.map(exam => {
                                                    const examDate = new Date(exam.exam_date);
                                                    const isPast = examDate < new Date();
                                                    const appeared = results.some(r => r.examid === exam.examid);
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
                                    <p className="text-muted mb-0">No exams scheduled.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Result Status */}
                    <div className="mt-5">
                        <h4 className="fw-bold mb-3 text-dark">Result Status</h4>
                        {(() => {
                            const batches = [...(student.prevCode || []), student.current_batch].filter(Boolean);
                            if (batches.length === 0) return <p className="text-muted">No results available yet.</p>;

                            const renderedBatches = batches.map((batch, idx) => {
                                const batchResults = results.filter(r => r.exam?.batchcode === batch.batchcode || r.examid === `EX-${batch.batchcode}` || r.examid.includes(batch.batchcode));
                                if (batchResults.length === 0) return null;

                                const sems = [...new Set(batchResults.map(r => r.semester))].sort();
                                const isDiploma = batch.courseDetails?.course_type === '02';
                                const requiredSems = isDiploma ? 2 : 1;

                                let totalAvg = 0;

                                return (
                                    <div key={`res-${idx}`} className="card shadow-sm border-0 rounded-4 mb-4 result-pdf-container" id={`result-container-${batch.batchcode}`}>
                                        <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0 fw-bold">{batch.courseDetails?.coursename || batch.batchcode}</h5>
                                            <button 
                                                className="btn btn-sm btn-outline-light" 
                                                onClick={async () => {
                                                    const elem = document.getElementById(`result-container-${batch.batchcode}`);
                                                    if(elem) {
                                                        const canvas = await html2canvas(elem, { scale: 2 });
                                                        const imgData = canvas.toDataURL('image/png');
                                                        const pdf = new jsPDF('p', 'mm', 'a4');
                                                        const pdfWidth = pdf.internal.pageSize.getWidth();
                                                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                                        pdf.save(`Transcript_${batch.batchcode}_${student.sid}.pdf`);
                                                    }
                                                }}
                                            >
                                                <i className="bi bi-download me-1"></i> Download PDF
                                            </button>
                                        </div>
                                        <div className="card-body p-4 row">
                                            <div className="col-md-9">
                                                {sems.map(sem => {
                                                    const semResult = batchResults.find(r => r.semester === sem);
                                                    const pct = (semResult.total_score / (semResult.marks.length * 100)) * 100;
                                                    totalAvg += pct;
                                                    const isCert = batch.courseDetails?.course_type === '01';
                                                    return (
                                                        <div key={`sem-${sem}`} className="mb-4 border-bottom pb-3">
                                                            <h6 className="fw-bold text-secondary">{isCert ? 'Course Results' : `Semester ${sem}`} (Exam: {semResult.examid})</h6>
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
                                                            <p className="small mb-1"><strong>Total Score:</strong> {semResult.total_score} | <strong>Percentage:</strong> {pct.toFixed(2)}% | <strong>Grade:</strong> {semResult.grade}</p>
                                                            {semResult.transaction_details && (
                                                                <p className="small text-muted mb-0"><i className="bi bi-link-45deg"></i> Blockchain TX: {semResult.transaction_details}</p>
                                                            )}
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
                                            <div className="col-md-3 text-center border-start d-flex flex-column align-items-center justify-content-center">
                                                <h6 className="fw-bold text-muted mb-3">Scan to Verify</h6>
                                                <QRCodeSVG 
                                                    value={`${window.location.origin}/verify-result/${student.sid}/${batch.batchcode}`} 
                                                    size={120} 
                                                    level="H" 
                                                    includeMargin={true} 
                                                />
                                                <p className="small text-muted mt-2 mb-0">Blockchain Secured</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }).filter(Boolean);

                            if (renderedBatches.length === 0) return <p className="text-muted">No results available yet.</p>;
                            return renderedBatches;
                        })()}
                    </div>

                    {/* Certificate Status */}
                    <div className="mt-5">
                        <h4 className="fw-bold mb-3 text-dark">Certificate Status</h4>
                        <div className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Select Batch / Course</label>
                                    <select className="form-select bg-light" value={selectedCertBatch} onChange={(e) => setSelectedCertBatch(e.target.value)}>
                                        <option value="">-- Choose Completed Course --</option>
                                        {certificates.map(cert => (
                                            <option key={cert.batchcode} value={cert.batchcode}>{cert.coursename} ({cert.batchcode})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCertBatch && (
                                    <div className="mt-4 p-3 border rounded bg-white">
                                        {certificates.find(c => c.batchcode === selectedCertBatch) ? (() => {
                                            const cert = certificates.find(c => c.batchcode === selectedCertBatch);
                                            return (
                                                <div>
                                                    <h5 className="fw-bold text-success mb-3"><i className="bi bi-patch-check-fill me-2"></i>Certificate Available</h5>
                                                    <p className="mb-1"><strong>Course:</strong> {cert.coursename}</p>
                                                    <p className="mb-1"><strong>Grade:</strong> {cert.grade}</p>
                                                    <p className="mb-3"><strong>TX Hash:</strong> <span className="font-monospace small">{cert.transaction_details}</span></p>
                                                    <a href={`/verify/${cert.crtid}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                                                        <i className="bi bi-download me-2"></i>View & Download Certificate
                                                    </a>
                                                </div>
                                            );
                                        })() : (
                                            <div className="text-muted"><i className="bi bi-info-circle me-2"></i>No certificate found or generated yet for this batch.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
