import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import './CalendarView.css';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchDoctors();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/analytics/calendar');
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load calendar events');
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Failed to load doctors');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      if (selectedDoctor === 'all') {
        return eventDate === dateString;
      }
      return eventDate === dateString && event.doctorId === selectedDoctor;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="calendar-view">
      <div className="calendar-controls">
        <div className="calendar-header">
          <button onClick={previousMonth} className="nav-btn">
            <ChevronLeft size={20} />
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="filter-section">
          <Filter size={18} />
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="doctor-filter"
          >
            <option value="all">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const dayEvents = getEventsForDate(date);
          const isToday = 
            date.toDateString() === new Date().toDateString();

          return (
            <div 
              key={day} 
              className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
            >
              <div className="day-number">{day}</div>
              <div className="day-events">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div 
                    key={idx} 
                    className={`event-item ${event.status}`}
                    title={`${event.time} - ${event.title}`}
                  >
                    <span className="event-time">{event.time}</span>
                    <span className="event-title">{event.patientName}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="more-events">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot scheduled"></div>
          <span>Scheduled</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot completed"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot cancelled"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
