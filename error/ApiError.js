class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }

    // Метод для создания ошибки с кодом 400 - Bad Request
    static badRequest(message) {
        return new ApiError(400, message);
    }

    // Метод для создания ошибки с кодом 401 - Unauthorized
    static unauthorized(message) {
        return new ApiError(401, message);
    }

    // Метод для создания ошибки с кодом 403 - Forbidden
    static forbidden(message) {
        return new ApiError(403, message);
    }

    // Метод для создания ошибки с кодом 404 - Not Found
    static notFound(message) {
        return new ApiError(404, message);
    }

    // Метод для создания ошибки с кодом 500 - Internal Server Error
    static internal(message) {
        return new ApiError(500, message);
    }
}

module.exports = ApiError;
