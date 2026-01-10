import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import RegistrationForm from "../components/auth/RegistrationForm";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  return (
    <div className="component-container">
      <Navbar></Navbar>
      <div className="flex justify-center py-10">
        <RegistrationForm
          isOpen={true}
          isModal={false}
          onSwitchToLogin={() => navigate('/login')}
        />
      </div>
      <Footer></Footer>
    </div>
  );
}
export default SignUp;
