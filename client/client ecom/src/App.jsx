import "./App.css";
import Home from "./pages/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import SearchResultPage from "./pages/SearchResultPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import { useContext } from "react";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserInfoPage from "./pages/UserInfoPage";
import OrderPage from "./pages/OrderPage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { CartProvider } from "./context/CartContext";

function App() {
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
    </CartProvider>
  );
}

export default App;
