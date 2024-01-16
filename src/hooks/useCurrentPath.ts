import { matchRoutes, useLocation } from "react-router-dom"

const routes = [
  { path: "/" },
  { path: "/my-assets" },
  { path: "/collections" },
  { path: "/stake" },
  { path: "/bridge" },
  { path: "/bridge/:bridgeSelection" },
  { path: "/bridge/:bridgeSelection/:bridgeAction/:transactionHash" },
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