import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
        >
            {/* El contenido de la página se mantiene intacto */}
            {children}

            {/* Telón que hace el fundido a negro suave */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(25, 25, 25, 1)',
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}
            />
        </motion.div>
    );
};

export default PageTransition;
