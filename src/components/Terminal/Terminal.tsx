import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { useEffect, useRef, useState } from 'react';

interface TerminalModalProps {
    show: boolean;
    onClose: () => void;
}

const TerminalModal = ({ show, onClose }: TerminalModalProps) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null);

    useEffect(() => {
        if (show && terminalRef.current) {
            const term = new Terminal({
                cols: 80,
                rows: 25,
                cursorBlink: true,
                fontSize: 18,
                fontFamily: 'monospace',
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalRef.current);

            // Tunggu render, lalu ukur dan set ulang ukuran div terminal
            setTimeout(() => {
                const dims = (term as any)._core._renderService.dimensions;
                if (dims) {
                    const width = dims.actualCellWidth * 80;
                    const height = dims.actualCellHeight * 25;
                    terminalRef.current!.style.width = `${width}px`;
                    terminalRef.current!.style.height = `${height}px`;
                }
            }, 0);

            term.focus();
            term.write('Terminal Ready\r\n');
            setTerminalInstance(term);
        }

        return () => {
            terminalInstance?.dispose();
            setTerminalInstance(null);
        };
    }, [show]);

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>×</button>
                <div ref={terminalRef} id="terminal" />
            </div>
        </div>
    );
};

export default TerminalModal;
