import "./App.css";
import Home from "./pages/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import SearchResultPage from "./pages/SearchResultPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import { useContext } from "react";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserInfo from "./components/UserInfo";
import Order from "./components/Order";

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
              <UserInfo />
            }
          />
          <Route
            path="orders"
            element={
              <Order />
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
