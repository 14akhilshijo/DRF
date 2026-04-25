import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetModal from './modals/AssetModal';
import AssetViewModal from './modals/AssetViewModal';

const Assets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAssets();
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const data = await assetsAPI.getAll(params);
      setAssets(data.results || []);
    } catch (err) {
      setError('Failed to load assets');
      console.error('Assets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (asset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setShowAssetModal(true);
  };

  const handleDelete = async (asset) => {
    if (window.confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      try {
        await assetsAPI.delete(asset.id);
        await fetchAssets(); // Refresh the list
        alert('Asset deleted successfully!');
      } catch (error) {
        alert('Failed to delete asset. Please try again.');
        console.error('Delete error:', error);
      }
    }
  };

  const handleAssetSave = async () => {
    await fetchAssets();
    setShowAssetModal(false);
    setSelectedAsset(null);
  };

  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'technician';
  };

  const canDelete = () => {
    return user?.role === 'admin';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { class: 'bg-success', text: 'Available' },
      assigned: { class: 'bg-primary', text: 'Assigned' },
      maintenance: { class: 'bg-warning', text: 'Maintenance' },
      retired: { class: 'bg-secondary', text: 'Retired' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      laptop: 'fas fa-laptop',
      desktop: 'fas fa-desktop',
      monitor: 'fas fa-tv',
      phone: 'fas fa-mobile-alt',
      tablet: 'fas fa-tablet-alt',
      printer: 'fas fa-print',
      other: 'fas fa-cube'
    };
    return icons[category] || icons.other;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Assets</h1>
          <p className="text-muted">Manage your organization's assets</p>
        </div>
        {canEdit() && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowAssetModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Add Asset
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="monitor">Monitor</option>
                <option value="phone">Phone</option>
                <option value="tablet">Tablet</option>
                <option value="printer">Printer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card">
        <div className="card-body">
          {assets.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-laptop fa-3x text-muted mb-3"></i>
              <h5>No assets found</h5>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Serial Number</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Purchase Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`${getCategoryIcon(asset.category)} text-primary me-2`}></i>
                          <div>
                            <div className="fw-bold">{asset.name}</div>
                            <small className="text-muted">{asset.brand} {asset.model}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code>{asset.serial_number}</code>
                      </td>
                      <td>
                        <span className="text-capitalize">{asset.category}</span>
                      </td>
                      <td>{getStatusBadge(asset.status)}</td>
                      <td>{asset.location}</td>
                      <td>{new Date(asset.purchase_date).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleView(asset)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {canEdit() && (
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => handleEdit(asset)}
                              title="Edit Asset"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {canDelete() && (
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(asset)}
                              title="Delete Asset"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAssetModal && (
        <AssetModal
          asset={selectedAsset}
          onSave={handleAssetSave}
          onClose={() => {
            setShowAssetModal(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {showViewModal && selectedAsset && (
        <AssetViewModal
          asset={selectedAsset}
          onClose={() => {
            setShowViewModal(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default Assets;