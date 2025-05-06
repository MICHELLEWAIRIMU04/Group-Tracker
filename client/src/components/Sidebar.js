import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/groups"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              My Groups
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/members"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Members
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/activities"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Activities
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contributions"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Contributions
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;