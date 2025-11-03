import { useLocation } from 'react-router-dom';
import '../css/AppWrapper.css';

const AppWrapper = ({ children }) => {
    const location = useLocation();

    const getBackgroundClass = () => {
        if (location.pathname === '/') return 'home-bg';
        else return 'other-bg';
    };

    return <div className={`app-wrapper ${getBackgroundClass()}`}>{children}</div>;
};

export default AppWrapper;