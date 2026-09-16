import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const IdVerification = () => {
    const { id } = useParams();
    const [idData, setIdData] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        const verifyIdCard = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/idcards/verify/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setIdData(data);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                setStatus('error');
            }
        };

        if (id) {
            verifyIdCard();
        }
    }, [id]);

    if (status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    <h4 className="mt-4 text-muted">Verifying Blockchain ID...</h4>
                </div>
            </div>
        );
    }

    if (status === 'error' || !idData) {
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-x-circle text-danger mb-3" style={{ fontSize: '5rem' }}></i>
                <h1 className="fw-bold text-dark mb-3">Verification Failed</h1>
                <p className="text-muted fs-5 mb-4">We could not find a valid ID Card matching this cryptographic signature.</p>
                <Link to="/" className="btn btn-primary rounded-pill px-4">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3 shadow" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-check-lg" style={{ fontSize: '3rem' }}></i>
                </div>
                <h1 className="fw-bold text-success mb-2">ID Card Verified</h1>
                <p className="text-muted fs-5">This ID Card has been securely verified on the Web3 blockchain ledger.</p>
            </div>

            <div className="row justify-content-center g-4">
                <div className="col-lg-5">
                    <div className="card shadow border-2" style={{ background: 'linear-gradient(to bottom, #ffffff, #f0f8ff)', overflow: 'hidden' }}>
                        <div className="bg-primary text-white text-center py-3">
                            <h5 className="fw-bold mb-0 tracking-wide text-uppercase">Student ID Card</h5>
                            <small className="opacity-75">Web3 Verified</small>
                        </div>
                        <div className="text-center mt-3 px-3">
                            {idData.photoUrl ? (
                                <img src={`http://localhost:5000/uploads/${idData.photoUrl}`} alt="Student" className="rounded-circle shadow-sm border border-4 border-white mx-auto mb-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            ) : (
                                <div className="bg-secondary text-white rounded-circle shadow-sm border border-4 border-white mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                    <i className="bi bi-person"></i>
                                </div>
                            )}
                            <h4 className="fw-bold text-dark mb-1 fs-5">{idData.fullname}</h4>
                            <p className="text-primary-custom fw-bold mb-1 small">ID: {idData.sid}</p>
                            <p className="text-muted small fw-semibold mb-2">{idData.courseName}</p>
                        </div>
                        <div className="px-4 pb-4">
                            <div className="row g-1 small text-start" style={{ fontSize: '0.8rem' }}>
                                <div className="col-4 fw-bold text-muted">Batch:</div><div className="col-8 text-dark fw-semibold text-break">{idData.batchcode}</div>
                                <div className="col-4 fw-bold text-muted">Phone:</div><div className="col-8 text-dark fw-semibold text-break">{idData.phone}</div>
                                <div className="col-4 fw-bold text-muted">Email:</div><div className="col-8 text-dark fw-semibold text-break">{idData.email}</div>
                                {idData.transaction_hash && (
                                    <>
                                        <div className="col-4 fw-bold text-muted mt-1">Tx Hash:</div>
                                        <div className="col-8 text-primary fw-semibold mt-1" style={{ fontSize: '0.7rem' }}>
                                            {idData.transaction_hash.slice(0, 12)}...{idData.transaction_hash.slice(-8)}
                                        </div>
                                    </>
                                )}
                                {idData.validUntil && (
                                    <>
                                        <div className="col-4 fw-bold text-danger mt-1">Valid Until:</div>
                                        <div className="col-8 text-danger fw-bold mt-1">{new Date(idData.validUntil).toLocaleDateString()}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                            <h5 className="fw-bold text-dark mb-0"><i className="bi bi-shield-check text-primary-custom me-2"></i>Cryptographic Proof</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="alert alert-light border shadow-sm mb-4">
                                <p className="mb-0 small text-muted"><i className="bi bi-info-circle-fill text-primary-custom me-2"></i>This record is immutable. It was cryptographically signed and permanently stored on the decentralized network.</p>
                            </div>
                            
                            <div className="row mb-2">
                                <div className="col-md-3 text-muted fw-semibold small">Record Hash</div>
                                <div className="col-md-9 text-break font-monospace small bg-white p-2 rounded shadow-sm border-start border-primary border-3">{idData.current_hash}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-md-3 text-muted fw-semibold small">Transaction Hash</div>
                                <div className="col-md-9 text-break font-monospace small bg-white p-2 rounded shadow-sm border-start border-primary border-3 d-flex justify-content-between align-items-center">
                                    <span>{idData.transaction_hash}</span>
                                    <a href={`https://etherscan.io/tx/${idData.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" title="View on Block Explorer">
                                        <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 text-muted fw-semibold small">Contract</div>
                                <div className="col-md-9 text-break font-monospace small bg-white p-2 rounded shadow-sm border-start border-primary border-3">{idData.contract_address}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdVerification;
