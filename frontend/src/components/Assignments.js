import React, { useState, useEffect } from 'react';
import { assignmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssignmentModal from './modals/AssignmentModal';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAssignments();
  }, [statusFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const data = await assignmentsAPI.getAll(params);
      setAssignments(data.results || []);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Assignments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (assignment) => {
    alert(`Assignment Details:\n\nAsset: ${assignment.asset_name}\nAssigned To: ${assignment.assigned_to_name}\nAssigned By: ${assignment.assigned_by_name}\nDate: ${formatDate(assignment.assigned_date)}\nExpected Return: ${formatDate(assignment.expected_return_date)}\nStatus: ${assignment.status}\nNotes: ${assignment.notes || 'No notes'}`);
  };

  const handleReturn = async (assignment) => {
    if (window.confirm(`Mark assignment as returned?\n\nAsset: ${assignment.asset_name}\nAssigned To: ${assignment.assigned_to_name}`)) {
      try {
        await assignmentsAPI.update(assignment.id, {
          ...assignment,
          status: 'returned',
          actual_return_date: new Date().toISOString().split('T')[0]
        });
        await fetchAssignments();
        alert('Assignment marked as returned successfully!');
      } catch (error) {
        alert('Failed to update assignment. Please try again.');
        console.error('Return error:', error);
      }
    }
  };

  const handleEdit = (assignment) => {
    alert('Edit functionality would open a modal to edit assignment details. This is a placeholder for now.');
  };

  const handleAssignmentSave = async () => {
    await fetchAssignments();
    setShowAssignmentModal(false);
  };

  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'technician';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'bg-success', text: 'Active' },
      returned: { class: 'bg-secondary', text: 'Returned' },
      overdue: { class: 'bg-danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (expectedReturnDate, status) => {
    if (status !== 'active' || !expectedReturnDate) return false;
    return new Date(expectedReturnDate) < new Date();
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
          <h1 className="h3 mb-0">Assignments</h1>
          <p className="text-muted">Track asset assignments to users</p>
        </div>
        {canEdit() && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowAssignmentModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            New Assignment
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
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="card">
        <div className="card-body">
          {assignments.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-user-check fa-3x text-muted mb-3"></i>
              <h5>No assignments found</h5>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Assigned To</th>
                    <th>Assigned By</th>
                    <th>Assignment Date</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr 
                      key={assignment.id}
                      className={isOverdue(assignment.expected_return_date, assignment.status) ? 'table-danger' : ''}
                    >
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-laptop text-primary me-2"></i>
                          <div>
                            <div className="fw-bold">{assignment.asset_name}</div>
                            <small className="text-muted">ID: {assignment.asset}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2">
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-bold">{assignment.assigned_to_name}</div>
                            <small className="text-muted">User ID: {assignment.assigned_to}</small>
                          </div>
                        </div>
                      </td>
                      <td>{assignment.assigned_by_name}</td>
                      <td>{formatDate(assignment.assigned_date)}</td>
                      <td>
                        <span className={isOverdue(assignment.expected_return_date, assignment.status) ? 'text-danger fw-bold' : ''}>
                          {formatDate(assignment.expected_return_date)}
                          {isOverdue(assignment.expected_return_date, assignment.status) && (
                            <i className="fas fa-exclamation-triangle ms-1"></i>
                          )}
                        </span>
                      </td>
                      <td>{getStatusBadge(assignment.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleView(assignment)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {assignment.status === 'active' && canEdit() && (
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleReturn(assignment)}
                              title="Mark as Returned"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          )}
                          {canEdit() && (
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => handleEdit(assignment)}
                              title="Edit Assignment"
                            >
                              <i className="fas fa-edit"></i>
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

      {/* Modal */}
      {showAssignmentModal && (
        <AssignmentModal
          onSave={handleAssignmentSave}
          onClose={() => setShowAssignmentModal(false)}
        />
      )}
    </div>
  );
};

export default Assignments;