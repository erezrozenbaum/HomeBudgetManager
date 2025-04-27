const React = window.React;
const { useState, useEffect } = React;
const { Line } = require('react-chartjs-2');
const {
  Chart: ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} = require('chart.js');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function HelpSupport() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchFaqs();
    fetchTickets();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/support/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/support/tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      setSuccess('Support ticket submitted successfully');
      setNewTicket({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: ''
      });
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setError('Failed to submit support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTicketStatusChange = async (ticketId, status) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }

      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Failed to update ticket status');
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTicketStatusData = () => {
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
      }]
    };
  };

  return React.createElement('div', { className: 'p-6' },
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Help & Support'),
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement('select', {
          className: 'border rounded px-3 py-2',
          value: activeTab,
          onChange: (e) => setActiveTab(e.target.value)
        },
          React.createElement('option', { value: 'faq' }, 'FAQs'),
          React.createElement('option', { value: 'tickets' }, 'Support Tickets'),
          React.createElement('option', { value: 'documentation' }, 'Documentation'),
          React.createElement('option', { value: 'contact' }, 'Contact Us')
        )
      )
    ),
    error && React.createElement('div', {
      className: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
    }, error),
    success && React.createElement('div', {
      className: 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'
    }, success),
    loading ? React.createElement('div', { className: 'flex justify-center items-center h-64' },
      React.createElement('div', {
        className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'
      })
    ) : React.createElement('div', { className: 'space-y-6' },
      activeTab === 'faq' && React.createElement('div', null,
        React.createElement('div', { className: 'mb-4' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search FAQs...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: 'w-full border rounded px-3 py-2'
          })
        ),
        React.createElement('div', { className: 'space-y-4' },
          filteredFaqs.map(faq =>
            React.createElement('div', {
              key: faq.id,
              className: 'bg-white rounded-lg shadow p-4'
            },
              React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, faq.question),
              React.createElement('p', { className: 'text-gray-600' }, faq.answer)
            )
          )
        )
      ),
      activeTab === 'tickets' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, 'Submit a Support Ticket'),
          React.createElement('form', {
            onSubmit: handleSubmitTicket,
            className: 'space-y-4'
          },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Subject'),
              React.createElement('input', {
                type: 'text',
                name: 'subject',
                value: newTicket.subject,
                onChange: handleInputChange,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3',
                required: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Category'),
              React.createElement('select', {
                name: 'category',
                value: newTicket.category,
                onChange: handleInputChange,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3'
              },
                React.createElement('option', { value: 'general' }, 'General'),
                React.createElement('option', { value: 'technical' }, 'Technical'),
                React.createElement('option', { value: 'billing' }, 'Billing'),
                React.createElement('option', { value: 'feature' }, 'Feature Request')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Priority'),
              React.createElement('select', {
                name: 'priority',
                value: newTicket.priority,
                onChange: handleInputChange,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3'
              },
                React.createElement('option', { value: 'low' }, 'Low'),
                React.createElement('option', { value: 'medium' }, 'Medium'),
                React.createElement('option', { value: 'high' }, 'High')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Description'),
              React.createElement('textarea', {
                name: 'description',
                value: newTicket.description,
                onChange: handleInputChange,
                rows: 4,
                className: 'mt-1 block w-full border rounded-md shadow-sm py-2 px-3',
                required: true
              })
            ),
            React.createElement('div', { className: 'flex justify-end' },
              React.createElement('button', {
                type: 'submit',
                disabled: submitting,
                className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
              }, submitting ? 'Submitting...' : 'Submit Ticket')
            )
          )
        ),
        React.createElement('div', { className: 'bg-white rounded-lg shadow' },
          React.createElement('div', { className: 'p-4 border-b' },
            React.createElement('h2', { className: 'text-lg font-semibold' }, 'Your Support Tickets')
          ),
          React.createElement('div', { className: 'divide-y' },
            tickets.map(ticket =>
              React.createElement('div', {
                key: ticket.id,
                className: 'p-4'
              },
                React.createElement('div', { className: 'flex justify-between items-start' },
                  React.createElement('div', null,
                    React.createElement('h3', { className: 'font-medium' }, ticket.subject),
                    React.createElement('p', { className: 'text-sm text-gray-500' }, ticket.description)
                  ),
                  React.createElement('div', { className: 'flex items-center space-x-2' },
                    React.createElement('span', {
                      className: `px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`
                    }, ticket.status.replace('_', ' ').toUpperCase()),
                    React.createElement('select', {
                      value: ticket.status,
                      onChange: (e) => handleTicketStatusChange(ticket.id, e.target.value),
                      className: 'text-sm border rounded'
                    },
                      React.createElement('option', { value: 'open' }, 'Open'),
                      React.createElement('option', { value: 'in_progress' }, 'In Progress'),
                      React.createElement('option', { value: 'closed' }, 'Closed')
                    )
                  )
                ),
                React.createElement('div', { className: 'mt-2 text-xs text-gray-500' },
                  React.createElement('span', null, `Category: ${ticket.category}`),
                  React.createElement('span', { className: 'mx-2' }, '•'),
                  React.createElement('span', null, `Priority: ${ticket.priority}`),
                  React.createElement('span', { className: 'mx-2' }, '•'),
                  React.createElement('span', null, `Created: ${new Date(ticket.created_at).toLocaleString()}`)
                )
              )
            )
          )
        )
      ),
      activeTab === 'documentation' && React.createElement('div', { className: 'prose max-w-none' },
        React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Documentation'),
        React.createElement('div', { className: 'space-y-6' },
          React.createElement('section', null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Getting Started'),
            React.createElement('p', null, 'Welcome to our application! This documentation will help you get started and make the most of our features.')
          ),
          React.createElement('section', null,
            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Features'),
            React.createElement('ul', { className: 'list-disc pl-5 space-y-2' },
              React.createElement('li', null, 'Track your income and expenses'),
              React.createElement('li', null, 'Set and monitor budgets'),
              React.createElement('li', null, 'Generate financial reports'),
              React.createElement('li', null, 'Manage investments'),
              React.createElement('li', null, 'Plan for taxes')
            )
          )
        )
      ),
      activeTab === 'contact' && React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Contact Information'),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium' }, 'Email Support'),
              React.createElement('p', { className: 'text-gray-600' }, 'support@example.com')
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium' }, 'Phone Support'),
              React.createElement('p', { className: 'text-gray-600' }, '+1 (555) 123-4567')
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-medium' }, 'Business Hours'),
              React.createElement('p', { className: 'text-gray-600' }, 'Monday - Friday: 9:00 AM - 5:00 PM EST')
            )
          )
        )
      )
    )
  );
}

module.exports = { HelpSupport }; 