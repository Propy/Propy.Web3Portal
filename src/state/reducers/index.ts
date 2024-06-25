import {combineReducers} from 'redux';
import showLeftMenu from './showLeftMenu';
import activeAccount from './activeAccount';
import darkMode from './darkMode';
import isConsideredMobile from './isConsideredMobile';
import isConsideredMedium from './isConsideredMedium';
import activeNetwork from './activeNetwork';
import propyKeysMapFilterOptions from './propyKeysMapFilterOptions';

const rootReducer = combineReducers({
    showLeftMenu,
    activeAccount,
    darkMode,
    isConsideredMobile,
    isConsideredMedium,
    activeNetwork,
    propyKeysMapFilterOptions,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;