import { connect, ConnectedProps } from 'react-redux';

import {
    setConsideredMobile,
    setConsideredMedium,
} from '../state/actions';

import App from '../components/App';

interface RootState {
    darkMode: boolean
}
  
const mapStateToProps = (state: RootState) => ({
    darkMode: state.darkMode
})

const mapDispatchToProps = {
    setConsideredMobile,
    setConsideredMedium,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(App)