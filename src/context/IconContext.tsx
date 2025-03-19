import React, { createContext, useContext } from 'react';
import { IconContext } from 'react-icons';

const defaultSettings = {
    color: '#333',
    size: '1.5em',
    className: 'icon',
};

export const IconSettingsContext = createContext(defaultSettings);

export const IconProvider: React.FC<{ settings?: Partial<typeof defaultSettings>, children: React.ReactNode }> = ({
    children,
    settings
}) => {
    const mergedSettings = { ...defaultSettings, ...settings };

    return (
        <IconSettingsContext.Provider value={mergedSettings}>
            <IconContext.Provider value={mergedSettings}>
                {children}
            </IconContext.Provider>
        </IconSettingsContext.Provider>
    );
};

export const useIconSettings = () => useContext(IconSettingsContext);
