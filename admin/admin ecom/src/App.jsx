import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoginPage from './pages/Auth/LoginPage.jsx'
import ChangePassword from './pages/Auth/ChangePassword.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import ProductList from "./pages/Products/ProductList.jsx";
import ProductUpload from "./pages/Products/ProductUpload.jsx";
import CateList from "./pages/Categories/CateList.jsx";
import CateUpload from "./pages/Categories/CateUpload.jsx";

import ProductEdit from './pages/Products/ProductEdit.jsx';
import UserList from './pages/Users/UserList.jsx';
import UserProfile from './pages/Users/UserProfile.jsx';
import InventoryList from './pages/Inventory/InventoryList.jsx'
import AddStock from './pages/Inventory/AddStock.jsx'
import PromotionList from './pages/Promotions/PromotionList.jsx'
import PromotionUpload from './pages/Promotions/PromotionUpload.jsx'
import OrderList from './pages/Orders/OrderList.jsx'
import PromotionEdit from './pages/Promotions/PromotionEdit.jsx'
import CampaignUpload from './pages/Promotions/CampaignUpload.jsx'
import BrandUpload from './pages/Brands/BrandUpload.jsx'
import BrandEdit from './pages/Brands/BrandEdit.jsx'
import ContentList from './pages/Content/ContentList.jsx'
import ContentUpload from './pages/Content/ContentUpload.jsx'
import ReviewsIndex from './pages/Reviews/ReviewsIndex.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Analysis from './pages/Analysis/Analysis.jsx'

function App() {
  const location = useLocation();

  return (
    <Routes location={location}>
      {/* Login Page stays as is, it can have its own internal motion.div if needed */}
      <Route
        path="/"
        element={
          <LoginPage />
        }
      />

      {/* Dashboard layout - Children are animated inside DashboardLayout */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
      </Route>

      {/* Auth - Change Password */}
      <Route path="/auth" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Users */}
      <Route path="/users" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<UserList />} />
        <Route path="users-view/:id" element={<UserProfile />} />
      </Route>

      {/* Products */}
      <Route path="/products" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ProductList />} />
        <Route path="products-edit/:id" element={<ProductEdit />} />
        <Route path="products-upload" element={<ProductUpload />} />
      </Route>

      {/* Inventory */}
      <Route path="/inventory" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<InventoryList />} />
        <Route path="stock-in" element={<AddStock />} />
      </Route>

      {/* Categories */}
      <Route path="/categories" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<CateList />} />
        <Route path="categories-edit/:id" element={<CateUpload />} />
        <Route path="categories-upload" element={<CateUpload />} />
        <Route path="brand-edit" element={<BrandEdit />} />
        <Route path="brand-upload" element={<BrandUpload />} />
      </Route>

      {/* Orders */}
      <Route path="/orders" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<OrderList />} />
      </Route>

      {/* Promotion */}
      <Route path="/promotion" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PromotionList />} />
        <Route path="promotion-edit/:id" element={<PromotionEdit />} />
        <Route path="promotion-upload" element={<PromotionUpload />} />
        <Route path="campaign-upload" element={<CampaignUpload />} />
        <Route path="campaign-edit/:id" element={<CampaignUpload />} />
      </Route>

      {/* Chatbot Content */}
      <Route path="/contents" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ContentList />} />
        <Route path="upload" element={<ContentUpload />} />
        <Route path="edit/:id" element={<ContentUpload />} />
      </Route>

      {/* Reviews */}
      <Route path="/reviews" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ReviewsIndex />} />
      </Route>
      {/* Chatbot Content */}
      <Route path="/contents" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route
          index
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <ContentList />
            </motion.div>
          }
        />
        <Route
          path="upload"
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <ContentUpload />
            </motion.div>
          }
        />
        <Route
          path="edit/:id"
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <ContentUpload />
            </motion.div>
          }
        />
      </Route>

      {/* Reviews (Ratings & Comments) */}
      <Route path="/reviews" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route
          index
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <ReviewsIndex />
            </motion.div>
          }
        />
      </Route>

      <Route path="/analysis" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route
          index
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Analysis />
            </motion.div>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
