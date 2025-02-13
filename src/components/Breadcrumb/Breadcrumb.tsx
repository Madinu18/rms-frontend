// Breadcrumb.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    text: string;
    href: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav aria-label="Breadcrumb">
            <ol style={{ listStyle: 'none', display: 'flex', paddingLeft: 0 }}>
                {items.map((item, index) => (
                    <li key={index} style={{ fontWeight: 'bold' }}>
                        {index < items.length - 1 ? (
                            <Link
                                to={item.href}
                                style={{
                                    textDecoration: 'none',
                                    color: '#0073e6',
                                    fontWeight: 'bold',
                                }}
                            >
                                {item.text}
                            </Link>
                        ) : (
                            <span
                                style={{
                                    color: '#b0b0b0', // Warna abu-abu untuk item terakhir
                                    fontWeight: 'bold',
                                }}
                            >
                                {item.text}
                            </span>
                        )}
                        {index < items.length - 1 && (
                            <span style={{ color: '#b0b0b0', marginLeft: '8px', marginRight: '8px' }}>
                                {'>'}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
