import React from 'react';

function FilterBar({ filters, setFilters, statuses, users, templates }) {
    return (
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

            <select value={filters.template} onChange={(e) => setFilters({ ...filters, template: e.target.value })}>
                <option value="">All Templates</option>
                {templates.map(template => (
                    <option key={template.id} value={template.name}>{template.name}</option>
                ))}
            </select>

            <select value={filters.orderBy} onChange={(e) => setFilters({ ...filters, orderBy: e.target.value })}>
                <option value="date_desc">DATE - Descending</option>
                <option value="date_asc">DATE - Ascending</option>
            </select>

            <select value={filters.ticketStatus} onChange={(e) => setFilters({ ...filters, ticketStatus: e.target.value })}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
            </select>
        </div>
    );
}

export default FilterBar;
