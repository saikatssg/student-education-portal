import React, { useState } from 'react';
import PageHeader from './PageHeader';

const Contact = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Message sent successfully! We will get back to you soon.');
        e.target.reset();
        setTimeout(() => setStatus(''), 5000);
    };

    return (
        <div>
            <PageHeader title="Contact Us" breadcrumbs={[{ label: 'Contact Us', path: '/contact' }]} />
            
            <div className="container py-5 my-5">
                <div className="row g-5">
                    {/* Contact Info Side */}
                    <div className="col-lg-5">
                        <h6 className="text-primary-custom fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px' }}>Get In Touch</h6>
                        <h2 className="display-6 fw-bold mb-4 text-dark">Have any questions? Let's talk!</h2>
                        <p className="text-muted mb-5">
                            Whether you're looking to enroll in a new course, verify a blockchain credential, or partner with us, our team is ready to assist you.
                        </p>
                        
                        <div className="d-flex mb-4">
                            <div className="bg-light text-primary-custom rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-geo-alt-fill fs-4"></i>
                            </div>
                            <div className="ms-3">
                                <h5 className="fw-bold text-dark mb-1">Our Location</h5>
                                <p className="text-muted mb-0">123 Education Lane, Tech District<br/>Learning City, LC 90210</p>
                            </div>
                        </div>

                        <div className="d-flex mb-4">
                            <div className="bg-light text-primary-custom rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-telephone-fill fs-4"></i>
                            </div>
                            <div className="ms-3">
                                <h5 className="fw-bold text-dark mb-1">Phone Number</h5>
                                <p className="text-muted mb-0">+1 (800) 123-4567<br/>+1 (800) 987-6543</p>
                            </div>
                        </div>

                        <div className="d-flex mb-4">
                            <div className="bg-light text-primary-custom rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-envelope-fill fs-4"></i>
                            </div>
                            <div className="ms-3">
                                <h5 className="fw-bold text-dark mb-1">Email Address</h5>
                                <p className="text-muted mb-0">info@educate.com<br/>support@educate.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Side */}
                    <div className="col-lg-7">
                        <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white h-100">
                            <h3 className="fw-bold text-dark mb-4">Send us a Message</h3>
                            {status && <div className="alert alert-success">{status}</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input type="text" className="form-control bg-light border-0" id="name" placeholder="Your Name" required />
                                            <label htmlFor="name" className="text-muted">Your Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input type="email" className="form-control bg-light border-0" id="email" placeholder="Your Email" required />
                                            <label htmlFor="email" className="text-muted">Your Email</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="text" className="form-control bg-light border-0" id="subject" placeholder="Subject" required />
                                            <label htmlFor="subject" className="text-muted">Subject</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <textarea className="form-control bg-light border-0" placeholder="Leave a message here" id="message" style={{ height: '150px' }} required></textarea>
                                            <label htmlFor="message" className="text-muted">Message</label>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm" type="submit">SEND MESSAGE</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
