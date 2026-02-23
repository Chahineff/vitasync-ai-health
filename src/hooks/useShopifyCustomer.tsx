import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ═══════════════ Types ═══════════════

export interface ShopifySubscriptionLine {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  currentPrice: { amount: string; currencyCode: string };
  variantImage?: { url: string; altText: string | null } | null;
}

export interface ShopifySubscriptionContract {
  id: string;
  status: string;
  nextBillingDate: string | null;
  deliveryPolicy: { interval: string; intervalCount: number } | null;
  lines: { edges: Array<{ node: ShopifySubscriptionLine }> };
}

export interface ShopifyCustomerAddress {
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
}

export interface ShopifyCustomerData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  defaultAddress: ShopifyCustomerAddress | null;
}

interface UseShopifyCustomerReturn {
  isConnected: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  customer: ShopifyCustomerData | null;
  subscriptions: ShopifySubscriptionContract[];
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  executeQuery: (query: string, variables?: Record<string, unknown>) => Promise<unknown>;
}

// ═══════════════ PKCE Helpers ═══════════════

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64urlEncode(hashed);
}

// ═══════════════ GraphQL Queries ═══════════════

const CUSTOMER_DATA_QUERY = `
  query {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      defaultAddress {
        address1
        address2
        city
        provinceCode
        zip
        countryCode
      }
    }
  }
`;

const SUBSCRIPTION_CONTRACTS_QUERY = `
  query {
    customer {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  image {
                    url
                    altText
                  }
                  discountedTotalPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ═══════════════ Hook ═══════════════

export function useShopifyCustomer(): UseShopifyCustomerReturn {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [customer, setCustomer] = useState<ShopifyCustomerData | null>(null);
  const [subscriptions, setSubscriptions] = useState<ShopifySubscriptionContract[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check connection status
  const checkStatus = useCallback(async () => {
    if (!user) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('shopify-customer-auth', {
        body: { action: 'status' },
      });

      if (fnError) throw fnError;
      setIsConnected(data?.connected === true);
    } catch (err) {
      console.error('Status check failed:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch customer data
  const fetchCustomerData = useCallback(async () => {
    if (!isConnected) return;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('shopify-customer-api', {
        body: { query: CUSTOMER_DATA_QUERY },
      });

      if (fnError) throw fnError;

      if (data?.data?.customer) {
        const c = data.data.customer;
        setCustomer({
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.emailAddress?.emailAddress || null,
          defaultAddress: c.defaultAddress ? {
            address1: c.defaultAddress.address1,
            address2: c.defaultAddress.address2,
            city: c.defaultAddress.city,
            province: c.defaultAddress.provinceCode,
            zip: c.defaultAddress.zip,
            country: c.defaultAddress.countryCode,
          } : null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch customer data:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('TOKEN_EXPIRED') || msg.includes('NOT_LINKED')) {
        setIsConnected(false);
      }
      setError(msg);
    }
  }, [isConnected]);

  // Execute arbitrary GraphQL query
  const executeQuery = useCallback(async (query: string, variables?: Record<string, unknown>) => {
    const { data, error: fnError } = await supabase.functions.invoke('shopify-customer-api', {
      body: { query, variables },
    });
    if (fnError) throw fnError;
    return data;
  }, []);

  // Connect (initiate OAuth)
  const connect = useCallback(async () => {
    if (!user) return;
    setIsAuthenticating(true);

    try {
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);
      const nonce = generateRandomString(32);
      const redirectUri = `${window.location.origin}/shopify-callback`;

      // Store PKCE params in sessionStorage
      sessionStorage.setItem('shopify_code_verifier', codeVerifier);
      sessionStorage.setItem('shopify_state', state);
      sessionStorage.setItem('shopify_redirect_uri', redirectUri);

      // Get auth URL from edge function
      const { data, error: fnError } = await supabase.functions.invoke('shopify-customer-auth', {
        body: {
          action: 'get-auth-url',
          code: codeChallenge,
          redirect_uri: redirectUri,
          state,
          nonce,
        },
      });

      if (fnError) throw fnError;
      if (!data?.url) throw new Error('No auth URL returned');

      // Redirect to Shopify
      window.location.href = data.url;
    } catch (err) {
      console.error('Connect failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsAuthenticating(false);
    }
  }, [user]);

  // Handle OAuth callback
  const handleCallback = useCallback(async (code: string, state: string) => {
    const storedState = sessionStorage.getItem('shopify_state');
    const codeVerifier = sessionStorage.getItem('shopify_code_verifier');
    const redirectUri = sessionStorage.getItem('shopify_redirect_uri');

    if (state !== storedState) {
      setError('Invalid OAuth state');
      return false;
    }

    if (!codeVerifier || !redirectUri) {
      setError('Missing PKCE parameters');
      return false;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('shopify-customer-auth', {
        body: {
          action: 'exchange-token',
          code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error('Token exchange failed');

      // Cleanup sessionStorage
      sessionStorage.removeItem('shopify_code_verifier');
      sessionStorage.removeItem('shopify_state');
      sessionStorage.removeItem('shopify_redirect_uri');

      setIsConnected(true);
      return true;
    } catch (err) {
      console.error('Callback failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      return false;
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      await supabase.functions.invoke('shopify-customer-auth', {
        body: { action: 'disconnect' },
      });
      setIsConnected(false);
      setCustomer(null);
      setSubscriptions([]);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await checkStatus();
    if (isConnected) {
      await fetchCustomerData();
    }
    setIsLoading(false);
  }, [checkStatus, fetchCustomerData, isConnected]);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Fetch data when connected
  useEffect(() => {
    if (isConnected) {
      fetchCustomerData();
    }
  }, [isConnected, fetchCustomerData]);

  // Handle callback on mount if URL has code
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (code && state && window.location.pathname === '/shopify-callback') {
      setIsAuthenticating(true);
      handleCallback(code, state).then((success) => {
        setIsAuthenticating(false);
        if (success) {
          // Redirect back to dashboard mystack
          window.history.replaceState({}, '', '/dashboard');
        }
      });
    }
  }, [handleCallback]);

  return {
    isConnected,
    isLoading,
    isAuthenticating,
    customer,
    subscriptions,
    error,
    connect,
    disconnect,
    refresh,
    executeQuery,
  };
}
