import { Routes, Route } from 'react-router-dom';
import Nav from './Nav.jsx';
import Home from './Home.jsx';
import About from './About.jsx';
import Learning from './components/Learning.jsx'
import AdminUpload from './components/AdminUpload.jsx';
// import Contact from './Contact.jsx';

function App() {
  return (
    <>
      {/* Navigation bar always visible */}
      <Nav />
      <hr />

      {/* Page content changes based on URL */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/learn" element={<Learning />} />
        <Route path="/AdminUpload" element={<AdminUpload />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* 404 Page */}
        {/* <Route path="*" element={<h1>404 - Page Not Found</h1>} /> */}
      </Routes>
    </>
  );
}

export default App;
