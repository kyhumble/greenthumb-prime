import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AddPlantDialog = ({ open, onClose }) => {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [plant, setPlant] = useState('');  // keeping this declaration

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add plant logic
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add a New Plant</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField 
                        label="Plant Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />
                    <TextField 
                        label="Species"
                        value={species}
                        onChange={(e) => setSpecies(e.target.value)}
                        fullWidth
                    />
                    {/* Remove duplicate plant declaration from here */}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button type="submit" color="primary">Add Plant</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPlantDialog;