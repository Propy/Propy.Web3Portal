import {combineReducers} from 'redux';
import showLeftMenu from './showLeftMenu';
import activeAccount from './activeAccount';
import darkMode from './darkMode';
import isConsideredMobile from './isConsideredMobile';
import isConsideredMedium from './isConsideredMedium';

const rootReducer = combineReducers({
    showLeftMenu,
    activeAccount,
    darkMode,
    isConsideredMobile,
    isConsideredMedium,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;