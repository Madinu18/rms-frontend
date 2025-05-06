/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-empty-pattern */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Header, Table, Box, SpaceBetween, TextFilter, Button, Pagination } from '@cloudscape-design/components';
import './Device_List.css';
import { useEffect, useState } from 'react';

const Device_List: React.FC<{}> = ({ }) => {
    const [dataDevice, setDataDevice] = useState<any[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [filterText, setFilterText] = useState(''); // State untuk teks filter
    const itemsPerPage = 18;

    const id_user = localStorage.getItem('id_user');
    const id_role = localStorage.getItem('id_role');
    const companyGroup = localStorage.getItem('company_group');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch('http://monitoring.qimtronics.com:3001/data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({ id_user, id_role }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();
                if (isMounted) {
                    setDataDevice(json.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 10000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const sortedDevices = [...dataDevice].sort((a, b) => {
        const nameA = a.devicename.toLowerCase();
        const nameB = b.devicename.toLowerCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        return 0;
    });

    // Filter data berdasarkan teks filter
    const filteredDevices = sortedDevices.filter((device) =>
        device.devicename.toLowerCase().includes(filterText.toLowerCase())
    );

    const paginatedDevices = filteredDevices.slice(
        (currentPageIndex - 1) * itemsPerPage,
        currentPageIndex * itemsPerPage
    );

    const columnDefinitions = [
        {
            id: "device_name",
            header: "Device Name",
            cell: (item: { devicename: any; }) => item.devicename || "-"
        },
        {
            id: "serial_number",
            header: "Serial Number",
            cell: (item: { serialnumber: any; }) => item.serialnumber || "-"
        },
        ...(companyGroup === 'Owner' ? [
            {
                id: "reseller_name",
                header: "Reseller Name",
                cell: (item: { reseller_name: any; }) => item.reseller_name || "-"
            }
        ] : []),
        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "customer_name",
                header: "Customer Name",
                cell: (item: { customer_name: any; }) => item.customer_name || "-"
            },
        ] : []),
        {
            id: "last_seen",
            header: "Last Seen",
            cell: (item: { datetime: any; }) => item.datetime || "-"
        }
    ];

    return (
        <div style={{ padding: '20px', borderRadius: '8px' }}>
            <Table
                renderAriaLive={({
                    firstIndex,
                    lastIndex,
                    totalItemsCount
                }) =>
                    `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
                }
                columnDefinitions={columnDefinitions}
                enableKeyboardNavigation
                items={paginatedDevices}
                loadingText="Loading resources"
                empty={
                    <Box
                        margin={{ vertical: "xs" }}
                        textAlign="center"
                        color="inherit"
                    >
                        <SpaceBetween size="m">
                            <b>No resources</b>
                            <Button>Create resource</Button>
                        </SpaceBetween>
                    </Box>
                }
                filter={
                    <TextFilter
                        filteringPlaceholder="Find resources by Device Name"
                        filteringText={filterText}
                        onChange={({ detail }) => setFilterText(detail.filteringText)} // Update teks filter
                    />
                }
                header={
                    <Header>Device List</Header>
                }
                pagination={
                    <Pagination
                        currentPageIndex={currentPageIndex}
                        pagesCount={Math.ceil(filteredDevices.length / itemsPerPage)}
                        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                    />
                }
            />
        </div>
    );
};

export default Device_List;
