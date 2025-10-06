# Analytics Quick Reference Guide

## Priority Levels Summary

### 🔴 HIGH PRIORITY - Critical Business Metrics
**What to monitor daily:**
- Today's consultation count
- Weekly/Monthly revenue
- Net profit margin
- Top performing doctors

**Key Questions Answered:**
- How much revenue are we generating?
- How many consultations are happening?
- Which doctors are performing best?
- What's our profit after expenses?

**Access:** Admin Dashboard → Analytics & Reports → High Priority Tab

---

### 🟡 MEDIUM PRIORITY - Operational Management
**What to review weekly:**
- Pending payroll records
- Monthly expenses by category
- Expense vs Revenue ratio
- Doctor commission payments

**Key Questions Answered:**
- What are our operational costs?
- Do we need to pay any doctors?
- Where is money being spent?
- Is our expense ratio healthy?

**Access:** Admin Dashboard → Analytics & Reports → Medium Priority Tab

---

### 🟢 LOW PRIORITY - Supplementary Information
**What to check monthly:**
- Yearly statistics
- Payment method distribution
- Specialty performance
- Historical consultation data

**Key Questions Answered:**
- What's our year-over-year growth?
- Which payment methods are popular?
- Which specialties are in demand?
- What's our historical performance?

**Access:** Admin Dashboard → Analytics & Reports → Low Priority Tab

---

## Daily Admin Checklist

### Morning (Start of Day)
- [ ] Check today's scheduled consultations (High Priority)
- [ ] Review yesterday's completed consultations
- [ ] Check pending payroll notifications (Medium Priority)

### Afternoon (Mid-Day)
- [ ] Monitor real-time consultation progress
- [ ] Review any new expenses added
- [ ] Check doctor performance metrics

### Evening (End of Day)
- [ ] Review daily revenue total
- [ ] Verify all consultations were completed/updated
- [ ] Check for any system alerts

---

## Weekly Admin Tasks

### Monday
- [ ] Review last week's analytics
- [ ] Generate payroll for doctors (if weekly payment)
- [ ] Set goals for the week

### Wednesday
- [ ] Mid-week performance check
- [ ] Review expense trends
- [ ] Adjust resources if needed

### Friday
- [ ] Week-end summary review
- [ ] Prepare payroll for processing
- [ ] Export weekly report

---

## Monthly Admin Tasks

### First Week
- [ ] Review previous month's complete analytics
- [ ] Process all pending payroll
- [ ] Reconcile expenses
- [ ] Generate monthly financial report

### Mid-Month
- [ ] Check progress toward monthly goals
- [ ] Review expense categories
- [ ] Analyze patient trends

### End of Month
- [ ] Close monthly books
- [ ] Calculate net profit
- [ ] Plan for next month
- [ ] Archive important reports

---

## Key Metrics to Watch

### Revenue Metrics
- **Target**: Steady growth month-over-month
- **Warning Signs**: 
  - Revenue declining for 2+ weeks
  - Average consultation fee decreasing
  - High cancellation rate

### Consultation Metrics
- **Target**: 80%+ completion rate
- **Warning Signs**:
  - Cancellation rate > 20%
  - No-show rate increasing
  - Scheduled consultations declining

### Expense Metrics
- **Target**: Expenses < 60% of revenue
- **Warning Signs**:
  - Expenses growing faster than revenue
  - Payroll > 70% of revenue
  - Unexpected expense spikes

### Doctor Performance
- **Target**: Even distribution of consultations
- **Warning Signs**:
  - One doctor handling too many consultations
  - Doctors with very low consultation counts
  - High patient complaints for specific doctors

---

## Common Actions

### How to Generate Payroll
```
1. Go to Medium Priority tab
2. Note doctors with completed consultations
3. Use API or future UI to generate:
   - Select doctor
   - Choose date range
   - Set commission rate (default 70%)
   - Generate payroll record
4. Review and mark as paid when processed
```

### How to Add an Expense
```
1. Use API endpoint: POST /api/analytics/expenses
2. Provide:
   - Category (payroll, utilities, supplies, etc.)
   - Description
   - Amount
   - Date
   - Payment method
   - Status (pending/paid)
```

### How to View Consultation History
```
1. Go to Low Priority tab
2. Or use API: GET /api/analytics/consultation-history
3. Filter by:
   - Patient email
   - Doctor ID
   - Date range
   - Status
```

### How to Export Reports
```
1. Go to Analytics Dashboard
2. Click "Export Report" button
3. Choose format (PDF/Excel)
4. Select date range
5. Download file
(Note: Feature ready for implementation)
```

---

## Understanding the Data

### What Happens at Midnight?
Every night at 00:00:
1. System archives all consultations from previous day
2. Generates daily analytics automatically
3. Clears consultation table for new day
4. All data preserved in ConsultationHistory

### Where is Historical Data?
- **Recent (Today)**: Main Consultation table
- **Historical (Past Days)**: ConsultationHistory table
- **Aggregated**: Analytics table (daily/weekly/monthly/yearly)

### How is Revenue Calculated?
- **Total Revenue**: Sum of all completed, paid consultations
- **Average Revenue**: Total revenue ÷ Number of consultations
- **Net Profit**: Total revenue - Total expenses

### How is Payroll Calculated?
- **Total Revenue**: Sum of doctor's completed consultations
- **Commission**: Total revenue × Commission rate (default 70%)
- **Net Pay**: Commission - Deductions

---

## Troubleshooting

### "No data available"
- **Cause**: No consultations in selected period
- **Solution**: Change date range or check if consultations exist

### "Analytics not updating"
- **Cause**: Server needs restart or database issue
- **Solution**: Click "Refresh" button or restart server

### "Payroll calculation seems wrong"
- **Cause**: Consultations not marked as completed/paid
- **Solution**: Update consultation status first

### "Expenses not showing"
- **Cause**: No expenses added for period
- **Solution**: Add expenses via API or check date filters

---

## Best Practices

### Data Entry
- ✅ Enter expenses as they occur
- ✅ Update consultation status promptly
- ✅ Process payroll on schedule
- ✅ Review analytics daily

### Monitoring
- ✅ Set up alerts for critical metrics
- ✅ Compare week-over-week trends
- ✅ Track seasonal patterns
- ✅ Monitor doctor workload balance

### Reporting
- ✅ Export monthly reports for records
- ✅ Share performance metrics with team
- ✅ Document unusual trends
- ✅ Keep financial records organized

### Security
- ✅ Only admins access analytics
- ✅ Protect financial data
- ✅ Regular data backups
- ✅ Audit trail maintenance

---

## Quick Stats Reference

### Healthy Platform Indicators
- ✅ 80%+ consultation completion rate
- ✅ Revenue growing 5-10% monthly
- ✅ Expenses < 60% of revenue
- ✅ Net profit > 30% of revenue
- ✅ Patient retention > 40%
- ✅ Doctor utilization 60-80%

### Warning Signs
- ⚠️ Declining consultation numbers
- ⚠️ Increasing cancellation rate
- ⚠️ Expenses exceeding 70% of revenue
- ⚠️ Doctor burnout (>90% utilization)
- ⚠️ Low patient retention (<20%)
- ⚠️ Negative profit margins

---

## Contact & Support

For technical issues:
- Check server logs
- Review API responses
- Verify database connectivity

For business questions:
- Review this guide
- Check documentation
- Analyze historical trends

---

## Version Information

**System**: CuraLine E-Health Platform
**Feature**: Consultation Reset & Analytics
**Version**: 1.0
**Last Updated**: 2025-10-06
