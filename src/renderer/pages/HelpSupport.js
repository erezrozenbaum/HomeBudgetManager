import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HelpSupport = () => {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <div className="flex space-x-4">
          <select
            className="border rounded px-3 py-2"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="faq">FAQs</option>
            <option value="tickets">Support Tickets</option>
            <option value="documentation">Documentation</option>
            <option value="contact">Contact Us</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'faq' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                        {faq.tags && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {faq.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
                <div className="space-y-4">
                  <a
                    href="#"
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium">Getting Started Guide</h3>
                    <p className="text-sm text-gray-600">Learn the basics of using our platform</p>
                  </a>
                  <a
                    href="#"
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium">Video Tutorials</h3>
                    <p className="text-sm text-gray-600">Watch step-by-step guides</p>
                  </a>
                  <a
                    href="#"
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium">Community Forum</h3>
                    <p className="text-sm text-gray-600">Connect with other users</p>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Support Tickets</h2>
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      New Ticket
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">Ticket ID</th>
                          <th className="px-4 py-2">Subject</th>
                          <th className="px-4 py-2">Category</th>
                          <th className="px-4 py-2">Priority</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Created</th>
                          <th className="px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className={ticket.id % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="px-4 py-2">{ticket.id}</td>
                            <td className="px-4 py-2">{ticket.subject}</td>
                            <td className="px-4 py-2">{ticket.category}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={ticket.status}
                                onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2">
                              <button className="text-blue-500 hover:text-blue-700">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Ticket Statistics</h2>
                <div className="space-y-4">
                  <div className="h-64">
                    <Line data={getTicketStatusData()} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Open Tickets</span>
                      <span className="text-sm">
                        {tickets.filter(t => t.status === 'open').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Pending Tickets</span>
                      <span className="text-sm">
                        {tickets.filter(t => t.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Closed Tickets</span>
                      <span className="text-sm">
                        {tickets.filter(t => t.status === 'closed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Documentation</h2>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">User Guide</h3>
                      <p className="text-gray-600 mb-4">
                        Comprehensive guide covering all features and functionality.
                      </p>
                      <a
                        href="#"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Download PDF →
                      </a>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">API Documentation</h3>
                      <p className="text-gray-600 mb-4">
                        Technical documentation for developers and integrators.
                      </p>
                      <a
                        href="#"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View Documentation →
                      </a>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">Best Practices</h3>
                      <p className="text-gray-600 mb-4">
                        Tips and tricks for getting the most out of our platform.
                      </p>
                      <a
                        href="#"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-gray-600">support@budgetmanager.com</p>
                    <p className="text-sm text-gray-500 mt-1">Response time: 24 hours</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-gray-600">Available 9:00 AM - 5:00 PM EST</p>
                    <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Start Chat
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">Available 24/7 for urgent issues</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Submit a Support Ticket</h2>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={newTicket.subject}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={newTicket.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      name="priority"
                      value={newTicket.priority}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={newTicket.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpSupport; 