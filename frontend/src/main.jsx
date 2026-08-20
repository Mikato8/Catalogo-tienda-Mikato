import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import App from './App';
import { store } from './store/index';
import { AuthProvider } from './contexts/AuthContext';
import './styles.css';

const theme = {
  token: {
    colorPrimary: '#006877',
    colorInfo: '#006877',
    colorLink: '#006877',
    borderRadius: 6,
    fontFamily: "'Inter', system-ui, sans-serif",
    colorBgLayout: '#f9f9ff',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ConfigProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
);
