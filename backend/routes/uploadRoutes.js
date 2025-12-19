import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// 1. Supabase Ayarları
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Supabase client'ı oluştur
const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// 2. Multer (Dosyayı geçici olarak RAM'e alır)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 3. Yükleme Rotası
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({ message: 'Supabase credentials not configured.' });
        }

        const file = req.file;
        if (!file) return res.status(400).json({ message: 'Dosya yok!' });

        // Dosya ismini benzersiz yap (Türkçe karakter ve boşlukları temizle)
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;

        // Supabase'e Yükle
        const { data, error } = await supabase
            .storage
            .from('images') // BUCKET adı 'images'
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) throw error;

        // Yüklenen dosyanın Herkese Açık Linkini Al
        const { data: publicUrlData } = supabase
            .storage
            .from('images')
            .getPublicUrl(fileName);

        // Linki Frontend'e gönder
        res.json({ success: true, url: publicUrlData.publicUrl });

    } catch (err) {
        console.error('Supabase Hatası:', err);
        res.status(500).json({ message: 'Yükleme başarısız', error: err.message });
    }
});

export default router;
