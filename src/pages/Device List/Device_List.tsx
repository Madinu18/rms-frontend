/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-empty-pattern */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Header, Table, Box, SpaceBetween, TextFilter, Pagination } from '@cloudscape-design/components';
import './Device_List.css';
import { useEffect, useState } from 'react';

const Device_List: React.FC<{}> = ({ }) => {
    const [dataDevice, setDataDevice] = useState<any[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [filterText, setFilterText] = useState(''); // State untuk teks filter
    const [loading, setLoading] = useState(true);
    const [sortingColumn, setSortingColumn] = useState<any>(null);
    const [isDescending, setIsDescending] = useState(false);
    const itemsPerPage = 18;

    const id_user = localStorage.getItem('id_user');
    const id_role = localStorage.getItem('id_role');
    const companyGroup = localStorage.getItem('company_group');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch('https://monitoring.qimtronics.com:3001/data', {
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

    // Sorting logic
    const getSortedDevices = () => {
        let devices = [...dataDevice];
        if (sortingColumn && sortingColumn.sortingField) {
            devices.sort((a, b) => {
                const field = sortingColumn.sortingField;
                const aValue = a[field];
                const bValue = b[field];
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return isDescending ? bValue - aValue : aValue - bValue;
                }
                return isDescending
                    ? String(bValue).localeCompare(String(aValue))
                    : String(aValue).localeCompare(String(bValue));
            });
        } else {
            // Default sort by devicename
            devices.sort((a, b) => {
                const nameA = a.devicename?.toLowerCase() || '';
                const nameB = b.devicename?.toLowerCase() || '';
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
        }
        return devices;
    };

    const sortedDevices = getSortedDevices();

    // Filter data berdasarkan teks filter
    const filteredDevices = sortedDevices.filter((device) =>
        device.devicename?.toLowerCase().includes(filterText.toLowerCase())
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
        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "kernel_version",
                header: "Kernel Version",
                sortingField: "kernel_version",
                cell: (item: { kernel_version: any; }) => item.kernel_version || "-"
            }
        ] : []),
        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "pss_version",
                header: "PSS Version",
                sortingField: "pss_version",
                cell: (item: { pss_version: any; }) => item.pss_version || "-"
            }
        ] : []),
        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "program_name",
                header: "Program Name",
                sortingField: "program_name",
                cell: (item: { program_name: any; }) => item.program_name || "-"
            }
        ] : []),
        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "program_version",
                header: "Program Version",
                sortingField: "program_version",
                cell: (item: { program_version: any; }) => item.program_version || "-"
            }
        ] : []),

        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "storage",
                header: "Device Storage",
                sortingField: "used_space",
                cell: (item: { used_space?: number; free_space?: number }) => {
                    const used = Number(item.used_space ?? 0);
                    const free = Number(item.free_space ?? 0);
                    const total = used + free;
                    const percent = total > 0 ? Math.round((used / total) * 100) : 0;
                    if (!total) return '-';
                    return (
                        <div className="storage-bar-container" style={{ position: 'relative' }}>
                            <span className="storage-bar-label" style={{
                                color: '#000',
                                width: '100%',
                                display: 'block',
                                textAlign: 'center',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                lineHeight: '22px',
                                zIndex: 2,
                                pointerEvents: 'none',
                                fontSize: '11px',
                            }}>
                                {`${used.toFixed(1)} GB / ${total.toFixed(1)} GB (${percent}%)`}
                            </span>
                            <div
                                className="storage-bar"
                                style={{ width: `${percent}%`, backgroundColor: percent > 80 ? '#e74c3c' : percent > 60 ? '#f1c40f' : '#2ecc71', position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 1 }}
                            >
                            </div>
                        </div>
                    );
                }
            }
        ] : []),
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
        ...(companyGroup === 'Owner' ? [
            {
                id: "tenant",
                header: "Tenant",
                sortingField: "tenant",
                cell: (item: { tenant: any; }) => item.tenant || "-"
            }
        ] : []),
        ...(companyGroup === 'Owner' || companyGroup === 'Reseller' ? [
            {
                id: "subtenant",
                header: "Subtenant",
                sortingField: "subtenant",
                cell: (item: { subtenant: any; }) => item.subtenant || "-"
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
                sortingColumn={sortingColumn}
                sortingDescending={isDescending}
                onSortingChange={({ detail }) => {
                    setSortingColumn(detail.sortingColumn);
                    setIsDescending(!!detail.isDescending);
                }}
                items={paginatedDevices}
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
                        filteringPlaceholder="Find resources by Device Name"
                        filteringText={filterText}
                        onChange={({ detail }) => {
                            setFilterText(detail.filteringText);
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
                        pagesCount={Math.ceil(filteredDevices.length / itemsPerPage)}
                        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                    />
                }
            />
        </div>
    );
};

export default Device_List;
