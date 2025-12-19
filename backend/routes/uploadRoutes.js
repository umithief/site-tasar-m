import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// --- YEREL DİSK DEPOLAMA AYARLARI ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

// Klasör yoksa oluştur
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Benzersiz dosya ismi: timestamp + orijinal isim (türkçe karakter temizlenmiş)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Lütfen bir dosya yükleyin.' });
        }

        // Sunucunun tam adresi (Localhost veya Canlı URL)
        // Request host'unu kullanarak dinamik URL oluşturuyoruz
        const protocol = req.protocol;
        const host = req.get('host');

        // Dosyanın erişilebilir URL'i
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: fileUrl,
            message: 'Dosya sunucuya başarıyla yüklendi.'
        });

    } catch (error) {
        console.error('Upload Hatası:', error);
        res.status(500).json({ message: 'Dosya yüklenirken sunucu hatası oluştu.' });
    }
});

export default router;
