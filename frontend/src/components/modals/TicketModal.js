import React, { useState, useEffect } from 'react';
import { ticketsAPI, assetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TicketModal = ({ ticket, onSave, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    asset: ''
  });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssets();
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        category: ticket.category || 'other',
        priority: ticket.priority || 'medium',
        asset: ticket.asset || ''
      });
    }
  }, [ticket]);

  const fetchAssets = async () => {
    try {
      const response = await assetsAPI.getAll();
      setAssets(response.results || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
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
      const submitData = {
        ...formData,
        asset: formData.asset || null
      };

      if (ticket) {
        await ticketsAPI.update(ticket.id, submitData);
      } else {
        await ticketsAPI.create(submitData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save ticket');
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
              <i className="fas fa-ticket-alt me-2"></i>
              {ticket ? 'Edit Support Ticket' : 'Create Support Ticket'}
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
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Detailed description of the issue or request..."
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="hardware_issue">Hardware Issue</option>
                    <option value="software_issue">Software Issue</option>
                    <option value="access_request">Access Request</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="replacement">Replacement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Priority *</label>
                  <select
                    className="form-select"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Related Asset (Optional)</label>
                <select
                  className="form-select"
                  name="asset"
                  value={formData.asset}
                  onChange={handleChange}
                >
                  <option value="">No specific asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.serial_number}
                    </option>
                  ))}
                </select>
                <small className="text-muted">Select an asset if this ticket is related to a specific item</small>
              </div>

              {user?.role === 'user' && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Your ticket will be reviewed by our technical team and assigned accordingly.
                </div>
              )}
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
                    {ticket ? 'Update Ticket' : 'Create Ticket'}
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

export default TicketModal;