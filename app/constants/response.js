//Response format for Success and failure
const Success = {
    Status: true,
    Success: true,
    Message: '',
    data: [],
  };
  
  const Failure = {
    Status: true,
    Success: false,
    Message: '',
    Error: '',
  };
  
  const ServerFailure = {
    Status: false,
    Success: false,
  };
  
  module.exports = { Success, Failure, ServerFailure };
  