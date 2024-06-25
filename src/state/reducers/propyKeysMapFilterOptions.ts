import {
  IPropyKeysMapFilterOptions,
} from '../../interfaces';

interface ISetMapFilterOptions {
  type: string;
  filterOptions: IPropyKeysMapFilterOptions;
}

const defaultState : IPropyKeysMapFilterOptions = {
  onlyListedHomes: false,
  onlyLandmarks: false,
}

const propyKeysMapFilterOptions = (state = defaultState, action: ISetMapFilterOptions) => {
  switch (action.type) {
      case 'SET_PROPYKEYS_MAP_FILTER_OPTIONS':
        let newValue = Object.assign({}, action.filterOptions);
        return newValue;
      default:
          return state
  }
}

export default propyKeysMapFilterOptions;