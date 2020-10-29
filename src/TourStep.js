import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  buttons: {
    marginTop: theme.spacing(2)
  },
  button: {
    marginRight: theme.spacing(2)
  }
}));



function TourStep(props) {

  const classes = useStyles();

  const handleNext = () => {
    if (props.onNext) {
      props.onNext();
    }
    props.goTo(props.step);
  };
  const handlePrev = () => {
    if (props.onPrev) {
      props.onPrev();
    }
    props.goTo(props.step-2)
  }

  return (
    <div>
      {props.title && <Typography variant="h6" className={classes.title}>{props.title}</Typography>}
      {typeof props.text === 'string' ?
        <Typography variant="body2">{props.text}</Typography>
      :
        props.text
      }
      <div className={classes.buttons}>
        {props.step > 1 && <Button color="secondary" onClick={handlePrev} disableFocusRipple={true} className={classes.button}>Back</Button>}
        {props.skip && <Button color="secondary" onClick={props.skip} disableFocusRipple={true} className={classes.button}>Skip tutorial</Button>}
        {props.end ? 
          <Button color="primary" variant="contained" onClick={props.end} disableFocusRipple={true} className={classes.button}>Done</Button>
        :
          <Button color="primary" variant="contained" onClick={handleNext} disableFocusRipple={true} className={classes.button}>Next</Button>
        }
      </div>
    </div>
  );
}

export default TourStep;