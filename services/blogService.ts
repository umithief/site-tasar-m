
import { BlogPost } from '../types';
import { delay } from './db';

const BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "2024 Ducati Panigale V4 R: Pistlerin Yeni Hakimi",
        excerpt: "Ducati'nin son şaheseri Panigale V4 R, aerodinamik kanatçıkları ve 240 beygirlik Desmosedici Stradale R motoruyla sınırları zorluyor. İşte detaylı incelememiz.",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop",
        date: "12 Mayıs 2024",
        author: {
            name: "Emre Motorcu",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
            id: "u101"
        },
        category: "inceleme",
        readTime: "6 dk",
        likes: 1240,
        comments: 85
    },
    {
        id: 2,
        title: "Zincir Bakımı: Motorunuzun Ömrünü Uzatın",
        excerpt: "Motosiklet zinciri temizliği ve yağlaması ne sıklıkla yapılmalı? O-Ring ve X-Ring zincirler için en iyi bakım yöntemleri ve ürün önerileri.",
        image: "https://images.unsplash.com/photo-1596706900226-0e318df62293?q=80&w=1200&auto=format&fit=crop",
        date: "10 Mayıs 2024",
        author: {
            name: "Teknik Servis",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop",
            id: "system"
        },
        category: "teknik",
        readTime: "4 dk",
        likes: 856,
        comments: 42
    },
    {
        id: 3,
        title: "Transfăgărășan: Dünyanın En İyi Sürüş Yolu",
        excerpt: "Top Gear ekibinin 'Dünyanın en iyi yolu' olarak tanımladığı Romanya'daki Transfăgărășan geçidine yaptığımız destansı yolculuğun hikayesi.",
        image: "https://images.unsplash.com/photo-1519506458709-fa64ba3987dc?q=80&w=1200&auto=format&fit=crop",
        date: "05 Mayıs 2024",
        author: {
            name: "Gezgin Rider",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
            id: "u102"
        },
        category: "gezi",
        readTime: "12 dk",
        likes: 2100,
        comments: 156
    },
    {
        id: 4,
        title: "Kış Sürüşü İçin Hayati Ekipman Rehberi",
        excerpt: "Soğuk havalarda sürüş keyfinizi bozmayın. Gore-Tex montlardan, ısıtmalı elciklere ve termal içliklere kadar kışın ihtiyacınız olan her şey.",
        image: "https://images.unsplash.com/photo-1609385602058-a1ddb6329c2a?q=80&w=1200&auto=format&fit=crop",
        date: "28 Nisan 2024",
        author: {
            name: "Zeynep Yılmaz",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
            id: "u103"
        },
        category: "yasam",
        readTime: "8 dk",
        likes: 945,
        comments: 67
    },
    {
        id: 5,
        title: "Yamaha MT-07 vs Honda CB650R: Orta Sınıfın Kralları",
        excerpt: "İki silindirli tork canavarı mı, yoksa dört silindirin çığlığı mı? Orta sınıf naked segmentinin en popüler iki modelini karşılaştırdık.",
        image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=1200&auto=format&fit=crop",
        date: "20 Nisan 2024",
        author: {
            name: "Can Hız",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
            id: "u104"
        },
        category: "inceleme",
        readTime: "10 dk",
        likes: 1560,
        comments: 230
    },
    {
        id: 6,
        title: "Grup Sürüşü Adabı ve İşaret Dili",
        excerpt: "Grup sürüşlerinde güvenliği sağlamak için bilinmesi gereken temel kurallar, fermuar düzeni ve el işaretleri.",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop",
        date: "15 Nisan 2024",
        author: {
            name: "Moto Eğitmen",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
            id: "u105"
        },
        category: "yasam",
        readTime: "5 dk",
        likes: 720,
        comments: 34
    }
];

export const blogService = {
    async getPosts(category: string = 'all'): Promise<BlogPost[]> {
        await delay(600); // Gerçekçilik için gecikme
        
        if (category === 'all') {
            return BLOG_POSTS;
        }
        
        return BLOG_POSTS.filter(post => post.category === category);
    }
};
