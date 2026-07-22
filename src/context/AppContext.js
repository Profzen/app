import React, { createContext, useState, useContext } from 'react';
import { SHOPS_MOCK } from '../mocks/shopsMock';
import { CONTACTS_MOCK } from '../mocks/contactsMock';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    name: 'David Mensah',
    email: 'david.mensah@dizzitapp.com',
    avatar: require('../../assets/avatars/david.jpg'),
    balanceDZY: 125500.00,
    balanceXOF: 510000.00,
    balanceGHS: 125500.00,
    currency: 'DZY',
  });

  const [shops, setShops] = useState(SHOPS_MOCK);
  const [contacts, setContacts] = useState(CONTACTS_MOCK);
  const [favorites, setFavorites] = useState(['jumia-sn', '1']);
  const [cart, setCart] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const updateBalance = (amountDZY) => {
    setUser(prev => ({
      ...prev,
      balanceDZY: prev.balanceDZY + amountDZY
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      shops,
      contacts,
      favorites,
      toggleFavorite,
      cart,
      addToCart,
      updateBalance
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
