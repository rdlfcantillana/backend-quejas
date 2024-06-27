import  { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../services/authService';
import ResetPasswordForm from '../components/resetpassword-form';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      await resetPassword(token, password);
      setMessage('Password reset successful. Redirecting to login...');
      
    } catch (err) {
      setMessage('Error resetting password. Please try again.');
    }
  };

  return (
    <div className='reset-password-page'>

<ResetPasswordForm
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      handleResetPassword={handleResetPassword}
      message={message}
    />

    </div> 
    
  );
};

export default ResetPassword;
