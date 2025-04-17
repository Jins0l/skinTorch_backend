class ApiResponse {
    static success(message = '', data = null) {
        return { success: true, message, data };
    }

    static error(message = '', data = null) {
        return { success: false, message, data };
    }
}

module.exports = ApiResponse;