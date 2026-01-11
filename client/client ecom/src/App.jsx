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
import { CartProvider } from "./context/CartContext";

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
        </Route>
      </Routes>

      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isModal={true}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          navigate("/signup");
        }}
      />
    </CartProvider>
  );
}

export default App;
