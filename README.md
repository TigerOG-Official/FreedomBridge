# Freedom Bridge

A cross-chain token bridge UI for moving OG tokens (TigerOG, LionOG, FrogOG) between blockchains using [Axelar Interchain Token Service (ITS)](https://axelar.network/).

## Features

- **Cross-Chain Bridging** - Transfer tokens seamlessly between 7 supported networks
- **Token Migration** - Upgrade legacy tokens to interchain-enabled versions
- **80+ Languages** - Full internationalization support
- **Multiple Themes** - Choose from 13 visual themes
- **Self-Custody** - Connect your own wallet; no funds are ever held by the app
- **Runs Locally** - Download and run entirely on your machine

## For Users

Download the latest release for your platform - no development tools required.

| Platform | Download | Requirements |
|----------|----------|--------------|
| macOS | `MacOS.zip` | None (uses built-in Apache) |
| Windows | `freedom-bridge_*_windows_*.zip` | None (single binary) |
| Linux | `freedom-bridge_*_linux_*.tar.gz` | None (single binary) |

### Quick Start

1. Download the package for your OS from [Releases](../../releases)
2. Extract the archive
3. Run:
   - **macOS**: Double-click `Start Freedom Bridge Server.scpt`
   - **Windows**: Double-click `freedom-bridge.exe`
   - **Linux**: Run `./freedom-bridge`
4. Your browser opens automatically to `http://localhost:4173`
5. Connect your wallet and start bridging

## For Developers

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/TigerOG-Dev/FreedomBridge.git
cd FreedomBridge

# Install dependencies
npm install

# Copy environment example and configure
cp .env.example .env
# Edit .env with your WalletConnect Project ID

# Start development server
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `./build-release.sh` | Build macOS package |
| `./build-release.sh --all` | Build all platforms (requires Go + goreleaser) |

### Building Release Packages

**macOS only** (no extra dependencies):
```bash
npm run build
./build-release.sh
```

**All platforms** (requires [Go 1.21+](https://go.dev/doc/install) and [goreleaser](https://goreleaser.com/install/)):
```bash
npm run build
./build-release.sh --all
```

This creates:
- `release/MacOS.zip` - AppleScript-based launcher (no code signing needed)
- `dist/freedom-bridge_*_linux_*.tar.gz` - Single binary for Linux
- `dist/freedom-bridge_*_windows_*.zip` - Single binary for Windows

### Environment Variables

See `.env.example` for required configuration:

- `VITE_WALLETCONNECT_PROJECT_ID` - Your WalletConnect Cloud project ID

## Supported Chains

| Chain | Network | Chain ID |
|-------|---------|----------|
| BNB Chain | Mainnet | 56 |
| Ethereum | Mainnet | 1 |
| Base | Mainnet | 8453 |
| Linea | Mainnet | 59144 |
| Polygon | Mainnet | 137 |
| Avalanche | Mainnet | 43114 |
| XRPL EVM | Mainnet | 1440000 |

## Supported Tokens

All tokens are deployed as Axelar Interchain Tokens with consistent addresses across all supported chains.

| Token | Symbol | Decimals | Canonical Chain |
|-------|--------|----------|-----------------|
| TigerOG | TIGEROG | 9 | BNB Chain |
| LionOG | LIONOG | 9 | BNB Chain |
| FrogOG | FROGOG | 9 | BNB Chain |

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Wallet**: RainbowKit + wagmi + viem
- **Cross-Chain**: Axelar ITS
- **i18n**: i18next
- **Animations**: Motion

## License

MIT
