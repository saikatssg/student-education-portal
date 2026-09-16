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
                className="bg-white position-relative p-5 text-center"
                style={{
                  cursor: 'pointer',
                  border: '15px solid #0d6efd',
                  minHeight: '600px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'linear-gradient(to bottom right, #ffffff, #f0f8ff)'
                }}
              >
                {/* Decorative Corners */}
                <div className="position-absolute top-0 start-0 border-top border-start border-primary border-5 m-3" style={{ width: '50px', height: '50px' }}></div>
                <div className="position-absolute top-0 end-0 border-top border-end border-primary border-5 m-3" style={{ width: '50px', height: '50px' }}></div>
                <div className="position-absolute bottom-0 start-0 border-bottom border-start border-primary border-5 m-3" style={{ width: '50px', height: '50px' }}></div>
                <div className="position-absolute bottom-0 end-0 border-bottom border-end border-primary border-5 m-3" style={{ width: '50px', height: '50px' }}></div>

                {/* Certificate Content */}
                <div className="mb-4">
                  <h1 className="fw-bold text-primary display-4" style={{ fontFamily: 'Georgia, serif' }}>CERTIFICATE</h1>
                  <h4 className="text-uppercase tracking-wide text-secondary">OF COMPLETION</h4>
                </div>

                <div className="my-4">
                  <p className="fst-italic fs-4 text-muted mb-4">This is to certify that</p>
                  <h2 className="fw-bold  display-4   my-3 border-bottom border-2 border-dark pb-2 d-inline-block px-5" style={{ fontFamily: '"Pinyon Script", serif', letterSpacing: '5px', color: 'rgba(2, 64, 188, 1)' }}>
                    {certData.fullname}
                  </h2>
                </div>

                <div className="my-4 px-5">
                  <p className="text-muted mb-2">has successfully completed the course</p>
                  <h3 className="fw-bold text-primary-custom">{certData.coursename}</h3>
                  <p className="mt-3 text-muted">
                    Achieving a score of <strong className="text-dark">{certData.score}</strong> and a grade of <strong className="text-dark">{certData.grade}</strong>.
                  </p>
                </div>

                <div className="d-flex justify-content-between align-items-end mt-5 px-5">
                  <div className="text-center">
                    <div className="border-bottom border-dark mb-1" style={{ width: '200px' }}>
                      {/* Signature placeholder */}
                      <span className="font-monospace text-muted fst-italic" style={{ fontSize: '1.2rem' }}>Saikat Sengupta</span>
                    </div>
                    <p className="small text-muted text-uppercase fw-bold m-0">Authorized Signature</p>
                  </div>

                  <div className="text-center">
                    <div className="badge bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '100px', height: '100px', fontSize: '10px' }}>
                      <div className="text-center">
                        <i className="bi bi-award fs-3 d-block mb-1"></i>
                        VERIFIED
                      </div>
                    </div>
                  </div>

                  <div className="text-start" style={{ width: '250px' }}>
                    <p className="small text-muted mb-1 border-bottom border-muted pb-1"><strong>ID:</strong> {certData.crtid}</p>
                    <p className="small text-muted mb-0" style={{ fontSize: '10px' }}><strong>TX:</strong> {certData.transaction_details.substring(0, 25)}...</p>
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