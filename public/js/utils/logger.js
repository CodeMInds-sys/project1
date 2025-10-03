const Logger = {
    info: (message, data = null) => {
        console.log(`🟦 INFO [${new Date().toISOString()}]:`, message);
        if (data) console.log(data);
    },

    error: (message, error = null) => {
        console.error(`🟥 ERROR [${new Date().toISOString()}]:`, message);
        if (error) {
            console.error('Error details:', error);
            if (error.stack) console.error('Stack trace:', error.stack);
        }
    },

    warn: (message, data = null) => {
        console.warn(`🟨 WARNING [${new Date().toISOString()}]:`, message);
        if (data) console.warn(data);
    },

    debug: (message, data = null) => {
        console.debug(`⬜ DEBUG [${new Date().toISOString()}]:`, message);
        if (data) console.debug(data);
    }
}; 