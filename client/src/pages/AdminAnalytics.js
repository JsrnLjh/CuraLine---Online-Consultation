import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, DollarSign, Users, Calendar, 
  BarChart3, PieChart, Clock, CheckCircle,
  AlertCircle, FileText, Briefcase, CreditCard,
  Activity, ArrowUpRight, ArrowDownRight,
  Filter, Download, RefreshCw
} from 'lucide-react';
import './AdminAnalytics.css';

function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [doctorPerformance, setDoctorPerformance] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [activeTab, setActiveTab] = useState('high-priority');

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedPeriod]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRevenueData(),
        fetchExpensesData(),
        fetchPayrollData(),
        fetchDoctorPerformance()
      ]);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setDashboardStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats');
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await axios.get(`/api/analytics/revenue?period=${selectedPeriod}`);
      setRevenueData(response.data);
    } catch (err) {
      console.error('Failed to fetch revenue data');
    }
  };

  const fetchExpensesData = async () => {
    try {
      const response = await axios.get('/api/analytics/expenses');
      setExpensesData(response.data);
    } catch (err) {
      console.error('Failed to fetch expenses data');
    }
  };

  const fetchPayrollData = async () => {
    try {
      const response = await axios.get('/api/analytics/payroll');
      setPayrollData(response.data);
    } catch (err) {
      console.error('Failed to fetch payroll data');
    }
  };

  const fetchDoctorPerformance = async () => {
    try {
      const response = await axios.get(`/api/analytics/doctor-performance?period=${selectedPeriod}`);
      setDoctorPerformance(response.data);
    } catch (err) {
      console.error('Failed to fetch doctor performance');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="container">
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1>Analytics & Reports</h1>
            <p>Comprehensive insights into your healthcare platform</p>
          </div>
          <div className="header-actions">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="btn btn-secondary" onClick={fetchAllAnalytics}>
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="btn btn-primary">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Priority Tabs */}
        <div className="priority-tabs">
          <button 
            className={`tab ${activeTab === 'high-priority' ? 'active' : ''}`}
            onClick={() => setActiveTab('high-priority')}
          >
            <AlertCircle size={18} />
            High Priority
          </button>
          <button 
            className={`tab ${activeTab === 'medium-priority' ? 'active' : ''}`}
            onClick={() => setActiveTab('medium-priority')}
          >
            <BarChart3 size={18} />
            Medium Priority
          </button>
          <button 
            className={`tab ${activeTab === 'low-priority' ? 'active' : ''}`}
            onClick={() => setActiveTab('low-priority')}
          >
            <FileText size={18} />
            Low Priority
          </button>
        </div>

        {/* HIGH PRIORITY ANALYTICS */}
        {activeTab === 'high-priority' && (
          <div className="analytics-section">
            <h2 className="section-title">
              <AlertCircle size={24} />
              High Priority Metrics
            </h2>

            {/* Key Metrics Overview */}
            {dashboardStats && (
              <>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-header">
                      <div className="metric-icon revenue">
                        <DollarSign size={24} />
                      </div>
                      <span className="metric-trend positive">
                        <ArrowUpRight size={16} />
                        12.5%
                      </span>
                    </div>
                    <h3>Monthly Revenue</h3>
                    <p className="metric-value">{formatCurrency(dashboardStats.month.revenue)}</p>
                    <span className="metric-label">Last 30 days</span>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <div className="metric-icon consultations">
                        <Activity size={24} />
                      </div>
                      <span className="metric-trend positive">
                        <ArrowUpRight size={16} />
                        8.3%
                      </span>
                    </div>
                    <h3>Total Consultations</h3>
                    <p className="metric-value">{dashboardStats.month.consultations}</p>
                    <span className="metric-label">This month</span>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <div className="metric-icon profit">
                        <TrendingUp size={24} />
                      </div>
                      <span className="metric-trend positive">
                        <ArrowUpRight size={16} />
                        15.2%
                      </span>
                    </div>
                    <h3>Net Profit</h3>
                    <p className="metric-value">{formatCurrency(dashboardStats.month.netProfit)}</p>
                    <span className="metric-label">Revenue - Expenses</span>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <div className="metric-icon patients">
                        <Users size={24} />
                      </div>
                      <span className="metric-trend positive">
                        <ArrowUpRight size={16} />
                        5.7%
                      </span>
                    </div>
                    <h3>Total Patients</h3>
                    <p className="metric-value">{dashboardStats.totals.patients}</p>
                    <span className="metric-label">All time</span>
                  </div>
                </div>

                {/* Period Breakdown */}
                <div className="section-grid">
                  <div className="card">
                    <h3>Consultation Breakdown</h3>
                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <Calendar size={18} />
                          Today
                        </div>
                        <span className="breakdown-value">{dashboardStats.today.consultations}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <Calendar size={18} />
                          This Week
                        </div>
                        <span className="breakdown-value">{dashboardStats.week.consultations}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <Calendar size={18} />
                          This Month
                        </div>
                        <span className="breakdown-value">{dashboardStats.month.consultations}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <Calendar size={18} />
                          This Year
                        </div>
                        <span className="breakdown-value">{dashboardStats.year.consultations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3>Revenue Breakdown</h3>
                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <DollarSign size={18} />
                          Weekly Revenue
                        </div>
                        <span className="breakdown-value">{formatCurrency(dashboardStats.week.revenue)}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <DollarSign size={18} />
                          Monthly Revenue
                        </div>
                        <span className="breakdown-value">{formatCurrency(dashboardStats.month.revenue)}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <DollarSign size={18} />
                          Yearly Revenue
                        </div>
                        <span className="breakdown-value">{formatCurrency(dashboardStats.year.revenue)}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-label">
                          <TrendingUp size={18} />
                          Average/Consultation
                        </div>
                        <span className="breakdown-value">
                          {formatCurrency(dashboardStats.month.revenue / (dashboardStats.month.consultations || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Revenue Chart */}
            {revenueData && revenueData.data.length > 0 && (
              <div className="card">
                <h3>Revenue Trend ({selectedPeriod})</h3>
                <div className="chart-container">
                  <div className="simple-bar-chart">
                    {revenueData.data.slice(0, 10).reverse().map((item, index) => (
                      <div key={index} className="chart-bar-item">
                        <div className="chart-bar-wrapper">
                          <div 
                            className="chart-bar-fill"
                            style={{ 
                              height: `${(item.total / Math.max(...revenueData.data.map(d => d.total))) * 100}%` 
                            }}
                            title={formatCurrency(item.total)}
                          />
                        </div>
                        <span className="chart-label">{formatDate(item.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-summary">
                  <div className="summary-item">
                    <span>Total Revenue</span>
                    <strong>{formatCurrency(revenueData.summary.total)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Average</span>
                    <strong>{formatCurrency(revenueData.summary.average)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Performance */}
            {doctorPerformance && doctorPerformance.topDoctors && doctorPerformance.topDoctors.length > 0 && (
              <div className="card">
                <h3>Top Performing Doctors</h3>
                <div className="performance-list">
                  {doctorPerformance.topDoctors.map((doctor, index) => (
                    <div key={index} className="performance-item">
                      <div className="performance-rank">#{index + 1}</div>
                      <div className="performance-info">
                        <strong>{doctor.doctorName}</strong>
                        <span>{doctor.consultationCount} consultations</span>
                      </div>
                      <div className="performance-revenue">
                        {formatCurrency(doctor.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEDIUM PRIORITY ANALYTICS */}
        {activeTab === 'medium-priority' && (
          <div className="analytics-section">
            <h2 className="section-title">
              <BarChart3 size={24} />
              Medium Priority Metrics
            </h2>

            {/* Expenses Overview */}
            {expensesData && (
              <div className="section-grid">
                <div className="card">
                  <h3>
                    <Briefcase size={20} />
                    Expenses Overview
                  </h3>
                  <div className="expense-summary">
                    <div className="expense-total">
                      <span>Total Expenses</span>
                      <strong>{formatCurrency(expensesData.summary.total)}</strong>
                    </div>
                    <div className="expense-categories">
                      {Object.entries(expensesData.summary.byCategory).map(([category, amount]) => (
                        <div key={category} className="category-item">
                          <span className="category-name">{category}</span>
                          <span className="category-amount">{formatCurrency(amount)}</span>
                          <div className="category-bar">
                            <div 
                              className="category-bar-fill"
                              style={{ 
                                width: `${(amount / expensesData.summary.total) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>
                    <CreditCard size={20} />
                    Recent Expenses
                  </h3>
                  <div className="expense-list">
                    {expensesData.expenses.slice(0, 5).map((expense) => (
                      <div key={expense._id} className="expense-item">
                        <div className="expense-info">
                          <strong>{expense.description}</strong>
                          <span className="expense-category">{expense.category}</span>
                          <span className="expense-date">{formatDate(expense.date)}</span>
                        </div>
                        <div className="expense-amount">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payroll Management */}
            {payrollData && (
              <div className="card">
                <div className="card-header">
                  <h3>
                    <Briefcase size={20} />
                    Payroll Management
                  </h3>
                  {dashboardStats && dashboardStats.totals.pendingPayrolls > 0 && (
                    <span className="badge badge-warning">
                      {dashboardStats.totals.pendingPayrolls} Pending
                    </span>
                  )}
                </div>
                <div className="payroll-summary">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <span>Total Payroll</span>
                      <strong>{formatCurrency(payrollData.summary.totalPayroll)}</strong>
                    </div>
                    <div className="summary-card">
                      <span>Total Revenue</span>
                      <strong>{formatCurrency(payrollData.summary.totalRevenue)}</strong>
                    </div>
                    <div className="summary-card">
                      <span>Records</span>
                      <strong>{payrollData.summary.count}</strong>
                    </div>
                  </div>
                </div>
                <div className="payroll-list">
                  {payrollData.payrolls.slice(0, 5).map((payroll) => (
                    <div key={payroll._id} className="payroll-item">
                      <div className="payroll-info">
                        <strong>{payroll.doctorName}</strong>
                        <span>
                          {formatDate(payroll.period.start)} - {formatDate(payroll.period.end)}
                        </span>
                        <span>{payroll.consultationsCount} consultations</span>
                      </div>
                      <div className="payroll-details">
                        <span className={`status-badge ${payroll.status}`}>
                          {payroll.status}
                        </span>
                        <strong>{formatCurrency(payroll.netPay)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Comparison */}
            {dashboardStats && (
              <div className="card">
                <h3>Financial Summary</h3>
                <div className="financial-summary">
                  <div className="financial-item">
                    <div className="financial-label">
                      <DollarSign size={18} />
                      Monthly Revenue
                    </div>
                    <div className="financial-value positive">
                      {formatCurrency(dashboardStats.month.revenue)}
                    </div>
                  </div>
                  <div className="financial-item">
                    <div className="financial-label">
                      <Briefcase size={18} />
                      Monthly Expenses
                    </div>
                    <div className="financial-value negative">
                      {formatCurrency(dashboardStats.month.expenses)}
                    </div>
                  </div>
                  <div className="financial-item highlight">
                    <div className="financial-label">
                      <TrendingUp size={18} />
                      Net Profit
                    </div>
                    <div className="financial-value">
                      {formatCurrency(dashboardStats.month.netProfit)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOW PRIORITY ANALYTICS */}
        {activeTab === 'low-priority' && (
          <div className="analytics-section">
            <h2 className="section-title">
              <FileText size={24} />
              Low Priority Metrics
            </h2>

            <div className="section-grid">
              {/* System Statistics */}
              {dashboardStats && (
                <div className="card">
                  <h3>System Statistics</h3>
                  <div className="stats-list">
                    <div className="stat-item">
                      <Users size={18} />
                      <span>Total Patients</span>
                      <strong>{dashboardStats.totals.patients}</strong>
                    </div>
                    <div className="stat-item">
                      <Activity size={18} />
                      <span>Active Doctors</span>
                      <strong>{dashboardStats.totals.doctors}</strong>
                    </div>
                    <div className="stat-item">
                      <Calendar size={18} />
                      <span>Yearly Consultations</span>
                      <strong>{dashboardStats.year.consultations}</strong>
                    </div>
                    <div className="stat-item">
                      <DollarSign size={18} />
                      <span>Yearly Revenue</span>
                      <strong>{formatCurrency(dashboardStats.year.revenue)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="card">
                <h3>Additional Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <Clock size={18} />
                    <div>
                      <strong>Data Reset</strong>
                      <p>Consultations reset daily at midnight</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <CheckCircle size={18} />
                    <div>
                      <strong>Archive Status</strong>
                      <p>All data archived and accessible in history</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <BarChart3 size={18} />
                    <div>
                      <strong>Analytics Period</strong>
                      <p>Currently viewing {selectedPeriod} data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Expenses Detail */}
            {expensesData && expensesData.expenses.length > 0 && (
              <div className="card">
                <h3>All Recent Expenses</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesData.expenses.slice(0, 10).map((expense) => (
                        <tr key={expense._id}>
                          <td>{formatDate(expense.date)}</td>
                          <td>{expense.description}</td>
                          <td>
                            <span className="category-badge">{expense.category}</span>
                          </td>
                          <td>{formatCurrency(expense.amount)}</td>
                          <td>
                            <span className={`status-badge ${expense.status}`}>
                              {expense.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
