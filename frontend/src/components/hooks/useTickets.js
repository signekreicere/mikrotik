import { useState, useEffect } from 'react';

export function useTickets() {
    const [tickets, setTickets] = useState([]);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTickets = async (filters) => {
        setLoading(true);
        setError(null);

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

                if (filters.template) {
                    filteredTickets = filteredTickets.filter(ticket => ticket.template_name === filters.template);
                }

                if (filters.ticketStatus === 'active') {
                    filteredTickets = filteredTickets.filter(ticket => !ticket.is_archived);
                } else if (filters.ticketStatus === 'archived') {
                    filteredTickets = filteredTickets.filter(ticket => ticket.is_archived);
                }

                const sortOptions = {
                    id_desc: (a, b) => b.id - a.id,
                    id_asc: (a, b) => a.id - b.id,
                    date_desc: (a, b) => new Date(b.created_at) - new Date(a.created_at),
                    date_asc: (a, b) => new Date(a.created_at) - new Date(b.created_at),
                };

                filteredTickets.sort(sortOptions[filters.orderBy]);

                setTickets(filteredTickets);
            } else {
                throw new Error('Failed to fetch tickets');
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketById = async (ticketId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8000/tickets/${ticketId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setTicket(data.ticket);
            } else {
                throw new Error('Failed to fetch ticket details');
            }
        } catch (error) {
            console.error('Failed to load ticket:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTicket(null);
    }, []);

    return {
        tickets,
        ticket,
        loading,
        error,
        fetchTickets,
        fetchTicketById,
    };
}