import React from 'react';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { matchSorter } from 'match-sorter';

const PopperMy = function (props) {
  return (<Popper {...props} style={{ width: 400 }} placement='bottom-start' />)
}

function IcaoSearch({options, label, required = false, inputProps = {}, ...props }) {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(a) => a.icao ? a.icao : ''}
      renderOption={(props, a) =>
        <li {...props}>
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <Box
              component="b"
              sx={{
                minWidth: 40,
                textAlign: 'center'
              }}
            >
              {a.icao}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                component="span"
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                {a.name}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  color: '#aaa'
                }}
              >
                {a.city}, {a.state ? a.state+', ' : ''}{a.country}
              </Typography>
            </Box>
          </Box>
        </li>
      }
      filterOptions={(options, params) => {
        return matchSorter(options, inputValue, {
          keys: [{threshold: matchSorter.rankings.STARTS_WITH, key: 'icao'}, 'name', 'city'],
        }).slice(0, 5);
      }}
      renderInput={(params) =>
        <TextField
          {...params}
          label={label}
          variant="outlined"
          placeholder="ICAO"
          required={required ? true : false}
          {...inputProps}
        />
      }
      PopperComponent={PopperMy}
      autoHighlight={true}
      selectOnFocus={false}
      inputValue={inputValue}
      onInputChange={(evt, value) => setInputValue(value)}
      {...props}
    />
  );
}

export default IcaoSearch;
