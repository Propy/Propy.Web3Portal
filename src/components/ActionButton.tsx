import React from 'react'

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface IActionButton {
  id?: string
  text: string
  size?: 'large' | 'medium' | 'small'
  buttonColor?: "primary" | "secondary" | "info" | "inherit" | "success" | "error" | "warning"
  textColor?: string
  className?: string
  component?: "button" | "div"
  variant?: "contained" | "text" | "outlined"
  disabled?: boolean
  onClick?: () => void
  showLoadingIcon?: boolean
}

const getCircularProgressColor = (color: IActionButton["buttonColor"]) => {
  if(color === 'primary') {
    return '#bdbdbd';
  }
  return "";
}

const ActionButton = (props: IActionButton) => {

    const {
      id,
      text,
      size = "medium",
      buttonColor = 'primary',
      textColor,
      className = "",
      component = "button",
      variant = "outlined",
      disabled = false,
      showLoadingIcon = false,
      onClick,
    } = props;

    return (
      <Button
        component={component}
        disabled={disabled}
        variant={variant}
        className={className}
        onClick={() => onClick && onClick()}
        size={size}
        color={buttonColor}
        style={{
          ...(textColor && {color: textColor}),
          // lineHeight: 1.1
        }}
        {...(id && { id })}
      >
        {showLoadingIcon &&
          <CircularProgress color="inherit" style={{height: '18px', width: '18px', marginRight: '8px', color: getCircularProgressColor(buttonColor)}} />
        }
        <span style={{padding: 0}}>{text}</span>
      </Button>
    )
}

export default ActionButton;