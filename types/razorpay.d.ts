export interface RazorpayInstance {
  on: (event: string, callback: (response: any) => void) => void;
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export {};

