import { Header, Table, Box, SpaceBetween, TextFilter, Button } from '@cloudscape-design/components';
import './Log_History.css';
import { useEffect, useState } from 'react';
import { parse, addHours as addHoursToDate, format } from 'date-fns';

const addHours = (timestamp: string, hours: number) => {
    const date = parse(timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
    const newDate = addHoursToDate(date, hours);
    return format(newDate, 'dd/MM/yyyy HH:mm:ss');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Log_History: React.FC<{}> = ({ }) => {
    const [dataLog, setDataLog] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch('http://ec2-13-212-4-125.ap-southeast-1.compute.amazonaws.com:3001/log-history', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();
                if (isMounted) {

                    setDataLog(json.data);
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


    console.log(dataLog);



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
                columnDefinitions={[
                    {
                        id: "timestamp",
                        header: "Timestamp",
                        cell: item => item.timestamp ? addHours(item.timestamp, 7) : "-",
                    },
                    {
                        id: "name",
                        header: "Name",
                        cell: item => item.name || "-"
                    },
                    {
                        id: "company",
                        header: "Company",
                        cell: item => item.company || "-"
                    },
                    {
                        id: "role",
                        header: "Role",
                        cell: item => item.role || "-"
                    },
                    {
                        id: "device_name",
                        header: "Device Name",
                        cell: item => item.devicename || "-"
                    },
                    {
                        id: "serial_number",
                        header: "Serial Number",
                        cell: item => item.serialnumber || "-"
                    },
                    {
                        id: "activity",
                        header: "Activity",
                        cell: item => item.activity || "-"
                    }
                ]}
                enableKeyboardNavigation
                items={dataLog}
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

export default Log_History;
