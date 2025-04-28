import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinancialCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'bill',
    amount: '',
    notes: '',
    recurring: false,
    frequency: 'monthly'
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('calendar');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/calendar/events?month=${format(currentDate, 'yyyy-MM')}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      if (response.ok) {
        await fetchEvents();
        setNewEvent({
          title: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          type: 'bill',
          amount: '',
          notes: '',
          recurring: false,
          frequency: 'monthly'
        });
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchEvents();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/calendar/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedEvent),
      });
      if (response.ok) {
        await fetchEvents();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (day) => {
    return events.filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'bill':
        return 'bg-red-100 text-red-800';
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'investment':
        return 'bg-blue-100 text-blue-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonthlySummaryData = () => {
    const days = getMonthDays();
    return {
      labels: days.map(day => format(day, 'd')),
      datasets: [
        {
          label: 'Daily Expenses',
          data: days.map(day => {
            const dayEvents = getEventsForDay(day);
            return dayEvents
              .filter(event => event.type === 'bill')
              .reduce((sum, event) => sum + parseFloat(event.amount || 0), 0);
          }),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Daily Income',
          data: days.map(day => {
            const dayEvents = getEventsForDay(day);
            return dayEvents
              .filter(event => event.type === 'income')
              .reduce((sum, event) => sum + parseFloat(event.amount || 0), 0);
          }),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Calendar</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded ${
              view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded ${
              view === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold py-2">
                    {day}
                  </div>
                ))}
                {getMonthDays().map(day => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div
                      key={day}
                      className={`p-2 min-h-24 border rounded ${
                        isToday(day) ? 'bg-blue-50' : ''
                      } ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}`}
                    >
                      <div className="font-semibold mb-1">{format(day, 'd')}</div>
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded ${getEventTypeColor(event.type)}`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.title}
                            {event.amount && ` - $${parseFloat(event.amount).toLocaleString()}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Event</h2>
              <form onSubmit={handleAddEvent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="bill">Bill</option>
                        <option value="income">Income</option>
                        <option value="investment">Investment</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={newEvent.amount}
                      onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newEvent.recurring}
                        onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.checked })}
                        className="mr-2"
                      />
                      Recurring Event
                    </label>
                    {newEvent.recurring && (
                      <select
                        value={newEvent.frequency}
                        onChange={(e) => setNewEvent({ ...newEvent, frequency: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>

            {selectedEvent && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Edit Event</h2>
                <form onSubmit={handleUpdateEvent}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={selectedEvent.title}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                          type="date"
                          value={selectedEvent.date}
                          onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                          className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          value={selectedEvent.type}
                          onChange={(e) => setSelectedEvent({ ...selectedEvent, type: e.target.value })}
                          className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="bill">Bill</option>
                          <option value="income">Income</option>
                          <option value="investment">Investment</option>
                          <option value="reminder">Reminder</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="number"
                        value={selectedEvent.amount}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, amount: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        value={selectedEvent.notes}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, notes: e.target.value })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
          <div className="h-96">
            <Bar data={getMonthlySummaryData()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialCalendar; 