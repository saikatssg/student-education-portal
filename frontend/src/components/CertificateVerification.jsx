import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateVerification = () => {
  const location = useLocation();
  const [crtid, setCrtid] = useState('');
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/verify/') && path.length > 8) {
      const id = path.substring(8);
      // Replace %2F with / if URL encoded
      const decodedId = decodeURIComponent(id);
      setCrtid(decodedId);
      verifyCertificate(decodedId);
    }
  }, [location]);

  const verifyCertificate = async (idToVerify) => {
    setError('');
    setCertData(null);
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/verify/${encodeURIComponent(idToVerify)}`);
      const data = await response.json();
      if (response.ok) {
        setCertData(data);
      } else {
        setError(data.message || 'Certificate not found.');
      }
    } catch (err) {
      setError('Server error while verifying certificate.');
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      // Temporarily add a class to scale it up for better quality before capturing
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'cm', 'A4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${certData.crtid.replace(/\//g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      setError('Failed to download PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    verifyCertificate(crtid);
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-lg-8">

        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Web3 Certificate Verification</h2>
          <p className="text-muted">Enter a certificate ID to instantly verify its authenticity on the Ethereum blockchain.</p>
        </div>

        <form onSubmit={handleVerify} className="mb-5 shadow-sm rounded-pill p-2 bg-white card-hover-shadow">
          <div className="input-group input-group-lg">
            <input
              type="text"
              className="form-control border-0 bg-transparent px-4"
              placeholder="Enter Certificate ID (e.g., CRT/...)"
              value={crtid}
              onChange={(e) => setCrtid(e.target.value)}
              required
            />
            <button className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" type="submit">
              VERIFY NOW
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger shadow-sm text-center fw-semibold rounded-4 py-3 border-0">
            <i className="bi bi-x-circle me-2"></i> {error}
          </div>
        )}

        {certData && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-success mb-0"><i className="bi bi-patch-check-fill me-2"></i>Verified Authentic</h4>
              <button
                onClick={handleDownload}
                className="btn btn-dark fw-bold rounded-pill px-4 shadow-sm"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Downloading...</>
                ) : (
                  <><i className="bi bi-download me-2"></i>Download PDF</>
                )}
              </button>
            </div>

            {/* Certificate Template for Download */}
            <div className="card shadow-lg border-0 overflow-hidden card-hover-shadow mx-auto" style={{ maxWidth: '1128px' }}>
              <div
                ref={certificateRef}
                className="position-relative text-center shadow-sm"
                style={{
                  cursor: 'pointer',
                  width: '1128px',
                  minHeight: '798px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '80px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fdfcfb 40%, #f2eae0 100%)',
                  border: '15px solid #1a365d', /* Thick Navy Outer Border */
                  boxShadow: 'inset 0 0 0 6px #fcfbf9, inset 0 0 0 10px #d4af37, inset 0 0 0 16px #fcfbf9, inset 0 0 0 18px #1a365d, inset 0 0 40px rgba(0,0,0,0.05)', /* Multiple inset elegant borders */
                  fontFamily: '"Times New Roman", Times, serif',
                  color: '#4a4a4a',
                  boxSizing: 'border-box'
                }}
              >
                {/* Clean Flexbox Layout Wrapper to avoid any absolute positioning overlaps */}
                <div className="h-100 d-flex flex-column justify-content-between">
                  
                  {/* Header Row: Student ID, Logo, Spacer */}
                  <div className="d-flex justify-content-between align-items-start w-100">
                    <div className="text-start" style={{ minWidth: '150px' }}>
                      <p className="text-muted fw-bold mb-0 small" style={{ letterSpacing: '1px' }}>STUDENT ID</p>
                      <p className="fw-bolder" style={{ color: '#2b2d31' }}>{typeof certData.sid === 'string' ? certData.sid : (certData.crtid?.match(/SID-\d+/)?.[0] || 'N/A')}</p>
                    </div>
                    <div className="text-center" style={{ flexGrow: 1 }}>
                      <img src="/assets/educate-logo.jpg" alt="EDUCATE Logo" style={{ height: '70px', objectFit: 'contain' }} />
                    </div>
                    <div className="text-end" style={{ minWidth: '150px' }}>
                      {/* Empty spacer to perfectly balance the header flex row */}
                    </div>
                  </div>

                  {/* Central Certificate Body */}
                  <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <div className="mb-3">
                      <h1 className="display-4 mb-0" style={{ fontFamily: 'Georgia, serif', color: '#4a4a4a', letterSpacing: '4px' }}>CERTIFICATE</h1>
                      <h5 className="text-uppercase mt-1" style={{ color: '#555', letterSpacing: '3px', fontWeight: '400' }}>OF COMPLETION</h5>
                    </div>

                    <div className="my-2">
                      <p className="text-uppercase tracking-widest mb-3" style={{ letterSpacing: '1px', fontSize: '0.9rem', color: '#666' }}>THIS CERTIFICATE IS AWARDED TO</p>
                      
                      {/* Centered Student Profile Picture */}
                      <div className="mx-auto mb-2 shadow-sm rounded-circle" style={{ width: '90px', height: '90px', border: '4px solid #fff', outline: '2px solid #d4af37', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={certData.photoUrl ? `http://localhost:5000/uploads/${certData.photoUrl}` : ((typeof certData.sid === 'object' && certData.sid.photo) ? `http://localhost:5000/uploads/${certData.sid.photo}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png")}
                          alt="Student Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                        />
                      </div>

                      <h2 className="display-3 my-1" style={{ fontFamily: '"Great Vibes", "Pinyon Script", cursive', color: '#d4af37', paddingBottom: '5px' }}>
                        {certData.fullname}
                      </h2>
                      <div style={{ width: '60%', margin: '0 auto', borderBottom: '1px solid #d4af37' }}></div>
                    </div>

                    <div className="my-2 px-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
                      <p className="mb-3" style={{ fontSize: '1.1rem', color: '#4a4a4a', lineHeight: '1.6' }}>
                        for successfully completing the <strong>{certData.coursename || 'N/A'}</strong> course
                        conducted on {new Date(certData.created_at || Date.now()).toLocaleDateString()}, showcasing dedication and professional skills.
                      </p>

                      <div className="d-flex justify-content-center gap-4 mt-3">
                        <span className="badge border px-4 py-2" style={{ backgroundColor: 'transparent', color: '#4a4a4a', borderColor: '#4a4a4a', fontSize: '0.9rem' }}>
                          Grade: {certData.grade}
                        </span>
                        <span className="badge border px-4 py-2" style={{ backgroundColor: 'transparent', color: '#4a4a4a', borderColor: '#4a4a4a', fontSize: '0.9rem' }}>
                          Score: {certData.score}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center align-items-end mt-3">
                      <div className="text-center" style={{ width: '250px' }}>
                        <div className="mt-3 pt-2">
                          <h4 className="mb-0" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive', color: '#4a4a4a' }}>Saikat Sengupta</h4>
                          <hr className="mx-auto my-2 border-secondary" style={{ width: '200px', opacity: 0.3 }} />
                          <p className="text-muted small text-uppercase" style={{ letterSpacing: '2px', fontSize: '0.75rem', marginBottom: 0 }}>Lead Trainer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Row: ID/TX, Spacer, Verified Badge */}
                  <div className="d-flex justify-content-between align-items-end w-100">
                    <div className="text-start" style={{ minWidth: '150px' }}>
                      <p className="mb-1 fw-bold" style={{ fontSize: '0.75rem', color: '#888' }}><strong>ID:</strong> {certData.crtid}</p>
                      <p className="mb-0 fw-bold" style={{ fontSize: '0.75rem', color: '#888' }}><strong>TX:</strong> {certData.transaction_details ? certData.transaction_details.substring(0, 20) + '...' : 'Pending...'}</p>
                    </div>
                    <div className="text-center" style={{ flexGrow: 1 }}>
                      {/* Empty space in center footer */}
                    </div>
                    <div className="text-end d-flex justify-content-end" style={{ minWidth: '150px' }}>
                      <div className="badge rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '70px', height: '70px', border: '2px solid #e58e1a', color: '#e58e1a', background: '#fff' }}>
                        <div className="text-center">
                          <i className="bi bi-award fs-5 d-block mb-1"></i>
                          <span className="fw-bold" style={{ fontSize: '0.5rem', letterSpacing: '1px' }}>VERIFIED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Extra Blockchain Data (Outside Downloadable Area) */}
              <div className="bg-light p-4 border-top">
                <h6 className="fw-bold mb-3 text-primary-custom text-uppercase tracking-wide"><i className="bi bi-link-45deg me-1"></i> Cryptographic Proof</h6>
                <div className="row mb-2">
                  <div className="col-md-3 text-muted fw-semibold small">Block Hash</div>
                  <div className="col-md-9 text-break font-monospace small bg-white p-2 rounded shadow-sm border-start border-primary border-3">{certData.current_hash}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-3 text-muted fw-semibold small">Transaction Hash</div>
                  <div className="col-md-9 text-break font-monospace small bg-white p-2 rounded shadow-sm border-start border-primary border-3 d-flex justify-content-between align-items-center">
                    <span>{certData.transaction_hash || certData.transaction_details}</span>
                    <a href={`https://etherscan.io/tx/${certData.transaction_hash || certData.transaction_details}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" title="View on Block Explorer">
                      <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3 text-muted fw-semibold small">Contract</div>
                  <div className="col-md-9 text-break font-monospace small bg-white p-2 rounded shadow-sm border-start border-primary border-3">{certData.contract_address}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerification;