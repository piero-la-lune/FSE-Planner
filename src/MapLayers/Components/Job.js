import React from 'react';
import JobSegment from "./JobSegment.js";
import Typography from '@material-ui/core/Typography';
import NavigationIcon from '@material-ui/icons/Navigation';
import { makeStyles } from '@material-ui/core/styles';

import ReactDOM from "react-dom";


const useStyles = makeStyles(theme => ({
  myflight: {
    marginTop: theme.spacing(1)
  },
  icon: {
    display: 'flex',
    alignItems: 'center'
  }
}));

// Generate amount p
function Cargo({cargo, pay, dir}) {
  const classes = useStyles();
  return (
    <Typography variant="body2" className={classes.icon}>
      <NavigationIcon fontSize="inherit" style={{transform: 'rotate('+dir+'deg'}} />
      {cargo.passengers > 0 && <span>&nbsp;{cargo.passengers} passengers</span>}
      {cargo.kg > 0 && <span>&nbsp;{cargo.kg} kg</span>}
      &nbsp;(${pay})
    </Typography>
  );
}

// Generate tooltip
function Tooltip({leg, type, rleg}) {
  const classes = useStyles();
  return (
    <div>
      <Typography variant="body1"><b>{leg.distance}NM</b></Typography>
      { leg.amount > 0 && <Cargo cargo={{[type]: leg.amount}} pay={leg.pay} dir={leg.direction} /> }
      { rleg && rleg.amount > 0 && <Cargo cargo={{[type]: rleg.amount}} pay={rleg.pay} dir={rleg.direction} /> }
      { (leg.flight || (rleg && rleg.flight)) &&
        <div>
          <Typography variant="body1" className={classes.myflight}><b>My flight</b></Typography>
          {leg.flight && <Cargo cargo={leg.flight} pay={leg.flight.pay} dir={leg.direction} />}
          {rleg && rleg.flight && <Cargo cargo={rleg.flight} pay={rleg.flight.pay} dir={rleg.direction} />}
        </div>
      }
    </div>
  );
}


// Generate all components to render leg
function Job(props) {

  // Add line
  return new JobSegment(props.positions, {
    weight: props.weight,
    color: props.color,
    highlight: props.highlight,
    bothWays: props.rleg
  })
    .bindTooltip(() => {
      var div = document.createElement('div');
      ReactDOM.render(<Tooltip {...props} />, div);
      return div;
    }, {sticky: true});

}


export default Job;