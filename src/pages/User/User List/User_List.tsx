import { Header, Table, Box, SpaceBetween, TextFilter, Button, Modal, FormField, Input } from '@cloudscape-design/components';
import './User_List.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFlashbar } from '../../../context/FlashbarContext';
import { SharedFlashbar } from '../../../components/Flashbar/Flashbar';

const User_List: React.FC<{}> = () => {
    const [dataUser, setDataUser] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const [idUser, setIdUser] = useState('');

    const [isResetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const navigate = useNavigate();
    const { addFlashbarItem } = useFlashbar();

    const idUserLogin = localStorage.getItem('id_user');
    const idRole = localStorage.getItem('id_role');
    const idCompany = localStorage.getItem('id_company');
    const companyName = localStorage.getItem('company_name');

    console.log('idCompany:', idCompany);
    console.log('companyName:', companyName);

    const successMessage = (message: string) => ({
        type: "success" as "success" | "error" | "warning" | "info",
        content: message,
        dismissible: true,
        dismissLabel: "Dismiss message",
        id: "success_message"
    });

    const errorMessage = (message: string) => ({
        type: "error" as "success" | "error" | "warning" | "info",
        content: message,
        dismissible: true,
        dismissLabel: "Dismiss message",
        id: "error_message"
    });

    const loadingMessage = (message: string) => ({
        type: "info" as "success" | "error" | "warning" | "info",
        content: message,
        dismissible: false,
        id: "loading_message"
    });

    const fetchData = async () => {
        try {
            const JSON_MESSAGE = JSON.stringify({
                id_user: idUserLogin,
                id_role: idRole,
                id_company: idCompany
            });
            console.log('JSON_MESSAGE:', JSON_MESSAGE);
            const response = await fetch('http://54.254.223.130:3001/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            console.log('Data fetched:', json.data);
            setDataUser(json.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleDelete = () => {
        if (selectedItems.length > 0) {
            setDeleteModalOpen(true);
        }
    };

    const handleAdd = () => {
        navigate('/user/create');
    };

    const handleConfirmDelete = async () => {
        addFlashbarItem(loadingMessage('Deleting items...'));
        console.log('Deleted items:', selectedItems);
        const JSON_MESSAGE = JSON.stringify({
            list_id_user: selectedItems.map(item => item.id_user)
        });
        console.log('JSON_MESSAGE:', JSON_MESSAGE);
        try {
            const response = await fetch('http://54.254.223.130:3001/user/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE
            });

            if (response.ok) {
                console.log('User delete successfully');
                addFlashbarItem(successMessage('User delete successfully'));
            } else {
                console.log('Failed to delete user');
                addFlashbarItem(errorMessage('Error deleting user.'));
                setErrorModalMessage(String('Error deleting user.'));
                setIsErrorModalVisible(true);
            }

            fetchData();
            setDeleteModalOpen(false);
            setSelectedItems([]);
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
    };

    const handleResetPasswordClick = (id_user: string) => {
        setIdUser(id_user);
        setResetPasswordModalOpen(true);
    };

    const handleResetPasswordSave = async () => {
        console.log(idUser)
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {

            setErrorModalMessage("Passwords do not match.");
            setIsErrorModalVisible(true);
            return;
        }
        addFlashbarItem({
            type: "info",
            content: "Resetting password...",
            dismissible: false,
            id: "reset_password_loading"
        });

        try {
            const JSON_MESSAGE = JSON.stringify({
                id_user: idUser,
                new_password: resetPasswordData.newPassword
            });
            console.log('Reset password payload:', JSON_MESSAGE);
            const response = await fetch('http://54.254.223.130:3001/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE
            });

            if (response.ok) {
                addFlashbarItem(successMessage('Password reset successfully.'));
            } else {
                throw new Error('Failed to reset password.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        } finally {
            setResetPasswordModalOpen(false);
            setResetPasswordData({ newPassword: '', confirmPassword: '' });
        }
    };

    const handleResetPasswordCancel = () => {
        setResetPasswordModalOpen(false);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
    };

    return (
        <>
            <SharedFlashbar />
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <Table
                    renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) =>
                        `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
                    }
                    columnDefinitions={[
                        { id: "Name", header: "Name", cell: item => item.name || "-" },
                        { id: "Role", header: "Role", cell: item => item.role_name || "-" },
                        { id: "company_name", header: "Company Name", cell: item => item.company_name || "-" },
                        { id: "Username", header: "Username", cell: item => item.username || "-" },
                        {
                            id: "reset_password",
                            header: <div style={{ textAlign: 'center' }}>Reset Password</div>,
                            cell: (item) => (
                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        style={{
                                            backgroundColor: '#0073e6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                        onClick={() => handleResetPasswordClick(item.id_user)}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            )
                        }
                    ]}
                    enableKeyboardNavigation
                    items={dataUser}
                    loadingText="Loading resources"
                    empty={
                        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                            <SpaceBetween size="m">
                                <b>No resources</b>
                                <Button>Create resource</Button>
                            </SpaceBetween>
                        </Box>
                    }
                    filter={
                        <TextFilter filteringPlaceholder="Find resources" filteringText="" />
                    }
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    <button
                                        className={'custom-button start'}
                                        onClick={handleAdd}
                                    >
                                        Add
                                    </button>
                                    {/* <button
                                        className={`custom-button warning ${selectedItems.length === 0 || selectedItems.length > 1 ? 'disabled' : ''}`}
                                        onClick={handleUpdate}
                                        disabled={selectedItems.length === 0 || selectedItems.length > 1}
                                    >
                                        Update
                                    </button> */}
                                    <button
                                        className={`custom-button danger ${selectedItems.length === 0 ? 'disabled' : ''}`}
                                        onClick={handleDelete}
                                        disabled={selectedItems.length === 0}
                                    >
                                        Delete
                                    </button>
                                </SpaceBetween>
                            }
                        >
                            User List
                        </Header>
                    }
                    selectionType="multi"
                    selectedItems={selectedItems}
                    onSelectionChange={event => setSelectedItems(event.detail.selectedItems)}
                />

                <Modal
                    visible={isResetPasswordModalOpen}
                    onDismiss={handleResetPasswordCancel}
                    header="Reset Password"
                    footer={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={handleResetPasswordCancel}>Cancel</Button>
                            <Button onClick={handleResetPasswordSave}>Save</Button>
                            {/* <button
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    color: '#333',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '5px 10px',
                                    cursor: 'pointer'
                                }}
                                onClick={handleResetPasswordCancel}
                            >
                                Cancel
                            </button>
                            <button
                                style={{
                                    backgroundColor: '#0073e6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '5px 10px',
                                    cursor: 'pointer'
                                }}
                                onClick={handleResetPasswordSave}
                            >
                                Save
                            </button> */}
                        </SpaceBetween>
                    }
                >
                    <div>
                        <FormField label="New Password">
                            <Input
                                value={resetPasswordData.newPassword}
                                onChange={e => setResetPasswordData(prev => ({ ...prev, newPassword: e.detail.value }))}
                                placeholder="Enter new password"
                                type="password"
                            />
                        </FormField>
                        <FormField label="Confirm Password">
                            <Input
                                value={resetPasswordData.confirmPassword}
                                onChange={e => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.detail.value }))}
                                placeholder="Confirm new password"
                                type="password"
                            />
                        </FormField>
                    </div>
                </Modal>

                <Modal
                    visible={isErrorModalVisible}
                    onDismiss={() => setIsErrorModalVisible(false)}
                    header="Error"
                    closeAriaLabel="Close modal"
                    footer={
                        <Box float="right">
                            <Button variant="primary" onClick={() => setIsErrorModalVisible(false)}>
                                OK
                            </Button>
                        </Box>
                    }
                >
                    {errorModalMessage}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    visible={isDeleteModalOpen}
                    onDismiss={handleCancelDelete}
                    header="Confirm Deletion"
                    footer={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={handleCancelDelete}>Cancel</Button>
                            <Button onClick={handleConfirmDelete}>Delete</Button>
                        </SpaceBetween>
                    }
                >
                    <p>Are you sure you want to delete the selected items?</p>
                </Modal>
            </div>
            <Modal
                visible={isErrorModalVisible}
                onDismiss={() => setIsErrorModalVisible(false)}
                header="Error"
                closeAriaLabel="Close modal"
                footer={
                    <Box float="right">
                        <Button variant="primary" onClick={() => setIsErrorModalVisible(false)}>
                            OK
                        </Button>
                    </Box>
                }
            >
                {errorModalMessage}
            </Modal>
        </>

    );
};

export default User_List;
