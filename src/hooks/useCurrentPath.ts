import { matchRoutes, useLocation } from "react-router-dom"

const routes = [
  { path: "/" },
  { path: "/my-assets" },
  { path: "/web3-agent" },
  { path: "/collections" },
  { path: "/stake" },
  { path: "/stake/v1" },
  { path: "/stake/v2" },
  { path: "/bridge" },
  { path: "/bridge/:bridgeSelection" },
  { path: "/bridge/:bridgeSelection/:bridgeAction/:transactionHash" },
  { path: "/profile" },
  { path: "/profile/:profileAddressOrUsername" },
  // { path: "/example/:exampleParam" },
]

const useCurrentPath = () => {
  const location = useLocation()
  const match = matchRoutes(routes, location)

  if(match?.[0]?.route?.path) {
    return match?.[0]?.route?.path;
  } else {
    return ''
  }
}

export default useCurrentPath;