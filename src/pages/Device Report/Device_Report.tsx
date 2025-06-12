import React from 'react';
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
    // Tentukan default sorting berdasarkan role
    const userRole = localStorage.getItem('role_name') || 'Guest';
    const defaultSortingColumn = (userRole === 'Dev')
        ? { sortingField: 'live_connection_uptime' }
        : { sortingField: 'yesterday_online_percent' };
    const [sortingColumn, setSortingColumn] = useState<any>(defaultSortingColumn);
    const [isDescending, setIsDescending] = useState(true);
    const itemsPerPage = 18;

    // Pindahkan ke atas sebelum getLivePercent
    const [currentTime, setCurrentTime] = useState(new Date());

    const getPercent = (count: number) => ((count / (1440 - 1)) * 100).toFixed(1);
    const getLivePercent = (count: number) => {
        // gunakan currentTime, bukan new Date()
        const now = currentTime;
        const minutesPassed = now.getHours() * 60 + now.getMinutes();
        // Hindari pembagian dengan nol jika aplikasi dibuka tepat di tengah malam
        const denominator = minutesPassed > 0 ? minutesPassed : 1;
        return ((count / denominator) * 100).toFixed(1);
    };

    const filterItemsByRole = (items: any[], allowedRoles: string[]) => {
        if (allowedRoles.includes(userRole)) {
            return items;
        }
        return [];
    };

    const handleSortingChange = (event: any) => {
        setSortingColumn(event.detail.sortingColumn);
        setIsDescending(event.detail.isDescending ?? false);
    };



    const sortedDevices = React.useMemo(() => {
        let sorted = [...data];
        if (!sortingColumn) return sorted;
        const field = sortingColumn.sortingField;
        const desc = isDescending;
        if (field === 'live_connection_uptime') {
            sorted.sort((a, b) => {
                const valA = Number(getLivePercent(a.today_online_count || 0));
                const valB = Number(getLivePercent(b.today_online_count || 0));
                return desc ? valB - valA : valA - valB;
            });
        }
        else if (field === 'yesterday_online_count') {
            sorted.sort((a, b) => {
                const valA = a.yesterday_online_count ?? 0;
                const valB = b.yesterday_online_count ?? 0;
                return desc ? valB - valA : valA - valB;
            });
        } else if (field === 'yesterday_online_percent') {
            sorted.sort((a, b) => {
                const percentA = Number(getPercent(a.yesterday_online_count || 0));
                const percentB = Number(getPercent(b.yesterday_online_count || 0));
                return desc ? percentB - percentA : percentA - percentB;
            });
        } else if (field === 'yesterday_offline_count') {
            sorted.sort((a, b) => {
                const valA = a.yesterday_offline_count ?? 0;
                const valB = b.yesterday_offline_count ?? 0;
                return desc ? valB - valA : valA - valB;
            });
        } else if (field === 'yesterday_offline_percent') {
            sorted.sort((a, b) => {
                const percentA = Number(getPercent(a.yesterday_offline_count || 0));
                const percentB = Number(getPercent(b.yesterday_offline_count || 0));
                return desc ? percentB - percentA : percentA - percentB;
            });
        } else if (sortingColumn.sortingComparator) {
            sorted.sort((a, b) => {
                const result = sortingColumn.sortingComparator(a, b);
                return desc ? -result : result;
            });
        }
        return sorted;
    }, [data, sortingColumn, isDescending]);

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

    // Update currentTime setiap menit
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60 * 1000); // setiap 1 menit
        return () => clearInterval(interval);
    }, []);

    const getOnlineColor = (percent: number) => percent < 50 ? percent < 25 ? 'red' : 'orange' : 'green';
    const getOfflineColor = () => 'red';

    const columnDefinitions = [
        {
            id: 'device_name',
            header: 'Device Name',
            cell: (item: any) => item.device_name || '-',
        },
        {
            id: 'serialnumber',
            header: 'Serial Number',
            cell: (item: any) => item.serialnumber || '-',
        },
        ...filterItemsByRole([
            {
                id: 'live_connection_uptime',
                header: 'Live Connection Uptime (%)',
                cell: (item: any) => {
                    const percent = Number(getLivePercent(item.today_online_count || 0));
                    return (
                        <span style={{ color: getOnlineColor(percent) }}>{percent}%</span>
                    );
                },
                sortingField: 'live_connection_uptime',
            },
        ], ['Dev']),
        {
            id: 'yesterday_online_count',
            header: 'Yesterday Online Count',
            cell: (item: any) => item.yesterday_online_count ?? '-',
            sortingField: 'yesterday_online_count',
        },
        {
            id: 'yesterday_online_percent',
            header: 'Yesterday Online %',
            cell: (item: any) => {
                const percent = Number(getPercent(item.yesterday_online_count || 0));
                return (
                    <span style={{ color: getOnlineColor(percent) }}>{percent}%</span>
                );
            },
            sortingField: 'yesterday_online_percent',
        },
        {
            id: 'yesterday_offline_count',
            header: 'Yesterday Offline Count',
            cell: (item: any) => item.yesterday_offline_count ?? '-',
            sortingField: 'yesterday_offline_count',
        },
        {
            id: 'yesterday_offline_percent',
            header: 'Yesterday Offline %',
            cell: (item: any) => {
                const percent = Number(getPercent(item.yesterday_offline_count || 0));
                return (
                    <span style={{ color: getOfflineColor() }}>{percent}%</span>
                );
            },
            sortingField: 'yesterday_offline_percent',
        },
    ];

    // Sorting logic
    let sorted = [...sortedDevices];
    if (sortingColumn) {
        if (sortingColumn.sortingField) {
            sorted.sort((a, b) => {
                const valA = a[sortingColumn.sortingField] ?? 0;
                const valB = b[sortingColumn.sortingField] ?? 0;
                return isDescending ? valB - valA : valA - valB;
            });
        } else if (sortingColumn.sortingComparator) {
            sorted.sort((a, b) => {
                const result = sortingColumn.sortingComparator(a, b);
                return isDescending ? -result : result;
            });
        }
    }

    const filtered = sorted.filter((device) =>
        device.device_name?.toLowerCase().includes(filterText.toLowerCase())
    );
    const paginated = filtered.slice(
        (currentPageIndex - 1) * itemsPerPage,
        currentPageIndex * itemsPerPage
    );

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
                sortingColumn={sortingColumn}
                sortingDescending={isDescending}
                onSortingChange={handleSortingChange}
            // onSortingChange={({ detail }) => {
            //     setSortingColumn(detail.sortingColumn);
            //     setIsDescending(detail.isDescending ?? false);
            // }}
            />
        </div>
    );
};

export default Device_Report;
