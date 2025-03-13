import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTicketModal from './modals/CreateTicketModal';
import ViewTicketModal from './modals/ViewTicketModal';

function Dashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [viewTicketId, setViewTicketId] = useState(null);
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [userRole, setUserRole] = useState('');

    const [filters, setFilters] = useState({
        orderBy: 'id_desc',
        assignee: '',
        status: '',
        creator: '',
    });

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/users', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await fetch('http://localhost:8000/statuses', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setStatuses(data.statuses);
            }
        } catch (error) {
            console.error('Failed to fetch statuses:', error);
        }
    };

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:8000/tickets', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                let filteredTickets = data.tickets;

                if (filters.assignee === 'Unassigned') {
                    filteredTickets = filteredTickets.filter(ticket => !ticket.assignee_email);
                } else if (filters.assignee) {
                    filteredTickets = filteredTickets.filter(ticket => ticket.assignee_email === filters.assignee);
                }

                if (filters.status) {
                    filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
                }

                if (filters.creator) {
                    filteredTickets = filteredTickets.filter(ticket => ticket.creator_email === filters.creator);
                }

                if (filters.orderBy === 'id_desc') {
                    filteredTickets.sort((a, b) => b.id - a.id);
                } else if (filters.orderBy === 'id_asc') {
                    filteredTickets.sort((a, b) => a.id - b.id);
                }

                setTickets(filteredTickets);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/checkAuth', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUserRole(data.user.role);
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const handleArchiveTicket = async (id) => {
        if (confirm('Are you sure you want to archive this ticket?')) {
            try {
                const response = await fetch(`http://localhost:8000/archive-ticket/${id}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    fetchTickets();
                }
            } catch (error) {
                console.error('Failed to archive ticket:', error);
            }
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchUsers();
        fetchStatuses();
        fetchCurrentUser();
    }, [filters]);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Mikrotik TMS</h1>
                <button className="btn btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-header">
                <h2>All Tasks</h2>
                <div className="button-group">
                    <button className="btn btn-task" onClick={() => setShowPopup(true)}>Create Ticket</button>
                    <button className="btn btn-template" onClick={() => navigate('/templates')}>Templates</button>
                </div>
            </div>

            {showPopup && (
                <CreateTicketModal
                    setShowPopup={setShowPopup}
                    refreshTickets={fetchTickets}
                />
            )}

            {viewTicketId && (
                <ViewTicketModal
                    ticketId={viewTicketId}
                    setShowPopup={() => setViewTicketId(null)}
                    refreshTickets={fetchTickets}
                />
            )}

            <div className="t-list">

                <div className="filter-dropdown">
                    <select value={filters.orderBy} onChange={(e) => setFilters({ ...filters, orderBy: e.target.value })}>
                        <option value="id_desc">ID - Descending</option>
                        <option value="id_asc">ID - Ascending</option>
                    </select>

                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.name}>{status.name}</option>
                        ))}
                    </select>

                    <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
                        <option value="">All Assignees</option>
                        <option value="Unassigned">Unassigned</option>
                        {users.map(user => (
                            <option key={user.id} value={user.email}>{user.email}</option>
                        ))}
                    </select>

                    <select value={filters.creator} onChange={(e) => setFilters({ ...filters, creator: e.target.value })}>
                        <option value="">All Creators</option>
                        {users.map(user => (
                            <option key={user.id} value={user.email}>{user.email}</option>
                        ))}
                    </select>
                </div>
                
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Assignee</th>
                        <th>Status</th>
                        <th>Creator</th>
                        <th>Created At</th>
                        {userRole === 'admin' && <th></th>}
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((ticket) => (
                        <tr
                            key={ticket.id}
                            onClick={(e) => {
                                if (!e.target.closest('.delete-icon')) {
                                    setViewTicketId(ticket.id);
                                }
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{ticket.id}</td>
                            <td>{ticket.title}</td>
                            <td>{ticket.assignee_email || 'Unassigned'}</td>
                            <td>{ticket.status}</td>
                            <td>{ticket.creator_email || 'Unknown'}</td>
                            <td>{new Date(ticket.created_at).toLocaleString()}</td>
                            {userRole === 'admin' && (
                                <td>
                                    <button
                                        className="delete-icon"
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        handleArchiveTicket(ticket.id);
                                    }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;