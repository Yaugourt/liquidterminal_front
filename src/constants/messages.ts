export const MESSAGE_CODES = {
  // Transaction related
  TX_SUCCESS: 'TX_001',
  TX_FAILED: 'TX_002',
  TX_PENDING: 'TX_003',
  
  // Authentication related
  AUTH_SUCCESS: 'AUTH_001',
  AUTH_FAILED: 'AUTH_002',
  
  // Network related
  NETWORK_ERROR: 'NET_001',
  NETWORK_CONGESTED: 'NET_002',
  
  // Data related
  DATA_LOADING: 'DATA_001',
  DATA_ERROR: 'DATA_002',
  DATA_NOT_FOUND: 'DATA_003'
} as const;

export const DEFAULT_MESSAGES = {
  // Success messages
  [MESSAGE_CODES.TX_SUCCESS]: {
    title: 'Transaction Successful',
    content: 'Your transaction has been validated successfully'
  },
  
  // Error messages
  [MESSAGE_CODES.TX_FAILED]: {
    title: 'Transaction Failed',
    content: 'The transaction could not be validated'
  },
  
  // Warning messages
  [MESSAGE_CODES.TX_PENDING]: {
    title: 'Transaction Pending',
    content: 'Your transaction is being processed'
  },
  
  [MESSAGE_CODES.NETWORK_CONGESTED]: {
    title: 'Network Congested',
    content: 'The network is currently congested, transactions may take longer'
  },
  
  // Info messages
  [MESSAGE_CODES.DATA_LOADING]: {
    title: 'Loading Data',
    content: 'Please wait while we fetch your data'
  },

  [MESSAGE_CODES.DATA_ERROR]: {
    title: 'Error Loading Data',
    content: 'An error occurred while fetching your data'
  },

  [MESSAGE_CODES.DATA_NOT_FOUND]: {
    title: 'Data Not Found',
    content: 'The requested data could not be found'
  },

  [MESSAGE_CODES.AUTH_SUCCESS]: {
    title: 'Authentication Successful',
    content: 'You have been successfully authenticated'
  },

  [MESSAGE_CODES.AUTH_FAILED]: {
    title: 'Authentication Failed',
    content: 'Unable to authenticate. Please try again'
  },

  [MESSAGE_CODES.NETWORK_ERROR]: {
    title: 'Network Error',
    content: 'Unable to connect to the network. Please check your connection'
  }
} as const; 