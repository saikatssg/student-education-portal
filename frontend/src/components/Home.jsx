import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import img_1 from "../assets/1.jpg";


const Home = () => {
    const role = localStorage.getItem('role');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('role', data.role);
                if (data.student) localStorage.setItem('student', JSON.stringify(data.student));

                if (data.role === 'admin') window.location.href = '/admin';
                else window.location.href = '/candidate';
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Server connection error.');
        }
    };

    return (
        <div style={{ marginTop: '-3rem' }}>
            {/* Hero Section */}
            <div className="position-relative d-flex align-items-center" style={{
                minHeight: '80vh',
                backgroundImage: `url(${img_1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff'
            }}>
                {/* Dark Overlay */}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.6 }}></div>

                <div className="container position-relative" style={{ zIndex: 1 }}>
                    <div className="row align-items-center">
                        <div className="col-lg-7 text-center text-lg-start mb-5 mb-lg-0">
                            <h1 className="display-3 fw-bold mb-4 text-uppercase">Start Your Beautiful Career Today</h1>
                            <p className="lead mb-5" style={{ fontSize: '1.25rem', fontWeight: 300, color: '#f5f7fa' }}>
                                Join the next generation of verifiable education. Access decentralized certificates, manage courses seamlessly, and build your future on the Web3 blockchain.
                            </p>
                            <Link to="/signup" className="btn btn-primary btn-lg rounded-pill px-5 py-3 me-3 fw-bold shadow-sm">GET STARTED</Link>
                            <Link to="/verify" className="btn btn-outline-light btn-lg rounded-pill px-5 py-3 fw-bold">VERIFY CERTIFICATE</Link>
                        </div>

                        <div className="col-lg-5">
                            {role ? (
                                <div className="card border-0 shadow-lg" style={{ borderRadius: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                    <div className="card-body p-5 text-center">
                                        <div className="mb-4">
                                            <i className="bi bi-person-check-fill text-success" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h3 className="fw-bold text-dark mb-3">Welcome Back!</h3>
                                        <p className="text-muted mb-4">You are securely logged into the portal.</p>
                                        <Link to={role === 'admin' ? '/admin' : '/candidate'} className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm">
                                            ACCESS DASHBOARD
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="card border-0 shadow-lg" style={{ borderRadius: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                    <div className="card-body p-5">
                                        <div className="text-center mb-4">
                                            <h3 className="fw-bold text-dark mb-1">Student Portal</h3>
                                            <p className="text-muted small">Login to access your dashboard</p>
                                        </div>

                                        {error && <div className="alert alert-danger p-2 small text-center">{error}</div>}

                                        <form onSubmit={handleLogin}>
                                            <div className="mb-4">
                                                <label className="form-label text-muted fw-semibold small text-uppercase">Username</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg bg-light border-0 shadow-none"
                                                    placeholder="Enter username"
                                                    value={username}
                                                    onChange={e => setUsername(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label text-muted fw-semibold small text-uppercase">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control form-control-lg bg-light border-0 shadow-none"
                                                    placeholder="Enter password"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm">LOGIN NOW</button>
                                        </form>
                                        <div className="mt-4 text-center">
                                            <small className="text-muted">Admin demo: <b>saikat / Saikat@123</b></small>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section underneath Hero */}
            <div className="container py-5 my-5">
                <div className="row g-4 text-center">
                    <div className="col-md-4">
                        <div className="p-4 card-hover-shadow rounded-4 bg-white shadow-sm h-100">
                            <i className="bi bi-shield-check display-4 text-primary-custom mb-3"></i>
                            <h4 className="fw-bold mb-3">Verifiable Records</h4>
                            <p className="text-muted mb-0">Every certificate is minted on the Ethereum blockchain, ensuring permanent and tamper-proof verification.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 card-hover-shadow rounded-4 bg-white shadow-sm h-100">
                            <i className="bi bi-book-half display-4 text-primary-custom mb-3"></i>
                            <h4 className="fw-bold mb-3">Modern Courses</h4>
                            <p className="text-muted mb-0">Enroll in cutting-edge programs dynamically managed by educational administrators.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 card-hover-shadow rounded-4 bg-white shadow-sm h-100">
                            <i className="bi bi-lightning-charge display-4 text-primary-custom mb-3"></i>
                            <h4 className="fw-bold mb-3">Instant Validation</h4>
                            <p className="text-muted mb-0">Employers can verify candidate credentials instantly using our decentralized portal without third-party delays.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call To Action Banner (Join 2912093 people) */}
            <div className="position-relative py-5 text-center text-white" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                marginTop: '4rem'
            }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.85 }}></div>
                <div className="container position-relative py-5" style={{ zIndex: 1 }}>
                    <h2 className="display-5 fw-normal mb-3" style={{ color: '#fff' }}>
                        Join <span className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.2em' }}>2912093</span> people
                    </h2>
                    <p className="lead mx-auto mb-5 text-white-50" style={{ maxWidth: '800px', fontSize: '1.1rem' }}>
                        Become part of the fastest-growing community of learners and professionals leveraging Web3 blockchain technology to secure and verify their educational accomplishments.
                    </p>
                    <Link to="/signup" className="btn btn-outline-light rounded-0 px-5 py-3 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                        JOIN NOW
                    </Link>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="container py-5 my-5 text-center">
                <div className="position-relative mx-auto" style={{ maxWidth: '900px' }}>
                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop"
                        alt="Students holding banner"
                        className="img-fluid rounded-top-4 mb-0 w-100"
                        style={{ objectFit: 'cover', height: '250px' }}
                    />
                    <div className="bg-white p-5 rounded-bottom-4 shadow-lg mx-auto" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2, width: '90%' }}>
                        <h2 className="fw-bold text-dark text-uppercase mb-3" style={{ letterSpacing: '1px' }}>NEWSLETTER</h2>
                        <p className="text-muted mb-4 px-3 small">
                            Subscribe now and receive weekly newsletter with educational materials, new courses, interesting posts, popular books and much more!
                        </p>
                        <form className="d-flex justify-content-center px-lg-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group input-group-lg shadow-sm w-100">
                                <input
                                    type="email"
                                    className="form-control rounded-0 border-end-0 fs-6 bg-light text-muted"
                                    placeholder="Your Email Here"
                                    required
                                />
                                <button className="btn btn-primary rounded-0 px-4 fw-bold text-uppercase fs-6" type="submit">
                                    SUBSCRIBE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;
