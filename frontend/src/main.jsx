import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

//  Amplify imports
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports'

//  Configure Amplify
Amplify.configure(awsconfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

//import awsconfig from './aws-exports';
//import { Amplify } from 'aws-amplify';
//import awsExports from './aws-exports';
