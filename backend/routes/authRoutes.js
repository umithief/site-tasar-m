import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();
const User = mongoose.models.User; // User modelini server.js'den veya mongoose'dan al

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // 2. Şifreyi kontrol et (Düz metin veya hash kontrolü)
        // Not: Mevcut veritabanında şifreler düz metin olabilir, önce onu deneyelim, sonra hash.
        // Eğer production'da ise mutlaka hash kullanılmalı. Burada her ikisini de destekleyelim.
        let isMatch = false;

        // Önce bcrypt ile dene
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (err) {
            // Bcrypt hatası verdiyse (örneğin kayıt hashli değilse), düz metin kontrolü yap
            isMatch = (password === user.password);
        }

        // Eğer bcrypt false döndürdüyse ama şifre düz metin olarak eşitse (eski kayıtlar için)
        if (!isMatch && password === user.password) {
            isMatch = true;
        }

        if (!isMatch) {
            return res.status(400).json({ message: 'Şifre hatalı.' });
        }

        // 3. Token oluştur
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'gizli-anahtar-123', // .env'den gelmeli
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('Login Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kullanıcı var mı?
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluştur
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Hashli kaydet
        });

        await newUser.save();

        // Token oluştur
        const token = jwt.sign(
            { id: newUser._id, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET || 'gizli-anahtar-123',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin
            }
        });

    } catch (error) {
        console.error('Register Hatası:', error);
        res.status(500).json({ message: 'Kayıt başarısız.' });
    }
});

export default router;
