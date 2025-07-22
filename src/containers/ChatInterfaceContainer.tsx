import { connect, ConnectedProps } from 'react-redux';

import { ChatInterface } from '../components/ChatInterface';

import {
  IAgentApiConfig,
  SupportedNetworks,
} from '../interfaces';

interface RootState {
  agentApiConfig: IAgentApiConfig,
  activeNetwork: SupportedNetworks,
  isConsideredMobile: boolean,
}
  
const mapStateToProps = (state: RootState) => ({
  agentApiConfig: state.agentApiConfig,
  activeNetwork: state.activeNetwork,
  isConsideredMobile: state.isConsideredMobile,
})
  
const mapDispatchToProps = {}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(ChatInterface)