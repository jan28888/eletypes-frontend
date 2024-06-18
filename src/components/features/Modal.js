import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import '../../style/Modal.css';

const ModalComponent = ({ open, handleClose, historyList, handleHistoryListChange}) => {
    const handleClick = (e) => {
        if (e.target.className ==='modal-book') {
            let selectedBook=historyList.filter(element => element.label === e.target.innerText)[0];
            console.log(e.target.innerText);
            console.log(selectedBook);
            handleHistoryListChange(selectedBook);
            handleClose();
        }
    }
    return (
        <Modal
            className="modal"
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className="modal-main">
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    LIBRARY
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    This is the modal content.
                </Typography>
                <div className="modal-box" onClick={handleClick}>
                    {
                        historyList.map(element =>
                        (<div className="modal-book">
                            <span>{element.label}</span>
                        </div>)
                        )
                    }
                </div>
                <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2 }}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default ModalComponent;
