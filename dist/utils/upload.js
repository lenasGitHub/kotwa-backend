"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Upload directory configuration
const uploadDir = path_1.default.join(__dirname, '../../uploads/proofs');
// Ensure upload directory exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.userId || 'unknown';
        const habitId = req.body.habitId || 'unknown';
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${userId}_${habitId}_${timestamp}${ext}`);
    },
});
// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'));
    }
};
// Export configured multer instance
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
//# sourceMappingURL=upload.js.map