/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty-pattern */
import { Header, Table, Box, SpaceBetween, TextFilter, Pagination } from '@cloudscape-design/components';
import './Log_History.css';
import { useEffect, useState } from 'react';
import { parse, addHours as addHoursToDate, format } from 'date-fns';

const addHours = (timestamp: string, hours: number) => {
    const date = parse(timestamp, 'dd/MM/yyyy HH:mm:ss', new Date());
    const newDate = addHoursToDate(date, hours);
    return format(newDate, 'dd/MM/yyyy HH:mm:ss');
};

const parseDate = (str: string): Date => {
    const [datePart, timePart] = str.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}`);
};

const Log_History: React.FC<{}> = ({ }) => {
    const [loading, setLoading] = useState(true);

    const [dataLog, setDataLog] = useState<any[]>([]);
    const [filteredDataLog, setFilteredDataLog] = useState<any[]>([]); // State untuk data yang difilter
    const [filteringText, setFilteringText] = useState(""); // State untuk teks filter
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const itemsPerPage = 18;

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch('https://monitoring.qimtronics.com:3001/log-history', {
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
                    const sortedData = json.data.sort((a: { timestamp: string; }, b: { timestamp: string; }) =>
                        parseDate(b.timestamp).getTime() - parseDate(a.timestamp).getTime()
                    );
                    setDataLog(sortedData);
                    setFilteredDataLog(sortedData); // Inisialisasi data yang difilter
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 10000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    // Logika filtering berdasarkan Device Name
    useEffect(() => {
        const filtered = dataLog.filter(item =>
            item.devicename?.toLowerCase().includes(filteringText.toLowerCase())
        );
        setFilteredDataLog(filtered);
        setCurrentPageIndex(1); // Reset ke halaman pertama saat filter berubah
    }, [filteringText, dataLog]);

    const paginatedItems = filteredDataLog.slice(
        (currentPageIndex - 1) * itemsPerPage,
        currentPageIndex * itemsPerPage
    );

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
                items={paginatedItems}
                loading={loading}
                loadingText="Loading resources"
                empty={
                    <Box
                        margin={{ vertical: "xs" }}
                        textAlign="center"
                        color="inherit"
                    >
                        <SpaceBetween size="m">
                            <b>No resources</b>

                        </SpaceBetween>
                    </Box>
                }
                filter={
                    <TextFilter
                        filteringPlaceholder="Find by Device Name"
                        filteringText={filteringText}
                        onChange={({ detail }) => {
                            setFilteringText(detail.filteringText);
                            setCurrentPageIndex(1);
                        }}
                    />
                }
                header={
                    <Header>Device List</Header>
                }
                pagination={
                    <Pagination
                        currentPageIndex={currentPageIndex}
                        pagesCount={Math.ceil(filteredDataLog.length / itemsPerPage)}
                        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                    />
                }
            />
        </div>
    );
};

export default Log_History;
