# minikit-js-template

Template repository for building a mini app in vanilla JS

## MiniKit delivery

Here we opted for a CDN delivery of MiniKit. You can also of course use the NPM package - see the [React template](https://github.com/worldcoin/minikit-react-template) for reference.

## Development modes

The frontend now distinguishes between two environments via `VITE_ENVIRONMENT` (defaults to `local`):

- **Local (`local`)**: Run with Vite in a normal browser. MiniKit is usually not available, so verification and payments are simulated. The UI remains usable for tournaments/leaderboard testing, and MetaMask is only queried if present (to prefill a wallet) without throwing errors when the extension is missing.
- **World App (`worldapp`)**: MiniKit is expected to be installed. Real verification and payment flows are executed. If MiniKit is absent, the UI surfaces a clear message instead of throwing.

MetaMask integration is hardened: the code checks for `window.ethereum` before requesting accounts and logs a warning instead of throwing if the extension is missing.
