import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
    const [student, setStudent] = useState(null);
    const [batchMaster, setBatchMaster] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedCertBatch, setSelectedCertBatch] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
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

    const fetchResults = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/results/student/${sid}`);
        if (res.ok) setResults(await res.json());
    };

    const fetchExams = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/exams/student/${sid}`);
        if (res.ok) setExams(await res.json());
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
                            {student.current_batch ? (
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
                                                {batchMaster.map(b => (
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
                                const batchResults = results.filter(r => r.exam?.batchcode === batch.batchcode);
                                if (batchResults.length === 0) return null;

                                const sems = [...new Set(batchResults.map(r => r.semester))].sort();
                                const isDiploma = batch.courseDetails?.course_type === '02';
                                const requiredSems = isDiploma ? 2 : 1;

                                let totalAvg = 0;

                                return (
                                    <div key={`res-${idx}`} className="card shadow-sm border-0 rounded-4 mb-4">
                                        <div className="card-header bg-dark text-white p-3">
                                            <h5 className="mb-0 fw-bold">{batch.courseDetails?.coursename || batch.batchcode}</h5>
                                        </div>
                                        <div className="card-body p-4">
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
