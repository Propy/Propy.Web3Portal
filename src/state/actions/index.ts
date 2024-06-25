import {
    SupportedNetworks,
    IPropyKeysMapFilterOptions,
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