import React from 'react';

import { Link } from "react-router-dom";

import { ExternalLink } from './ExternalLink';

interface ILinkWrapper {
  link?: string,
  external?: boolean,
  className?: string,
  children: React.ReactNode,
  onClick?: () => void,
}

// we use this component to dynamically handle internal links and external links

const LinkWrapper = (props: ILinkWrapper) => {
  const {
    link,
    external = false,
    className,
    children,
    onClick,
  } = props;
  if(external && link) {
    return (
      <ExternalLink className={className} href={link}>
        {children}
      </ExternalLink>
    )
  }
  if(!external && link) {
    return (
      <Link onClick={() => onClick && onClick()} className={[className, 'no-decorate', 'inherit-color'].join(" ")} to={`/${link}`}>
        {children}
      </Link>
    )
  }
  return (
    <>
      {children}
    </>
  );
}

export default LinkWrapper;