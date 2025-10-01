# Admin Dashboard Guide

## Overview
The Admin Dashboard provides comprehensive analytics and management tools for monitoring the E-Health consultation platform.

## Accessing the Dashboard
Navigate to `/admin` or click the "Admin" link in the navigation menu.

## Features

### 1. Overview Tab

#### Key Metrics Cards
- **Total Consultations** - Shows all-time consultation count
- **Total Patients** - Displays unique patient count with weekly comparison
- **Active Doctors** - Number of doctors available on the platform
- **Scheduled Appointments** - Count of upcoming appointments

#### Consultations by Period
View consultation statistics across different time periods:
- **Today** - Consultations booked today
- **This Week** - Last 7 days
- **This Month** - Last 30 days
- **This Year** - Last 365 days

#### Status Overview
Monitor appointment statuses:
- **Completed** - Successfully finished consultations
- **Scheduled** - Upcoming appointments
- **Cancelled** - Cancelled appointments

#### Performance Analytics
- **Consultations by Doctor** - Visual bar chart showing workload distribution
- **Consultations by Specialty** - Breakdown by medical specialty

### 2. Calendar Tab

#### Calendar View Features
- **Monthly Calendar** - Visual representation of all appointments
- **Color-Coded Events** - Different colors for scheduled, completed, and cancelled appointments
- **Doctor Filtering** - Filter appointments by specific doctors
- **Event Details** - Hover over events to see time and patient information
- **Navigation** - Use arrow buttons to move between months

#### Calendar Legend
- **Blue** - Scheduled appointments
- **Green** - Completed appointments
- **Red** - Cancelled appointments

## Using the Dashboard

### Monitoring Daily Operations
1. Check the "Today" metric to see current day's bookings
2. Review the "Scheduled" count for upcoming appointments
3. Use the calendar to see the day's schedule

### Weekly Reports
1. View "This Week" consultation count
2. Check "Weekly Patients" to monitor patient engagement
3. Review consultations by doctor to balance workload

### Monthly Analysis
1. Compare "This Month" vs previous periods
2. Analyze consultations by specialty
3. Review status breakdown for quality metrics

### Calendar Management
1. Switch to Calendar tab
2. Select a doctor from the filter dropdown
3. Navigate through months to view schedules
4. Click on dates to see appointment details

## API Integration

The dashboard fetches data from these endpoints:

### Statistics Endpoint
```
GET /api/analytics/stats
```
Returns comprehensive statistics including:
- Consultation counts by period
- Patient metrics
- Status breakdown
- Doctor and specialty analytics

### Calendar Endpoint
```
GET /api/analytics/calendar
```
Returns all appointments formatted for calendar display

### Date Range Endpoint
```
GET /api/analytics/consultations-by-date?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```
Returns consultations within a specific date range

## Best Practices

### Daily Tasks
- Review today's consultation count
- Check scheduled appointments
- Monitor for any cancellations

### Weekly Tasks
- Analyze weekly patient trends
- Review doctor workload distribution
- Identify popular specialties

### Monthly Tasks
- Generate monthly reports
- Compare month-over-month growth
- Assess overall platform performance

## Tips

1. **Use Filters** - Filter calendar by doctor to focus on specific schedules
2. **Monitor Trends** - Compare weekly vs monthly metrics to identify patterns
3. **Balance Workload** - Use "Consultations by Doctor" to ensure fair distribution
4. **Track Growth** - Monitor patient counts to measure platform adoption

## Troubleshooting

### Dashboard Not Loading
- Check if the backend server is running on port 5000
- Verify API endpoints are accessible
- Check browser console for errors

### Missing Data
- Ensure consultations have been booked
- Verify date formats are correct
- Check that doctor IDs are properly assigned

### Calendar Issues
- Refresh the page to reload events
- Clear browser cache if events don't update
- Verify consultation dates are in correct format (YYYY-MM-DD)

## Future Enhancements

Planned features for the admin dashboard:
- Export reports to PDF/Excel
- Advanced filtering and search
- Real-time updates with WebSockets
- Email report scheduling
- Custom date range selection
- Interactive charts with drill-down capabilities
- Doctor performance ratings
- Patient satisfaction metrics

---

For technical support or feature requests, please refer to the main README.md file.
