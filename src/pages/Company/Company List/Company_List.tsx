import { Header, Table, Box, SpaceBetween, TextFilter, Button, Modal, FormField, Input, Select } from '@cloudscape-design/components';
import { Link } from 'react-router-dom';
import './Company_List.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFlashbar } from '../../../context/FlashbarContext';
import { SharedFlashbar } from '../../../components/Flashbar/Flashbar';

const List_Company: React.FC<{}> = () => {
    const idUser = localStorage.getItem('id_user');
    const idRole = localStorage.getItem('id_role');

    const [dataCompany, setDataCompany] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [previousGroupName, setPreviousGroupName] = useState("");
    const [previousCompanyName, setPreviousCompanyName] = useState("");

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const navigate = useNavigate();
    const { addFlashbarItem } = useFlashbar();

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
        const JSON_MESSAGE = JSON.stringify({
            id_role: idRole,
            created_by: idUser
        });
        try {
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/company', {
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
            setDataCompany(json.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = () => {
        setPreviousGroupName(selectedItems[0].group_name);
        setPreviousCompanyName(selectedItems[0].company_name)
        if (selectedItems.length === 1) {
            setEditingItem({ ...selectedItems[0] });
            setUpdateModalOpen(true);
        }
    };

    const handleDelete = () => {
        if (selectedItems.length > 0) {
            setDeleteModalOpen(true);
        }
    };

    const handleCreate = () => {
        navigate('/company/create');
    };

    const handleConfirmDelete = async () => {
        addFlashbarItem(loadingMessage('Deleting items...'));
        console.log('Deleted items:', selectedItems);

        const JSON_MESSAGE = JSON.stringify({
            list_id_company: selectedItems.map(item => item.id_company),
            list_company_name_and_group: selectedItems.map(item => ({
                company_name: item.company_name,
                group_name: item.group_name
            }))
        });
        console.log('JSON_MESSAGE:', JSON_MESSAGE);

        try {
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/company/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE
            });

            if (response.ok) {
                console.log('Company delete successfully');
                addFlashbarItem(successMessage('Company delete successfully'));
            } else {
                console.log('Failed to delete company');
                addFlashbarItem(errorMessage('Error deleting company.'));
                setErrorModalMessage(String('Error deleting company.'));
                setIsErrorModalVisible(true);
            }

            fetchData();
            setDeleteModalOpen(false);
            setSelectedItems([]);
        } catch (error) {
            console.error('Error deleting company:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
    };

    const handleSaveUpdate = async () => {
        addFlashbarItem(loadingMessage('Updating item...'));
        console.log('Saving updated item:', editingItem);
        const JSON_MESSAGE = JSON.stringify({
            id_company: editingItem?.id_company,
            previous_group_name: previousGroupName,
            company_group: editingItem?.group_name,
            previous_company_name: previousCompanyName,
            company_name: editingItem?.company_name,
            company_address: editingItem?.company_address,
            company_contact: editingItem?.company_contact,
            company_person_in_charge: editingItem?.company_person_in_charge
        });
        console.log('JSON_MESSAGE:', JSON_MESSAGE);
        try {
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/company/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE
            });

            if (response.ok) {
                console.log('Company delete successfully');
                addFlashbarItem(successMessage('Company updated successfully'));
            } else {
                console.log('Failed to delete company');
                addFlashbarItem(errorMessage('Error updating company.'));
                setErrorModalMessage(String('Error updating company.'));
                setIsErrorModalVisible(true);
            }

            fetchData();
            setUpdateModalOpen(false);
            setSelectedItems([]);
        } catch (error) {
            console.error('Error deleting company:', error);
            addFlashbarItem(errorMessage(String(error)));
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    const handleCancelUpdate = () => {
        console.log('Editing item:', editingItem);
        setUpdateModalOpen(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setEditingItem((prev: any) => ({
            ...prev,
            [field]: value
        }));
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
                        {
                            id: "company_name", header: "Company Name", cell: item => <Link to={`/company/${item.id_company}`} style={{ textDecoration: 'underline', color: '#0073e6' }}>
                                {item.company_name}
                            </Link>
                        },
                        { id: "company_address", header: "Company Address", cell: item => item.company_address || "-" },
                        { id: "company_contact", header: "Company Contact", cell: item => item.company_contact || "-" },
                        { id: "group", header: "Group", cell: item => item.group_name || "-" },
                        { id: "person_in_charge", header: "Person in Charge", cell: item => item.company_person_in_charge || "-" }
                    ]}
                    enableKeyboardNavigation
                    items={dataCompany}
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
                                        onClick={handleCreate}
                                    >
                                        Create
                                    </button>
                                    <button
                                        className={`custom-button warning ${selectedItems.length === 0 || selectedItems.length > 1 ? 'disabled' : ''}`}
                                        onClick={handleUpdate}
                                        disabled={selectedItems.length === 0 || selectedItems.length > 1}
                                    >
                                        Update
                                    </button>
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
                            Company List
                        </Header>
                    }
                    selectionType="multi"
                    selectedItems={selectedItems}
                    onSelectionChange={event => setSelectedItems(event.detail.selectedItems)}
                />

                {/* Update Modal */}
                <Modal
                    visible={isUpdateModalOpen}
                    onDismiss={handleCancelUpdate}
                    header="Update Company Information"
                    footer={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={handleCancelUpdate}>Cancel</Button>
                            <Button onClick={handleSaveUpdate}>Save</Button>
                        </SpaceBetween>
                    }
                >
                    <div>
                        <FormField label="Company Name">
                            <Input
                                value={editingItem?.company_name || ''}
                                onChange={e => handleInputChange('company_name', e.detail.value)}
                                placeholder="Enter company name"
                            />
                        </FormField>

                        <FormField label="Company Address">
                            <Input
                                value={editingItem?.company_address || ''}
                                onChange={e => handleInputChange('company_address', e.detail.value)}
                                placeholder="Enter company address"
                            />
                        </FormField>

                        <FormField label="Company Contact">
                            <Input
                                value={editingItem?.company_contact || ''}
                                onChange={e => handleInputChange('company_contact', e.detail.value)}
                                placeholder="Enter company contact"
                            />
                        </FormField>

                        <FormField label="Group">
                            <Select
                                selectedOption={editingItem?.group_name ? { label: editingItem?.group_name, value: editingItem?.group_name } : null}
                                onChange={e => handleInputChange('group_name', e.detail.selectedOption.value || '')}
                                options={[
                                    { label: 'Owner', value: 'Owner' },
                                    { label: 'Reseller', value: 'Reseller' },
                                    { label: 'Customer', value: 'Customer' }
                                ]}
                                placeholder="Select group"
                            />
                        </FormField>

                        <FormField label="Person in Charge">
                            <Input
                                value={editingItem?.company_person_in_charge || ''}
                                onChange={e => handleInputChange('company_person_in_charge', e.detail.value)}
                                placeholder="Enter person in charge"
                            />
                        </FormField>
                    </div>
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

export default List_Company;
