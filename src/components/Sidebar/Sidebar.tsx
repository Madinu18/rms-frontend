import React from 'react';
import { SideNavigation } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

import './Sidebar.css';

interface SidebarProps {
  isVisible: boolean; // Status visibilitas sidebar
  onToggleSidebar: () => void; // Callback function untuk toggle sidebar
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onToggleSidebar }) => {
  const navigate = useNavigate();

  // Ambil role dari localStorage
  const userRole = localStorage.getItem('role_name') || 'Guest';
  const userGroup = localStorage.getItem('company_group') || 'Guest';

  // Fungsi untuk memfilter items berdasarkan role
  const filterItemsByRole = (items: any[], allowedRoles: string[]) => {
    if (allowedRoles.includes(userRole)) {
      return items;
    }
    return [];
  };

  const filterItemsByGroup = (items: any[], allowedGroups: string[]) => {
    if (allowedGroups.includes(userGroup)) {
      return items;
    }
    return [];
  };

  // Sidebar items
  const sidebarItems: any[] = [
    {
      type: "section-group",
      title: "Remote Management",
      items: [
        { type: 'link', text: 'Remote Device', href: '/' },
        { type: 'link', text: 'Device List', href: '/device_list' },
      ],
    },
    ...filterItemsByRole(
      [
        { type: "divider" },
        {
          type: "section-group",
          title: "Administrator",
          items: [
            {
              type: "section",
              text: "Company",
              items: [
                ...filterItemsByGroup([
                  {
                    type: "link",
                    text: "List Company",
                    href: "/company",
                  },

                  {
                    type: "link",
                    text: "Create Company",
                    href: "/company/create",
                  },

                ], ['Owner', 'Reseller']),]
            },
            {
              type: "section",
              text: "User",
              items: [
                {
                  type: "link",
                  text: "List User",
                  href: "/user",
                },

                {
                  type: "link",
                  text: "Create User",
                  href: "/user/create",
                },

              ],
            },
            {
              type: "section",
              text: "Device",
              items: [
                {
                  type: "link",
                  text: "Device Manager",
                  href: "/device-manager",
                },
              ],
            },
            ...filterItemsByRole(
              [
                {
                  type: "link",
                  text: "Log History",
                  href: "/log-history",
                },
              ],
              ['Dev', 'Super Admin'] // Hanya Admin & SuperAdmin yang bisa mengakses
            ),
          ],
        },
      ],
      ['Dev', 'Super Admin'] // Hanya Admin & SuperAdmin yang bisa mengakses
    ),
  ];

  return (
    <div className={`sidebar-container ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Tombol untuk toggle sidebar */}
      <button className="toggle-button" onClick={onToggleSidebar}>
        {isVisible ? '<' : '>'}
      </button>

      {/* Side Navigation */}
      {isVisible && (
        <SideNavigation
          onFollow={(event) => {
            if (!event.detail.external) {
              event.preventDefault();
              navigate(event.detail.href);
            }
          }}
          items={sidebarItems}
        />
      )}
    </div>
  );
};

export default Sidebar;
