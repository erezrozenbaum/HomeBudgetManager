const { contextBridge } = require('electron');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactRouterDOM = require('react-router-dom');

// Expose required modules to renderer process
contextBridge.exposeInMainWorld('React', React);
contextBridge.exposeInMainWorld('ReactDOM', ReactDOM);
contextBridge.exposeInMainWorld('ReactRouterDOM', ReactRouterDOM);

// Log that preload script has run
console.log('Preload script executed successfully'); 