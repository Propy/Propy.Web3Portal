import { connect, ConnectedProps } from 'react-redux';

import { setAgentApiConfig } from '../state/actions';

import { AgentApiKeyGate } from '../components/AgentApiConfigGate';

import {
  IAgentApiConfig,
} from '../interfaces';

interface RootState {
  agentApiConfig: IAgentApiConfig,
}
  
const mapStateToProps = (state: RootState) => ({
  agentApiConfig: state.agentApiConfig
})
  
const mapDispatchToProps = {
  setAgentApiConfig,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(AgentApiKeyGate)