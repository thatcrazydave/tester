import './styles/nav.css';
import { Link } from 'react-router-dom';
function Nav(){
  return(
    <nav>
      <p><Link to="/">Verya</Link></p>
      <ul>
      <li><Link to="/about">About</Link></li>
        <li><Link to="/Contact">Contact</Link></li>
        <li><Link to="/Signup">SignUp</Link></li>
      </ul>
    </nav>
  );
}
export default Nav;