import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';


// Definisi tipe props
interface NavbarProps {
  signOut?: () => void; // signOut bisa undefined
  user?: { username?: string }; // user juga bisa undefined
}

const Navbar: React.FC<NavbarProps> = ({ signOut, user }) => {
  const navigate = useNavigate();


  const handleItemClick = (event: { detail: { id: string } }) => {
    console.log(`Clicked item: ${event.detail.id}`);
    if (event.detail.id === 'signout' && signOut) {
      console.log('User signed out');
      signOut(); // Panggil signOut jika tidak undefined
      // navigate("/");
    }
    if (event.detail.id === 'profile') {
      navigate("/profile");
    }
    if (event.detail.id === 'security') {
      // navigate("/security");
    }
  };

  return (
    <div className="navbar">
      <TopNavigation
        identity={{
          href: "#",
          title: "QIMTRONICS | Remote Management System",
          logo: {
            src: "/qimtronics_logo.png",
            alt: "qimtronics"
          }
        }}
        utilities={[
          {
            type: "menu-dropdown",
            text: user?.username || "Guest",
            iconName: "user-profile",
            onItemClick: handleItemClick,
            items: [
              { id: "profile", text: "Profile" },
              // { id: "security", text: "Security" },
              { id: "signout", text: "Sign out" },
            ]
          }
        ]}
      />
    </div>
  );
};

export default Navbar;
