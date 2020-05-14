import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from '@reach/router'
import ts from './translate'
import russianFlagImg from './assets/images/flag_rus.png'
import englishFlagImg from './assets/images/flag_en.png'
import { useMediaQuery } from '@material-ui/core'

import {
  MenuItem,
  makeStyles,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Menu,
  AppBar as MuiAppBar,
} from '@material-ui/core'
import {
  Person,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),

  },
  title: {
    flexGrow: 1,
    'text-align': 'center',
  },
  langSwitch: {
    width: '40px',
    height: '100%',
  },
  langImg: {
    width: '30px',
  },
}))

const AppBar = ({
  auth,
  onChangeLang,
  onClickLogout,
  lang,
}) => {
  const classes = useStyles()
  const mediaSmall = useMediaQuery('(max-width:600px)')
  const [anchorElem, setAnchorElem] = useState(null)
  const [activeMenu, setActiveMenu] = useState('')

  /*  side effect for active menu  */
  useEffect(() => {
    // close and reset menu infos only if it is the account menu.
    // do not apply this behaviour for language menu.
    if (!!mediaSmall === false && activeMenu === 'accountMenu') {
      setActiveMenu('')
      setAnchorElem(null)
    }
  }, [mediaSmall, activeMenu])

  const handleClose = () => setAnchorElem(null)

  const langMenuItems = [
    { name: 'eng', selected: 'eng' === lang, img: englishFlagImg },
    { name: 'ru', selected: 'ru' === lang, img: russianFlagImg },
  ]

  const handleLangMenu = item => {
    onChangeLang(item)
    handleClose()
  }

  const handlemenu = (e, menu) => {
    setAnchorElem(e.currentTarget)
    setActiveMenu(menu)
  }

  const langSection = (
    <div>
      <IconButton onClick={e => handlemenu(e, 'langMenu')}>
        <img className={classes.langImg} src={lang === 'eng' ? englishFlagImg : russianFlagImg}
             alt={lang.name}/>
      </IconButton>
      <Menu
        id="lang-menu"
        anchorEl={anchorElem}
        keepMounted
        open={!!anchorElem && activeMenu === 'langMenu'}
        onClose={handleClose}
      >
        {langMenuItems.map(lang => (
          <MenuItem
            key={lang.name}
            onClick={() => handleLangMenu(lang.name)}
            selected={lang.selected}
          >
            <img className={classes.langImg} src={lang.img} alt={lang.name}/>
          </MenuItem>
        ))}
      </Menu>
    </div>
  )

  const authSection = mediaSmall ? (
    <>
      <IconButton onClick={e => handlemenu(e, 'accountMenu')}>
        <Person/>
      </IconButton>
      <Menu
        id="lang-menu"
        anchorEl={anchorElem}
        keepMounted
        open={!!anchorElem && activeMenu === 'accountMenu'}
        onClose={handleClose}
        onClick={handleClose}
      >
        <MenuItem>
          <RouterLink to="/profil">
            {ts.navbar.profil[lang]}
          </RouterLink>
        </MenuItem>
        <MenuItem onClick={onClickLogout}>
          {ts.navbar.logout[lang]}
        </MenuItem>
      </Menu>
    </>
  ) : (
    <>
      <RouterLink to="/profil">
        <Button>
          {ts.navbar.profil[lang]}
        </Button>
      </RouterLink>
      <Button
        onClick={onClickLogout}
        color="inherit"
      >
        {ts.navbar.logout[lang]}
      </Button>
    </>
  )

  return (
    <header className={classes.root}>
      <MuiAppBar position="static">
        <Toolbar style={{ height: '90px' }}>
          <RouterLink to="/">
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <Typography variant="h6" className={classes.title}>
                {mediaSmall ? '#HT' : 'Hypertube'}
              </Typography>
            </IconButton>
          </RouterLink>
          {langSection}
          {auth && authSection}
        </Toolbar>
      </MuiAppBar>
    </header>
  )
}

export default AppBar
