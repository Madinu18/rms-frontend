import { Header, Table, Box, SpaceBetween, TextFilter, Button, Modal, Multiselect } from '@cloudscape-design/components';
import './Device_Manager.css';
import { useEffect, useState } from 'react';

import { useFlashbar } from '../../../context/FlashbarContext';
import { SharedFlashbar } from '../../../components/Flashbar/Flashbar';


const Device_Manager: React.FC<{}> = () => {
    const [dataUser, setDataUser] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const [deviceList, setDeviceList] = useState<{ serialnumber: string; devicename: string }[]>([]);
    const [deviceData, setDeviceData] = useState<{ label: string; value: string }[]>([]);

    const [currentDeviceListData, setCurrentDeviceList] = useState<string>();
    const [currentUserData, setCurrentUser] = useState<string>();

    const [isManageDeviceModalOpen, setManageDeviceModalOpen] = useState(false);

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const { addFlashbarItem } = useFlashbar();

    const idRole = localStorage.getItem('id_role');
    const idUserLogin = localStorage.getItem('id_user');
    const idCompany = localStorage.getItem('id_company');
    const companyName = localStorage.getItem('company_name');

    console.log('idCompany:', idCompany);
    console.log('companyName:', companyName);

    // const successMessage = (message: string) => ({
    //     type: "success" as "success" | "error" | "warning" | "info",
    //     content: message,
    //     dismissible: true,
    //     dismissLabel: "Dismiss message",
    //     id: "success_message"
    // });

    // const errorMessage = (message: string) => ({
    //     type: "error" as "success" | "error" | "warning" | "info",
    //     content: message,
    //     dismissible: true,
    //     dismissLabel: "Dismiss message",
    //     id: "error_message"
    // });

    const loadingMessage = (message: string) => ({
        type: "info" as "success" | "error" | "warning" | "info",
        content: message,
        dismissible: false,
        id: "loading_message"
    });

    const fetchData = async () => {
        try {
            const JSON_MESSAGE = JSON.stringify({
                id_role: idRole,
                id_company: idCompany
            });
            console.log('JSON_MESSAGE:', JSON_MESSAGE);
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/device-manager', {
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

    const fetchDeviceData = async () => {
        const JSON_MESSAGE = JSON.stringify({
            id_role: idRole,
            id_user: idUserLogin
        })
        try {
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/devices', {
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
            const formattedData = json.data.map((device: any) => ({
                label: `${device.serialnumber} (${device.devicename})`,
                value: device.serialnumber,
            }));
            setDeviceData(formattedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, [deviceList]);

    const handleDeleteDevice = async (serialnumber: string) => {
        addFlashbarItem(loadingMessage('Deleting items...'));
        console.log('Deleted items:', serialnumber);
        const updatedListDevice = currentDeviceListData?.split(",")           // Memisahkan string berdasarkan koma
            .filter(item => item !== serialnumber) // Menghapus item yang tidak diinginkan
            .join(",");

        const cleanedDeviceList = updatedListDevice ? updatedListDevice : "";

        const JSON_MESSAGE = JSON.stringify({
            id_user: currentUserData,
            accessible_device: cleanedDeviceList
        });
        console.log('JSON_MESSAGE:', JSON_MESSAGE);
        updateAccesibleDevice(JSON_MESSAGE);
        setCurrentDeviceList(updatedListDevice);
        const updatedDeviceList = await getDeviceListData(updatedListDevice?.toString() || "");
        setDeviceList(updatedDeviceList);
    };

    const handleManageDeviceClick = async (deviceString: string, idUser: string) => {
        console.log('Device string:', deviceString);
        setCurrentUser(idUser);

        fetchDeviceData();

        setCurrentDeviceList(deviceString)
        const data = await getDeviceListData(deviceString);
        setDeviceList(data)

        setManageDeviceModalOpen(true);
    };

    const getDeviceListData = async (deviceString: string) => {
        const JSON_MESSAGE = JSON.stringify({
            accessible_device: deviceString
        });
        console.log('JSON_MESSAGE:', JSON_MESSAGE);
        try {
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/devices-manager/list', {
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
            return json.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    const handleManageDeviceCancel = () => {
        setManageDeviceModalOpen(false);
    };

    const [selectedOptions, setSelectedOptions] = useState<Array<{
        label: string; value: string; description?: string
    }>>([]);

    const handleAddDevice = async () => {
        addFlashbarItem(loadingMessage('Adding device...'));
        const accessibleDevices = selectedOptions
            .map(option => option.value)
            .join(',');

        if (!accessibleDevices) {
            // Jika tidak ada perangkat yang dipilih, tampilkan pesan kesalahan
            setErrorModalMessage("No device selected!");
            setIsErrorModalVisible(true);
            return;
        }

        const updatedDeviceListData = currentDeviceListData
            ? `${currentDeviceListData},${accessibleDevices}`
            : accessibleDevices;

        const JSON_MESSAGE = JSON.stringify({
            id_user: currentUserData,
            accessible_device: updatedDeviceListData
        });

        console.log('JSON_MESSAGE:', JSON_MESSAGE);
        updateAccesibleDevice(JSON_MESSAGE);
        setSelectedOptions([]);
        setCurrentDeviceList(updatedDeviceListData);
        const updatedDeviceList = await getDeviceListData(updatedDeviceListData);
        setDeviceList(updatedDeviceList);
    }

    const updateAccesibleDevice = async (JSON_MESSAGE: string) => {
        try {
            const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/devices-manager/user/update-device', {
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
            console.log('Success update device');
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    const filteredDeviceData = deviceData.filter(device => {
        return !deviceList.some(existingDevice => existingDevice.serialnumber === device.value);
    });

    return (
        <>
            <SharedFlashbar />
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <Table
                    renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) =>
                        `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
                    }
                    columnDefinitions={[
                        { id: "username", header: "Username", cell: item => item.username || "-" },
                        { id: "name", header: "Name", cell: item => item.name || "-" },
                        // { id: "accesible_device", header: "Accesible Device", cell: item => item.accessible_device || "-" },
                        {
                            id: "manage_device",
                            header: <div style={{ textAlign: 'center' }}>Manage Devices</div>,
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
                                        onClick={() => handleManageDeviceClick(item.accessible_device, item.id_user)}
                                    >
                                        Manage Devices
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
                        <Header>
                            Device Manager
                        </Header>
                    }
                    selectionType="multi"
                    selectedItems={selectedItems}
                    onSelectionChange={event => setSelectedItems(event.detail.selectedItems)}
                />

                <Modal
                    visible={isManageDeviceModalOpen}
                    onDismiss={handleManageDeviceCancel}
                    header="Manage Device for User"
                >
                    <div>
                        <div>
                            <SpaceBetween size="xs">
                                <Multiselect
                                    selectedOptions={selectedOptions.map(option => ({
                                        label: option.label,
                                        value: option.value,
                                    }))}
                                    onChange={({ detail }) =>
                                        setSelectedOptions(detail.selectedOptions.map(option => ({
                                            label: option.label || '',
                                            value: option.value || '',
                                        })))
                                    }
                                    options={filteredDeviceData}
                                    placeholder="Select devices"
                                    filteringType="auto"
                                />
                                {/* Tombol untuk menambahkan device ke deviceList */}
                                <Button
                                    variant="primary"
                                    onClick={handleAddDevice}
                                >
                                    Add Device to List
                                </Button>
                            </SpaceBetween>
                        </div>
                        {/* Memberikan jarak antara Multiselect dan tabel */}
                        <div style={{ marginTop: '20px' }}>
                            <Table
                                columnDefinitions={[
                                    { id: "serialnumber", header: "Serial Number", cell: item => item.serialnumber || "-" },
                                    { id: "devicename", header: "Device Name", cell: item => item.devicename || "-" },
                                    {
                                        id: "del",
                                        header: <div style={{ textAlign: 'center' }}></div>,
                                        cell: (item) => (
                                            <div style={{ textAlign: 'center' }}>
                                                <button
                                                    style={{
                                                        backgroundColor: '#e31414',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        padding: '5px 10px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                    }}
                                                    onClick={() => handleDeleteDevice(item.serialnumber)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        )
                                    }
                                ]}
                                enableKeyboardNavigation
                                items={deviceList}
                                loadingText="Loading resources"
                                empty={
                                    <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                                        <SpaceBetween size="m">
                                            <b>No resources</b>
                                            <Button>Create resource</Button>
                                        </SpaceBetween>
                                    </Box>
                                }
                            />
                        </div>
                    </div>
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

export default Device_Manager;
