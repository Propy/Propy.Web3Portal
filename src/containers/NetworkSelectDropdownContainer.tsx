import { connect, ConnectedProps } from 'react-redux';

import { setShowLeftMenu, setDarkMode, setActiveNetwork } from '../state/actions';

import NetworkSelectDropdown from '../components/NetworkSelectDropdown';

import {
  SupportedNetworks,
} from '../interfaces';

interface RootState {
  showLeftMenu: boolean;
  darkMode: boolean;
  activeNetwork: SupportedNetworks;
}
  
const mapStateToProps = (state: RootState) => ({
  showLeftMenu: state.showLeftMenu,
  darkMode: state.darkMode,
  activeNetwork: state.activeNetwork
})
  
const mapDispatchToProps = {
  setShowLeftMenu,
  setDarkMode,
  setActiveNetwork,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(NetworkSelectDropdown)