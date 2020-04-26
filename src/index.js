import 'core-js/stable';

import '@style/index.scss';

import covidSimulator from '@js/simulator';

// Init simulator
const canvas = document.getElementById('world');
const resetButton = document.getElementById('resetButton');
const toggleButton = document.getElementById('toggleButton');
const counter = document.getElementById('counter');

const simulator = covidSimulator(canvas, resetButton, toggleButton, counter);
simulator.init();

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
