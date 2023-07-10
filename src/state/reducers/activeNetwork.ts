import {
  SupportedNetworks,
} from '../../interfaces';

interface ISetActiveNetwork {
  type: string;
  network: SupportedNetworks;
}

const activeNetwork = (state = 'ethereum', action: ISetActiveNetwork) => {
  switch (action.type) {
    case 'SET_ACTIVE_NETWORK':
      return action.network
    default:
      return state
  }
}

export default activeNetwork;