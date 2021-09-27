import React from 'react';
import ReactDOM from 'react-dom';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { memoryCache } from './lib';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
  cleanup();
});

describe('App', () => {

  test('is rendered', async () => {
    const p1 = /Loading.../i, p2 = /Generate/i;
    
    //render(<App />);
    act(() => {
      ReactDOM.render(<App cache={memoryCache()} />, container);
    });
    
    expect(screen.getByText(p1)).toBeInTheDocument();

    //await waitFor(() => screen.getByText(p2));

    //expect(screen.getByText(p2)).toBeInTheDocument();
  });

});
