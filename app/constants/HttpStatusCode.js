// All type of status code that has been used throughout the APIs(Responses)

const StatusCode={
    SERVER_ERROR: {
      code: 409,
      message: 'Conflict',
    },
    CONTINUE: {
      code: 100,
      message: 'Continue',
    },
    SWITCHING_PROTOCOLS: {
      code: 101,
      message: 'Switching Protocols',
    },
    PROCESSING: {
      code: 102,
      message: 'Processing',
    },
    OK: {
      code: 200,
      message: 'OK',
    },
    CREATED: {
      code: 201,
      message: 'Created',
    },
    ACCEPTED: {
      code: 202,
      message: 'Accepted',
    },
    NON_AUTHORITATIVE_INFORMATION: {
      code: 203,
      message: 'Non Authoritative Information',
    },
    NO_CONTENT: {
      code: 204,
      message: 'No Content',
    },
    RESET_CONTENT: {
      code: 205,
      message: 'Reset Content',
    },
    PARTIAL_CONTENT: {
      code: 206,
      message: 'Partial Content',
    },
    MULTI_STATUS: {
      code: 207,
      message: 'Multi-Status',
    },
    MULTIPLE_CHOICES: {
      code: 300,
      message: 'Multiple Choices',
    },
    MOVED_PERMANENTLY: {
      code: 301,
      message: 'Moved Permanently',
    },
    MOVED_TEMPORARILY: {
      code: 302,
      message: 'Moved Temporarily',
    },
    SEE_OTHER: {
      code: 303,
      message: 'See Other',
    },
    NOT_MODIFIED: {
      code: 304,
      message: 'Not Modified',
    },
    USE_PROXY: {
      code: 305,
      message: 'Use Proxy',
    },
    TEMPORARY_REDIRECT: {
      code: 307,
      message: 'Temporary Redirect',
    },
    PERMANENT_REDIRECT: {
      code: 308,
      message: 'Permanent Redirect',
    },
    BAD_REQUEST: {
      code: 400,
      message: 'Bad Request',
    },
    UNAUTHORIZED: {
      code: 401,
      message: 'Unauthorized',
    },
    PAYMENT_REQUIRED: {
      code: 402,
      message: 'Payment Required',
    },
    FORBIDDEN: {
      code: 403,
      message: 'Forbidden',
    },
    NOT_FOUND: {
      code: 404,
      message: 'Not Found',
    },
    METHOD_NOT_ALLOWED: {
      code: 405,
      message: 'Method Not Allowed',
    },
    NOT_ACCEPTABLE: {
      code: 406,
      message: 'Not Acceptable',
    },
  };

  module.exports={StatusCode}
  