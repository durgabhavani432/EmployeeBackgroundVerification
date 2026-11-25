
import { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  // Authentication
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Employee data
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Employee form fields
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('Pending');

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Document states
  const [documents, setDocuments] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  // General states
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/employees',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch employees');
      }

      setEmployees(data);

      setSelectedEmployee((currentEmployee) => {
        if (!currentEmployee) return null;

        return data.find(
          (employee) => employee.id === currentEmployee.id
        ) || null;
      });

    } catch (error) {
      setMessage(error.message);
    }
  }, [token]);

  // Fetch employees after login
  useEffect(() => {
  if (!token) return;

  const loadEmployees = async () => {
    await fetchEmployees();
  };

  loadEmployees();
}, [token, fetchEmployees]);
  // Fetch documents for selected employee
  const fetchDocuments = useCallback(async (employeeId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${employeeId}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch documents');
      }

      setDocuments(data);

    } catch (error) {
      setMessage(error.message);
      setDocuments([]);
    }
  }, [token]);

  // Load documents when an employee is selected
  useEffect(() => {
  if (!selectedEmployee || !token) return;

  const loadDocuments = async () => {
    await fetchDocuments(selectedEmployee.id);
  };

  loadDocuments();
}, [selectedEmployee, token, fetchDocuments]);
  // Upload document
  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!documentName.trim()) {
      setMessage('Please enter a document name.');
      return;
    }

    if (!selectedFile) {
      setMessage('Please select a document.');
      return;
    }

    const formData = new FormData();
    formData.append('documentName', documentName);
    formData.append('document', selectedFile);

    setDocumentLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${selectedEmployee.id}/documents`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Document upload failed');
      }

      setMessage('Document uploaded successfully!');
      setDocumentName('');
      setSelectedFile(null);

      e.target.reset();

      await fetchDocuments(selectedEmployee.id);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setDocumentLoading(false);
    }
  };

  // Download document
  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${selectedEmployee.id}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Unable to download document');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;

      const docRecord = documents.find(
        (doc) => doc.id === documentId
      );

      link.download = docRecord?.file_name || 'document';

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      setMessage(error.message);
    }
  };

  // Login and Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const url = isLogin
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register';

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setMessage('Registration successful! Please login.');
        setIsLogin(true);
        setName('');
        setPassword('');
      }

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset employee form
  const resetEmployeeForm = () => {
    setEmployeeName('');
    setEmployeeEmail('');
    setEmployeePhone('');
    setEmployeeRole('');
    setEmployeeStatus('Pending');
    setEditingId(null);
    setShowForm(false);
  };

  // Add or Update Employee
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const employeeData = {
      name: employeeName,
      email: employeeEmail,
      phone: employeePhone,
      job_role: employeeRole,
      verification_status: employeeStatus
    };

    const isEditing = editingId !== null;

    try {
      const response = await fetch(
        isEditing
          ? `http://localhost:5000/api/employees/${editingId}`
          : 'http://localhost:5000/api/employees',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(employeeData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save employee');
      }

      setMessage(
        isEditing
          ? 'Employee updated successfully!'
          : 'Employee added successfully!'
      );

      resetEmployeeForm();
      await fetchEmployees();

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Employee
  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setEmployeeName(employee.name || '');
    setEmployeeEmail(employee.email || '');
    setEmployeePhone(employee.phone || '');
    setEmployeeRole(employee.job_role || '');
    setEmployeeStatus(employee.verification_status || 'Pending');

    setShowForm(true);
    setSelectedEmployee(null);
    setDocuments([]);
    setMessage('');
  };

  // Delete Employee
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this employee?'
    );

    if (!confirmDelete) return;

    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete employee');
      }

      setMessage('Employee deleted successfully!');
      setSelectedEmployee(null);
      setDocuments([]);

      await fetchEmployees();

    } catch (error) {
      setMessage(error.message);
    }
  };

  // Dashboard Summary Counts
  const totalEmployees = employees.length;

  const pendingEmployees = employees.filter(
    (employee) => employee.verification_status === 'Pending'
  ).length;

  const verifiedEmployees = employees.filter(
    (employee) => employee.verification_status === 'Verified'
  ).length;

  const rejectedEmployees = employees.filter(
    (employee) => employee.verification_status === 'Rejected'
  ).length;

  // Search and Filter
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (employee.name || '').toLowerCase().includes(search) ||
      (employee.email || '').toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'All' ||
      employee.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');

    setToken(null);
    setEmployees([]);
    setEmail('');
    setPassword('');
    setMessage('');
    setSearchTerm('');
    setStatusFilter('All');
    setSelectedEmployee(null);
    setDocuments([]);
    setIsLogin(true);

    resetEmployeeForm();
  };

  // Export employees to CSV
  const handleExportCSV = () => {
    if (employees.length === 0) {
      alert('No employee records available to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Job Role',
      'Verification Status'
    ];

    const rows = employees.map((employee) => [
      employee.id,
      employee.name,
      employee.email,
      employee.phone || '',
      employee.job_role || '',
      employee.verification_status || 'Pending'
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');

    link.href = downloadUrl;
    link.download = 'employee_records.csv';

    window.document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  };

  // Dashboard
  if (token) {
    return (
      <div className="dashboard">

        <header className="dashboard-header">
          <div>
            <h1>Employee Background Check</h1>
            <p>Employee Verification Dashboard</p>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <main className="dashboard-content">

          <div className="dashboard-title">
            <div>
              <h2>Employee Records</h2>
              <p>Total Employees: {employees.length}</p>
            </div>

            <button
              className="add-employee-btn"
              onClick={() => {
                if (showForm) {
                  resetEmployeeForm();
                } else {
                  setEditingId(null);
                  setEmployeeName('');
                  setEmployeeEmail('');
                  setEmployeePhone('');
                  setEmployeeRole('');
                  setEmployeeStatus('Pending');
                  setShowForm(true);
                  setMessage('');
                }
              }}
            >
              {showForm ? 'Close Form' : '+ Add Employee'}
            </button>

            <button
              type="button"
              className="export-btn"
              onClick={handleExportCSV}
            >
              Export Employees
            </button>
          </div>

          {/* Dashboard Summary Cards */}
          <div className="summary-cards">

            <div className="summary-card total-card">
              <p>Total Employees</p>
              <h3>{totalEmployees}</h3>
            </div>

            <div className="summary-card pending-card">
              <p>Pending</p>
              <h3>{pendingEmployees}</h3>
            </div>

            <div className="summary-card verified-card">
              <p>Verified</p>
              <h3>{verifiedEmployees}</h3>
            </div>

            <div className="summary-card rejected-card">
              <p>Rejected</p>
              <h3>{rejectedEmployees}</h3>
            </div>

          </div>

          {message && (
            <p className="dashboard-message">{message}</p>
          )}

          {/* Add and Edit Form */}
          {showForm && (
            <div className="employee-form-container">

              <h3>
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h3>

              <form
                className="employee-form"
                onSubmit={handleSaveEmployee}
              >

                <input
                  type="text"
                  placeholder="Employee Name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Employee Email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  required
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Job Role"
                  value={employeeRole}
                  onChange={(e) => setEmployeeRole(e.target.value)}
                />

                {editingId && (
                  <select
                    value={employeeStatus}
                    onChange={(e) => setEmployeeStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                )}

                <button type="submit" disabled={loading}>
                  {loading
                    ? 'Please wait...'
                    : editingId
                      ? 'Update Employee'
                      : 'Save Employee'}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetEmployeeForm}
                >
                  Cancel
                </button>

              </form>
            </div>
          )}

          {/* Search and Filter */}
          <div className="filter-container">

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

          </div>

          {/* Employee Table */}
          {employees.length === 0 ? (

            <div className="empty-message">
              <h3>No employees found</h3>
              <p>Click Add Employee to create your first record.</p>
            </div>

          ) : filteredEmployees.length === 0 ? (

            <div className="empty-message">
              <h3>No matching employees</h3>
              <p>Try another search or status filter.</p>
            </div>

          ) : (

            <div className="table-container">

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Job Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (

                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone || '-'}</td>
                      <td>{employee.job_role || '-'}</td>

                      <td>
                        <span
                          className={`status status-${(
                            employee.verification_status || 'Pending'
                          ).toLowerCase()}`}
                        >
                          {employee.verification_status || 'Pending'}
                        </span>
                      </td>

                      <td className="action-buttons">

                        <button
                          className="view-btn"
                          onClick={() => {
                            setMessage('');
                            setDocumentName('');
                            setSelectedFile(null);
                            setDocuments([]);
                            setSelectedEmployee(employee);
                          }}
                        >
                          View
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete
                        </button>

                      </td>
                    </tr>

                  ))}
                </tbody>
              </table>

            </div>
          )}

          {/* Employee Details Popup */}
          {selectedEmployee && (

            <div
              className="modal-overlay"
              onClick={() => {
                setSelectedEmployee(null);
                setDocuments([]);
              }}
            >

              <div
                className="employee-details"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="details-header">
                  <h2>Employee Details</h2>

                  <button
                    className="modal-close"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setDocuments([]);
                    }}
                  >
                    ×
                  </button>
                </div>

                <div className="details-content">

                  <p>
                    <strong>Employee ID:</strong>
                    <span>{selectedEmployee.id}</span>
                  </p>

                  <p>
                    <strong>Name:</strong>
                    <span>{selectedEmployee.name}</span>
                  </p>

                  <p>
                    <strong>Email:</strong>
                    <span>{selectedEmployee.email}</span>
                  </p>

                  <p>
                    <strong>Phone:</strong>
                    <span>{selectedEmployee.phone || '-'}</span>
                  </p>

                  <p>
                    <strong>Job Role:</strong>
                    <span>{selectedEmployee.job_role || '-'}</span>
                  </p>

                  <p>
                    <strong>Verification Status:</strong>

                    <span
                      className={`status status-${(
                        selectedEmployee.verification_status || 'Pending'
                      ).toLowerCase()}`}
                    >
                      {selectedEmployee.verification_status || 'Pending'}
                    </span>
                  </p>

                  <p>
                    <strong>Created At:</strong>
                    <span>
                      {selectedEmployee.created_at
                        ? new Date(
                            selectedEmployee.created_at
                          ).toLocaleDateString()
                        : '-'}
                    </span>
                  </p>

                </div>

                {/* Document Upload Section */}
                <div className="document-section">

                  <h3>Employee Documents</h3>

                  <form
                    className="document-upload-form"
                    onSubmit={handleUploadDocument}
                  >

                    <input
                      type="text"
                      placeholder="Document Name (e.g. Resume)"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      required
                    />

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setSelectedFile(e.target.files[0] || null)
                      }
                      required
                    />

                    <p className="document-hint">
                      Allowed formats: PDF, JPG, PNG.
                      Maximum size: 5 MB.
                    </p>

                    <button
                      type="submit"
                      disabled={documentLoading}
                    >
                      {documentLoading
                        ? 'Uploading...'
                        : 'Upload Document'}
                    </button>

                  </form>

                  <h4>Uploaded Documents</h4>

                  {documents.length === 0 ? (

                    <p className="no-documents">
                      No documents uploaded yet.
                    </p>

                  ) : (

                    <div className="document-list">

                      {documents.map((doc) => (

                        <div className="document-item" key={doc.id}>

                          <div>
                            <strong>{doc.document_name}</strong>
                            <p>{doc.file_name}</p>

                            <small>
                              {doc.uploaded_at
                                ? new Date(
                                    doc.uploaded_at
                                  ).toLocaleDateString()
                                : ''}
                            </small>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadDocument(doc.id)
                            }
                          >
                            Download
                          </button>

                        </div>

                      ))}

                    </div>
                  )}

                </div>

                <button
                  className="close-details-btn"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setDocuments([]);
                  }}
                >
                  Close
                </button>

              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  // Login and Registration Page
  return (
    <div className="app-container">

      <div className="auth-card">

        <h1>Employee Background Check</h1>

        <p className="subtitle">
          Secure Employee Verification System
        </p>

        <div className="tab-buttons">

          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(true);
              setMessage('');
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(false);
              setMessage('');
            }}
          >
            Register
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Login'
                : 'Create Account'}
          </button>

        </form>

        {message && (
          <p className="message">{message}</p>
        )}

      </div>
    </div>
  );
}

export default App;
