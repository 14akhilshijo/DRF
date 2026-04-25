import React from 'react';

const AssetViewModal = ({ asset, onClose }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { class: 'bg-success', text: 'Available' },
      assigned: { class: 'bg-primary', text: 'Assigned' },
      maintenance: { class: 'bg-warning', text: 'Under Maintenance' },
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className={`${getCategoryIcon(asset.category)} me-2`}></i>
              Asset Details
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row g-4">
              {/* Asset Header */}
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <i className={`${getCategoryIcon(asset.category)} fa-3x text-primary mb-3`}></i>
                    <h4 className="card-title">{asset.name}</h4>
                    <p className="card-text text-muted">{asset.brand} {asset.model}</p>
                    <div className="d-flex justify-content-center gap-3">
                      {getStatusBadge(asset.status)}
                      <span className="badge bg-info text-capitalize">{asset.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      Basic Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td className="fw-bold">Serial Number:</td>
                          <td><code>{asset.serial_number}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Brand:</td>
                          <td>{asset.brand}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Model:</td>
                          <td>{asset.model}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Category:</td>
                          <td className="text-capitalize">{asset.category}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Location:</td>
                          <td>
                            <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                            {asset.location}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-dollar-sign me-2"></i>
                      Financial Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td className="fw-bold">Purchase Price:</td>
                          <td className="text-success fw-bold">
                            {formatCurrency(asset.purchase_price)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Purchase Date:</td>
                          <td>{formatDate(asset.purchase_date)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Warranty Expiry:</td>
                          <td>
                            {asset.warranty_expiry ? (
                              <span className={
                                new Date(asset.warranty_expiry) < new Date() 
                                  ? 'text-danger' 
                                  : 'text-success'
                              }>
                                {formatDate(asset.warranty_expiry)}
                                {new Date(asset.warranty_expiry) < new Date() && (
                                  <i className="fas fa-exclamation-triangle ms-1"></i>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Age:</td>
                          <td>
                            {Math.floor((new Date() - new Date(asset.purchase_date)) / (1000 * 60 * 60 * 24 * 365))} years
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-clock me-2"></i>
                      Timeline
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-marker bg-success"></div>
                        <div className="timeline-content">
                          <h6 className="timeline-title">Asset Created</h6>
                          <p className="timeline-text text-muted">
                            {formatDate(asset.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker bg-primary"></div>
                        <div className="timeline-content">
                          <h6 className="timeline-title">Last Updated</h6>
                          <p className="timeline-text text-muted">
                            {formatDate(asset.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {asset.description && (
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="card-title mb-0">
                        <i className="fas fa-file-alt me-2"></i>
                        Description
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{asset.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times me-2"></i>
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -23px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .timeline-title {
          margin-bottom: 5px;
          font-size: 0.9rem;
        }
        
        .timeline-text {
          margin-bottom: 0;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default AssetViewModal;