import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import Spinner from "@cloudscape-design/components/spinner";
import Button from "@cloudscape-design/components/button";
import Cards from "@cloudscape-design/components/cards";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";

import terminalImage from '../../assets/terminal.png';
import internetImage from '../../assets/internet.png';
import folderImage from '../../assets/folder.png';
import backArrowImage from '../../assets/back-arrow.png';
import trashIcon from '../../assets/trash.png';
import changeNameIcon from '../../assets/edit.png';
import downloadIcon from '../../assets/download.png';

import Modal from "@cloudscape-design/components/modal";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import { CircularProgress } from "@mui/material";
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import './CustomModal.css';

const TerminalIcon = () => <img src={terminalImage} alt="terminal" style={{ width: 32, height: 32 }} />;
const BrowserIcon = () => <img src={internetImage} alt="browser" style={{ width: 32, height: 32 }} />;
const FolderIcon = () => <img src={folderImage} alt="sftp" style={{ width: 32, height: 32 }} />;
const PlayIcon = () => <span role="img" aria-label="play">▶️</span>;

interface Device {
    id: number;
    serialnumber: string;
    device_name: string;
    ip: string;
    port: number;
    service: string;
    status: number;
}

const NodeDevice: React.FC = () => {
    const idUser = localStorage.getItem('id_user') || '';
    const { serialnumber: serialnumberParam } = useParams<{ serialnumber: string }>();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(false);
    const [serialnumber, setSerialnumber] = useState(serialnumberParam || "");
    const [error, setError] = useState<string | null>(null);

    const fetchDevices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://monitoring.qimtronics.com:3001/data/node-device", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id_user: idUser,
                    serialnumber: serialnumber,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setDevices(data.data || []);
            } else {
                setError(data.error || "Failed to fetch data");
            }
        } catch (err) {
            setError("Network error");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (serialnumberParam) {
            setSerialnumber(serialnumberParam);
        }
    }, [serialnumberParam]);

    useEffect(() => {
        if (serialnumber) {
            fetchDevices();
        }
    }, [serialnumber]);

    const getServiceIcon = (service: string) => {
        if (service.toLowerCase() === "ssh") return <TerminalIcon />;
        if (service.toLowerCase() === "http") return <BrowserIcon />;
        if (service.toLowerCase() === "sftp") return <FolderIcon />;
        return null;
    };

    const groupedDevices = devices.reduce<Record<string, Device[]>>((acc, device) => {
        const key = device.device_name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(device);
        if (device.service.toLowerCase() === "ssh") {
            acc[key].push({
                ...device,
                service: "SFTP",
                port: 22,
            });
        }
        return acc;
    }, {});

    const [showSshDurationModal, setShowSshDurationModal] = useState(false);
    const [sshDuration, setSshDuration] = useState('60');
    const [tempSshParams, setTempSshParams] = useState<any>(null);

    const [showHttpDurationModal, setShowHttpDurationModal] = useState(false);
    const [httpDuration, setHttpDuration] = useState('60');
    const [tempHttpParams, setTempHttpParams] = useState<any>(null);

    const [showSftpDurationModal, setShowSftpDurationModal] = useState(false);
    const [sftpDuration, setSftpDuration] = useState('60');
    const [tempSftpParams, setTempSftpParams] = useState<any>(null);

    const [showSftpLoginModal, setShowSftpLoginModal] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [sftpLoading, setSftpLoading] = useState(false);

    const [showTerminal, setShowTerminal] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);
    const [showSftpModal, setShowSftpModal] = useState(false);

    const [currentDevice, setCurrentDevice] = useState<any>(null);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [currentPort, setCurrentPort] = useState<string | null>(null);
    const [currentSftpTimer, setCurrentSftpTimer] = useState<string | null>(null);

    const [progressRemoteModal, setProgressRemoteModal] = useState(false);
    const [progressRemoteMessage, setProgressRemoteMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);

    // --- HANDLER UNTUK MODAL DURASI ---
    const handleSshDurationClick = (device: Device) => {
        setTempSshParams(device);
        setShowSshDurationModal(true);
    };
    const handleHttpsDurationClick = (device: Device) => {
        setTempHttpParams(device);
        setShowHttpDurationModal(true);
    };
    const handleSftpDurationClick = (device: Device) => {
        setTempSftpParams(device);
        setShowSftpDurationModal(true);
    };

    // --- HANDLER UNTUK ACTION ---
    const handleImageClick = async (device: Device, timer: string) => {
        // SSH
        setCurrentDevice(device);
        setProgressRemoteMessage('Preparing...');
        setProgressRemoteModal(true);

        const id_req = Math.random().toString(36).substr(2, 10);

        try {
            const resp = await fetch('https://monitoring.qimtronics.com:3001/enable-device/ssh/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id_req,
                    name: device.device_name,
                    role: "",
                    company: "",
                    datetime: new Date().toISOString(),
                    devicename: device.device_name,
                    serialnumber: device.serialnumber,
                    timer,
                    ip_node: device.ip,
                    port_node: device.port
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.port) {
                setErrorMessage(data.error || "Failed to enable SSH connection");
                setShowErrorModal(true);
                setProgressRemoteModal(false);
                return;
            }
            setCurrentPort(data.port);
            setProgressRemoteModal(false);
            setShowTerminal(true);
        } catch (err) {
            setErrorMessage("Failed to enable SSH connection");
            setShowErrorModal(true);
            setProgressRemoteModal(false);
        }
    };

    const handleTerminalClose = (datetime: string | null, devicename: string | null, serialnumber: string | null, port: string | null) => {
        if (datetime && devicename && serialnumber && port) {
            console.log('disable device:', serialnumber);
            console.log(JSON.stringify({ datetime, devicename, serialnumber, port }))

            fetch('https://monitoring.qimtronics.com:3001/enable-device/ssh/0', {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ datetime, devicename, serialnumber, port }),
            })
                .then(async response => { response.json() })
                .then(data => {
                    console.log('success:', data);
                    setShowTerminal(false);
                })
                .catch((error) => {
                    console.error('error:', error);
                });
        } else {
            console.log('device id is null');
        }
        // setshowterminal(false);
    }

    const handleHttpsClick = async (device: Device, timer: string) => {
        // HTTP
        setCurrentDevice(device);
        setProgressRemoteMessage('Preparing...');
        setProgressRemoteModal(true);

        const id_req = Math.random().toString(36).substr(2, 10);

        try {
            const resp = await fetch('https://monitoring.qimtronics.com:3001/enable-device/http/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id_req,
                    name: device.device_name,
                    role: "",
                    company: "",
                    datetime: new Date().toISOString(),
                    devicename: device.device_name,
                    serialnumber: device.serialnumber,
                    timer,
                    ip_node: device.ip,
                    port_node: device.port
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.port) {
                setErrorMessage(data.error || "Failed to enable HTTP connection");
                setShowErrorModal(true);
                setProgressRemoteModal(false);
                return;
            }
            setCurrentPort(data.port);
            setCurrentUrl(`https://monitoring.qimtronics.com:${data.port}`);
            setProgressRemoteModal(false);
            setShowBrowser(true);
        } catch (err) {
            setErrorMessage("Failed to enable HTTP connection");
            setShowErrorModal(true);
            setProgressRemoteModal(false);
        }
    };

    const handleHttpClose = (datetime: string | null, devicename: string | null, serialnumber: string | null, port: string | null) => {
        if (serialnumber) {
            setShowBrowser(false)
            console.log('Disable device:', serialnumber);

            fetch('https://monitoring.qimtronics.com:3001/enable-device/http/0', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ datetime, devicename, serialnumber, port }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            console.log('Device ID is null');
        }
    }

    const handleSftpClick = (device: Device, timer: string) => {
        setCurrentDevice(device);
        setCurrentSftpTimer(timer);
        setShowSftpLoginModal(true);
    };

    const handleSftpSubmit = async () => {
        // SFTP
        setSftpLoading(true);
        setProgressRemoteMessage('Preparing...');
        setProgressRemoteModal(true);
        const device = currentDevice;
        const timer = currentSftpTimer || '60';
        const id_req = Math.random().toString(36).substr(2, 10);

        try {
            const resp = await fetch('https://monitoring.qimtronics.com:3001/enable-device/sftp/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id_req,
                    name: device.device_name,
                    role: "",
                    company: "",
                    datetime: new Date().toISOString(),
                    devicename: device.device_name,
                    serialnumber: device.serialnumber,
                    timer,
                    ip_node: device.ip,
                    port_node: device.port
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.port) {
                setErrorMessage(data.error || "Failed to enable SFTP connection");
                setShowErrorModal(true);
                setProgressRemoteModal(false);
                setSftpLoading(false);
                return;
            }
            setCurrentPort(data.port);
            setProgressRemoteModal(false);
            setSftpLoading(false);
            setShowDirectory('/home/user');
            await new Promise(resolve => setTimeout(resolve, 5000));
            setShowSftpLoginModal(false);
            const JSON_MESSAGE = JSON.stringify({
                username: loginData.username,
                password: loginData.password,
                port: data.port,
                directory: '/home/user'
            });

            await fetchSftpData(JSON_MESSAGE);
            setShowSftpModal(true);
        } catch (err) {
            setErrorMessage("Failed to enable SFTP connection");
            setShowErrorModal(true);
            setProgressRemoteModal(false);
            setSftpLoading(false);
        }
    };

    const handleSftpClose = async (datetime: string | null, devicename: string | null, serialnumber: string | null, port: string | null) => {
        if (datetime && devicename && serialnumber && port) {
            console.log('disable device:', serialnumber);

            fetch('https://monitoring.qimtronics.com:3001/enable-device/sftp/0', {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ datetime, devicename, serialnumber, port }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('success:', data);
                    setShowSftpModal(false)
                    setDataListFolder([]);
                    setLoginData({ username: '', password: '' });
                })
                .catch((error) => {
                    console.error('error:', error);
                });
        } else {
            console.log('device id is null');
        }
        // setshowterminal(false);
    }

    // --- Terminal State ---
    const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null);
    const terminalSocketRef = React.useRef<WebSocket | null>(null);

    // --- SFTP State ---
    // const [showErrorModal, setShowErrorModal] = useState(false);
    // const [errorMessage, setErrorMessage] = useState('');
    const [errorId, setErrorId] = useState('');

    const [isLoadingNewFolder, setLoadingNewFolder] = useState(false);
    const [isLoadingDeleteFolder, setLoadingDeleteFolder] = useState(false);
    const [isLoadingDeleteFile, setLoadingDeleteFile] = useState(false);
    const [isLoadingChangeName, setLoadingChangeName] = useState(false);
    const [isLoadingUploadFile, setLoadingUploadFile] = useState(false);

    const [dataListFolder, setDataListFolder] = useState<any[]>([]);

    const fetchSftpData = async (JSON_MESSAGE: string) => {
        setLoadingFolder(true);
        fetch('https://monitoring.qimtronics.com:3001/sftp/list-dir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON_MESSAGE,
        })
            .then(async response => {
                const data = await response.json()

                if (!response.ok) {
                    // Handle HTTP error responses
                    setErrorId(data.id || '');
                    setErrorMessage(data.error || `Failed to fetch folder data`);
                    setShowErrorModal(true);
                    setLoadingFolder(false);
                    return;
                }

                console.log('Success:', data);
                // console.log(data.data);
                if (Array.isArray(data.data)) {
                    setDataListFolder(data.data);
                    setLoadingFolder(false);
                } else {
                    console.error('Error: data is not an array');
                    setErrorId(data.id || '');
                    setErrorMessage(data.error || `Unexpected error happend while fetching folder data`);
                    setShowErrorModal(true);
                    setLoadingFolder(false);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                console.error(errorId);
            });
    }

    const [showDirectory, setShowDirectory] = useState('/home/user');
    const [clickedFolder, setClickedFolder] = useState<string | null>(null);
    const [loadingFolder, setLoadingFolder] = useState(false); // Add loading state for folder clicks
    const [showNewFolderModal, setShowNewFolderModal] = useState(false); // Add state for new folder modal
    const [newFolderName, setNewFolderName] = useState(''); // Add state for new folder name
    const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false); // Add state for delete folder modal
    const [deleteFolderName, setDeleteFolderName] = useState(''); // Add state for delete folder name
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            setSelectedFile(target.files[0]);
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) return;

        const fileExists = dataListFolder
            .some(item => item.filename.toLowerCase() === selectedFile.name.toLowerCase());

        if (fileExists) {
            setErrorId('');
            setErrorMessage(`File "${selectedFile.name}" already exists`);
            setShowErrorModal(true);
            return;
        }

        setLoadingUploadFile(true);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('username', loginData.username);
        formData.append('password', loginData.password);
        if (currentPort) {
            formData.append('port', currentPort);
        }
        formData.append('directory', showDirectory);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://monitoring.qimtronics.com:3001/sftp/upload', true);

            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(percentCompleted);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    console.log('File uploaded successfully');
                    setShowUploadModal(false);
                    setLoadingUploadFile(false);
                    setSelectedFile(null);
                    setUploadProgress(0);
                    await fetchSftpData(JSON.stringify({
                        username: loginData.username,
                        password: loginData.password,
                        port: currentPort,
                        directory: showDirectory
                    }));
                } else {
                    setShowUploadModal(false);
                    setLoadingUploadFile(false);
                    console.error('Failed to upload file');
                    setErrorId('');
                    setErrorMessage(`Failed to upload file`);
                    setShowErrorModal(true);
                }
            };

            xhr.onerror = () => {
                setShowUploadModal(false);
                setLoadingUploadFile(false);
                console.error('Error uploading file');
                setErrorId('');
                setErrorMessage(`Failed to upload file`);
                setShowErrorModal(true);
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading file:', error);
            setShowUploadModal(false);
            setLoadingUploadFile(false);
            setErrorId('');
            setErrorMessage(`Failed to upload file`);
            setShowErrorModal(true);
        }
    };

    const handleFolderClick = async (directory: string) => {
        if (loadingFolder) return; // Prevent multiple clicks while loading
        // setLoadingFolder(true); // Set loading state to true
        console.log('Directory path:', directory);
        setClickedFolder(directory);
        const currentDirectory = `${showDirectory}/${directory}`;
        console.log('Current directory:', currentDirectory);


        const JSON_MESSAGE = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: currentDirectory
        });
        console.log('Submitting SFTP data:', JSON_MESSAGE);

        await fetchSftpData(JSON_MESSAGE);
        setShowDirectory(currentDirectory);
        // setLoadingFolder(false); // Set loading state to false after data is loaded
    };

    const handleFolderBack = async () => {
        if (loadingFolder) return; // Prevent multiple clicks while loading
        // setLoadingFolder(true); // Set loading state to true
        const currentDirectory = showDirectory.split('/').slice(0, -1).join('/') || '/';
        console.log('Current directory:', currentDirectory);

        const JSON_MESSAGE = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: currentDirectory
        });
        console.log('Submitting SFTP data:', JSON_MESSAGE);

        await fetchSftpData(JSON_MESSAGE);
        console.log("test");
        setShowDirectory(currentDirectory);
        // setLoadingFolder(false); // Set loading state to false after data is loaded
    };

    const handleCancelDownload = () => {
        if (downloadController) {
            downloadController.abort();
        }
        setIsDownloading(false);
        setDownloadProgress(0);
    };

    const [downloadController, setDownloadController] = useState<AbortController | null>(null);

    const downloadSftpData = async (JSON_MESSAGE: string, fileName: string) => {
        if (isDownloading) return;

        setIsDownloading(true);
        setDownloadProgress(0);
        const controller = new AbortController();
        setDownloadController(controller);

        try {
            const response = await fetch('https://monitoring.qimtronics.com:3001/sftp/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON_MESSAGE,
                signal: controller.signal,
            });

            if (response.ok) {
                const reader = response.body?.getReader();
                const contentLength = +response.headers.get('Content-Length')!;
                let receivedLength = 0;
                const chunks = [];

                while (true) {
                    const { done, value } = await reader!.read();
                    if (done) break;
                    chunks.push(value);
                    receivedLength += value.length;
                    setDownloadProgress(Math.round((receivedLength * 100) / contentLength));
                }

                const blob = new Blob(chunks);
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();
            } else {
                console.error('Failed to download file');
                const data = await response.json();
                setErrorId(data.id || '');
                setErrorMessage(data.error || 'Unknown error occurred while downloading file');
                setShowErrorModal(true);
            }
        } catch (error) {
            if (controller.signal.aborted) {
                console.log('Download canceled');
            } else {
                console.error('Error downloading file:', error);
                setErrorId('');
                setErrorMessage('An unexpected error occurred while downloading file');
                setShowErrorModal(true);
            }
        } finally {
            setIsDownloading(false);
            setDownloadController(null);
        }
    };

    const handleNewFolderSubmit = async () => {
        if (!newFolderName.trim()) {
            setErrorId('');
            setErrorMessage('Folder name cannot be empty');
            setShowErrorModal(true);
            return;
        }

        const folderExists = dataListFolder
            .filter(isDirectory)
            .some(item => item.filename.toLowerCase() === newFolderName.toLowerCase());

        if (folderExists) {
            setErrorId('');
            setErrorMessage(`Folder "${newFolderName}" already exists`);
            setShowErrorModal(true);
            return;
        }

        console.log('New folder name:', newFolderName);
        setLoadingNewFolder(true);

        const JSON_MESSAGE = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: showDirectory
        });

        try {
            const response = await fetch('https://monitoring.qimtronics.com:3001/sftp/create-dir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    username: loginData.username,
                    password: loginData.password,
                    port: currentPort,
                    directory: showDirectory,
                    newFolderName: newFolderName
                }),
            });
            if (response.ok) {
                await fetchSftpData(JSON_MESSAGE);
                setNewFolderName('');
                setLoadingNewFolder(false);
                setShowNewFolderModal(false);
            } else {
                setLoadingNewFolder(false);
                setShowNewFolderModal(false);
                const data = await response.json();
                console.error('Failed create file');
                setErrorId(data.id || '');
                setErrorMessage(data.error || `Failed to create file`);
                setShowErrorModal(true);
            }
        } catch (error) {
            setLoadingNewFolder(false);
            setShowNewFolderModal(false);
            console.log('Error:', error);
            setErrorId('');
            setErrorMessage(`Failed to create file`);
            setShowErrorModal(true);
        }
    };

    const handleDeleteForderSubmit = async () => {
        console.log('Delete folder name:', deleteFolderName);
        setLoadingDeleteFolder(true);

        const deleteDirectory = `${showDirectory}/${deleteFolderName}`;
        console.log('Current directory:', deleteDirectory);

        const JSON_MESSAGE_FOR_DELETE = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: deleteDirectory
        });

        const JSON_MESSAGE_FOR_FETCH = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: showDirectory
        });

        try {
            const response = await fetch('https://monitoring.qimtronics.com:3001/sftp/delete-dir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON_MESSAGE_FOR_DELETE,
            });
            if (response.ok) {
                await fetchSftpData(JSON_MESSAGE_FOR_FETCH);
                setLoadingDeleteFolder(false);
                setShowDeleteFolderModal(false);
            } else {
                setLoadingDeleteFolder(false);
                setShowDeleteFolderModal(false);
                const data = await response.json();
                console.error('Failed delete folder');
                setErrorId(data.id || 'HTTP_ERROR');
                setErrorMessage(data.error || `Failed to delete folder`);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const [showDeleteFileModal, setShowDeleteFileModal] = useState(false); // Add state for delete file modal
    const [deleteFileName, setDeleteFileName] = useState(''); // Add state for delete file name

    const handleDeleteFileSubmit = async () => {
        console.log('Delete file name:', deleteFileName);
        setLoadingDeleteFile(true);

        const JSON_MESSAGE = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: showDirectory,
            fileName: deleteFileName,
        });

        try {
            const response = await fetch('https://monitoring.qimtronics.com:3001/sftp/delete-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON_MESSAGE,
            });
            if (response.ok) {
                await fetchSftpData(JSON_MESSAGE);
                setLoadingDeleteFile(false);
                setShowDeleteFileModal(false);
            } else {
                setLoadingDeleteFile(false);
                setShowDeleteFileModal(false);
                const data = await response.json();
                console.error('Failed to delete file');
                setErrorId(data.id || '');
                setErrorMessage(data.error || `Failed to delete file`);
                setShowErrorModal(true);
            }
        } catch (error) {
            setLoadingDeleteFile(false);
            setShowDeleteFileModal(false);
            console.log('Error:', error);
            setErrorId('');
            setErrorMessage(`Failed to delete file`);
            setShowErrorModal(true);
        }
    };

    const handleChangeFileName = async (oldFileName: string, newFileName: string) => {
        if (!newFileName.trim()) {
            setErrorId('');
            setErrorMessage('File name cannot be empty');
            setShowErrorModal(true);
            return;
        }

        const fileExists = dataListFolder
            .some(item => item.filename.toLowerCase() === newFileName.toLowerCase() &&
                item.filename.toLowerCase() !== oldFileName.toLowerCase());

        if (fileExists) {
            setErrorId('');
            setErrorMessage(`File "${newFileName}" already exists`);
            setShowErrorModal(true);
            return;
        }

        setLoadingChangeName(true);
        const JSON_MESSAGE = JSON.stringify({
            username: loginData.username,
            password: loginData.password,
            port: currentPort,
            directory: showDirectory,
            oldFileName: oldFileName,
            newFileName: newFileName
        });

        try {
            const response = await fetch('https://monitoring.qimtronics.com:3001/sftp/rename-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON_MESSAGE,
            });
            if (response.ok) {
                await fetchSftpData(JSON_MESSAGE);
                console.log(`File renamed from ${oldFileName} to ${newFileName} successfully`);
                setLoadingChangeName(false);
            } else {
                setLoadingChangeName(false);
                setShowRenameFileModal(false);
                const data = await response.json();
                console.error('Failed to rename file');
                setErrorId(data.id || '');
                setErrorMessage(data.error || `Failed to rename file`);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const [showRenameFileModal, setShowRenameFileModal] = useState(false); // Add state for rename file modal
    const [renameFileName, setRenameFileName] = useState(''); // Add state for rename file name
    const [oldFileName, setOldFileName] = useState(''); // Add state for old file name

    const handleRenameFileSubmit = async () => {
        await handleChangeFileName(oldFileName, renameFileName);
        setShowRenameFileModal(false);
    };

    const handleRenameFileClick = (fileName: string) => {
        setOldFileName(fileName);
        setRenameFileName(fileName);
        setShowRenameFileModal(true);
    };


    // --- SFTP Helpers (copied from Dashboard) ---
    const isDirectory = (item: { longname: string; }) => item.longname.startsWith('d');
    const getFilename = (item: { filename: any; }) => item.filename;
    const getOwnerGroup = (item: any) => `${item.attrs.uid}/${item.attrs.gid}`;
    const getPermission = (item: any) => item.longname.split(' ')[0];
    const getSize = (item: any) => {
        const bytes = item.attrs.size;
        if (bytes < 1024) return `${bytes} Bytes`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(2)} KB`;
        const mb = kb / 1024;
        if (mb < 1024) return `${mb.toFixed(2)} MB`;
        const gb = mb / 1024;
        return `${gb.toFixed(2)} GB`;
    };
    const getLastModified = (item: any) => new Date(item.attrs.mtime * 1000).toLocaleString();

    // --- Terminal UI Logic (xterm) ---
    useEffect(() => {
        if (showTerminal) {
            const terminalElement = document.getElementById('terminal');
            if (terminalElement) {
                let username: string | undefined;
                let password: string | undefined;
                let text = '';
                const terminal = new Terminal({
                    cursorBlink: true,
                    rows: 25,
                    cols: 80,
                });
                terminal.open(terminalElement);
                terminal.focus();
                terminal.write(`Connecting to ${currentDevice?.device_name}...\r\n`);
                terminal.write('Username : ');

                terminalElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    navigator.clipboard.readText().then(text => {
                        terminal.paste(text);
                    });
                });

                terminal.onData(data => {
                    if (username === undefined) {
                        if (data === '\r') {
                            username = text;
                            text = '';
                            terminal.write('\r\nPassword : ');
                        } else if (data === '\u007F') {
                            text = text.slice(0, -1);
                            terminal.write('\b \b');
                        } else {
                            text += data;
                            terminal.write(data);
                        }
                    } else if (password === undefined) {
                        if (data === '\r') {
                            password = text;
                            text = '';
                            terminal.write('\r\n');
                            terminalSocketRef.current = new WebSocket(`ws://monitoring.qimtronics.com:3001?port=${currentPort}?username=${username}?password=${password}`);
                            terminalSocketRef.current.onmessage = (event) => {
                                if (event.data === 'SSH Connection failed: Incorrect username or password') {
                                    terminal.clear();
                                    terminal.write('SSH Connection failed: Incorrect username or password\r\n');
                                    username = undefined;
                                    password = undefined;
                                    terminal.write('Username : ');
                                }
                                else {
                                    terminal.write(event.data);
                                }
                            };
                        } else if (data === '\u007F') {
                            text = text.slice(0, -1);
                            terminal.write('\b \b');
                        } else {
                            text += data;
                            terminal.write(data);
                        }
                    } else {
                        terminalSocketRef.current?.send(data);
                    }
                });

                setTerminalInstance(terminal);
            }
        } else {
            if (terminalInstance) {
                terminalInstance.dispose();
                setTerminalInstance(null);
            }
            if (terminalSocketRef.current) {
                terminalSocketRef.current.close();
                terminalSocketRef.current = null;
            }
        }
    }, [showTerminal, currentDevice, currentPort]);

    // --- SFTP Logic (fetch, upload, download, etc) ---
    // (Copy fetchSftpData, handleFolderClick, handleFolderBack, handleUploadSubmit, downloadSftpData, handleNewFolderSubmit, handleDeleteForderSubmit, handleDeleteFileSubmit, handleChangeFileName, handleRenameFileSubmit, handleRenameFileClick from Dashboard, but use currentDevice, loginData, currentPort, showDirectory, etc.)

    // ...copy SFTP logic from Dashboard, adapting variable names as needed...

    // --- UI ---
    return (
        <Box padding="l">
            <BreadcrumbGroup
                items={[
                    { text: "Remote Device", href: "/", element: <Link to="/">Remote Device</Link> },
                    { text: serialnumber, href: `/device/${serialnumber}`, element: <Link to={`/device/${serialnumber}`}>{serialnumber}</Link> },
                    { text: "Node Device", href: "#" }
                ]}
                onFollow={event => {
                    if (event.detail.href) {
                        event.preventDefault();
                    }
                }}
            />
            <div style={{ height: 12 }} />
            <Header variant="h1">Node Device List</Header>
            <div style={{ height: 24 }} />
            {loading ? (
                <Spinner />
            ) : error ? (
                <Box color="text-status-error">{error}</Box>
            ) : (
                <div>
                    {Object.entries(groupedDevices).map(([deviceName, deviceCards]) => (
                        <Box key={deviceName} margin={{ bottom: "l" }}>
                            <Header variant="h2">{deviceName}</Header>
                            <div style={{ height: 12 }} />
                            <Cards
                                cardDefinition={{
                                    header: item => (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 32 }}>
                                                    {getServiceIcon(item.service)}
                                                </span>
                                                <span style={{ fontWeight: 600, fontSize: 18 }}>{item.service}</span>
                                            </div>
                                            <Button
                                                variant="icon"
                                                iconName="play"
                                                ariaLabel="Run"
                                                onClick={() => {
                                                    if (item.service.toLowerCase() === "ssh") handleSshDurationClick(item);
                                                    else if (item.service.toLowerCase() === "http") handleHttpsDurationClick(item);
                                                    else if (item.service.toLowerCase() === "sftp") handleSftpDurationClick(item);
                                                }}
                                            >
                                                <PlayIcon />
                                            </Button>
                                        </div>
                                    ),
                                    sections: [
                                        {
                                            id: "ip",
                                            content: item => (
                                                <div style={{ marginBottom: 4 }}>
                                                    <b>IP:</b> {item.ip}
                                                </div>
                                            )
                                        },
                                        {
                                            id: "port",
                                            content: item => (
                                                <div style={{ marginBottom: 4 }}>
                                                    <b>Port:</b> {item.port}
                                                </div>
                                            )
                                        },
                                        {
                                            id: "service-type",
                                            content: item => (
                                                <div style={{ marginBottom: 4 }}>
                                                    <b>Service:</b> {item.service}
                                                </div>
                                            )
                                        },
                                    ]
                                }}
                                items={deviceCards}
                                loading={loading}
                                empty={<Box>No data</Box>}
                                cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 2 }, { minWidth: 600, cards: 3 }, { minWidth: 900, cards: 4 }]}
                            />
                        </Box>
                    ))}
                </div>
            )}

            {/* SSH Duration Modal */}
            <Modal
                visible={showSshDurationModal}
                onDismiss={() => setShowSshDurationModal(false)}
                header="SSH Duration"
                footer={
                    <Box float="right">
                        <Button variant="normal" onClick={() => setShowSshDurationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (tempSshParams) {
                                    handleImageClick(tempSshParams, (parseInt(sshDuration) * 60).toString());
                                }
                                setShowSshDurationModal(false);
                            }}
                        >
                            Connect
                        </Button>
                    </Box>
                }
            >
                <FormField label="SSH Duration (minutes)">
                    <Input
                        type="number"
                        value={sshDuration}
                        onChange={e => setSshDuration(e.detail.value)}
                        placeholder="Enter duration in minutes"
                    />
                </FormField>
            </Modal>

            {/* HTTP Duration Modal */}
            <Modal
                visible={showHttpDurationModal}
                onDismiss={() => setShowHttpDurationModal(false)}
                header="HTTP Duration"
                footer={
                    <Box float="right">
                        <Button variant="normal" onClick={() => setShowHttpDurationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (tempHttpParams) {
                                    handleHttpsClick(tempHttpParams, (parseInt(httpDuration) * 60).toString());
                                }
                                setShowHttpDurationModal(false);
                            }}
                        >
                            Connect
                        </Button>
                    </Box>
                }
            >
                <FormField label="HTTP Duration (minutes)">
                    <Input
                        type="number"
                        value={httpDuration}
                        onChange={e => setHttpDuration(e.detail.value)}
                        placeholder="Enter duration in minutes"
                    />
                </FormField>
            </Modal>

            {/* SFTP Duration Modal */}
            <Modal
                visible={showSftpDurationModal}
                onDismiss={() => setShowSftpDurationModal(false)}
                header="SFTP Duration"
                footer={
                    <Box float="right">
                        <Button variant="normal" onClick={() => setShowSftpDurationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (tempSftpParams) {
                                    handleSftpClick(tempSftpParams, (parseInt(sftpDuration) * 60).toString());
                                }
                                setShowSftpDurationModal(false);
                            }}
                        >
                            Connect
                        </Button>
                    </Box>
                }
            >
                <FormField label="SFTP Duration (minutes)">
                    <Input
                        type="number"
                        value={sftpDuration}
                        onChange={e => setSftpDuration(e.detail.value)}
                        placeholder="Enter duration in minutes"
                    />
                </FormField>
            </Modal>

            {/* SFTP Login Modal */}
            <Modal
                visible={showSftpLoginModal}
                onDismiss={() => setShowSftpLoginModal(false)}
                header="SFTP Login"
                footer={
                    <Box float="right">
                        {sftpLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <>
                                <Button
                                    variant="normal"
                                    onClick={() => setShowSftpLoginModal(false)}
                                    disabled={sftpLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSftpSubmit}
                                    disabled={sftpLoading}
                                >
                                    Ok
                                </Button>
                            </>
                        )}
                    </Box>
                }
            >
                <FormField label="Username">
                    <Input
                        value={loginData.username}
                        onChange={e => setLoginData(prev => ({ ...prev, username: e.detail.value }))
                        }
                        placeholder="Enter username"
                    />
                </FormField>
                <FormField label="Password">
                    <Input
                        type="password"
                        value={loginData.password}
                        onChange={e => setLoginData(prev => ({ ...prev, password: e.detail.value }))
                        }
                        placeholder="Enter password"
                    />
                </FormField>
            </Modal>

            {/* Terminal Modal */}
            {showTerminal && (
                <div className="custom-modal">
                    <div className="custom-modal-content-terminal">
                        <div className="custom-modal-header">
                            <span className="custom-modal-title">Terminal {currentDevice.device_name}</span>
                            <span className="custom-icon-close" onClick={() => handleTerminalClose(new Date().toISOString(), currentDevice.device_name, currentDevice.serialnumber, currentPort)}>&times;</span>
                        </div>
                        <div id="terminal-container" style={{ height: 'calc(100% - 60px)' }}>
                            <div id="terminal"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Browser Modal */}
            {showBrowser && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <div className="custom-modal-header">
                            <span className="custom-modal-title">Website {currentDevice.device_name}</span>
                            <span className="custom-icon-close" onClick={() => handleHttpClose(new Date().toISOString(), currentDevice.device_name, currentDevice.serialnumber, currentPort)}>&times;</span>
                        </div>
                        <iframe src={currentUrl || ''} style={{ height: 'calc(100% - 60px)', width: '100%' }}></iframe>
                    </div>
                </div>
            )}

            {/* SFTP Modal */}
            {showSftpModal && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <div className="custom-modal-header">
                            <span className="custom-modal-title">SFTP</span>
                            <span className="custom-icon-close" onClick={() => handleSftpClose(new Date().toISOString(), currentDevice.device_name, currentDevice.serialnumber, currentPort)}>&times;</span>
                        </div>
                        <div className="custom-modal-body" style={{
                            display: 'flex',
                            gap: '20px',
                            overflow: 'hidden', // Ensure content does not overflow the modal
                            height: 'calc(100% - 60px)', // Adjust height to fit the modal
                            fontSize: '12px' // Reduce text size
                        }}>

                            <div style={{
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '10px',
                                flex: '0 0 20%',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '95%' // Adjust height to fit the modal
                            }}>
                                <h4 style={{ marginTop: '0' }}>Folders</h4>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px',
                                    padding: '5px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}>
                                    <div style={{
                                        flex: '1',
                                        overflow: 'hidden',
                                        maxWidth: 'calc(100% - 30px)' // Adjust width to ensure button is visible
                                    }}>
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            direction: 'rtl',
                                            textAlign: 'left',
                                            display: 'block',
                                            width: '200px'
                                        }}>{showDirectory}</span>
                                    </div>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }} onClick={() => { handleFolderBack() }} disabled={loadingFolder}>
                                        {loadingFolder ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <img src={backArrowImage} alt="Back" style={{ width: '20px', height: '20px' }} />
                                        )}
                                    </button>
                                </div>
                                <button style={{
                                    background: '#0073e6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    marginBottom: '10px'
                                }} onClick={() => setShowNewFolderModal(true)} disabled={loadingFolder}>
                                    New Folder
                                </button>
                                <button style={{
                                    background: '#0073e6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }} onClick={() => setShowUploadModal(true)} disabled={loadingFolder}>
                                    Upload Files
                                </button>
                                <div style={{
                                    overflowY: 'auto',
                                    flex: '1'
                                }}>
                                    {dataListFolder
                                        .filter(isDirectory)
                                        .map((item, index) => (
                                            <div key={index} style={{
                                                padding: '5px',
                                                cursor: 'pointer',
                                                backgroundColor: clickedFolder === getFilename(item) ? '#e0e0e0' : 'transparent',
                                                borderBottom: '1px solid #ccc', // Add separator line
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }} onClick={() => handleFolderClick(getFilename(item))} title="Delete">
                                                <span>📁 {getFilename(item)}</span>
                                                <button style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }} onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteFolderName(getFilename(item));
                                                    console.log(`hapus folder ${getFilename(item)}`);
                                                    setShowDeleteFolderModal(true);
                                                }} disabled={loadingFolder}>
                                                    <img src={trashIcon} alt="Delete" style={{ width: '15px', height: '15px', opacity: '0.6' }} />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            <div style={{
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '10px',
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '95%'
                            }}>
                                {/* <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <h4 style={{ marginTop: '0' }}>Files</h4>
                                    <button style={{
                                        background: '#0073e6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }} onClick={() => console.log('Upload File')} disabled={loadingFolder}>
                                        Upload Files
                                    </button>

                                </div> */}
                                {isDownloading && (
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}>
                                        <div style={{ flex: 1 }}>
                                            <ProgressBar value={downloadProgress} label="Downloading..." />
                                        </div>
                                        <button onClick={handleCancelDownload} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginLeft: '10px', marginTop: '17px', fontSize: '12px' }} disabled={loadingFolder}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                <div style={{
                                    overflowY: 'auto',
                                    flex: '1',
                                    position: 'relative'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                                            <tr>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>Action</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>File Name</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>Owner/Group</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>Permission</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>Size</th>
                                                <th style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>Last Modified</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataListFolder
                                                .filter(item => !isDirectory(item))
                                                .map((item, index) => (
                                                    <tr key={index}>
                                                        <td style={{ borderBottom: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                                                            <button style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                marginRight: '5px'
                                                            }} onClick={() => handleRenameFileClick(getFilename(item))} title="Change Name" disabled={loadingFolder}>
                                                                <img src={changeNameIcon} alt="Change Name" style={{ width: '15px', height: '15px', opacity: '0.6' }} />
                                                            </button>
                                                            <button style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                marginRight: '5px'
                                                            }} onClick={() => {
                                                                const JSON_MESSAGE = JSON.stringify({
                                                                    username: loginData.username,
                                                                    password: loginData.password,
                                                                    port: currentPort,
                                                                    directory: showDirectory,
                                                                    fileName: getFilename(item)
                                                                });
                                                                downloadSftpData(JSON_MESSAGE, getFilename(item));
                                                            }} title="Download" disabled={loadingFolder || isDownloading}>
                                                                <img src={downloadIcon} alt="Download" style={{ width: '15px', height: '15px', opacity: '0.6' }} />
                                                            </button>
                                                            <button style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }} onClick={() => {
                                                                setDeleteFileName(getFilename(item));
                                                                setShowDeleteFileModal(true);
                                                            }} title="Delete" disabled={loadingFolder}>
                                                                <img src={trashIcon} alt="Delete" style={{ width: '15px', height: '15px', opacity: '0.6' }} />
                                                            </button>
                                                        </td>
                                                        <td style={{ borderBottom: '1px solid #ccc', padding: '5px' }}>
                                                            📄 {getFilename(item)}
                                                        </td>
                                                        <td style={{ borderBottom: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                                                            {getOwnerGroup(item)}
                                                        </td>
                                                        <td style={{ borderBottom: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                                                            {getPermission(item)}
                                                        </td>
                                                        <td style={{ borderBottom: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                                                            {getSize(item)}
                                                        </td>
                                                        <td style={{ borderBottom: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                                                            {getLastModified(item)}
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    {/* {isDownloading && (
                                        <div style={{ marginTop: '10px' }}>
                                            <ProgressBar value={downloadProgress} label="Downloading..." />
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                visible={showNewFolderModal}
                onDismiss={() => { if (!isLoadingNewFolder) setShowNewFolderModal(false) }}
                header="Create New Folder"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">
                            {isLoadingNewFolder ? (
                                <>
                                    <CircularProgress size={20} />
                                </>
                            ) : (
                                <>
                                    <Button variant="normal" onClick={() => setShowNewFolderModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleNewFolderSubmit}>
                                        OK
                                    </Button>
                                </>
                            )}
                        </Box>
                    </>
                }
            >
                <FormField label="Folder Name">
                    <Input
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.detail.value)}
                        placeholder="Enter folder name"
                    />
                </FormField>
            </Modal>

            <Modal
                visible={showDeleteFolderModal}
                onDismiss={() => { if (!isLoadingDeleteFolder) setShowDeleteFolderModal(false) }}
                header="Create New Folder"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">
                            {isLoadingDeleteFolder ? (
                                <>
                                    <CircularProgress size={20} />
                                </>
                            ) : (
                                <>
                                    <Button variant="primary" onClick={() => setShowDeleteFolderModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleDeleteForderSubmit}>
                                        OK
                                    </Button>
                                </>
                            )}
                        </Box>
                    </>
                }
            >
                Are you sure want to delete folder {deleteFolderName}?
            </Modal>
            <Modal
                visible={showUploadModal}
                onDismiss={() => { if (!isLoadingUploadFile) setShowUploadModal(false) }}
                header="Upload File"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">
                            {isLoadingUploadFile ? (
                                <>
                                    <CircularProgress size={20} />
                                </>
                            ) : (
                                <>
                                    <Button variant="primary" onClick={() => setShowUploadModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleUploadSubmit}>
                                        OK
                                    </Button>
                                </>
                            )}
                        </Box>
                    </>
                }
            >
                <FormField label="Select File">
                    <input type="file" onChange={handleFileChange} />
                </FormField>
                {uploadProgress > 0 && (
                    <ProgressBar value={uploadProgress} label="Uploading..." />
                )}
            </Modal>
            <Modal
                visible={showDeleteFileModal}
                onDismiss={() => { if (!isLoadingDeleteFile) setShowDeleteFileModal(false) }}
                header="Delete File"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">
                            {isLoadingDeleteFile ? (
                                <>
                                    <CircularProgress size={20} />
                                </>
                            ) : (
                                <>
                                    <Button variant="primary" onClick={() => setShowDeleteFileModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleDeleteFileSubmit}>
                                        OK
                                    </Button>
                                </>
                            )}

                        </Box>
                    </>
                }
            >
                Are you sure you want to delete file {deleteFileName}?
            </Modal>
            <Modal
                visible={showRenameFileModal}
                onDismiss={() => { if (!isLoadingChangeName) setShowRenameFileModal(false) }}
                header="Rename File"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">

                            {isLoadingChangeName ? (
                                <>
                                    <CircularProgress size={20} />
                                </>
                            ) : (
                                <>
                                    <Button variant="primary" onClick={() => setShowRenameFileModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleRenameFileSubmit}>
                                        OK
                                    </Button>
                                </>
                            )}
                        </Box>
                    </>
                }
            >
                <FormField label="New File Name">
                    <Input
                        value={renameFileName}
                        onChange={e => setRenameFileName(e.detail.value)}
                        placeholder="Enter new file name"
                    />
                </FormField>
            </Modal>

            {/* Progress Modal */}
            <Modal
                visible={progressRemoteModal}
                header="Progress"
            >
                <CircularProgress size={20} />
                <div>{progressRemoteMessage}</div>
            </Modal>

            {/* Error Modal */}
            <Modal
                visible={showErrorModal}
                onDismiss={() => setShowErrorModal(false)}
                header="Error"
                footer={
                    <Box float="right">
                        <Button variant="primary" onClick={() => setShowErrorModal(false)}>
                            OK
                        </Button>
                    </Box>
                }
            >
                <div>Error Message: {errorMessage}</div>
            </Modal>
        </Box>
    );
};

export default NodeDevice;