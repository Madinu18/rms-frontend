/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';

import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';

import Dashboard from "./pages/Dashboard/Dashboard";
import DeviceList from "./pages/Device List/Device_List";
import CompanyList from "./pages/Company/Company List/Company_List";
import CreateCompany from "./pages/Company/Create Company/Create_Company";
import CompanyDetails from "./pages/Company/Company Details/Company_Details";
import UserList from "./pages/User/User List/User_List";
import CreateUser from "./pages/User/Create User/Create_User";
import DeviceManager from "./pages/Device/Device Manager/Device_Manager";
import LogHistory from "./pages/Log History/Log_History";

import ProtectedRoute from "./props/ProtectedRouteProps";

const ROLE_SUPER_ADMIN = import.meta.env.VITE_ROLE_SUPER_ADMIN;
const ROLE_DEVELOPER = import.meta.env.VITE_ROLE_DEVELOPER;
const ROLE_USER_MANAGER = import.meta.env.VITE_ROLE_USER_MANAGER;


interface AppProps {
  signOut: () => void;
  user: any; // Replace 'any' with the appropriate type if known
}

const App: React.FC<AppProps> = ({ signOut }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');
  // const [userRole, setUserRole] = useState(localStorage.getItem('id_role') || 'Guest');
  const userRole = localStorage.getItem('id_role') || 'Guest';


  useEffect(() => {
    // Update username whenever localStorage changes
    const storedUsername = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    if (storedUsername) {
      setUsername(storedName || 'Guest');
    }
  }, []);

  const onToggleSidebar = () => {
    console.log(!isSidebarVisible);
    setSidebarVisible(!isSidebarVisible);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('userSession');
    signOut();
  };

  return (
    <>
      <Router>
        <div>
          <Navbar signOut={handleSignOut} user={{ username }} />
        </div>
        <div>
          <Sidebar isVisible={isSidebarVisible} onToggleSidebar={onToggleSidebar} />
        </div>

        <div className={`content ${isSidebarVisible ? '' : 'expanded'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device_list" element={<DeviceList />} />
            <Route path="/company" element={<CompanyList />} />
            {/* <Route path="/company/create" element={<CreateCompany />} /> */}
            <Route
              path="/company/create"
              element={
                <ProtectedRoute role={userRole} allowedRoles={[ROLE_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_USER_MANAGER]}>
                  <CreateCompany />
                </ProtectedRoute>
              }
            />
            <Route path="/company/:id" element={
              <ProtectedRoute role={userRole} allowedRoles={[ROLE_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_USER_MANAGER]}>
                <CompanyDetails />
              </ProtectedRoute>
            }
            />
            <Route path="/user" element={
              <ProtectedRoute role={userRole} allowedRoles={[ROLE_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_USER_MANAGER]}>
                <UserList />
              </ProtectedRoute>
            }
            />
            <Route path="/user/create" element={
              <ProtectedRoute role={userRole} allowedRoles={[ROLE_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_USER_MANAGER]}>
                <CreateUser />
              </ProtectedRoute>
            }
            />
            <Route path="/device-manager" element={
              <ProtectedRoute role={userRole} allowedRoles={[ROLE_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_USER_MANAGER]}>
                <DeviceManager />
              </ProtectedRoute>
            } />
            <Route path="/log-history" element={
              <ProtectedRoute role={userRole} allowedRoles={[ROLE_DEVELOPER, ROLE_SUPER_ADMIN]}>
                <LogHistory />
              </ProtectedRoute>
            }
            />

            {/* <Route path="/" element={<Dashboard data_transaksi_pengeluaran={transactions_pengeluaran} data_transaksi_transfer={transactions_transfer} />} />
            <Route path="/transaksi_pengeluaran" element={<TransaksiPengeluaran data={transactions_pengeluaran} />} />
            <Route path="/transaksi_transfer" element={<TransaksiTransfer data={transactions_transfer} />} />
            <Route path="/profile" element={<Profile user={user} />} /> */}
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;