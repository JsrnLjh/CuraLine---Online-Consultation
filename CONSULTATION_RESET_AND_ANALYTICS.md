# Consultation Reset & Analytics System

## Overview
This document describes the automatic consultation reset system and comprehensive analytics implementation for the CuraLine E-Health platform.

## Features Implemented

### 1. Daily Consultation Reset System

#### How It Works
- **Automatic Reset**: Every day at midnight (00:00), the system automatically archives all consultations from the previous day
- **Data Preservation**: All consultation data is moved to the `ConsultationHistory` collection before deletion
- **Analytics Generation**: Daily analytics are automatically generated before archiving
- **Zero Data Loss**: Complete consultation history is maintained for reporting and analytics

#### Technical Implementation
- **Scheduler**: Runs at midnight using `setTimeout` and `setInterval`
- **Archive Process**: 
  1. Fetches all consultations from yesterday
  2. Creates archive records in `ConsultationHistory`
  3. Generates daily analytics
  4. Deletes consultations from main collection
  
#### Models Created
- **ConsultationHistory**: Stores archived consultation data
- **Analytics**: Stores aggregated daily/weekly/monthly/yearly statistics
- **Expense**: Tracks business expenses
- **Payroll**: Manages doctor payroll records

### 2. Comprehensive Analytics System

The analytics system is divided into three priority levels:

#### HIGH PRIORITY ANALYTICS ⚠️

**Purpose**: Critical business metrics that require immediate attention

**Metrics Included**:
- **Consultation Statistics**
  - Daily, weekly, monthly, and yearly consultation counts
  - Current day real-time statistics
  - Status breakdown (completed, cancelled, scheduled)
  
- **Revenue Analytics**
  - Total revenue by period
  - Average revenue per consultation
  - Revenue trends over time
  - Visual charts and graphs

- **Patient Analytics**
  - New patients by period
  - Total unique patients
  - Patient growth trends

- **Doctor Performance**
  - Top performing doctors
  - Consultation counts per doctor
  - Revenue generated per doctor

**API Endpoints**:
- `GET /api/analytics/consultations?period=daily|weekly|monthly|yearly`
- `GET /api/analytics/revenue?period=daily&startDate=&endDate=`
- `GET /api/analytics/patients?period=daily`
- `GET /api/analytics/doctor-performance?period=daily&limit=10`
- `GET /api/analytics/dashboard` - Comprehensive overview

#### MEDIUM PRIORITY ANALYTICS 📊

**Purpose**: Important operational metrics for business management

**Metrics Included**:
- **Payroll Management**
  - Doctor payroll records
  - Commission calculations (default 70% to doctor)
  - Pending/processed/paid status tracking
  - Period-based payroll generation

- **Expense Tracking**
  - Expenses by category (payroll, utilities, supplies, etc.)
  - Monthly expense summaries
  - Expense status tracking
  - Category-wise breakdown

- **Financial Summary**
  - Monthly revenue vs expenses
  - Net profit calculations
  - Financial health indicators

**API Endpoints**:
- `GET /api/analytics/payroll?status=&startDate=&endDate=`
- `POST /api/analytics/payroll` - Create payroll
- `PATCH /api/analytics/payroll/:id` - Update payroll status
- `GET /api/analytics/expenses?category=&status=&startDate=&endDate=`
- `POST /api/analytics/expenses` - Create expense
- `PUT /api/analytics/expenses/:id` - Update expense
- `DELETE /api/analytics/expenses/:id` - Delete expense

#### LOW PRIORITY ANALYTICS 📄

**Purpose**: Supplementary information and historical data

**Metrics Included**:
- **Specialty Breakdown**
  - Consultations by medical specialty
  - Revenue by specialty

- **Payment Method Analysis**
  - Payment method distribution (card, GCash, PayMaya, cash)
  - Aggregated payment statistics

- **Consultation History**
  - Archived consultation records
  - Historical data queries
  - Patient/doctor specific history

- **System Statistics**
  - Total patients and doctors
  - Yearly aggregates
  - System health information

**API Endpoints**:
- `GET /api/analytics/specialties?period=daily`
- `GET /api/analytics/payment-methods?startDate=&endDate=`
- `GET /api/analytics/consultation-history?patientEmail=&doctorId=&status=`

### 3. Admin Analytics Dashboard

**Location**: `/admin/analytics`

**Features**:
- **Priority-Based Tabs**: Switch between High, Medium, and Low priority metrics
- **Period Selection**: View data by daily, weekly, monthly, or yearly periods
- **Visual Charts**: Bar charts for revenue trends
- **Real-Time Data**: Refresh button to update all analytics
- **Export Capability**: Export reports (button ready for implementation)

**Dashboard Sections**:

1. **High Priority View**
   - Key metrics cards (Revenue, Consultations, Profit, Patients)
   - Consultation and revenue breakdowns
   - Revenue trend charts
   - Top performing doctors list

2. **Medium Priority View**
   - Expense overview with category breakdown
   - Recent expenses list
   - Payroll management interface
   - Financial summary (Revenue vs Expenses)

3. **Low Priority View**
   - System statistics
   - Additional information
   - Detailed expense table
   - Archive status information

## Database Schema

### ConsultationHistory
```javascript
{
  originalConsultationId: ObjectId,
  doctorId: ObjectId,
  patientId: ObjectId,
  patientName: String,
  patientEmail: String,
  doctorName: String,
  doctorSpecialty: String,
  consultationFee: Number,
  date: String,
  time: String,
  status: String,
  paymentStatus: String,
  archivedAt: Date,
  originalCreatedAt: Date
}
```

### Analytics
```javascript
{
  date: Date,
  period: 'daily|weekly|monthly|yearly',
  consultations: {
    total: Number,
    completed: Number,
    cancelled: Number,
    scheduled: Number
  },
  revenue: {
    total: Number,
    consultationFees: Number,
    averagePerConsultation: Number
  },
  patients: {
    new: Number,
    returning: Number,
    total: Number
  },
  doctors: {
    active: Number,
    totalConsultations: Number
  },
  payments: {
    total: Number,
    byMethod: { card, gcash, paymaya, cash }
  },
  specialtyBreakdown: [{ specialty, count, revenue }],
  topDoctors: [{ doctorId, doctorName, consultationCount, revenue }]
}
```

### Expense
```javascript
{
  category: 'payroll|utilities|supplies|maintenance|marketing|insurance|equipment|other',
  description: String,
  amount: Number,
  date: Date,
  payee: String,
  paymentMethod: String,
  status: 'pending|paid|overdue',
  notes: String,
  createdBy: ObjectId
}
```

### Payroll
```javascript
{
  doctorId: ObjectId,
  doctorName: String,
  period: { start: Date, end: Date },
  consultationsCount: Number,
  totalRevenue: Number,
  commission: Number,
  commissionRate: Number (default: 70),
  deductions: Number,
  netPay: Number,
  status: 'pending|processed|paid',
  paymentDate: Date,
  notes: String
}
```

## Usage Guide

### For Admins

#### Viewing Analytics
1. Navigate to Admin Dashboard
2. Click "Analytics & Reports" button
3. Select priority level (High/Medium/Low)
4. Choose time period (Daily/Weekly/Monthly/Yearly)
5. Click "Refresh" to update data

#### Managing Expenses
1. Go to Medium Priority tab
2. View expense breakdown by category
3. Add new expenses via API or future UI form
4. Track monthly expenses vs revenue

#### Managing Payroll
1. Go to Medium Priority tab
2. View pending payroll records
3. Generate payroll for doctors via API:
```javascript
POST /api/analytics/payroll
{
  "doctorId": "doctor_id",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "commissionRate": 70
}
```
4. Update payroll status when paid

#### Viewing Consultation History
1. Go to Low Priority tab or use API
2. Query archived consultations:
```javascript
GET /api/analytics/consultation-history?patientEmail=patient@example.com
```

### For Developers

#### Testing the Reset Function Manually
```javascript
// In server console or via API call
archiveAndResetConsultations();
```

#### Generating Analytics for Specific Date
```javascript
// Call the function with a specific date
generateDailyAnalytics(new Date('2025-01-15'));
```

#### Creating Expenses
```javascript
POST /api/analytics/expenses
{
  "category": "utilities",
  "description": "Monthly electricity bill",
  "amount": 5000,
  "date": "2025-01-15",
  "paymentMethod": "bank_transfer",
  "status": "paid"
}
```

## Benefits

### Business Intelligence
- **Data-Driven Decisions**: Make informed decisions based on real analytics
- **Performance Tracking**: Monitor doctor performance and patient trends
- **Financial Health**: Track revenue, expenses, and profitability
- **Resource Planning**: Identify peak periods and allocate resources

### Operational Efficiency
- **Automated Archiving**: No manual intervention needed
- **Clean Database**: Main consultation table stays lean and fast
- **Historical Access**: Complete history available for audits
- **Payroll Automation**: Calculate doctor commissions automatically

### Compliance & Reporting
- **Audit Trail**: Complete consultation history preserved
- **Financial Reports**: Ready-to-export financial data
- **Period Comparisons**: Compare performance across periods
- **Tax Preparation**: Expense tracking for tax purposes

## System Requirements

- MongoDB database
- Node.js server running continuously for scheduler
- Admin role access for analytics dashboard

## Troubleshooting

### Reset Not Running
- Check server logs for scheduler confirmation
- Verify server has been running since startup
- Check MongoDB connection

### Missing Analytics Data
- Ensure consultations existed on previous days
- Run manual analytics generation for past dates
- Check date ranges in queries

### Payroll Calculation Issues
- Verify consultation history data exists
- Check commission rate settings
- Ensure consultations are marked as completed and paid

## Future Enhancements

1. **Export Functionality**: PDF/Excel report generation
2. **Email Reports**: Automated daily/weekly email summaries
3. **Advanced Charts**: More visualization options
4. **Predictive Analytics**: Forecast revenue and patient trends
5. **Custom Date Ranges**: More flexible date selection
6. **Multi-Currency Support**: Handle different currencies
7. **Tax Calculations**: Automated tax computation
8. **Budget Tracking**: Set and monitor budgets by category

## Notes

- The system automatically starts the scheduler when the server starts
- Consultations are reset at midnight (00:00) server time
- All monetary values are in Philippine Peso (PHP)
- Default doctor commission rate is 70%
- Analytics are generated before archiving to ensure accuracy
- Current day consultations are always visible in real-time

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify database connectivity
3. Ensure all models are properly imported
4. Check API endpoint responses for detailed error messages
