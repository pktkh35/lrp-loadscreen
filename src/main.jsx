import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style/main.scss'
import { ConfigProvider, theme } from 'antd';
const { darkAlgorithm } = theme;

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider theme={{
    algorithm: [darkAlgorithm],
    token: {
      colorPrimary: "#f3ca20",
      colorLink: "#f3ca20",
      colorLinkActive: "#f3ca20",
      colorLinkHover: "#f3ca20",
    }
  }}>
    <App />
  </ConfigProvider>,
)
