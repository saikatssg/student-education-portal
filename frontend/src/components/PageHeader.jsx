import React from 'react';
import { Link } from 'react-router-dom';
import img_1 from '../assets/1.jpg';

const PageHeader = ({ title, breadcrumbs }) => {
    return (
        <div className="position-relative d-flex align-items-center justify-content-center text-center" style={{ 
            minHeight: '350px', 
            backgroundImage: `url(${img_1})`, // Library/students studying image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginTop: '-3rem'
        }}>
            {/* Dark Overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.75 }}></div>
            
            <div className="position-relative z-1 text-white mt-5">
                <h1 className="display-4 fw-bold text-uppercase mb-3" style={{ letterSpacing: '2px' }}>{title}</h1>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb justify-content-center mb-0">
                        <li className="breadcrumb-item"><Link to="/" className="text-white-50 text-decoration-none">Home</Link></li>
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index} className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active text-primary-custom fw-bold' : ''}`} aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>
                                {index === breadcrumbs.length - 1 ? (
                                    crumb.label
                                ) : (
                                    <Link to={crumb.path} className="text-white-50 text-decoration-none">{crumb.label}</Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

export default PageHeader;
