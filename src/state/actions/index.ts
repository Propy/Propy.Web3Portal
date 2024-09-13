import {
    SupportedNetworks,
    IPropyKeysMapFilterOptions,
    IFullScreenGalleryConfig,
} from '../../interfaces';

export const setShowLeftMenu = (visible: boolean) => ({
    type: "SHOW_LEFT_MENU",
    visible
})

export const setActiveAccount = (account: string) => ({
    type: "SET_ACTIVE_ACCOUNT",
    account
})

export const setDarkMode = (active: boolean) => ({
    type: "SET_DARK_MODE",
    active
})

export const setConsideredMobile = (mobile: boolean) => ({
    type: "IS_CONSIDERED_MOBILE",
    mobile
})

export const setConsideredMedium = (medium: boolean) => ({
    type: "IS_CONSIDERED_MEDIUM",
    medium
})

export const setActiveNetwork = (network: SupportedNetworks) => ({
    type: "SET_ACTIVE_NETWORK",
    network: network,
})

export const setPropyKeysMapFilterOptions = (filterOptions: IPropyKeysMapFilterOptions) => ({
    type: "SET_PROPYKEYS_MAP_FILTER_OPTIONS",
    filterOptions: filterOptions,
})

export const setFullScreenGalleryConfig = (fullScreenGalleryConfig: IFullScreenGalleryConfig) => ({
    type: "SET_FULL_SCREEN_GALLERY_CONFIG",
    fullScreenGalleryConfig: fullScreenGalleryConfig,
})

export const setsupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX = (supportAddressToWalletToTimestamp: {[key: string]: {[key: string]: number}}) => ({
    type: "SET_SUPPORT_ADDRESS_TO_WALLET_ADDRESS_TO_LAST_PUSH_CHAT_DISMISSED_TIMESTAMP_UNIX",
    supportAddressToWalletToTimestamp,
})