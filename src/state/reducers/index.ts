import {combineReducers} from 'redux';
import showLeftMenu from './showLeftMenu';
import activeAccount from './activeAccount';
import darkMode from './darkMode';
import isConsideredMobile from './isConsideredMobile';
import isConsideredMedium from './isConsideredMedium';
import activeNetwork from './activeNetwork';
import propyKeysMapFilterOptions from './propyKeysMapFilterOptions';
import fullScreenGalleryConfig from './fullScreenGalleryConfig';
import supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX from './supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX';
import agentApiConfig from './agentApiConfig';

const rootReducer = combineReducers({
    showLeftMenu,
    activeAccount,
    darkMode,
    isConsideredMobile,
    isConsideredMedium,
    activeNetwork,
    propyKeysMapFilterOptions,
    fullScreenGalleryConfig,
    supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
    agentApiConfig,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;