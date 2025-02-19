import { FormField, Input, Header, Button, Select, Multiselect, Modal, Box } from '@cloudscape-design/components';
import './Create_Company.css';
import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useFlashbar } from '../../../context/FlashbarContext';
import { SharedFlashbar } from '../../../components/Flashbar/Flashbar';

const Create_Company: React.FC = () => {
    const idRoleUser = localStorage.getItem('id_role');
    const idUser = localStorage.getItem('id_user');
    const companyGroup = localStorage.getItem('company_group');
    const userRoleName = localStorage.getItem('role_name');

    const navigate = useNavigate();

    const { addFlashbarItem } = useFlashbar();

    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");

    const [deviceData, setDeviceData] = useState([]);

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
        company_name: '',
        company_address: '',
        company_contact: '',
        company_group: '',
        company_person_in_charge: '',
        company_username: ''
    });

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
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            console.log('Data fetched:', json.data);

            // Filter the data based on selected group (Reseller or Customer)
            const filteredData = json.data.filter((device: any) => {
                if (formData.company_group === 'Reseller') {
                    return device.reseller_name === null || device.reseller_name === '';
                } else if (formData.company_group === 'Customer') {
                    return device.customer_name === null || device.customer_name === '';
                }
                return true; // No filter for other group types
            });

            const formattedData = filteredData.map((device: any) => ({
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
    }, [formData.company_group]);



    const [selectedOptions, setSelectedOptions] = useState<Array<{
        label: string; value: string; description?: string
    }>>([]);

    const handleInputChange = (field: string, value: string | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        addFlashbarItem(loadingMessage);
        const accessibleDevices = selectedOptions
            .map(option => option.value)
            .join(',');
        const JSON_MESSAGE = JSON.stringify({
            company_name: formData.company_name,
            company_address: formData.company_address,
            company_contact: formData.company_contact,
            company_group: formData.company_group,
            company_person_in_charge: formData.company_person_in_charge,
            company_username: formData.company_username,
            accessible_device: accessibleDevices,
            created_by: idUser
        });

        try {
            const response = await fetch('http://54.254.223.130:3001/company/create', {
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
                    company_name: '',
                    company_address: '',
                    company_contact: '',
                    company_group: '',
                    company_person_in_charge: '',
                    company_username: ''
                });
                setSelectedOptions([]);
                navigate('/company');
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
                setErrorModalMessage('Error creating company.');
                setIsErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Error creating company:', error);
            addFlashbarItem(errorMessage(String(error)));
            setErrorModalMessage(String(error));
            setIsErrorModalVisible(true);
        }
    };

    useEffect(() => {
        console.log(selectedOptions);
    })

    return (
        <>
            <SharedFlashbar />
            <div style={{ marginLeft: '20px', marginBottom: '0px' }}>
                <Breadcrumb
                    items={[
                        { text: "Company", href: "/company" },
                        { text: "Create Company", href: "/company/create" }
                    ]}
                />
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Header>Create Company</Header>
                </div>



                <FormField label="Company Name">
                    <Input
                        value={formData.company_name}
                        onChange={e => handleInputChange('company_name', e.detail.value)}
                        placeholder="Enter company name"
                    />
                </FormField>

                <FormField label="Company Address">
                    <Input
                        value={formData.company_address}
                        onChange={e => handleInputChange('company_address', e.detail.value)}
                        placeholder="Enter company address"
                    />
                </FormField>

                <FormField label="Company Contact">
                    <Input
                        value={formData.company_contact}
                        onChange={e => handleInputChange('company_contact', e.detail.value)}
                        placeholder="Enter company contact"
                    />
                </FormField>

                <FormField label="Group">
                    <Select
                        selectedOption={formData.company_group ? { label: formData.company_group, value: formData.company_group } : null}
                        onChange={e => handleInputChange('company_group', e.detail.selectedOption.value)}
                        options={
                            userRoleName === "Dev" ? [
                                { label: 'Owner', value: 'Owner' },
                                { label: 'Reseller', value: 'Reseller' },
                                { label: 'Customer', value: 'Customer' }
                            ] : companyGroup === "Owner" ? [
                                { label: 'Reseller', value: 'Reseller' },
                                { label: 'Customer', value: 'Customer' }
                            ] : companyGroup === "Reseller" ? [{ label: 'Customer', value: 'Customer' }] : []
                        }
                        placeholder="Select group"
                    />
                </FormField>

                <FormField label="Person in Charge">
                    <Input
                        value={formData.company_person_in_charge}
                        onChange={e => handleInputChange('company_person_in_charge', e.detail.value)}
                        placeholder="Enter person in charge"
                    />
                </FormField>

                <FormField label="Username for Company Account">
                    <Input
                        value={formData.company_username}
                        onChange={e => handleInputChange('company_username', e.detail.value)}
                        placeholder="Enter username for company account"
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
                        placeholder="Select devices"
                        filteringType="auto"
                        disabled={!formData.company_group}
                    />
                </FormField>


                {/* <SpaceBetween size="l" /> */}
                <div style={{ marginTop: '20px' }}>
                    <Button variant="primary" onClick={handleSubmit}>Submit</Button>
                </div>

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

export default Create_Company;
