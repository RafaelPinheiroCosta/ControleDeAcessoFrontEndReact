import React, { createContext, useState, useEffect, useContext } from 'react';

export const ServerIpContext = createContext();

export const useServerIp = () => useContext(ServerIpContext);

export const ServerIpProvider = ({ children }) => {
  // Verifica se o IP está no sessionStorage; se não, usa o valor padrão
  const initialServerIp = sessionStorage.getItem('serverIp') || 
    (window.location.hostname === 'localhost' ? 'https://localhost:8000' : null);

  const [serverIp, setServerIp] = useState(initialServerIp);

  useEffect(() => {
    // Só busca o IP do servidor se não estiver definido e não estiver no sessionStorage
    if (!serverIp) {
      const fetchServerIp = async () => {
        try {
          const response = await fetch('/server-ip');
          if (!response.ok) throw new Error('Falha ao obter o IP do servidor');
          
          const data = await response.json();
          setServerIp(data.serverIp); // Atualiza o contexto
          sessionStorage.setItem('serverIp', data.serverIp); // Armazena no sessionStorage
        } catch (error) {
          console.error('Erro ao buscar o IP do servidor:', error);
        }
      };
      fetchServerIp();
    }
  }, [serverIp]);

  return (
    <ServerIpContext.Provider value={{ serverIp, setServerIp }}>
      {children}
    </ServerIpContext.Provider>
  );
};
