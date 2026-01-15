import "./App.css";
import Home from "./pages/Home";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import SearchResultPage from "./pages/SearchResultPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import { useContext, useEffect, useState } from "react";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserInfoPage from "./pages/UserInfoPage";
import OrderPage from "./pages/OrderPage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginForm from "./components/auth/LogInForm";
import RegistrationForm from "./components/auth/RegistrationForm";
import ScrollToTop from "./components/utils/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import AddressManager from "./pages/AddressPage";
import Chatbot from "./components/Chatbot/Chatbot";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />}></Route>
        <Route path="/checkout" element={<CheckoutPage />}></Route>
        <Route path="/payment-result" element={<PaymentResultPage />}></Route>
        <Route path="/:name" element={<ProductPage />}></Route>
        <Route path="/search" element={<SearchResultPage></SearchResultPage>} ></Route>
        <Route path="/cart" element={<CartPage></CartPage>}></Route>
        <Route path="/account" element={<UserDashboardPage />}>
          <Route
            index
            element={
              <UserInfoPage />
            }
          />
          <Route
            path="orders"
            element={
              <OrderPage />
            }
          />
          <Route
            path="address"
            element={
              <AddressManager />
            }
          />
        </Route>
      </Routes>

      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isModal={true}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <Chatbot />
      <ToastContainer position="top-right" autoClose={3000} />

      <RegistrationForm
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        isModal={true}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </CartProvider>
  );
}

export default App;
