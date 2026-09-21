import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Home from './components/Home';
import Signup from './components/Signup';
import CertificateVerification from './components/CertificateVerification';
import AdminDashboard from './components/AdminDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import About from './components/About';
import Contact from './components/Contact';
import IdVerification from './components/IdVerification';
import myLogo from './assets/nielit.jpg';

const LogoutButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-outline-danger ms-3 btn-sm fw-bold"
      onClick={() => {
        localStorage.removeItem('role');
        localStorage.removeItem('student');
        localStorage.removeItem('admin');
        window.location.href = '/';
      }}
    >
      Logout
    </button>
  );
}

const App = () => {
  const role = localStorage.getItem('role');
  const student = JSON.parse(localStorage.getItem('student') || 'null');
  const admin = JSON.parse(localStorage.getItem('admin') || 'null');

  const getDisplayName = () => {
    if (role === 'admin' && admin) return admin.name;
    if (role === 'candidate' && student) return student.fname + ' ' + (student.lname || '');
    return '';
  };
  const displayName = getDisplayName();

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-light">

        {/* Top Contact Bar */}
        <div className="top-bar d-none d-lg-block">
          <div className="container d-flex justify-content-between align-items-center">
            <div>
              <span className="me-4 " style={{ cursor: "pointer" }}><i className="bi bi-envelope me-2"></i>https://kolkata.nielit.gov.in/</span>
              <span><i className="bi bi-telephone me-2"></i>+91-33-4602-2246</span>
            </div>
            <div>
              <span className="me-3 cursor-pointer">Facebook</span>
              <span className="me-3 cursor-pointer">Twitter</span>
              <span className="cursor-pointer">LinkedIn</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className="navbar navbar-expand-lg navbar-custom sticky-top shadow-sm py-2">
          <div className="container">
            <NavLink to="/" className="navbar-brand fw-bold fs-3 text-dark text-decoration-none">
              <span className="text-primary-custom">EDU</span>CATE
            </NavLink>
            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="mainNavbar">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0 me-4">
                <li className="nav-item">
                  <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>About</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/verify" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Verify Certificate</NavLink>
                </li>
                {role === 'admin' && (
                  <li className="nav-item">
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Admin Panel</NavLink>
                  </li>
                )}
                {role === 'candidate' && (
                  <li className="nav-item">
                    <NavLink to="/candidate" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>My Dashboard</NavLink>
                  </li>
                )}
              </ul>

              <div className="d-flex align-items-center">
                {!role && (
                  <NavLink to="/signup" className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm">Sign Up</NavLink>
                )}
                {role && (
                  <span className="me-3 fw-bold text-dark">
                    Welcome, <span className="text-primary-custom">{displayName}</span>
                  </span>
                )}
                {role && <LogoutButton />}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify/*" element={<CertificateVerification />} />
            <Route path="/verify-id/:id" element={<IdVerification />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/candidate" element={<CandidateDashboard />} />
          </Routes>
        </main>

        <footer className="bg-dark-custom text-white py-5 mt-auto">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <h4 className="fw-bold mb-4"><span className="text-primary-custom">EDU</span>CATE</h4>
                <p className=" text-light" style={{ width: '70%' }}>Empowering the next generation with decentralized, verifiable certificates and seamless course management on the Web3 blockchain.</p>
                <div className='my-2'>
                  <img src={myLogo} alt="" style={{ width: '200px', margin: '15px 0' }} />
                </div>
                <p className="text-light" style={{ width: '70%' }}><b>Website : </b> <a className='text-primary-custom ms-2' href="https://kolkata.nielit.gov.in/" target="_blank" rel="noopener noreferrer">https://kolkata.nielit.gov.in/</a></p>
              </div>
              <div className="col-lg-4 col-md-6">
                <h5 className="fw-bold mb-4">Quick Links</h5>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2"><NavLink to="/" className="text-light text-decoration-none hover-primary">Home</NavLink></li>
                  <li className="mb-2"><NavLink to="/about" className="text-light text-decoration-none hover-primary">About Us</NavLink></li>
                  <li className="mb-2"><NavLink to="/contact" className="text-light text-decoration-none hover-primary">Contact Us</NavLink></li>
                  <li className="mb-2"><NavLink to="/verify" className="text-light text-decoration-none hover-primary">Verify Certificate</NavLink></li>
                  <li className="mb-2"><NavLink to="/signup" className="text-light text-decoration-none hover-primary">Admissions</NavLink></li>
                </ul>
              </div>
              <div className="col-lg-4 col-md-12">
                <h5 className="fw-bold mb-4 text-light">Contact Us</h5>
                <ul className="list-unstyled  text-light">
                  <li><b>Unit 1 :</b></li>
                  <li className="mb-2">Jadavpur University Campus, Kolkata-700032</li>
                  <li className="mb-2">Telephone (EPABX): (033) 2414-6054 / 6081</li>
                  <li className="mb-2">Mobile: 9477301644</li>
                </ul>

                <ul className="list-unstyled  text-light">
                  <li><b>Unit 1 :</b></li>
                  <li className="mb-2">Salt Lake Campus,</li>
                  <li className="mb-2">BF-267, Sector-I, Salt Lake,</li>
                  <li className="mb-2">Kolkata - 700064</li>
                  <li className="mb-2">Phone: 91-033-4602-2246</li>
                </ul>
              </div>
            </div>
            <div className="border-top border-secondary mt-4 pt-4 text-center text-light" style={{ cursor: 'pointer' }}>
              <p>&copy; {new Date().getFullYear()} EDUCATE Portal. All rights reserved.</p>
              <p> <strong>Project Cordinator :</strong> <span className='text-primary-custom ms-2'>Debapriya  Bhattacharyya </span> &nbsp;&nbsp;| &nbsp;&nbsp; <strong>Developed By : </strong> <span className='text-primary-custom ms-2'> Saikat Sengupta </span> </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;