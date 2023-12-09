import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import Storage from '../Storage.js';
const storage = new Storage();


function EditGroupsPopup (props) {
  const [name, setName] = React.useState('');
  const [id, setId] = React.useState('');

  const setGroups = arr => {
    props.setGroups(arr);
    storage.set('flightGroups', arr);
  }

  const handleClose = () => {
    props.handleClose();
    setName('');
    setId('');
  };

  const addGroup = () => {
    setGroups([...props.groups, [name, id]]);
    setName('');
    setId('');
  }

  return (
      <Dialog open={props.open} onClose={handleClose}>
        <DialogTitle>Edit groups</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Remove group</Typography>
          <Stack direction="row" spacing={1} sx={{my: 1}}>
            { props.groups.map(group => (
              <Chip
                label={group[0]}
                onDelete={() => {
                  setGroups(props.groups.filter(g => g[1] !== group[1]));
                }}
                key={group[1]}
              />
            )) }
          </Stack>
          <Typography variant="h6" sx={{mt: 4}}>Add new group</Typography>
          <TextField
            autoFocus
            label="Group name"
            fullWidth
            value={name}
            onChange={evt => setName(evt.target.value)}
            margin="normal"
          />
          <TextField
            label="Group ID"
            fullWidth
            value={id}
            onChange={evt => setId(evt.target.value)}
            margin="normal"
            helperText={<span>Browse to Group &gt; Assignments &gt; <i>My Group</i> and extract the group ID from the page URL: <i>https://server.fseconomy.net/groupassignments.jsp?groupid=</i><b>XXXX</b></span>}
          />
          <Button onClick={addGroup} disabled={!name || !id}>Add group</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">Done</Button>
        </DialogActions>
      </Dialog>

  );
}

function AddToFlight({onSubmit, ids, children, variant='contained', size='medium', btnSx={}, onGroupChange=null, defaultGroup=null, ...props}) {
  const [popup, setPopup] = React.useState(false);
  const [groups, setGroups] = React.useState(storage.get('flightGroups', []));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [group, setGroup] = React.useState(null);
  const anchorRef = React.useRef(null);
  const open = Boolean(anchorEl);

  const handleClick = (evt) => {
    setAnchorEl(anchorRef.current);
  }
  const handleClose = () => setAnchorEl(null);
  const addToGroup = g => {
    setGroup(g);
    setAnchorEl(null);
    if (onGroupChange) {
      onGroupChange(g);
    }
  }
  const editGroups = () => setPopup(true);
  const handleClosePopup = () => {
    // If selected group as been removed, fall back to My Assignments
    if (group && !groups.reduce((acc, g) => acc || g[1] === group[1], false)) {
      setGroup(null);
      if (onGroupChange) {
        onGroupChange(null);
      }
    }
    setPopup(false);
  }
  React.useEffect(() => {
    setGroups(storage.get('flightGroups', []));
    setGroup(defaultGroup);
  }, [defaultGroup]);

  return (
    <form
      action="https://server.fseconomy.net/userctl"
      method="post"
      target="fse"
      onSubmit={onSubmit}
      {...props}
    >
      <input type="hidden" name="event" value="Assignment" />
      <input type="hidden" name="type" value={group !== null ? 'move' : 'add'} />
      <input type="hidden" name="id" value="[object+RadioNodeList]" />
      <input type="hidden" name="groupid" value={group !== null ? group[1] : ''} />
      <input type="hidden" name="returnpage" value={group !== null ? '/groupassignments.jsp?groupid='+group[1]: '/myflight.jsp'} />
      {group !== null &&
        <input type="hidden" name="addToGroup" value={group[1]} />
      }
      {
        ids.map(id => <input type="hidden" name="select" value={id} key={id} />)
      }
      {children}
      {variant !== 'hidden' &&
        <ButtonGroup variant={variant} size={size} ref={anchorRef}>
          <Button type="submit" startIcon={<AddShoppingCartIcon />} sx={btnSx}>
            {group !== null ? 'Add to '+group[0] : 'Add to My Flight'}
          </Button>
          <Button
            size="small"
            onClick={handleClick}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      }
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => addToGroup(null)} selected={group === null}>Add to My Flight</MenuItem>
        {groups.map(([name, id]) => <MenuItem onClick={() => addToGroup([name, id])} key={id} selected={group && group[1] === id}>Add to {name}</MenuItem>)}
        <MenuItem onClick={editGroups}><i>Edit groups</i></MenuItem>
      </Menu>
      <EditGroupsPopup
        handleClose={handleClosePopup}
        open={popup}
        groups={groups}
        setGroups={setGroups}
      />
    </form>
  );
}

export default AddToFlight;
