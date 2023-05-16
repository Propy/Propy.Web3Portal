interface IConsidredMedium {
  type: string;
  medium: boolean;
}
const isConsideredMedium = (state = false, action: IConsidredMedium) => {
  switch (action.type) {
      case 'IS_CONSIDERED_MEDIUM':
          return action.medium
      default:
          return state
  }
}

export default isConsideredMedium;