/**
 * Hardened File Upload Middleware
 *
 * Security layers:
 *  1. Multer memoryStorage (no temp file on disk until validated)
 *  2. Extension + MIME type check (first pass)
 *  3. Magic-number (file signature) validation on raw buffer
 *  4. UUID-based filenames (no user-controlled names reach disk)
 *  5. EXIF stripping & re-encoding via sharp (removes GPS, camera data, embedded scripts)
 */
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// ── Upload directory ──
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Magic number signatures for allowed image types ──
const MAGIC_NUMBERS = {
    'image/jpeg': [
        Buffer.from([0xFF, 0xD8, 0xFF]),                    // JPEG/JFIF/EXIF
    ],
    'image/png': [
        Buffer.from([0x89, 0x50, 0x4E, 0x47]),              // PNG
    ],
    'image/webp': [
        Buffer.from('RIFF'),                                  // RIFF header (bytes 0-3)
        // bytes 8-11 must be 'WEBP' — checked separately
    ],
};

/**
 * Validate that the file buffer starts with a legitimate image magic number.
 * Returns the verified MIME type or null if invalid.
 */
function verifyMagicNumber(buffer) {
    if (!buffer || buffer.length < 12) return null;

    // JPEG: starts with FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'image/jpeg';
    }

    // PNG: starts with 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return 'image/png';
    }

    // WebP: starts with RIFF....WEBP
    if (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
        return 'image/webp';
    }

    return null;
}

// ── Multer: use memoryStorage so file stays in RAM until we validate ──
const memStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExts = /\.(jpe?g|png|webp)$/i;

    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Images only! (jpeg, jpg, png, webp)'));
    }
    if (!allowedExts.test(path.extname(file.originalname))) {
        return cb(new Error('Images only! (jpeg, jpg, png, webp)'));
    }
    cb(null, true);
};

const upload = multer({
    storage: memStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
});

/**
 * Post-upload middleware: validates magic number, strips EXIF, saves to disk.
 * Must be used AFTER multer middleware in the route chain.
 *
 * Usage:
 *   router.post('/upload', upload.single('image'), processUpload, controller)
 */
async function processUpload(req, res, next) {
    // If no file was uploaded, skip processing
    if (!req.file) return next();

    const { buffer, mimetype } = req.file;

    // ── Step 1: Magic number validation ──
    const verifiedMime = verifyMagicNumber(buffer);
    if (!verifiedMime) {
        return res.status(400).json({
            success: false,
            code: 'INVALID_FILE',
            message: 'File content does not match a valid image format.',
        });
    }

    // ── Step 2: UUID filename (no user-controlled names on disk) ──
    const ext = verifiedMime === 'image/jpeg' ? '.jpg'
        : verifiedMime === 'image/png' ? '.png'
        : '.webp';
    const safeName = crypto.randomUUID() + ext;
    const destPath = path.join(uploadDir, safeName);

    try {
        // ── Step 3: EXIF stripping & re-encoding via sharp (if available) ──
        let sharp;
        try {
            sharp = require('sharp');
        } catch {
            // sharp not installed — write raw buffer (safe but no EXIF strip)
            sharp = null;
        }

        if (sharp) {
            let pipeline = sharp(buffer).rotate(); // auto-rotate by EXIF then strip

            if (verifiedMime === 'image/jpeg') {
                pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
            } else if (verifiedMime === 'image/png') {
                pipeline = pipeline.png({ compressionLevel: 8 });
            } else {
                pipeline = pipeline.webp({ quality: 80 });
            }

            await pipeline.toFile(destPath);
        } else {
            // Fallback: write buffer directly (no EXIF strip)
            await fs.promises.writeFile(destPath, buffer);
        }

        // ── Step 4: Rewrite req.file so downstream controllers see the disk path ──
        req.file.filename = safeName;
        req.file.path = destPath;
        req.file.destination = uploadDir;
        // Remove buffer from memory
        delete req.file.buffer;

        next();
    } catch (err) {
        // Clean up on failure
        try { await fs.promises.unlink(destPath); } catch { /* ignore */ }
        next(err);
    }
}

module.exports = upload;
module.exports.processUpload = processUpload;
