interface IConsidredMobile {
  type: string;
  mobile: boolean;
}
const isConsideredMobile = (state = false, action: IConsidredMobile) => {
  switch (action.type) {
      case 'IS_CONSIDERED_MOBILE':
          return action.mobile
      default:
          return state
  }
}

export default isConsideredMobile;