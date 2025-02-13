import React, { createContext, useState, useContext } from 'react';
import { FlashbarProps } from '@cloudscape-design/components';

interface FlashbarContextType {
  flashbarItems: FlashbarProps.MessageDefinition[];
  addFlashbarItem: (item: FlashbarProps.MessageDefinition) => void;
  removeFlashbarItem: (id: string) => void;
}

const FlashbarContext = createContext<FlashbarContextType | undefined>(undefined);

export const FlashbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [flashbarItems, setFlashbarItems] = useState<FlashbarProps.MessageDefinition[]>([]);

  const addFlashbarItem = (item: FlashbarProps.MessageDefinition) => {
    const itemWithDismiss = {
      ...item,
      dismissible: true,
      onDismiss: () => item.id && removeFlashbarItem(item.id),
    };
    setFlashbarItems(prev => [...prev, itemWithDismiss]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      if (item.id) {
        removeFlashbarItem(item.id);
      }
    }, 5000);
  };

  const removeFlashbarItem = (id: string) => {
    setFlashbarItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <FlashbarContext.Provider value={{ flashbarItems, addFlashbarItem, removeFlashbarItem }}>
      {children}
    </FlashbarContext.Provider>
  );
};

export const useFlashbar = () => {
  const context = useContext(FlashbarContext);
  if (!context) {
    throw new Error('useFlashbar must be used within FlashbarProvider');
  }
  return context;
};