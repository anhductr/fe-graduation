import React, { useState, useEffect, useContext } from 'react';
import RatingService from '../../services/RatingService';
import RatingsTable from '../../components/Ratings/RatingsTable';
import RatingModal from '../../components/Ratings/RatingModal';
import AlertContext from '../../context/AlertContext';
import Pagination from '../../components/common/Pagination';
import './RatingsList.css';

const RatingsList = ({ productId }) => {
  const { showAlert } = useContext(AlertContext);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPage: 0,
    totalElements: 0
  });

  // Fetch ratings on mount and when filters change
  useEffect(() => {
    fetchRatings();
  }, [productId, filterType, pagination.page]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      let response;

      if (productId && productId.trim()) {
        response = await RatingService.getAllRatingsFiltered(
          productId,
          pagination.page,
          pagination.size,
          filterType
        );
      } else {
        response = await RatingService.getAllRatings(
          pagination.page,
          pagination.size
        );
      }

      if (response.data && response.data.result) {
        setRatings(response.data.result.data);
        setPagination(prev => ({
          ...prev,
          totalPage: response.data.result.totalPage,
          totalElements: response.data.result.totalElements
        }));
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      showAlert(error.response?.data?.message || 'Failed to load ratings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRating = (rating) => {
    setSelectedRating(rating);
    setShowModal(true);
  };

  const handleSaveRating = async (formData) => {
    try {
      setLoading(true);
      if (formData.id) {
        // Update existing rating
        const response = await RatingService.updateRating(formData);
        if (response.data) {
          setRatings(ratings.map(r => r.id === formData.id ? response.data.result : r));
          showAlert('Rating updated successfully', 'success');
        }
      }
      setShowModal(false);
      setSelectedRating(null);
    } catch (error) {
      console.error('Error saving rating:', error);
      showAlert(error.response?.data?.message || 'Failed to save rating', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (id) => {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      try {
        setLoading(true);
        await RatingService.deleteRating(id);
        setRatings(ratings.filter(r => r.id !== id));
        showAlert('Rating deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting rating:', error);
        showAlert(error.response?.data?.message || 'Failed to delete rating', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="ratings-list-container">
      {/* 
      <div className="page-header">
        <h1>Rating Management</h1>
        <p>Manage user ratings for your products</p>
      </div>
       */}

      <div className="search-filter-section">
        <div className="filter-group">
          <label>Filter by:</label>
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Ratings</option>
            <option value="HAVE_PURCHASE">Have Purchase</option>
            <option value="STAR_FIVE">5 Stars</option>
            <option value="STAR_FOUR">4 Stars</option>
            <option value="STAR_THREE">3 Stars</option>
            <option value="STAR_TWO">2 Stars</option>
            <option value="STAR_ONE">1 Star</option>
          </select>
        </div>
      </div>

      {productId && (
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-label">Total Ratings</span>
            <span className="stat-value">{pagination.totalElements}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Page</span>
            <span className="stat-value">{pagination.page} / {pagination.totalPage}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Per Page</span>
            <span className="stat-value">{pagination.size}</span>
          </div>
        </div>
      )}

      <RatingsTable
        ratings={ratings}
        onEdit={handleEditRating}
        onDelete={handleDeleteRating}
        loading={loading}
      />

      <Pagination
        currentPage={pagination.page}
        totalPage={pagination.totalPage}
        totalElements={pagination.totalElements}
        pageSize={pagination.size}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {showModal && (
        <RatingModal
          rating={selectedRating}
          onClose={() => {
            setShowModal(false);
            setSelectedRating(null);
          }}
          onSave={handleSaveRating}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default RatingsList;
