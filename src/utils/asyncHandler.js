
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err));
    }
};

export { asyncHandler };

// const asyncHandler = (func) => { async (err, req, res, next) => {
//     try {
//         await func(err, req, res, next); 
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }}

