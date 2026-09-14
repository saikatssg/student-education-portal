import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        fname: '', lname: '', username: '', password: '', 
        passKey: '', email: '', phone: '', city: '', dob: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const [file, setFile] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
            if (file) submitData.append('photo', file);

            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                body: submitData
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: `Registration successful! Your Student ID is ${data.sid}. Redirecting to login...` });
                setTimeout(() => navigate('/'), 3000);
            } else {
                setStatus({ type: 'danger', message: data.error || 'Signup failed.' });
            }
        } catch (err) {
            setStatus({ type: 'danger', message: 'Server connection error.' });
        }
    };

    return (
        <div className="row justify-content-center mt-4 mb-5">
            <div className="col-lg-8">
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-dark">Admissions Registration</h2>
                    <p className="text-muted">Create your profile to start enrolling in our premium courses</p>
                </div>
                <div className="card shadow-lg border-0 rounded-4 bg-white">
                    <div className="card-body p-5">
                        {status.message && <div className={`alert alert-${status.type} rounded-3`}>{status.message}</div>}
                        <form onSubmit={handleSubmit}>
                            <h5 className="text-primary-custom fw-bold mb-4"><i className="bi bi-person-badge me-2"></i>Personal Details</h5>
                            <div className="row g-4 mb-5">
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">First Name</label>
                                    <input type="text" name="fname" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Last Name</label>
                                    <input type="text" name="lname" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Date of Birth</label>
                                    <input type="date" name="dob" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">City</label>
                                    <input type="text" name="city" className="form-control form-control-lg bg-light border-0" onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Phone</label>
                                    <input type="text" name="phone" className="form-control form-control-lg bg-light border-0" onChange={handleChange} />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Profile Photo</label>
                                    <input type="file" name="photo" className="form-control form-control-lg bg-light border-0" onChange={handleFileChange} accept="image/*" />
                                </div>
                            </div>
                            
                            <h5 className="text-primary-custom fw-bold mb-4"><i className="bi bi-shield-lock me-2"></i>Account Credentials</h5>
                            <div className="row g-4 mb-5">
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Username</label>
                                    <input type="text" name="username" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Email</label>
                                    <input type="email" name="email" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Password</label>
                                    <input type="password" name="password" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted fw-semibold small text-uppercase">Recovery PassKey</label>
                                    <input type="text" name="passKey" className="form-control form-control-lg bg-light border-0" onChange={handleChange} required />
                                </div>
                            </div>
                            <hr className="mb-4" />
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill fw-bold shadow-sm">REGISTER NOW</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
