import '.././App.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const LoginSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  return (
    <div className="App">
      <h1>Your login is succesfull !!!</h1>
      <p>The {email} address is already stored</p>

      <div className="back-button">
        <button onClick={() => navigate('/')}>Back</button>
      </div>
    </div>
  );
};

export default LoginSuccess;
