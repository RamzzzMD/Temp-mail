import './styles.css';
import { App } from './App.js';
import { storage } from './utils/storage.js';

const savedTheme = storage.getTheme() || 'dark';
document.documentElement.dataset.theme = savedTheme;

const root = document.getElementById('app');
const { el } = App();
root.appendChild(el);
