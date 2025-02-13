/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Container, FormField, Header, Input, Modal, SpaceBetween, Table, TextFilter, ProgressBar } from '@cloudscape-design/components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
// import { CircularProgress } from '@material-ui/core'; // Import CircularProgress from Material-UI
import { CircularProgress } from '@mui/material'; // Updated import


import './Dashboard.css';
import './CustomModal.css'; // Import custom modal CSS

import terminalImage from '../../assets/terminal.png';
import internetImage from '../../assets/internet.png';
import folderImage from '../../assets/folder.png';
import backArrowImage from '../../assets/back-arrow.png';
import trashIcon from '../../assets/trash.png'; // Import trash icon
import changeNameIcon from '../../assets/edit.png'; // Import change name icon
import downloadIcon from '../../assets/download.png'; // Import download icon
// import { useState, useMemo, useCallback } from "react";
// import { Link } from "react-router-dom";

const Dashboard: React.FC<{}> = () => {
    const name = localStorage.getItem('name') || '';
    const role = localStorage.getItem('role_name') || '';
    const company = localStorage.getItem('company_name') || '';
    // const userRole = localStorage.getItem('role') || 'Guest';
    const companyGroup = localStorage.getItem('company_group') || '';

    const id_user = localStorage.getItem('id_user') || '';
    const id_role = localStorage.getItem('id_role') || '';

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorId, setErrorId] = useState('');

    const [dataDevice, setDataDevice] = useState<any[]>([]);
    const [onlineDevices, setOnlineDevices] = useState(0);
    const [offlineDevices, setOfflineDevices] = useState(0);
    const [totalDevices, setTotalDevices] = useState(0)


    const [showTerminal, setShowTerminal] = useState(false);
    const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null);
    const [currentDateTime, setCurrentDateTime] = useState<string | null>(null);
    const [currentDeviceName, setCurrentDeviceName] = useState<string | null>(null);
    const [currentSerialNumber, setCurrentSerialNumber] = useState<string | null>(null);
    const [currentPort, setCurrentPort] = useState<string | null>(null);
    const [showBrowser, setShowBrowser] = useState(false);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const [showSftpLoginModal, setShowSftpLoginModal] = useState(false);

    const [showSftpModal, setShowSftpModal] = useState(false);

    const [isLoadingNewFolder, setLoadingNewFolder] = useState(false);
    const [isLoadingDeleteFolder, setLoadingDeleteFolder] = useState(false);
    const [isLoadingDeleteFile, setLoadingDeleteFile] = useState(false);
    const [isLoadingChangeName, setLoadingChangeName] = useState(false);
    const [isLoadingUploadFile, setLoadingUploadFile] = useState(false);

    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
    });

    const handleInputChange = (field: string, value: string | undefined) => {
        setLoginData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const [showDirectory, setShowDirectory] = useState('/home/user');

    const handleSftpClick = (datetime: string, devicename: string, serialnumber: string) => {
        setCurrentDeviceName(devicename);
        setCurrentSerialNumber(serialnumber);
        setCurrentDateTime(datetime);
        setShowSftpLoginModal(true);
    };

    const [sftpLoading, setSftpLoading] = useState(false);


    const handleSftpSubmit = async (datetime: string, devicename: string, serialnumber: string, username: string, password: string) => {

        setSftpLoading(true);
        console.log('Submitting SFTP data:', { datetime, devicename, serialnumber, username, password });
        // const JSON_MESSAGE = JSON.stringify({
        //     username: formData.username,
        //     password: formData.password,
        //     // port: port,
        //     directory: '/home/user'
        // });
        // console.log('Submitting SFTP data:', JSON_MESSAGE);

        // await fetchSftpData(JSON_MESSAGE);

        // setShowSftpModal(true);
        // return

        fetch('http://157.15.164.78:3001/enable-device/sftp/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ datetime, devicename, serialnumber }),
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    // Handle HTTP error responses
                    setErrorId(data.id || '');
                    setErrorMessage(data.error || `Failed to create SFTP conenction`);
                    setShowErrorModal(true);
                    setSftpLoading(false);
                    return;
                }

                console.log('Success:', data);

                // const output = data.output;
                const port = data.port;

                if (port) {
                    console.log('Port:', port);
                    setCurrentPort(port);
                    setShowDirectory('/home/user');

                    await new Promise(resolve => setTimeout(resolve, 5000));

                    setShowSftpLoginModal(false);

                    const JSON_MESSAGE = JSON.stringify({
                        username: loginData.username,
                        password: loginData.password,
                        port: port,
                        directory: '/home/user'
                    });
                    setSftpLoading(false);

                    console.log('Submitting SFTP data:', JSON_MESSAGE);

                    await fetchSftpData(JSON_MESSAGE);

                    setShowSftpModal(true);

                } else {
                    console.log('Port tidak ditemukan');
                    setSftpLoading(false);
                    setErrorId('');
                    setErrorMessage("Cannot find SFTP port");
                    setShowErrorModal(true);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setSftpLoading(false);
                setErrorId('');
                setErrorMessage("Failed to create SFTP conenction");
                setShowErrorModal(true);
            });



        // fetch('http://157.15.164.78:3001/enable-device/ssh/1', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ datetime, devicename, serialnumber }),
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('Success:', data);

        //         const port = data.port;

        //         if (port) {
        //             console.log('Port:', port);
        //             setCurrentPort(port);
        //             setShowSftpModal(true);
        //         } else {
        //             console.log('Port tidak ditemukan');
        //         }
        //     })
        //     .catch((error) => {
        //         console.error('Error:', error);
        //     });
    };

    const handleSftpClose = async (datetime: string | null, devicename: string | null, serialnumber: string | null, port: string | null) => {
        if (datetime && devicename && serialnumber && port) {
            console.log('disable device:', serialnumber);

            fetch('http://157.15.164.78:3001/enable-device/sftp/0', {
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

    const [dataListFolder, setDataListFolder] = useState<any[]>([]);
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

    const fetchSftpData = async (JSON_MESSAGE: string) => {
        setLoadingFolder(true);
        fetch('http://157.15.164.78:3001/sftp/list-dir', {
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
            });
    }


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
            xhr.open('POST', 'http://157.15.164.78:3001/sftp/upload', true);

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
            const response = await fetch('http://157.15.164.78:3001/sftp/download', {
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
            const response = await fetch('http://157.15.164.78:3001/sftp/create-dir', {
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
            const response = await fetch('http://157.15.164.78:3001/sftp/delete-dir', {
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
            const response = await fetch('http://157.15.164.78:3001/sftp/delete-file', {
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
            const response = await fetch('http://157.15.164.78:3001/sftp/rename-file', {
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

    // const handleSftpSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();

    //     if (currentDeviceName) {
    //         console.log('Submitting SFTP data:', {
    //             device: currentDeviceName,
    //             username: formData.username,
    //             password: formData.password,
    //         });

    //         // Lakukan tindakan dengan data SFTP yang dimasukkan (misalnya, kirim ke server)
    //         fetch('http://157.15.164.78:3001/sftp-login', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 // deviceName: currentDevice.devicename,
    //                 username: formData.username,
    //                 password: formData.password,
    //             }),
    //         })
    //             .then(response => response.json())
    //             .then(data => {
    //                 console.log('SFTP Login Success:', data);
    //                 setShowSftpLoginModal(false); // Menutup modal setelah berhasil
    //             })
    //             .catch((error) => {
    //                 console.error('SFTP Login Error:', error);
    //             });
    //     }
    // };

    const handleImageClick = (name: string, role: string, company: string, datetime: string, devicename: string, serialnumber: string) => {
        setCurrentDeviceName(devicename);
        setCurrentSerialNumber(serialnumber);
        setCurrentDateTime(datetime);

        console.log('Enable device:', serialnumber);

        fetch('http://157.15.164.78:3001/enable-device/ssh/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, role, company, datetime, devicename, serialnumber }),
        })
            .then(async response => {
                const data = await response.json()

                if (!response.ok) {
                    // Handle HTTP error responses
                    setErrorId(data.id || '');
                    setErrorMessage(data.error || `Failed to enable SSH connection`);
                    setShowErrorModal(true);
                    return;
                }

                console.log('Success:', data);

                // const output = data.output;
                const port = data.port;

                if (port) {
                    console.log('Port:', port);
                    setCurrentPort(port);
                    setShowTerminal(true);
                } else {
                    console.log('Port tidak ditemukan');
                    setErrorId('');
                    setErrorMessage(`Failed to enable SSH connection`);
                    setShowErrorModal(true);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorId('');
                setErrorMessage(`Failed to enable SSH connection`);
                setShowErrorModal(true);
            });
        // setShowTerminal(true);
    };

    const handleTerminalClose = (datetime: string | null, devicename: string | null, serialnumber: string | null, port: string | null) => {
        if (datetime && devicename && serialnumber && port) {
            console.log('disable device:', serialnumber);

            fetch('http://157.15.164.78:3001/enable-device/ssh/0', {
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

    const handleHttpsClick = (name: string, role: string, company: string, datetime: string, devicename: string, serialnumber: string) => {
        setCurrentDeviceName(devicename);
        setCurrentSerialNumber(serialnumber);

        console.log(JSON.stringify({ datetime, devicename, serialnumber }));

        fetch('http://157.15.164.78:3001/enable-device/http/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, role, company, datetime, devicename, serialnumber }),
        })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    // Handle HTTP error responses
                    setErrorId(data.id || '');
                    setErrorMessage(data.error || `Failed to enable HTTP connection`);
                    setShowErrorModal(true);
                    return;
                }

                console.log('Success:', data);

                // const output = data.output;
                const port = data.port;
                if (port) {
                    console.log('Port:', port);
                    setCurrentPort(port);
                    const newUrl = `http://157.15.164.78:${port}`;
                    setCurrentUrl(newUrl); // Update the current URL with the new port
                    console.log('url:', newUrl);
                } else {
                    setErrorId('');
                    setErrorMessage(`Failed to enable HTTP connection`);
                    setShowErrorModal(true);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorId('');
                setErrorMessage(`Failed to enable HTTP connection`);
                setShowErrorModal(true);
            });


        setShowBrowser(true);
    };

    const handleHttpClose = (datetime: string | null, devicename: string | null, serialnumber: string | null, port: string | null) => {
        if (serialnumber) {
            setShowBrowser(false)
            console.log('Disable device:', serialnumber);

            fetch('http://157.15.164.78:3001/enable-device/http/0', {
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

    useEffect(() => {
        if (showTerminal) {
            // Add this at component level

            const terminalElement = document.getElementById('terminal');
            if (terminalElement) {
                let username: string | undefined;
                let password: string | undefined;
                let text = '';

                const terminal = new Terminal({
                    cursorBlink: true,
                    rows: 20,
                    cols: 80
                });
                const fitAddon = new FitAddon();
                terminal.loadAddon(fitAddon);
                terminal.open(terminalElement);
                fitAddon.fit();
                terminal.write(`Connecting to ${currentDeviceName}...\r\n`);
                terminal.focus();

                terminal.write('Username : ');
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
                            // terminal.clear();
                            socketRef.current = new WebSocket(`ws://157.15.164.78:3001?port=${currentPort}?username=${username}?password=${password}`);
                            socketRef.current.onmessage = (event) => {
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
                            if (username != undefined && password == undefined) {
                                // terminal.write('*');
                            } else {
                                terminal.write(data);
                            }
                        }
                    } else {
                        socketRef.current?.send(data);
                    }
                });

                setTerminalInstance(terminal);
            }
        } else {
            if (terminalInstance) {
                terminalInstance.dispose();
                setTerminalInstance(null);
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        }
    }, [showTerminal, currentDeviceName]);

    const fetchData = async () => {
        try {
            const response = await fetch('http://157.15.164.78:3001/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id_user, id_role }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            setDataDevice(json.data);

            // Hitung status online, offline, dan total setelah data diterima
            const online = json.data.filter((device: { status: number; }) => device.status === 1).length;
            const offline = json.data.filter((device: { status: number; }) => device.status === 0).length;
            const total = json.data.length;

            setOnlineDevices(online);
            setOfflineDevices(offline);
            setTotalDevices(total);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData(); // Panggil pertama kali saat komponen mount

        const intervalId = setInterval(fetchData, 10000); // Ambil data setiap 10 detik

        return () => {
            clearInterval(intervalId); // Bersihkan interval ketika komponen unmount
        };
    }, []); // Kosongkan array dependensi agar effect hanya dijalankan sekali saat mount


    const sortedDevices = [...dataDevice].sort((a, b) => {
        // Urutkan berdasarkan status (status 1 di atas)
        if (a.status === 1 && b.status !== 1) {
            return -1; // A lebih tinggi (status 1) dari B (status 0)
        }
        if (a.status !== 1 && b.status === 1) {
            return 1; // B lebih tinggi (status 1) dari A (status 0)
        }

        // Jika status sama, urutkan berdasarkan deviceName secara alfabetis (A-Z)
        const nameA = a.devicename.toLowerCase();
        const nameB = b.devicename.toLowerCase();
        if (nameA < nameB) {
            return -1; // A lebih kecil dari B
        }
        if (nameA > nameB) {
            return 1; // A lebih besar dari B
        }

        // Jika deviceName sama, urutkan berdasarkan lastSeen (terbaru di atas)
        const dateA = new Date(a.datetime);
        const dateB = new Date(b.datetime);
        return dateB.getTime() - dateA.getTime(); // Urutkan berdasarkan tanggal (terbaru di atas)
    });

    const columnDefinitions = [
        {
            id: "status",
            header: "Status",
            cell: (item: { status: number; }) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: item.status === 1 ? 'green' : 'red',
                            marginRight: '5px'
                        }}
                    ></span>
                </div>
            ),
        },
        {
            id: "device_name",
            header: "Device Name",
            cell: (item: { devicename: any; }) => item.devicename || "-"
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
            id: "sftp",
            header: "SFTP",
            cell: (item: { status: number; datetime: string; devicename: string; serialnumber: string; }) => (
                item.status === 0 ? (
                    <div className="image-container">-</div>
                ) : (
                    <div className="image-container">
                        <a href="#" onClick={() => handleSftpClick(item.datetime, item.devicename, item.serialnumber)}>
                            <img src={folderImage} alt="SFTP" className="terminal-image" />
                        </a>
                    </div>
                )
            )
        },
        {
            id: "ssh",
            header: "SSH",
            cell: (item: { status: number; datetime: string; devicename: string; serialnumber: string; }) => (
                item.status === 0 ? (
                    <div className="image-container">-</div>
                ) : (
                    <div className="image-container">
                        <a href="#" onClick={() => handleImageClick(name, role, company, item.datetime, item.devicename, item.serialnumber)}>
                            <img src={terminalImage} alt="SSH" className="terminal-image" />
                        </a>
                    </div>
                )
            )
        },

        {
            id: "https",
            header: "HTTPS",
            cell: (item: { status: number; datetime: string; devicename: string; serialnumber: string; }) => (
                item.status === 0 ? (
                    <div className="image-container">-</div>
                ) : (
                    <div className="image-container">
                        <a href="#" onClick={() => handleHttpsClick(name, role, company, item.datetime, item.devicename, item.serialnumber)}>
                            <img src={internetImage} alt="HTTPS" className="internet-image" />
                        </a>
                    </div>
                )
            )
        },
        {
            id: "last_seen",
            header: "Last Seen",
            cell: (item: { datetime: any; }) => item.datetime || "-"
        }
    ];

    return (
        <>
            <div className="dashboard-content">
                <div className="dashboard-left">
                    <Container
                        fitHeight
                        header={
                            <Header variant="h2" description="Total Online">
                                Online Devices
                            </Header>
                        }
                    >
                        <div className="online-count">{onlineDevices}</div>
                    </Container>
                </div>
                <div className="dashboard-center">
                    <Container
                        fitHeight
                        header={
                            <Header variant="h2" description="Total Offline">
                                Offline Devices
                            </Header>
                        }
                    >
                        <div className="offline-count">{offlineDevices}</div>
                    </Container>
                </div>
                <div className="dashboard-right">
                    <Container
                        fitHeight
                        header={
                            <Header variant="h2" description="Total Devices">
                                Total Devices
                            </Header>
                        }
                    >
                        <div className="total-count">{totalDevices}</div>
                    </Container>
                </div>
            </div>
            <div className="dashboard-content">
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
                />
            </div>
            {showTerminal && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <div className="custom-modal-header">
                            <span className="custom-modal-title">Terminal {currentDeviceName}</span>
                            <span className="custom-modal-close" onClick={() => handleTerminalClose(currentDateTime, currentDeviceName, currentSerialNumber, currentPort)}>&times;</span>
                        </div>
                        <div id="terminal" style={{ height: 'calc(100% - 60px)', width: '100%' }}></div>
                    </div>
                </div>
            )}
            {showBrowser && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <div className="custom-modal-header">
                            <span className="custom-modal-title">Website {currentDeviceName}</span>
                            <span className="custom-modal-close" onClick={() => handleHttpClose(currentDateTime, currentDeviceName, currentSerialNumber, currentPort)}>&times;</span>
                        </div>
                        <iframe src={currentUrl || ''} style={{ height: 'calc(100% - 60px)', width: '100%' }}></iframe>
                    </div>
                </div>
            )}
            <Modal
                visible={showSftpLoginModal}
                onDismiss={() => setShowSftpLoginModal(false)}
                header="SFTP Login"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">
                            {sftpLoading ? (
                                <CircularProgress size={20} />
                            ) : (
                                <>
                                    <Button
                                        variant="normal"
                                        onClick={() => {
                                            if (!sftpLoading) setShowSftpLoginModal(false);
                                        }}
                                        disabled={sftpLoading} // Disable Cancel button while loading
                                    >
                                        Cancel
                                    </Button><Button
                                        variant="primary"
                                        onClick={() => handleSftpSubmit(
                                            currentDateTime || '',
                                            currentDeviceName || '',
                                            currentSerialNumber || '',
                                            loginData.username,
                                            loginData.password
                                        )}
                                    >
                                        Ok
                                    </Button>
                                </>
                            )}
                        </Box>
                    </>

                }
            >
                <FormField label="Username">
                    <Input
                        value={loginData.username}
                        onChange={e => handleInputChange('username', e.detail.value)}
                        placeholder="Enter username"
                    />
                </FormField>

                <FormField label="Password">
                    <Input
                        type="password"
                        value={loginData.password}
                        onChange={e => handleInputChange('password', e.detail.value)}
                        placeholder="Enter password"
                    />
                </FormField>
            </Modal>
            {showSftpModal && (
                <div className="custom-modal">
                    <div className="custom-modal-content">
                        <div className="custom-modal-header">
                            <span className="custom-modal-title">SFTP</span>
                            <span className="custom-modal-close" onClick={() => handleSftpClose(currentDateTime, currentDeviceName, currentSerialNumber, currentPort)}>&times;</span>
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
            <Modal
                visible={showErrorModal}
                onDismiss={() => setShowErrorModal(false)}
                header="Error"
                closeAriaLabel="Close modal"
                footer={
                    <>
                        <Box float="right">
                            <Button variant="primary" onClick={() => setShowErrorModal(false)}>
                                OK
                            </Button>
                        </Box>
                    </>
                }
            >
                {errorId && <div>Error ID: {errorId}</div>}
                <div>Error Message: {errorMessage}</div>
            </Modal>
            {/* <Modal
                visible={isDownloading}
                // onDismiss={() => setShowDeleteFolderModal(false)}
                // header="Create New Folder"
                // closeAriaLabel="Close modal"
            >
                <ProgressBar value={downloadProgress} label="Downloading..." />
            </Modal> */}
        </>
    );
};

export default Dashboard;
