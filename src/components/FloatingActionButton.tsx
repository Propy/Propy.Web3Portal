import React from 'react'

import Fab from '@mui/material/Fab';
import Checkbox from '@mui/material/Checkbox';
import UncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckedIcon from '@mui/icons-material/TaskAlt';
import CircularProgress from '@mui/material/CircularProgress';

interface IFloatingActionButton {
  id?: string
  text: string
  checkboxMode?: boolean
  checked?: boolean
  size?: 'large' | 'medium' | 'small'
  buttonColor?: 'primary' | 'secondary' | "default" | "info" | "warning" | "error"
  textColor?: string
  className?: string
  component?: "button" | "div"
  variant?: "extended" | "circular"
  disabled?: boolean
  onClick?: () => void
  showLoadingIcon?: boolean
}

const getCircularProgressColor = (color: IFloatingActionButton["buttonColor"]) => {
  if(color === 'primary') {
    return '#bdbdbd';
  }
  return "";
}

const FloatingActionButton = (props: IFloatingActionButton) => {

    const {
      id,
      text,
      checkboxMode = false,
      checked = false,
      size = "medium",
      buttonColor = 'primary',
      textColor = "white",
      className = "",
      component = "button",
      variant = "extended",
      disabled = false,
      showLoadingIcon = false,
      onClick,
    } = props;

    return (
      <Fab 
        component={component}
        disabled={disabled}
        variant={variant}
        className={className}
        onClick={() => onClick && onClick()}
        size={size}
        color={buttonColor}
        style={{color: textColor, lineHeight: 1.1}}
        {...(id && { id })}
      >
        {showLoadingIcon &&
          <CircularProgress color="inherit" style={{height: '18px', width: '18px', marginRight: '8px', color: getCircularProgressColor(buttonColor)}} />
        }
        {checkboxMode &&
          <Checkbox
            checked={checked}
            icon={<UncheckedIcon />}
            checkedIcon={<CheckedIcon />}
            style={{
              color: textColor,
              left: '10px',
              position: 'absolute',
            }}
          />
        }
        <span style={{padding: checkboxMode ? 20 : 0}}>{text}</span>
      </Fab>
    )
}

export default FloatingActionButton;