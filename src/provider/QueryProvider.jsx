'use client'

import React from 'react';
import {QueryClient,QueryClientProvider,} from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();
const QueryProvider = ({children}) => {
  return (
    <div>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
};

export default QueryProvider;