import md5 from 'md5';

interface BasePaymentParams {
  pid: string;
  type: string;
  out_trade_no: string;
  notify_url: string;
  return_url: string;
  name: string;
  money: string;
  param?: string;
  sign_type?: string;
  sign?: string;
}

interface ApiPaymentParams extends BasePaymentParams {
  clientip: string;
  device?: 'pc' | 'mobile' | 'qq' | 'wechat' | 'alipay' | 'jump';
}

export type PaymentMethod = 'page' | 'api';

interface PaymentResponse {
  code: number;
  msg?: string;
  trade_no?: string;
  payurl?: string;
  qrcode?: string;
  urlscheme?: string;
}

// Debug function to show signature process
function debugSignature(params: Record<string, string>, signStr: string, finalStr: string, sign: string) {
  console.log('Signature Debug:');
  console.log('1. Original Params:', params);
  console.log('2. Parameter String:', signStr);
  console.log('3. Final String with Key:', finalStr);
  console.log('4. MD5 Hash:', sign);
}

export function generateSignature(params: Record<string, string>): string {
  // 1. Sort parameters alphabetically
  const sortedParams = Object.entries(params)
    .filter(([key, value]) => {
      // Exclude sign, sign_type and empty values
      return key !== 'sign' && 
             key !== 'sign_type' && 
             value !== '';
    })
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  // 2. Create parameter string (key=value&key=value format)
  const signStr = sortedParams
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // 3. Add merchant key
  const finalStr = signStr + import.meta.env.VITE_MERCHANT_KEY;
  
  // 4. Generate MD5 hash
  const sign = md5(finalStr);

  // Debug output
  debugSignature(params, signStr, finalStr, sign);

  return sign;
}

export function buildRequestParams<T extends Record<string, string>>(params: T): T & { sign: string; sign_type: string } {
  // First create a copy of the params and ensure they're properly formatted
  const formattedParams = Object.entries(params).reduce((acc, [key, value]) => {
    // Skip sign and sign_type
    if (key === 'sign' || key === 'sign_type') return acc;
    
    // Include non-empty values
    if (value !== '') {
      acc[key] = value.toString();
    }
    return acc;
  }, {} as Record<string, string>);

  // Generate signature
  const sign = generateSignature(formattedParams);

  // Return original params with sign and sign_type
  return {
    ...params,
    sign,
    sign_type: 'MD5'
  };
}

export async function submitApiPayment(params: Omit<ApiPaymentParams, 'sign' | 'sign_type'>): Promise<PaymentResponse> {
  // Format parameters
  const baseParams = {
    pid: params.pid.toString(),
    type: params.type || 'alipay',
    out_trade_no: params.out_trade_no || Date.now().toString(),
    notify_url: params.notify_url,
    return_url: params.return_url,
    name: params.name,
    money: parseFloat(params.money).toFixed(2),
    clientip: params.clientip,
    device: params.device || 'pc'
  };

  console.log('Submitting payment with params:', baseParams);
  const signedParams = buildRequestParams(baseParams);
  console.log('Signed params:', signedParams);
  
  // Convert params to URLSearchParams
  const formData = new URLSearchParams();
  Object.entries(signedParams).forEach(([key, value]) => {
    // Don't encode notify_url and return_url as they're already encoded
    if (key === 'notify_url' || key === 'return_url') {
      formData.append(key, decodeURIComponent(value));
    } else {
      formData.append(key, value);
    }
  });
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/mapi.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': '',
      'Origin': ''
    },
    referrerPolicy: 'no-referrer',
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error('Payment request failed');
  }

  const data = await response.json();
  if (typeof data === 'string' && data.includes('Fatal error')) {
    throw new Error(data);
  }

  return data;
}

export function getClientIp(): Promise<string> {
  return fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => data.ip)
    .catch(() => '127.0.0.1');
}

export function detectDevice(): 'pc' | 'mobile' | 'qq' | 'wechat' | 'alipay' | 'jump' {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/micromessenger/.test(ua)) return 'wechat';
  if (/qq/.test(ua)) return 'qq';
  if (/alipay/.test(ua)) return 'alipay';
  if (/mobile/.test(ua)) return 'mobile';
  return 'pc';
}
