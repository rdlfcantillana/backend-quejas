
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


//auth import
import MainScreen from './pages/auth/mainscreen/mainscreen';



import ResetPassword from './pages/auth/resetpassword/resetpassword';



const App = () => {


  return (
    
        <Router>
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            
          </Routes>



        </Router>
     
  );
};

export default App;