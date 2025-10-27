import App from './App';
import { createRoot } from 'react-dom/client';
import './index.css';

const root = document.createElement('div');
root.id = 'x-ai-reply-root';

document.body.append(root);

createRoot(root).render(<App />);
