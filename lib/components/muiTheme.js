import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { grey500 } from 'material-ui/styles/colors';

// TODO: I should clone it.
const theme = lightBaseTheme;

theme.palette.borderColor = grey500;

const muiTheme = getMuiTheme(lightBaseTheme);

export default muiTheme;
