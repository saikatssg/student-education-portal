import React, { useState } from 'react';
import { ethers } from 'ethers';

// Replace with your actual deployed contract address and ABI
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const CONTRACT_ABI = ["function mintCertificate(string, string, string, string, string, string, string, string, string) public"];

const AdminMintingPanel = () => {
  const [formData, setFormData] = useState({
    crtid: '', sid: '', fullname: '', email: '', phone: '', 
    examid: '', coursename: '', score: '', grade: ''
  });
  
  const [walletAddress, setWalletAddress] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } catch (err) {
        setError("User denied account access or MetaMask is locked.");
      }
    } else {
      setError("MetaMask is not installed. Please install it to continue.");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) return setError("Please connect your MetaMask wallet first.");
    
    setIsMinting(true);
    setError('');
    setResult(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const transactionDetails = `Minting ${formData.crtid} for ${formData.fullname}`;
      const tx = await contract.mintCertificate(
        transactionDetails, formData.sid, formData.fullname, formData.crtid, 
        formData.score, formData.grade, formData.coursename, formData.phone, formData.email
      );
      
      const receipt = await tx.wait();

      const dbResponse = await fetch('http://localhost:5000/api/certificates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData, transactionHash: receipt.hash, blockHash: receipt.blockHash, contractAddress: CONTRACT_ADDRESS
        })
      });
      
      if (dbResponse.ok) {
        setResult({ message: 'Certificate minted to Blockchain & Database.', transactionHash: receipt.hash });
        setFormData({ crtid: '', sid: '', fullname: '', email: '', phone: '', examid: '', coursename: '', score: '', grade: '' });
      } else {
        setError('Minted on blockchain, but failed to save to database.');
      }
    } catch (err) {
      setError(`Transaction failed: ${err.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="card shadow-lg border-dark rounded-4 mb-5">
          <div className="card-header bg-dark text-white p-4 d-flex justify-content-between align-items-center rounded-top-4">
            <div>
              <h4 className="mb-0 fw-bold">Web3 Admin Portal</h4>
              <p className="mb-0 text-white-50 small mt-1">Issue tamper-proof certificates via MetaMask.</p>
            </div>
            {walletAddress ? (
              <span className="badge bg-success bg-opacity-25 text-success border border-success py-2 px-3 rounded-pill shadow-sm">
                🟢 {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </span>
            ) : (
              <button className="btn btn-warning fw-bold shadow-sm rounded-pill px-4" onClick={connectWallet}>
                Connect MetaMask
              </button>
            )}
          </div>
          
          <div className="card-body p-5">
            {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}
            
            {result && (
              <div className="alert alert-success shadow-sm border-0 mb-4 p-4 rounded-4">
                <h5 className="alert-heading fw-bold mb-3">🎉 {result.message}</h5>
                <p className="mb-0 font-monospace small bg-white p-2 rounded text-break border">
                  <strong>TX:</strong> {result.transactionHash}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <h6 className="text-primary fw-bold text-uppercase tracking-wide border-bottom pb-2 mb-0">Certificate Details</h6>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label text-muted fw-semibold">Certificate ID</label>
                  <input type="text" name="crtid" className="form-control form-control-lg bg-light" value={formData.crtid} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted fw-semibold">Exam ID</label>
                  <input type="text" name="examid" className="form-control form-control-lg bg-light" value={formData.examid} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted fw-semibold">Course Name</label>
                  <input type="text" name="coursename" className="form-control form-control-lg bg-light" value={formData.coursename} onChange={handleChange} required />
                </div>

                <div className="col-12 mt-5">
                  <h6 className="text-primary fw-bold text-uppercase tracking-wide border-bottom pb-2 mb-0">Student Identity</h6>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label text-muted fw-semibold">Student ID</label>
                  <input type="text" name="sid" className="form-control" value={formData.sid} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted fw-semibold">Full Name</label>
                  <input type="text" name="fullname" className="form-control" value={formData.fullname} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted fw-semibold">Email</label>
                  <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted fw-semibold">Phone</label>
                  <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="col-12 mt-5">
                  <h6 className="text-primary fw-bold text-uppercase tracking-wide border-bottom pb-2 mb-0">Academic Results</h6>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label text-muted fw-semibold">Total Score</label>
                  <input type="text" name="score" className="form-control form-control-lg" placeholder="850/1000" value={formData.score} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted fw-semibold">Final Grade</label>
                  <select name="grade" className="form-select form-select-lg" value={formData.grade} onChange={handleChange} required>
                    <option value="">-- Select --</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="F">Fail</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 pt-3">
                <button 
                  type="submit" 
                  className="btn btn-dark btn-lg w-100 fw-bold shadow-lg rounded-pill py-3" 
                  disabled={isMinting || !walletAddress}
                >
                  {isMinting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                      Confirming Transaction in MetaMask...
                    </>
                  ) : (
                    '🚀 Mint Certificate via MetaMask'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMintingPanel;