import {
    Chain,
    Wallet,
    getWalletConnectConnector,
} from '@rainbow-me/rainbowkit';
import okxLogo from "../assets/images/okx.jpg";

export const OKX = ({ chains } : any) => ({
    id: 'okx-wallet',
    name: 'OKX Wallet',
    iconUrl: okxLogo,
    iconBackground: '#000000',
    downloadUrls: {
        android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp&pli=1',
        ios: 'https://apps.apple.com/by/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        qrCode: 'https://www.okx.com/download',
    },
    createConnector: () => {
        const connector = getWalletConnectConnector({ chains });
        return {
            connector,
            mobile: {
                getUri: async () => {
                    const { uri } = (await connector.getProvider()).connector;
                    return uri;
                },
            },
            qrCode: {
                getUri: async () =>
                    (await connector.getProvider()).connector.uri,
                instructions: {
                    learnMoreUrl: 'https://www.okx.com/',
                    steps: [
                        {
                            description:
                                'We recommend putting OKX on your home screen for faster access to your wallet.',
                            step: 'install',
                            title: 'Open the OKX app',
                        },
                        {
                            description:
                                'After you scan, a connection prompt will appear for you to connect your wallet.',
                            step: 'scan',
                            title: 'Tap the scan button',
                        },
                    ],
                },
            },
        };
    },
});
