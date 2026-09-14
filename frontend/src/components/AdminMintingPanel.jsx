import React, { useState } from 'react';
import { ethers } from 'ethers';

// Replace with your actual deployed contract address and ABI
const CONTRACT_ADDRESS = '0x9a177C4a7383843cB91E8147F903B388bf0B3767';
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"string","name":"currentHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateMinted","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"previousHash","type":"string"},{"internalType":"string","name":"currentHash","type":"string"},{"internalType":"string","name":"transactionDetails","type":"string"},{"internalType":"string","name":"studentId","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"marksScore","type":"string"},{"internalType":"string","name":"grade","type":"string"},{"internalType":"string","name":"courseName","type":"string"},{"internalType":"string","name":"phone","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBlockHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_transactionDetails","type":"string"},{"internalType":"string","name":"_studentId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"string","name":"_marksScore","type":"string"},{"internalType":"string","name":"_grade","type":"string"},{"internalType":"string","name":"_courseName","type":"string"},{"internalType":"string","name":"_phone","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"mintCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const AdminMintingPanel = () => {
  const [formData, setFormData] = useState({
    crtid: '', sid: '', fullname: '', email: '', phone: '', 
    examid: '', coursename: '', score: '', grade: ''
  });
  
  const [walletAddress, setWalletAddress] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Connect to MetaMask
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) return setError("Please connect your MetaMask wallet first.");
    
    setIsMinting(true);
    setError('');
    setResult(null);

    try {
      // 1. Initialize Ethers and Contract via MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const transactionDetails = `Minting certificate ${formData.crtid} for ${formData.fullname} (${formData.coursename})`;

      // 2. Trigger the MetaMask popup for the admin to sign
      const tx = await contract.mintCertificate(
        transactionDetails, formData.sid, formData.fullname, formData.crtid, 
        formData.score, formData.grade, formData.coursename, formData.phone, formData.email
      );
      
      // 3. Wait for the block to be mined on Ganache
      const receipt = await tx.wait();

      // 4. Send the data AND the blockchain receipt to the Express backend for MongoDB storage
      const dbResponse = await fetch('http://localhost:5000/api/certificates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          transactionHash: receipt.hash,
          blockHash: receipt.blockHash,
          contractAddress: CONTRACT_ADDRESS
        })
      });
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setResult({
          message: 'Certificate minted via MetaMask and saved to Database.',
          transactionHash: receipt.hash,
          blockHash: receipt.blockHash,
          crtid: dbData.crtid || formData.crtid // Fallback to formData.crtid if backend doesn't return one
        });
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
    <div className="container mt-5 mb-5">
      <div className="card shadow border-dark">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Admin Panel: MetaMask Minting</h4>
          {walletAddress ? (
            <span className="badge bg-success">Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</span>
          ) : (
            <button className="btn btn-warning btn-sm fw-bold" onClick={connectWallet}>Connect MetaMask</button>
          )}
        </div>
        
        <div className="card-body bg-light">
          {error && <div className="alert alert-danger">{error}</div>}
          {result && (
            <div className="alert alert-success shadow-sm">
              <h5 className="alert-heading">🎉 {result.message}</h5>
              <hr />
              <div className="small font-monospace mb-3">
                <strong>Transaction Hash:</strong> {result.transactionHash}<br />
                <strong>Block Hash:</strong> {result.blockHash}
              </div>
              <div className="bg-white p-3 rounded border border-success">
                <h6 className="fw-bold mb-2">🎓 Candidate Verification & Download Link</h6>
                <p className="small text-muted mb-2">Share this link with the candidate so they can view and download their verified PDF certificate. They don't need to re-mint it.</p>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control bg-light" 
                    value={`${window.location.origin}/verify/${result.crtid}`} 
                    readOnly 
                  />
                  <button 
                    className="btn btn-outline-success" 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/verify/${result.crtid}`);
                      alert('Link copied to clipboard!');
                    }}
                  >
                    <i className="bi bi-clipboard"></i> Copy Link
                  </button>
                  <a 
                    href={`/verify/${result.crtid}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-success"
                  >
                    <i className="bi bi-box-arrow-up-right"></i> Open
                  </a>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Form inputs remain exactly the same as the previous version */}
            {/* ... (Certificate, Student Identity, Academic Results inputs) ... */}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mt-4" 
              disabled={isMinting || !walletAddress}
            >
              {isMinting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Waiting for MetaMask Signature...
                </>
              ) : (
                'Sign & Mint via MetaMask'
              )}
            </button>
          </form>
        </div>
        <div className="card-footer text-muted text-center small">
          Project Architecture by Saikat Sengupta
        </div>
      </div>
    </div>
  );
};

export default AdminMintingPanel;