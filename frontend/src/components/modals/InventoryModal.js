import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';

const InventoryModal = ({ inventory, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'accessories',
    sku: '',
    description: '',
    quantity_in_stock: '',
    minimum_stock_level: '',
    unit_price: '',
    supplier: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inventory) {
      setFormData({
        name: inventory.name || '',
        category: inventory.category || 'accessories',
        sku: inventory.sku || '',
        description: inventory.description || '',
        quantity_in_stock: inventory.quantity_in_stock || '',
        minimum_stock_level: inventory.minimum_stock_level || '',
        unit_price: inventory.unit_price || '',
        supplier: inventory.supplier || '',
        location: inventory.location || ''
      });
    }
  }, [inventory]);

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
      if (inventory) {
        await inventoryAPI.update(inventory.id, formData);
      } else {
        await inventoryAPI.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save inventory item');
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
              <i className="fas fa-boxes me-2"></i>
              {inventory ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., USB-C Cable"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    placeholder="e.g., CABLE001"
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
                    <option value="accessories">Accessories</option>
                    <option value="cables">Cables</option>
                    <option value="consumables">Consumables</option>
                    <option value="software">Software</option>
                    <option value="parts">Parts</option>
                    <option value="other">Other</option>
                  </select>
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
                    placeholder="e.g., Storage Room A"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Quantity in Stock *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity_in_stock"
                    value={formData.quantity_in_stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Minimum Stock Level *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="minimum_stock_level"
                    value={formData.minimum_stock_level}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="5"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Unit Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    className="form-control"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="e.g., Tech Supplies Inc."
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
                    placeholder="Additional details about this inventory item..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {inventory ? 'Update Item' : 'Create Item'}
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

export default InventoryModal;