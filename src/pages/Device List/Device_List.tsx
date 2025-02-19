import { Header, Table, Box, SpaceBetween, TextFilter, Button } from '@cloudscape-design/components';
import './Device_List.css';
import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Device_List: React.FC<{}> = ({ }) => {
    const [dataDevice, setDataDevice] = useState<any[]>([]);

    const id_user = localStorage.getItem('id_user');
    const id_role = localStorage.getItem('id_role');
    const companyGroup = localStorage.getItem('company_group');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch('http://54.254.223.130:3001/data', {
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


    console.log(dataDevice);

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
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
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
                items={sortedDevices}
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
                        filteringPlaceholder="Find resources"
                        filteringText=""
                    />
                }
                header={
                    <Header>Device List</Header>
                }
            // pagination={
            //     <Pagination currentPageIndex={1} pagesCount={1} />
            // }
            />
        </div>
    );
};

export default Device_List;
