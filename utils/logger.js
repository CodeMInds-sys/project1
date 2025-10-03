const Logger = {
    info: (message, data = {}) => {
        console.log('\x1b[36m%s\x1b[0m', '📝 INFO:', message, data);
    },
    
    error: (message, data = {}) => {
        console.error('\x1b[31m%s\x1b[0m', '❌ ERROR:', message, data);
    },
    
    warn: (message, data = {}) => {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARN:', message, data);
    },
    
    debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug('\x1b[32m%s\x1b[0m', '🔍 DEBUG:', message, data);
        }
    } 
};

module.exports = Logger; 