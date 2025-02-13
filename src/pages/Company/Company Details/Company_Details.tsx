import { Header, Table, Box, SpaceBetween, TextFilter, Button, Modal, Container } from '@cloudscape-design/components';
import './Company_Details.css';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Company_Details: React.FC<{}> = () => {
    const idRole = localStorage.getItem('id_role');
    const idUser = localStorage.getItem('id_user');
    const groupName = localStorage.getItem('company_group');
    console.log('Group Name:', groupName);

    const { id } = useParams<{ id: string }>();
    const [dataDevice, setDataDevice] = useState<any[]>([]);
    const [companyInfo, setCompanyInfo] = useState<any>({});
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [modalSelectItems, setModalSelectedItems] = useState<any[]>([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentDeviceListData, setCurrentDeviceList] = useState<string>();
    const [currentUserData, setCurrentUser] = useState<string>();
    const [wholeDevice, setWholeDevice] = useState<any[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const JSON_MESSAGE = JSON.stringify({ id_company: id });
            try {
                const response = await fetch('http://157.15.164.78:3001/company/details', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON_MESSAGE,
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const json = await response.json();
                console.log(json);
                setCompanyInfo(json.data[0]);
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };

        fetchData();
    }, [id]);

    const fetchWholeDevice = async () => {
        const JSON_MESSAGE = JSON.stringify({ id_role: idRole, id_user: idUser });
        try {
            const response = await fetch('http://157.15.164.78:3001/devices', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE,
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            setWholeDevice(json.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchDataDevice = async () => {
        const JSON_MESSAGE = JSON.stringify({ id_user: companyInfo.id_user_manager });
        try {
            const response = await fetch('http://157.15.164.78:3001/devices', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE,
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const json = await response.json();
            const serialNumbers = json.data.map((item: { serialnumber: any; }) => item.serialnumber).join(',');
            setCurrentDeviceList(serialNumbers);
            setDataDevice(json.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (companyInfo.id_user_manager) {
            setCurrentUser(companyInfo.id_user_manager);
            fetchDataDevice();
        }
    }, [companyInfo]);

    const sortedDevices = [...dataDevice].sort((a, b) => {
        const nameA = a?.devicename?.toLowerCase() || '';
        const nameB = b?.devicename?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
    });

    const handleDelete = async () => {
        if (selectedItems.length > 0) {
            const serialNumbersToDelete = selectedItems.map(item => item.serialnumber);
            const formattedDeletedSerialNumbers = serialNumbersToDelete.join(',');
            // return;
            const updatedListDevice = currentDeviceListData?.split(',')
                .filter(serial => !serialNumbersToDelete.includes(serial))
                .join(',');

            const cleanedDeviceList = updatedListDevice || '';
            const JSON_MESSAGE = JSON.stringify({
                id_user: currentUserData,
                accessible_device: cleanedDeviceList,
                removed_accesible_device: formattedDeletedSerialNumbers,
            });

            try {
                const response = await fetch('http://157.15.164.78:3001/devices/delete', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON_MESSAGE
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                fetchDataDevice();
                setSelectedItems([]);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleConfirmDelete = () => {
        setDeleteModalOpen(false);
        setSelectedItems([]);
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
    };

    const handleAddModalOpen = () => {
        fetchWholeDevice();
        setAddModalOpen(true);
    };

    const handleAddModalClose = () => {
        setAddModalOpen(false);
    };

    const handleAddDevices = async () => {
        if (!modalSelectItems || modalSelectItems.length === 0) {
            return;
        }

        console.log('Selected Devices to Add:', modalSelectItems);
        const accessibleDevices = modalSelectItems
            .map(item => item.serialnumber)
            .join(',');

        const updatedDeviceListData = currentDeviceListData
            ? `${currentDeviceListData},${accessibleDevices}`
            : accessibleDevices;

        const JSON_MESSAGE = JSON.stringify({
            id_user: currentUserData,
            company_name: companyInfo.company_name,
            group_name: companyInfo.group_name,
            accessible_device: updatedDeviceListData
        });
        console.log('JSON_MESSAGE:', JSON_MESSAGE);
        try {
            const response = await fetch('http://157.15.164.78:3001/devices/update', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE,
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            console.log('Success update device');
        } catch (error) {
            console.error('Error deleting user:', error);
        }

        fetchDataDevice();
        setModalSelectedItems([]);
        setAddModalOpen(false);
    };

    const filteredDevices = wholeDevice
        .filter(device => {
            // Filter tambahan berdasarkan GroupName
            if (groupName === 'Owner' && companyInfo.group_name === 'Reseller') {
                return !device.reseller_name && !device.customer_name;
            } else if (groupName === 'OWner' && companyInfo.group_name === 'Customer') {
                return !device.customer_name; // customer_name kosong
            } else if (groupName === 'Reseller') {
                return !device.customer_name; // customer_name kosong
            }
            return true; // Jika bukan 'Owner' atau 'Reseller', tampilkan semua
        })
        .filter(device => {
            // Filter berdasarkan serial number yang tidak ada di currentDeviceListData
            return !currentDeviceListData?.split(',').includes(device.serialnumber);
        })
        .filter(device => {
            // Filter berdasarkan device_name yang mengandung searchQuery
            return device.devicename?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        });

    return (
        <>
            <div style={{ marginLeft: '20px', marginBottom: '0px' }}>
                <Breadcrumb
                    items={[
                        { text: 'Company', href: '/company' },
                        { text: companyInfo?.company_name || 'Company Name', href: `/company/${id}` },
                        { text: 'Details', href: '' },
                    ]}
                />
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Container
                        header={
                            <Header variant="h2" description="Details of the selected company">
                                {companyInfo?.company_name || 'Company Name'}
                            </Header>
                        }
                    >
                        {companyInfo ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div><strong>Address:</strong> {companyInfo?.company_address || '-'}</div>
                                <div><strong>Group:</strong> {companyInfo?.group_name || '-'}</div>
                                <div><strong>Contact:</strong> {companyInfo?.company_contact || '-'}</div>
                                <div><strong>Person in Charge:</strong> {companyInfo?.company_person_in_charge || '-'}</div>
                            </div>
                        ) : (
                            <div>Loading company details...</div>
                        )}
                    </Container>
                </div>

                <Table
                    columnDefinitions={[
                        { id: 'device_name', header: 'Device Name', cell: item => item?.devicename || '-' },
                        { id: 'serialnumber', header: 'Serial Number', cell: item => item?.serialnumber || '-' },
                    ]}
                    enableKeyboardNavigation
                    items={sortedDevices}
                    loadingText="Loading resources"
                    empty={
                        <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
                            <SpaceBetween size="m">
                                <b>No resources</b>
                                <Button>Create resource</Button>
                            </SpaceBetween>
                        </Box>
                    }
                    filter={<TextFilter filteringPlaceholder="Find resources" filteringText={''} />}
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    <button className="custom-button start" onClick={handleAddModalOpen}>Add</button>
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
                            Device List
                        </Header>
                    }
                    selectionType="multi"
                    selectedItems={selectedItems}
                    onSelectionChange={event => setSelectedItems(event.detail.selectedItems)}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    size="max"
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

                {/* Add Devices Modal */}
                <Modal
                    size="medium"
                    visible={isAddModalOpen}
                    onDismiss={handleAddModalClose}
                    header="Add Devices"
                    footer={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={handleAddModalClose}>Cancel</Button>
                            <Button onClick={handleAddDevices}>ADD</Button>
                        </SpaceBetween>
                    }
                >
                    <Table
                        columnDefinitions={[
                            { id: 'device_name', header: 'Device Name', cell: item => item?.devicename || '-' },
                            { id: 'serialnumber', header: 'Serial Number', cell: item => item?.serialnumber || '-' },
                        ]}
                        items={filteredDevices}
                        filter={<TextFilter
                            filteringText={searchQuery}
                            onChange={({ detail }) => setSearchQuery(detail.filteringText)}
                            filteringPlaceholder="Search by device name"
                        />}
                        selectionType="multi"
                        selectedItems={modalSelectItems}
                        onSelectionChange={event => setModalSelectedItems(event.detail.selectedItems)}
                    />
                </Modal>
            </div>
        </>
    );
};

export default Company_Details;
