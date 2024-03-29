interface ISetDarkMode {
    type: string;
    active: boolean;
}
const setDarkMode = (state = false, action: ISetDarkMode) => {
    switch (action.type) {
        case 'SET_DARK_MODE':
            return action.active
        default:
            return state
    }
}

export default setDarkMode;