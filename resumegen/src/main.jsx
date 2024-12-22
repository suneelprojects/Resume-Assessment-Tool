import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { StepProvider } from "./hooks/StepContext";

createRoot(document.getElementById('root')).render(
        <StepProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StepProvider>
)
