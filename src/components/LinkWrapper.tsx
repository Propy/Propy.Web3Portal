import React from 'react';

import { Link } from "react-router-dom";

import ExternalLinkIcon from '@mui/icons-material/Launch';

import { ExternalLink } from './ExternalLink';

interface ILinkWrapper {
  link?: string,
  external?: boolean,
  className?: string,
  children: React.ReactNode,
  onClick?: () => void,
  showExternalLinkIcon?: boolean,
  style?: {[key: string]: string},
}

// we use this component to dynamically handle internal links and external links

const LinkWrapper = (props: ILinkWrapper) => {
  const {
    link,
    external = false,
    className,
    children,
    onClick,
    showExternalLinkIcon = false,
    style = {},
  } = props;
  if(external && link) {
    return (
      <ExternalLink className={[className, 'no-decorate', 'inherit-color'].join(" ")} style={{display: 'flex', alignItems: 'center', ...style}} href={link}>
        {children}
        {showExternalLinkIcon &&
          <ExternalLinkIcon style={{marginLeft: 4}} />
        }
      </ExternalLink>
    )
  }
  if(!external && link) {
    return (
      <Link onClick={() => onClick && onClick()} style={style} className={[className, 'no-decorate', 'inherit-color'].join(" ")} to={`/${link}`}>
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