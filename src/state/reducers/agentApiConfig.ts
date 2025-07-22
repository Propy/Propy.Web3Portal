import {
  IAgentApiConfig,
} from '../../interfaces';

interface ISetAgentApiConfig {
  type: string;
  agentApiConfig: IAgentApiConfig;
}

const agentApiConfig = (state = {}, action: ISetAgentApiConfig) => {
  switch (action.type) {
    case 'SET_AGENT_API_CONFIG':
      return action.agentApiConfig
    default:
      return state
  }
}

export default agentApiConfig;