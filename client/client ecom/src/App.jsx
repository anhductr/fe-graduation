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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
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
    </>
  );
}

export default App;
