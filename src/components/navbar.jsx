import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
        <ul>
            <li>
            <Link to="/">Home</Link>
            </li>
            <li>
            <Link to="/bmr">BMR Calculator</Link>
            </li>
        </ul>
        </nav>
    );
}


export default Navbar;