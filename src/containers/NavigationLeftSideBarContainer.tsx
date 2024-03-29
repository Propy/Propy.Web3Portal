import { connect, ConnectedProps } from 'react-redux';

import { setShowLeftMenu } from '../state/actions';

import NavigationLeftSideBar from '../components/NavigationLeftSideBar';

interface RootState {
    showLeftMenu: boolean
    darkMode: boolean
}
  
const mapStateToProps = (state: RootState) => ({
    showLeftMenu: state.showLeftMenu,
    darkMode: state.darkMode,
})
  
const mapDispatchToProps = {
    setShowLeftMenu
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(NavigationLeftSideBar)