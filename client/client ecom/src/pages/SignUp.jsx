import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import RegistrationForm from "../components/RegisterationForm";

function SignUp() {
  return (
    <div className="component-container">
      <Navbar></Navbar>
      <RegistrationForm></RegistrationForm>
      <Footer></Footer>
    </div>
  );
}
export default SignUp;
