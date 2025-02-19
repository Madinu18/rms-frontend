import { FormField, Input, Header, Button, Multiselect, Modal, Box } from '@cloudscape-design/components';
import './Create_User.css';
import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useFlashbar } from '../../../context/FlashbarContext';
import { SharedFlashbar } from '../../../components/Flashbar/Flashbar';

const ROLE_USER = import.meta.env.VITE_ROLE_USER;


const Create_User: React.FC = () => {

    const idRoleUser = localStorage.getItem('id_role');
    const idUser = localStorage.getItem('id_user');
    const idCompany = localStorage.getItem('id_company');

    const [deviceData, setDeviceData] = useState([]);

    const navigate = useNavigate();

    const { addFlashbarItem } = useFlashbar();

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const successMessage = {
        type: "success" as "success" | "error" | "warning" | "info",
        content: "Company created successfully.",
        dismissible: true,
        dismissLabel: "Dismiss message",
        id: "success_message"
    };

    const errorMessage = (message: string) => ({
        type: "error" as "success" | "error" | "warning" | "info",
        content: message,
        dismissible: true,
        dismissLabel: "Dismiss message",
        id: "error_message"
    });

    const loadingMessage = {
        type: "info" as "success" | "error" | "warning" | "info",
        content: "Submitting...",
        dismissible: false,
        id: "loading_message"
    };

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmation_password: '',
        name: '',
        id_company: '',
        accessible_device: ''
    });

    const [selectedOptions, setSelectedOptions] = useState<Array<{
        label: string; value: string; description?: string
    }>>([]);

    const fetchData = async () => {
        try {
            const response = await fetch('http://54.254.223.130:3001/devices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    id_role: idRoleUser,
                    id_user: idUser
                })
            }
            );
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
    }, []);

    const handleInputChange = (field: string, value: string | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (formData.password !== formData.confirmation_password) {
            addFlashbarItem(errorMessage('Password and confirmation password do not match.'));
            return;
        }
        addFlashbarItem(loadingMessage);
        const accessibleDevices = selectedOptions
            .map(option => option.value)
            .join(',');
        const JSON_MESSAGE = JSON.stringify({
            id_company: idCompany,
            username: formData.username,
            password: formData.password,
            name: formData.name,
            id_role: ROLE_USER,
            accessible_device: accessibleDevices
        });
        console.log(JSON_MESSAGE);

        try {
            const response = await fetch('http://54.254.223.130:3001/user/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON_MESSAGE
            });

            if (response.ok) {
                addFlashbarItem(successMessage);
                setFormData({
                    username: '',
                    password: '',
                    confirmation_password: '',
                    name: '',
                    id_company: '',
                    accessible_device: ''
                });
                setSelectedOptions([]);
                navigate('/user');
            } else {
                if (response.status === 400) {
                    const json = await response.json();
                    console.error('Error creating company:', json.error);
                    addFlashbarItem(errorMessage(json.error));
                    setErrorModalMessage(json.error);
                    setIsErrorModalVisible(true);
                    return;
                }
                addFlashbarItem(errorMessage('Error creating company.'));
                setErrorModalMessage('Error creating User.');
                setIsErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Error creating company:', error);
            addFlashbarItem(errorMessage(String(error)));
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    return (
        <div>
            <SharedFlashbar />
            <div style={{ marginLeft: '20px', marginBottom: '0px' }}>
                <Breadcrumb
                    items={[
                        { text: "User", href: "/user" },
                        { text: "Create User", href: "/user/create" }
                    ]}
                />
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Header>Create User</Header>
                </div>

                {/* <SpaceBetween size="l"> */}

                <FormField label="Username">
                    <Input
                        value={formData.username}
                        onChange={e => handleInputChange('username', e.detail.value)}
                        placeholder="Enter company name"
                    />
                </FormField>

                <FormField label="Password">
                    <Input
                        value={formData.password}
                        onChange={e => handleInputChange('password', e.detail.value)}
                        placeholder="Enter company address"
                        type="password"
                    />
                </FormField>

                <FormField label="Confirmation Password">
                    <Input
                        value={formData.confirmation_password}
                        onChange={e => handleInputChange('confirmation_password', e.detail.value)}
                        placeholder="Enter company address"
                        type="password"
                    />
                </FormField>

                <FormField label="Name">
                    <Input
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.detail.value)}
                        placeholder="Enter company contact"
                    />
                </FormField>

                {/* Multiselect Form Field */}
                <FormField label="Device">
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
                        options={deviceData}
                        placeholder="Select tags"
                        filteringType="auto"
                    />
                </FormField>

                <div style={{ marginTop: '20px' }}>
                    <Button variant="primary" onClick={handleSubmit}>Submit</Button>
                </div>
                {/* </SpaceBetween> */}
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
        </div>
    );
};

export default Create_User;
