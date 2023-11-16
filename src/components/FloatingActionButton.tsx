import React from 'react'

import Fab from '@mui/material/Fab';
import Checkbox from '@mui/material/Checkbox';
import UncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckedIcon from '@mui/icons-material/TaskAlt';

interface IFloatingActionButton {
  id?: string
  text: string
  checkboxMode?: boolean
  checked?: boolean
  size?: 'large' | 'medium' | 'small'
  buttonColor?: 'primary' | 'secondary' | "default"
  textColor?: string
  className?: string
  component?: "button" | "div"
  disabled?: boolean
  onClick?: () => void
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
      disabled = false,
      onClick,
    } = props;

    return (
      <Fab 
        component={component}
        disabled={disabled}
        variant="extended"
        className={className}
        onClick={() => onClick && onClick()}
        size={size}
        color={buttonColor}
        style={{color: textColor, lineHeight: 1.1}}
        {...(id && { id })}
      >
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