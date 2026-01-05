import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import Dashboard from "./components/Dashboard.jsx";
import ProductList from "./components/ProductList.jsx";
import ProductUpload from "./components/ProductUpload.jsx";
import CateList from "./components/CateList.jsx";
import CateUpload from "./components/CateUpload.jsx";
import CateEdit from "./components/CateEdit.jsx";
import ProductEdit from './components/ProductEdit.jsx';
import UserList from './components/UserList.jsx';
import InventoryList from './components/InventoryList.jsx'
import AddStock from './components/AddStock.jsx'
import PromotionList from './components/PromotionList.jsx'
import PromotionUpload from './components/PromotionUpload.jsx'
import OrderList from './components/OrderList.jsx'
import PromotionEdit from './components/PromotionEdit.jsx'
import BrandUpload from './components/BrandUpload.jsx'
import BrandEdit from './components/BrandEdit.jsx'
import ContentList from './components/ContentList.jsx'
import ContentUpload from './components/ContentUpload.jsx'

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
        <Route path="/dashboard" element={<HomePage />}>
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
        <Route path="/users" element={<HomePage />}>
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
        <Route path="/products" element={<HomePage />}>
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
        <Route path="/inventory" element={<HomePage />}>
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
        <Route path="/categories" element={<HomePage />}>
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
        <Route path="/orders" element={<HomePage />}>
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
        <Route path="/promotion" element={<HomePage />}>
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
        <Route path="/contents" element={<HomePage />}>
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
