import React from 'react';
import PageHeader from './PageHeader';

const About = () => {
    return (
        <div>
            <PageHeader title="About Us" breadcrumbs={[{ label: 'About Us', path: '/about' }]} />
            
            <div className="container py-5 my-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                        <img 
                            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
                            alt="University Campus" 
                            className="img-fluid rounded-4 shadow-lg card-hover-shadow"
                        />
                    </div>
                    <div className="col-lg-6">
                        <h6 className="text-primary-custom fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px' }}>Discover Our Platform</h6>
                        <h2 className="display-6 fw-bold mb-4 text-dark">Empowering Students Through Decentralization</h2>
                        <p className="text-muted mb-4 lead">
                            The EDUCATE platform bridges the gap between traditional learning and modern blockchain technology. We offer an intuitive portal for students to manage their courses while ensuring their achievements are securely minted on the Web3 ecosystem.
                        </p>
                        <p className="text-muted mb-4">
                            By leveraging Ethereum smart contracts, we provide immutable, verifiable certificates that employers can trust instantly. No more paper records, no more third-party background checks—just pure, decentralized validation.
                        </p>
                        
                        <div className="row mt-5 g-4">
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-color)' }}>
                                        <i className="bi bi-mortarboard-fill fs-3"></i>
                                    </div>
                                    <div className="ms-3">
                                        <h3 className="fw-bold mb-0 text-dark">50+</h3>
                                        <p className="text-muted mb-0 small text-uppercase fw-semibold">Premium Courses</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-color)' }}>
                                        <i className="bi bi-people-fill fs-3"></i>
                                    </div>
                                    <div className="ms-3">
                                        <h3 className="fw-bold mb-0 text-dark">10K+</h3>
                                        <p className="text-muted mb-0 small text-uppercase fw-semibold">Active Candidates</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
