const MESSAGE = {
    SUCCESS: 'SUCCESS',
    UPDATE: 'UPDATED SUCCESSFULLY',
    DELETE: 'DELETED SUCCESSFULLY',
    INCORRECT_PASSWORD: 'The password you have entered is Incorrect',
    INCORRECT_EMAIL: 'The email you have entered is Incorrect',
    EMAIL_EXISTS: 'The email already exists',
    PHONE_EXISTS: 'The phone already exists',
    EMAIL_AND_PHONE_EXISTS:'Your email and phone number already exists',
    PERSON_REGISTERED:'Already person Register',
    PERSON_NOT_REGISTERED: 'person not Register',
    LOGIN_SUCCESS:'Login Successfully',
    LOGIN_FAIL:'Incorrect user credentials.try again',
    EMAIL_NOT_FOUND:'Email does not match',
    PASSWORD_NOT_FOUND:'Password does not match',
    NOT_FOUND:'Not Found',
    ALREADY_SCHEDULE:'Already Scheduled',

    // --------------------------------------------
    OTP_SUBJECT: "Your OTP Code",
    OTP_TEXT: "Your OTP code is",
    OTP_EXPIRY: "It will expire in 5 minutes.",
    OTP_SENT: "OTP sent successfully!",
    OTP_FAILED: "Failed to send OTP",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED: "OTP expired",
    OTP_VERIFIED: "OTP verified successfully",
    OTP_VERIFICATION_FAILED: "Failed to verify OTP"
};

module.exports = { MESSAGE };
