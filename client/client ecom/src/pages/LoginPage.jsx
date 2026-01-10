import React from "react";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import LoginForm from "../components/auth/LogInForm";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    return (
        <div className="component-container">
            <Navbar></Navbar>
            <div className="flex justify-center py-10">
                <LoginForm
                    isOpen={true}
                    isModal={false}
                    onSwitchToRegister={() => navigate('/signup')}
                    onClose={() => navigate('/')} // Redirect to home if close (though close button might be hidden in non-modal)
                />
            </div>
            <Footer></Footer>
        </div>
    );
}

export default LoginPage;
