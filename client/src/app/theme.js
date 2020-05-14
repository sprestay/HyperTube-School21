import { createMuiTheme } from '@material-ui/core';
import purple from '@material-ui/core/colors/purple';
import amber from '@material-ui/core/colors/amber';
import red from '@material-ui/core/colors/red';

export function createHypertubeTheme() {
  return createMuiTheme({
    palette: {
      primary: {
        light: purple[600],
        main: purple[700],
        dark: purple[800]
      },
      secondary: {
        light: amber[300],
        main: amber[700],
        dark: amber[800],
      },
      error: red,
    },
  });
}