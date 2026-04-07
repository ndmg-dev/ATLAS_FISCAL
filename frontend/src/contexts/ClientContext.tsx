import { createContext, useContext, useState, ReactNode } from 'react';

type ClientContextType = {
  selectedClientCnpj: string | null;
  setSelectedClientCnpj: (cnpj: string | null) => void;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClientCnpj, setSelectedClientCnpj] = useState<string | null>(null);

  return (
    <ClientContext.Provider value={{ selectedClientCnpj, setSelectedClientCnpj }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
