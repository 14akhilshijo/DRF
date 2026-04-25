import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/api';

const AssetModal = ({ asset, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    category: 'laptop',
    brand: '',
    model: '',
    status: 'available',
    location: '',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        serial_number: asset.serial_number || '',
        category: asset.category || 'laptop',
        brand: asset.brand || '',
        model: asset.model || '',
        status: asset.status || 'available',
        location: asset.location || '',
        purchase_date: asset.purchase_date || '',
        purchase_price: asset.purchase_price || '',
        warranty_expiry: asset.warranty_expiry || '',
        description: asset.description || ''
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (asset) {
        await assetsAPI.update(asset.id, formData);
      } else {
        await assetsAPI.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-laptop me-2"></i>
              {asset ? 'Edit Asset' : 'Add New Asset'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Asset Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., MacBook Pro 16"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Serial Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    required
                    placeholder="e.g., MBP001"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="monitor">Monitor</option>
                    <option value="phone">Phone</option>
                    <option value="tablet">Tablet</option>
                    <option value="printer">Printer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Brand *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Apple, Dell, HP"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Model *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    placeholder="e.g., MacBook Pro M2"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Office Floor 1"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Purchase Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Purchase Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Warranty Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    name="warranty_expiry"
                    value={formData.warranty_expiry}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional notes about this asset..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {asset ? 'Update Asset' : 'Create Asset'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssetModal;