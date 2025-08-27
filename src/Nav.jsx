import './styles/nav.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav>
      <p className="logo"><Link to="/">Verya</Link></p>

      {/* Hamburger Icon */}
      <div 
        className={`hamburger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Fullscreen Menu */}
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/learn" onClick={() => setIsOpen(false)}>Learn</Link></li>
        <li><Link to="/AdminUpload" onClick={() => setIsOpen(false)}>Admin</Link></li>
        <li><Link to="/Signup" onClick={() => setIsOpen(false)}>Practice</Link></li>
      </ul>
    </nav>
  );
}

export default Nav;
