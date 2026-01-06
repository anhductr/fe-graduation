import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LoginPage from './pages/Auth/LoginPage.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import ProductList from "./pages/Products/ProductList.jsx";
import ProductUpload from "./pages/Products/ProductUpload.jsx";
import CateList from "./pages/Categories/CateList.jsx";
import CateUpload from "./pages/Categories/CateUpload.jsx";
import CateEdit from "./pages/Categories/CateEdit.jsx";
import ProductEdit from './pages/Products/ProductEdit.jsx';
import UserList from './pages/Users/UserList.jsx';
import InventoryList from './pages/Inventory/InventoryList.jsx'
import AddStock from './pages/Inventory/AddStock.jsx'
import PromotionList from './pages/Promotions/PromotionList.jsx'
import PromotionUpload from './pages/Promotions/PromotionUpload.jsx'
import OrderList from './pages/Orders/OrderList.jsx'
import PromotionEdit from './pages/Promotions/PromotionEdit.jsx'
import BrandUpload from './pages/Brands/BrandUpload.jsx'
import BrandEdit from './pages/Brands/BrandEdit.jsx'
import ContentList from './pages/Content/ContentList.jsx'
import ContentUpload from './pages/Content/ContentUpload.jsx'

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Login */}
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <LoginPage />
            </motion.div>
          }
        />

        {/* Dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            }
          />
        </Route>

        {/* Users */}
        <Route path="/users" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <UserList />
              </motion.div>
            }
          />
        </Route>

        {/* Products */}
        <Route path="/products" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ProductList />
              </motion.div>
            }
          />

          <Route
            path="products-edit/:id"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ProductEdit />
              </motion.div>
            }
          />
          <Route
            path="products-upload"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ProductUpload />
              </motion.div>
            }
          />
        </Route>

        {/* Inventory */}
        <Route path="/inventory" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <InventoryList />
              </motion.div>
            }
          />
          <Route
            path="stock-in"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <AddStock />
              </motion.div>
            }
          />
        </Route>

        {/* Categories */}
        <Route path="/categories" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <CateList />
              </motion.div>
            }
          />
          <Route
            path="categories-edit/:id"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <CateEdit />
              </motion.div>
            }
          />
          <Route
            path="categories-upload"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <CateUpload />
              </motion.div>
            }
          />

          <Route
            path="brand-edit"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <BrandEdit />
              </motion.div>
            }
          />
          <Route
            path="brand-upload"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <BrandUpload />
              </motion.div>
            }
          />
        </Route>

        {/* Orders */}
        <Route path="/orders" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <OrderList />
              </motion.div>
            }
          />
        </Route>

        {/* Promotion */}
        <Route path="/promotion" element={<DashboardLayout />}>
          <Route
            index
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <PromotionList />
              </motion.div>
            }
          />
          <Route
            path="promotion-edit/:id"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <PromotionEdit />
              </motion.div>
            }
          />
          <Route
            path="promotion-upload"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <PromotionUpload />
              </motion.div>
            }
          />
        </Route>


        {/* Chatbot Content */}
        <Route path="/contents" element={<DashboardLayout />}>
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

      </Routes>
    </AnimatePresence>
  )
}

export default App
