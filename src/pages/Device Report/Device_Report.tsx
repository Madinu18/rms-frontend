import { Header, Table, Box, SpaceBetween, TextFilter, Pagination } from '@cloudscape-design/components';
import './Device_Report.css';
import { useEffect, useState } from 'react';

const Device_Report: React.FC = () => {
    const id_user = localStorage.getItem('id_user');
    const id_role = localStorage.getItem('id_role');

    const [loading, setLoading] = useState(true);

    const [data, setData] = useState<any[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [filterText, setFilterText] = useState('');
    const itemsPerPage = 18;

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const response = await fetch('https://monitoring.qimtronics.com:3001/device_report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({ id_user, id_role }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const json = await response.json();
                console.log('Device Report Data:', json.data);
                if (isMounted) setData(json.data);
            } catch (error) {
                console.error('Error fetching device report:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 10000);
        return () => { isMounted = false; clearInterval(intervalId); };
    }, []);

    const filtered = data.filter((device) =>
        device.device_name?.toLowerCase().includes(filterText.toLowerCase())
    );
    const paginated = filtered.slice(
        (currentPageIndex - 1) * itemsPerPage,
        currentPageIndex * itemsPerPage
    );

    const getPercent = (count: number) => ((count / 1440) * 100).toFixed(1);
    const getOnlineColor = (percent: number) => percent < 50 ? percent < 25 ? 'red' : 'orange' : 'green';
    const getOfflineColor = () => 'red';

    const columnDefinitions = [
        {
            id: 'device_name',
            header: 'Device Name',
            cell: (item: any) => item.device_name || '-'
        },
        {
            id: 'serialnumber',
            header: 'Serial Number',
            cell: (item: any) => item.serialnumber || '-'
        },
        {
            id: 'yesterday_online_count',
            header: 'Yesterday Online Count',
            cell: (item: any) => item.yesterday_online_count ?? '-'
        },
        {
            id: 'yesterday_online_percent',
            header: 'Yesterday Online %',
            cell: (item: any) => {
                const percent = Number(getPercent(item.yesterday_online_count || 0));
                return (
                    <span style={{ color: getOnlineColor(percent) }}>{percent}%</span>
                );
            }
        },
        {
            id: 'yesterday_offline_count',
            header: 'Yesterday Offline Count',
            cell: (item: any) => item.yesterday_offline_count ?? '-'
        },
        {
            id: 'yesterday_offline_percent',
            header: 'Yesterday Offline %',
            cell: (item: any) => {
                const percent = Number(getPercent(item.yesterday_offline_count || 0));
                return (
                    <span style={{ color: getOfflineColor() }}>{percent}%</span>
                );
            }
        },
    ];

    return (
        <div style={{ padding: '20px', borderRadius: '8px' }}>
            <Table
                renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) =>
                    `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
                }
                columnDefinitions={columnDefinitions}
                enableKeyboardNavigation
                items={paginated}
                loading={loading}
                loadingText="Loading device report"
                empty={
                    <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
                        <SpaceBetween size="m">
                            <b>No device report data</b>
                        </SpaceBetween>
                    </Box>
                }
                filter={
                    <TextFilter
                        filteringPlaceholder="Find by Device Name"
                        filteringText={filterText}
                        onChange={({ detail }) => {
                            setFilterText(detail.filteringText);
                            setCurrentPageIndex(1);
                        }}
                    />
                }
                header={<Header>Device Report</Header>}
                pagination={
                    <Pagination
                        currentPageIndex={currentPageIndex}
                        pagesCount={Math.ceil(filtered.length / itemsPerPage)}
                        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                    />
                }
            />
        </div>
    );
};

export default Device_Report;
