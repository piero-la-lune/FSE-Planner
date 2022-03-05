import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import ReactTour from 'reactour';

import Storage from './Storage.js';

const storage = new Storage();

const styles = {
  button: {
    marginRight: 2
  }
};

function TourStep(props) {

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
      {props.title &&
        <Typography
          variant="h6"
          sx={{
            marginBottom: 2,
            paddingRight: 2
          }}
        >
          {props.title}
        </Typography>
      }
      {typeof props.text === 'string' ?
        <Typography variant="body2">{props.text}</Typography>
      :
        <React.Fragment>
          {props.text.map((text, id) => <Typography key={id} variant="body2" sx={{marginBottom: 2}}>{text}</Typography>)}
        </React.Fragment>
      }
      <Box sx={{marginTop: 2}}>
        {props.step > 1 && <Button color="secondary" onClick={handlePrev} disableFocusRipple={true} sx={styles.button}>Back</Button>}
        {props.skip && <Button color="secondary" onClick={props.skip} disableFocusRipple={true} sx={styles.button}>Skip tutorial</Button>}
        {props.end ?
          <Button color="primary" variant="contained" onClick={props.end} disableFocusRipple={true} sx={styles.button}>Done</Button>
        :
          <Button color="primary" variant="contained" onClick={handleNext} disableFocusRipple={true} sx={styles.button}>Next</Button>
        }
      </Box>
    </div>
  );
}



function Tour({ setUpdatePopup, updatePopup, isTourOpen, setIsTourOpen }) {

  const isUpdatePopupOpen = React.useRef(false);
  const wasUpdatePopupOpen = React.useRef(false);
  const wasTourOpen = React.useRef(false);
  React.useEffect(() => {
    isUpdatePopupOpen.current = updatePopup;
  }, [updatePopup]);
  React.useEffect(() => {
    if (isTourOpen) {
      wasUpdatePopupOpen.current = isUpdatePopupOpen.current;
      wasTourOpen.current = true;
      setUpdatePopup(false);
    }
    else if (wasTourOpen.current) {
      setUpdatePopup(wasUpdatePopupOpen.current);
    }
  }, [isTourOpen, setUpdatePopup]);

  const steps =[
    {
      content: ({goTo}) =>
        <TourStep
          step={1}
          title="Welcome aboard FSE Planner!"
          text="This quick tour will show you the main features of this application."
          goTo={goTo}
          skip={() => goTo(9)}
        />
    },
    {
      selector: '[data-tour="Step2"]',
      content: ({goTo}) =>
        <TourStep
          step={2}
          title="Step 1: Loading jobs"
          text="First, you have to load jobs from FSE. Click here to open the data update popup."
          goTo={goTo}
          onNext={() => setUpdatePopup(true)}
        />
    },
    {
      content: ({goTo}) =>
        <TourStep
          step={3}
          text="This popup allows you to load and update different type of data from FSE."
          goTo={goTo}
          onPrev={() => setUpdatePopup(false)}
        />
    },
    {
      selector: '[data-tour="Step4"]',
      content: ({goTo}) =>
        <TourStep
          step={4}
          text="You have to first enter your FSE Read Access Key."
          goTo={goTo}
        />
    },
    {
      selector: '[data-tour="Step5"]',
      content: ({goTo}) =>
        <TourStep
          step={5}
          text="You can now select an area to load jobs from. Click on Update to start the loading process."
          goTo={goTo}
        />
    },
    {
      selector: '[data-tour="Step6"]',
      content: ({goTo}) =>
        <TourStep
          step={6}
          text="You can also display airports where a plane is available for rental."
          goTo={goTo}
          onNext={() => setUpdatePopup(false)}
        />
    },
    {
      selector: '[data-tour="Step7"]',
      content: ({goTo}) =>
        <TourStep
          step={7}
          title="Step 2: Filtering jobs"
          text={[
            "Jobs are now loaded and displayed on the map, but it is often a mess since there are so many jobs available. Use the filters in the top bar to reduce the number of jobs displayed on the map."
          ]}
          goTo={goTo}
          onPrev={() => setUpdatePopup(true)}
        />
    },
    {
      selector: '[data-tour="Step8"]',
      content: ({goTo}) =>
        <TourStep
          step={8}
          title="Map layers"
          text="You can display more usefull layers on the map, such as MSFS airports or FSE airports landing areas."
          goTo={goTo}
        />
    },
    {
      selector: '[data-tour="Step9"]',
      content: ({goTo}) =>
        <TourStep
          step={9}
          title="Route finding"
          text={[
            "Click here to open the Route Finder.",
            "The Route Finder will allow you to find the best paying multi-hop multi-assignment routes."
          ]}
          goTo={goTo}
        />
    },
    {
      selector: '[data-tour="Step10"]',
      content: ({goTo}) =>
        <TourStep
          step={10}
          title="Your turn!"
          text="You can launch again this tutorial or review the changelog and credits here."
          goTo={goTo}
          end={() => {
            goTo(0);
            setIsTourOpen(false);
            storage.set('tutorial', process.env.REACT_APP_VERSION);
          }}
        />
    },
  ];

  return (
    <ReactTour
      steps={steps}
      isOpen={isTourOpen}
      onRequestClose={() => setIsTourOpen(false)}
      showNavigation={false}
      disableInteraction={true}
      disableFocusLock={true}
      showButtons={false}
      closeWithMask={false}
      showCloseButton={false}
    />

  );


}



export default Tour;
