export {};

declare global {
  interface Window {
    skldbg: Readonly<{
      platform: string;
    }>;
  }
}
