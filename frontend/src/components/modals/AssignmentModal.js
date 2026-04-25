import React, { useState, useEffect } from 'react';
import { assignmentsAPI, assetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AssignmentModal = ({ onSave, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    asset: '',
    assigned_to: '',
    expected_return_date: '',
    notes: '',
    condition_on_assignment: ''
  });
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableAssets();
  }, []);

  const fetchAvailableAssets = async () => {
    try {
      const response = await assetsAPI.getAll({ status: 'available' });
      setAvailableAssets(response.results || []);
    } catch (error) {
      console.error('Failed to fetch available assets:', error);
    }
  };

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
      await assignmentsAPI.create({
        ...formData,
        assigned_by: user.id
      });
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user-check me-2"></i>
              Create New Assignment
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

              <div className="mb-3">
                <label className="form-label">Select Asset *</label>
                <select
                  className="form-select"
                  name="asset"
                  value={formData.asset}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose an available asset...</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.serial_number} ({asset.brand} {asset.model})
                    </option>
                  ))}
                </select>
                {availableAssets.length === 0 && (
                  <small className="text-muted">No available assets found</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Assign To (User ID) *</label>
                <input
                  type="number"
                  className="form-control"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  required
                  placeholder="Enter user ID"
                />
                <small className="text-muted">Enter the ID of the user to assign this asset to</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Expected Return Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expected_return_date"
                  value={formData.expected_return_date}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Asset Condition</label>
                <textarea
                  className="form-control"
                  name="condition_on_assignment"
                  value={formData.condition_on_assignment}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Describe the condition of the asset being assigned..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional notes about this assignment..."
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-info" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Create Assignment
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

export default AssignmentModal;