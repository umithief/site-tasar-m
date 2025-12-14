
import { Route } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

const DEFAULT_ROUTES: Route[] = [
  {
    id: 'route-1',
    title: 'Trans Toros Geçişi',
    description: 'Akdeniz\'in zirvelerinde virajlı ve manzaralı bir sürüş. Sert virajlar ve yükseklik değişimi ile teknik bir rota. Antalya\'dan başlayıp Toros Dağları\'nı aşarak Isparta\'ya ulaşan bu rota, hem sürüş tekniğinizi test eder hem de eşsiz manzaralar sunar.',
    image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/5803208/5803208-uhd_2560_1440_30fps.mp4',
    difficulty: 'Zor',
    distance: '145 km',
    duration: '2.5 Saat',
    location: 'Antalya - Isparta',
    bestSeason: 'İlkbahar - Sonbahar',
    tags: ['Virajlı', 'Dağ', 'Manzara', 'Performans'],
    coordinates: { lat: 36.8841, lng: 30.7056 },
    tips: [
        "Antalya çıkışında trafik yoğun olabilir, sabah erken saatleri tercih edin.",
        "Karacaören Barajı kenarındaki mola noktalarında gözleme yemeyi unutmayın.",
        "Tünel geçişlerinde zemin ıslak olabilir, hızınızı düşürün.",
        "Rakım yükseldikçe hava sıcaklığı 10 dereceye kadar düşebilir, içlik bulundurun.",
        "Virajlar oldukça keskin, apeks noktalarına dikkat edin."
    ],
    path: [
        { lat: 36.8841, lng: 30.7056 }, // Antalya Merkez
        { lat: 36.9423, lng: 30.6876 }, // Kepez Çıkışı
        { lat: 37.0156, lng: 30.6543 }, // Dağ Yolu Başlangıcı
        { lat: 37.0890, lng: 30.6210 }, // Tırmanış
        { lat: 37.1500, lng: 30.6000 }, // Zirveye Doğru
        { lat: 37.2123, lng: 30.6543 }, // Virajlar
        { lat: 37.2850, lng: 30.7500 }, // Karacaören Barajı Giriş
        { lat: 37.3200, lng: 30.8000 }, // Baraj Kenarı
        { lat: 37.4000, lng: 30.8500 }, // Ağlasun Ayrımı
        { lat: 37.5500, lng: 30.7800 }, // Isparta Ovası
        { lat: 37.7648, lng: 30.5566 }  // Isparta Merkez
    ]
  },
  {
    id: 'route-2',
    title: 'Ege Sahil Yolu',
    description: 'Deniz kokusu eşliğinde, zeytin ağaçları arasından geçen sakin ve keyifli bir rota. Gün batımı sürüşleri için ideal.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/3004273/3004273-uhd_2560_1440_30fps.mp4',
    difficulty: 'Kolay',
    distance: '180 km',
    duration: '3 Saat',
    location: 'İzmir - Çanakkale',
    bestSeason: 'Yaz',
    tags: ['Sahil', 'Kamp', 'Rahat'],
    coordinates: { lat: 38.4192, lng: 27.1287 },
    path: [
        { lat: 38.4192, lng: 27.1287 }, // İzmir
        { lat: 38.5500, lng: 27.0500 }, // Menemen
        { lat: 38.8000, lng: 26.9500 }, // Aliağa
        { lat: 39.1000, lng: 26.9000 }, // Dikili
        { lat: 39.3000, lng: 26.7000 }, // Ayvalık
        { lat: 39.5000, lng: 26.6000 }  // Edremit
    ]
  },
  {
    id: 'route-3',
    title: 'Karadeniz Yayla Yolu',
    description: 'Bulutların üzerinde, sisli ve yeşil bir macera. Yer yer bozuk zemin ve yağmur ihtimali ile adventure motorlar için birebir.',
    image: 'https://images.unsplash.com/photo-1504218290665-37a5f94688b0?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://videos.pexels.com/video-files/2422204/2422204-hd_1920_1080_30fps.mp4',
    difficulty: 'Extreme',
    distance: '450 km',
    duration: '8 Saat',
    location: 'Trabzon - Rize',
    bestSeason: 'Yaz Ortası',
    tags: ['Offroad', 'Yayla', 'Sis'],
    coordinates: { lat: 40.9833, lng: 39.7167 },
    path: [
        { lat: 40.9833, lng: 39.7167 },
        { lat: 40.8500, lng: 39.8000 }, // Maçka
        { lat: 40.7000, lng: 39.9500 }, // Sümela
        { lat: 40.6000, lng: 40.1000 }, // Yaylalar
        { lat: 40.8000, lng: 40.4000 }, 
        { lat: 41.0201, lng: 40.5234 }  // Rize
    ]
  },
  {
    id: 'route-4',
    title: 'Kapadokya Peri Rotaları',
    description: 'Tarihi dokunun içinde, balonların altında mistik bir sürüş deneyimi. Fotoğraf tutkunları için eşsiz duraklar.',
    image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '120 km',
    duration: '2.5 Saat',
    location: 'Nevşehir',
    bestSeason: 'İlkbahar',
    tags: ['Tarih', 'Fotoğraf', 'Toz'],
    coordinates: { lat: 38.6250, lng: 34.7122 },
    path: [
        { lat: 38.6250, lng: 34.7122 },
        { lat: 38.6500, lng: 34.8000 }, // Ürgüp
        { lat: 38.6000, lng: 34.8500 }, // Göreme
        { lat: 38.5500, lng: 34.7500 }, // Uçhisar
        { lat: 38.6250, lng: 34.7122 }  // Loop back
    ]
  },
  {
    id: 'route-5',
    title: 'Uçmakdere Virajları',
    description: 'Marmara\'nın en keyifli virajlarına sahip, deniz ve dağ manzarasının birleştiği efsanevi rota. Yamaç paraşütü alanında mola verilebilir.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '85 km',
    duration: '2 Saat',
    location: 'Tekirdağ - Şarköy',
    bestSeason: 'İlkbahar - Yaz',
    tags: ['Viraj', 'Deniz', 'Haftasonu'],
    coordinates: { lat: 40.9780, lng: 27.5117 },
    path: [
        { lat: 40.9780, lng: 27.5117 }, // Tekirdağ
        { lat: 40.8800, lng: 27.4500 }, // Kumbağ
        { lat: 40.8037, lng: 27.3682 }, // Uçmakdere
        { lat: 40.7500, lng: 27.2500 }, // Mürefte
        { lat: 40.6150, lng: 27.1000 }  // Şarköy
    ]
  },
  {
    id: 'route-6',
    title: 'Karanlık Kanyon & Taş Yolu',
    description: 'Dünyanın en tehlikeli yollarından biri olarak bilinen, el emeği tüneller ve uçurum kenarı sürüşü içeren saf adrenalin rotası.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Extreme',
    distance: '60 km',
    duration: '4 Saat',
    location: 'Erzincan - Kemaliye',
    bestSeason: 'Yaz - Sonbahar',
    tags: ['Adventure', 'Kanyon', 'Tünel'],
    coordinates: { lat: 39.2630, lng: 38.4962 },
    path: [
        { lat: 39.2630, lng: 38.4962 },
        { lat: 39.2800, lng: 38.5200 },
        { lat: 39.3000, lng: 38.5500 }, // Tunnels
        { lat: 39.3200, lng: 38.5800 },
        { lat: 39.3500, lng: 38.6000 }
    ]
  },
  {
    id: 'route-7',
    title: 'Datça Knidos Yolu',
    description: 'Badem ağaçları arasından geçerek antik kente ulaşan, Ege ve Akdeniz\'in birleştiği noktada huzurlu ve virajlı bir yolculuk.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '140 km',
    duration: '3 Saat',
    location: 'Muğla - Datça',
    bestSeason: 'İlkbahar - Sonbahar',
    tags: ['Tarih', 'Doğa', 'Viraj'],
    coordinates: { lat: 36.9500, lng: 28.1000 },
    path: [
        { lat: 36.9500, lng: 28.1000 }, // Marmaris Turnoff
        { lat: 36.8500, lng: 27.9000 },
        { lat: 36.7237, lng: 27.6854 }, // Datça Center
        { lat: 36.6800, lng: 27.3700 }  // Knidos
    ]
  },
  {
    id: 'route-8',
    title: 'Bolu Yedigöller Orman Yolu',
    description: 'Sonbaharda renk cümbüşü sunan, sık orman içi yolları ve göl manzaraları ile tam bir terapi rotası. Zemin yer yer kaygan olabilir.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '90 km',
    duration: '2.5 Saat',
    location: 'Bolu',
    bestSeason: 'Sonbahar',
    tags: ['Orman', 'Kamp', 'Fotoğraf'],
    coordinates: { lat: 40.7300, lng: 31.6000 },
    path: [
        { lat: 40.7300, lng: 31.6000 }, // Bolu
        { lat: 40.8500, lng: 31.6800 },
        { lat: 40.9427, lng: 31.7516 }, // Yedigöller
        { lat: 41.0000, lng: 31.8500 }
    ]
  },
  {
    id: 'route-9',
    title: 'Tuz Gölü Sonsuzluk Sürüşü',
    description: 'Ufuk çizgisinin kaybolduğu, gün batımında eşsiz yansımalar sunan düz ama büyüleyici bir rota. Drone çekimi için ideal.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '200 km',
    duration: '2.5 Saat',
    location: 'Ankara - Aksaray',
    bestSeason: 'Yaz',
    tags: ['Manzara', 'Düz Yol', 'Fotoğraf'],
    coordinates: { lat: 39.0000, lng: 33.0000 },
    path: [
        { lat: 39.0000, lng: 33.0000 },
        { lat: 38.8350, lng: 33.3323 }, // Tuz Gölü Center Approx
        { lat: 38.7000, lng: 33.5000 }
    ]
  },
  {
    id: 'route-10',
    title: 'Mardin Tarihi İpek Yolu',
    description: 'Mezopotamya ovasını seyrederek, taş evlerin arasından geçen büyüleyici bir tarih yolculuğu. Güneşin doğuşu burada bir başka.',
    image: 'https://images.unsplash.com/photo-1590059397664-f6ef733d3c82?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '95 km',
    duration: '2 Saat',
    location: 'Mardin - Midyat',
    bestSeason: 'İlkbahar - Sonbahar',
    tags: ['Kültür', 'Tarih', 'Manzara'],
    coordinates: { lat: 37.3212, lng: 40.7245 },
    path: [
        { lat: 37.3212, lng: 40.7245 }, // Mardin
        { lat: 37.3100, lng: 40.8500 },
        { lat: 37.3500, lng: 41.0000 },
        { lat: 37.4000, lng: 41.1500 },
        { lat: 37.4200, lng: 41.3300 }  // Midyat
    ]
  },
  {
    id: 'route-11',
    title: 'Kaş - Kalkan Sahil Sürüşü',
    description: 'Türkiye\'nin en güzel manzaralı yollarından biri. Virajlı kaputaş plajı geçişi ve turkuaz sular eşliğinde sürüş.',
    image: 'https://images.unsplash.com/photo-1580910543236-0c95332f7a9d?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '30 km',
    duration: '45 Dk',
    location: 'Antalya (Kaş)',
    bestSeason: 'Yaz',
    tags: ['Deniz', 'Viraj', 'Kısa Rota'],
    coordinates: { lat: 36.2000, lng: 29.6384 },
    path: [
        { lat: 36.2000, lng: 29.6384 }, // Kaş
        { lat: 36.2300, lng: 29.5100 }, // Kaputaş
        { lat: 36.2600, lng: 29.4100 }  // Kalkan
    ]
  },
  {
    id: 'route-12',
    title: 'Uludağ Zirve Tırmanışı',
    description: 'Bursa merkezden başlayıp bulutların üzerine çıkan bol virajlı ve serin bir dağ yolu. Zirvede sucuk ekmek molası şart.',
    image: 'https://images.unsplash.com/photo-1517999813206-44759604df0f?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Zor',
    distance: '40 km',
    duration: '1 Saat',
    location: 'Bursa',
    bestSeason: 'Yaz',
    tags: ['Dağ', 'Viraj', 'Serin'],
    coordinates: { lat: 40.1826, lng: 29.0662 },
    path: [
        { lat: 40.1826, lng: 29.0662 }, // Bursa Merkez
        { lat: 40.1500, lng: 29.1000 },
        { lat: 40.1200, lng: 29.1500 }, // Milli Park Girişi
        { lat: 40.0700, lng: 29.2100 }  // Oteller Bölgesi
    ]
  },
  // --- YENİ EKLENEN ROTALAR ---
  {
    id: 'route-13',
    title: 'Karaburun Yarımadası Turu',
    description: 'İzmir\'in en bakir ve en virajlı rotalarından biri. Mordoğan\'dan başlayıp Karaburun\'a uzanan, denizle iç içe yüzlerce viraj.',
    image: 'https://images.unsplash.com/photo-1566322300732-243501a47321?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Zor',
    distance: '110 km',
    duration: '3 Saat',
    location: 'İzmir (Karaburun)',
    bestSeason: 'İlkbahar - Sonbahar',
    tags: ['Aşırı Viraj', 'Deniz', 'Sakin'],
    coordinates: { lat: 38.5139, lng: 26.6346 },
    path: [
        { lat: 38.3750, lng: 26.7500 }, // Urla çıkışı
        { lat: 38.5100, lng: 26.6300 }, // Mordoğan
        { lat: 38.6400, lng: 26.5100 }, // Karaburun Merkez
        { lat: 38.6000, lng: 26.4000 }  // Sarpıncık Feneri
    ]
  },
  {
    id: 'route-14',
    title: 'Domaniç Geçidi',
    description: 'Türkiye\'nin Nürburgring\'i olarak anılan, motosikletçilerin favori oyun alanı. Mükemmel asfalt ve ardı ardına gelen virajlar.',
    image: 'https://images.unsplash.com/photo-1621255394237-772922633016?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Extreme',
    distance: '25 km',
    duration: '40 Dk',
    location: 'Bursa - Kütahya',
    bestSeason: 'Yaz',
    tags: ['Pist Tadında', 'Viraj', 'Orman'],
    coordinates: { lat: 39.8700, lng: 29.5500 },
    path: [
        { lat: 39.9200, lng: 29.5000 }, // İnegöl tarafı
        { lat: 39.8700, lng: 29.5500 }, // Zirve / Virajlar
        { lat: 39.8000, lng: 29.6100 }  // Domaniç
    ]
  },
  {
    id: 'route-15',
    title: 'Şavşat - Karagöl Rüyası',
    description: 'Türkiye\'nin Alpleri Artvin\'de, yeşilin her tonunu görebileceğiniz, masalsı bir doğa sürüşü.',
    image: 'https://images.unsplash.com/photo-1589553093026-8c4c782b536c?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '60 km',
    duration: '2 Saat',
    location: 'Artvin',
    bestSeason: 'Yaz',
    tags: ['Doğa', 'Göl', 'Sakin'],
    coordinates: { lat: 41.2400, lng: 42.3600 },
    path: [
        { lat: 41.2400, lng: 42.3600 }, // Şavşat Merkez
        { lat: 41.2600, lng: 42.4000 },
        { lat: 41.2800, lng: 42.4500 }, // Tırmanış
        { lat: 41.3100, lng: 42.4800 }  // Karagöl
    ]
  },
  {
    id: 'route-16',
    title: 'Sakar Geçidi & Akyaka',
    description: 'Muğla\'dan Gökova körfezine inerken nefes kesen manzara eşliğinde yapılan ikonik bir iniş sürüşü.',
    image: 'https://images.unsplash.com/photo-1548674558-da397022c069?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '20 km',
    duration: '30 Dk',
    location: 'Muğla',
    bestSeason: 'Yaz',
    tags: ['Manzara', 'İkonik', 'Kısa'],
    coordinates: { lat: 37.1300, lng: 28.3600 },
    path: [
        { lat: 37.1800, lng: 28.3600 }, // Zirve
        { lat: 37.1300, lng: 28.3600 }, // Virajlar
        { lat: 37.0500, lng: 28.3300 }  // Akyaka
    ]
  },
  {
    id: 'route-17',
    title: 'Nemrut Dağı Gün Doğumu',
    description: 'Adıyaman\'dan başlayıp tanrı heykellerine uzanan, taşlı yolları ve dik rampalarıyla mistik bir tırmanış.',
    image: 'https://images.unsplash.com/photo-1595843469275-042168925203?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Zor',
    distance: '80 km',
    duration: '3 Saat',
    location: 'Adıyaman',
    bestSeason: 'Yaz',
    tags: ['Tarih', 'Tırmanış', 'Taş Yol'],
    coordinates: { lat: 37.9800, lng: 38.7400 },
    path: [
        { lat: 37.7600, lng: 38.2700 }, // Adıyaman
        { lat: 37.8500, lng: 38.5000 },
        { lat: 37.9500, lng: 38.7000 }, // Karadut
        { lat: 37.9800, lng: 38.7400 }  // Zirve
    ]
  },
  {
    id: 'route-18',
    title: 'Bafa Gölü & Herakleia',
    description: 'Antik Latmos dağlarının eteğinde, zeytinlikler ve devasa kayalar arasından geçen tarihi bir Ege rotası.',
    image: 'https://images.unsplash.com/photo-1627918370771-337c76899476?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '45 km',
    duration: '1 Saat',
    location: 'Muğla - Aydın Sınırı',
    bestSeason: 'İlkbahar',
    tags: ['Tarih', 'Göl', 'Sakin'],
    coordinates: { lat: 37.5000, lng: 27.5300 },
    path: [
        { lat: 37.4500, lng: 27.6500 }, // Söke Yolu
        { lat: 37.5000, lng: 27.5300 }, // Bafa Kıyısı
        { lat: 37.5100, lng: 27.4500 }  // Kapıkırı
    ]
  },
  {
    id: 'route-19',
    title: 'Salda Gölü Turu',
    description: 'Türkiye\'nin Maldivleri olarak bilinen Salda Gölü\'nün etrafında turkuaz sulara karşı keyifli bir sürüş.',
    image: 'https://images.unsplash.com/photo-1625904835711-09529202720b?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '40 km',
    duration: '1 Saat',
    location: 'Burdur',
    bestSeason: 'Yaz',
    tags: ['Manzara', 'Yüzme', 'Mavi'],
    coordinates: { lat: 37.5500, lng: 29.6800 },
    path: [
        { lat: 37.5200, lng: 29.6500 },
        { lat: 37.5500, lng: 29.6800 },
        { lat: 37.5800, lng: 29.7200 },
        { lat: 37.5300, lng: 29.7500 }  // Loop
    ]
  },
  {
    id: 'route-20',
    title: 'Kaz Dağları Zirve',
    description: 'Oksijen deposu ormanların içinden, mitolojik İda dağına doğru serin ve virajlı bir kaçış.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '70 km',
    duration: '2 Saat',
    location: 'Balıkesir - Çanakkale',
    bestSeason: 'Yaz',
    tags: ['Orman', 'Serin', 'Kamp'],
    coordinates: { lat: 39.7000, lng: 26.9600 },
    path: [
        { lat: 39.5800, lng: 26.9200 }, // Edremit
        { lat: 39.6500, lng: 26.9600 },
        { lat: 39.7500, lng: 27.0500 }  // Kalkım
    ]
  },
  {
    id: 'route-21',
    title: 'Nallıhan Kuş Cenneti',
    description: 'Renkli tepelerin oluşturduğu görsel şölen eşliğinde Ankara\'dan kaçış rotası. Fotoğrafçılar için mükemmel.',
    image: 'https://images.unsplash.com/photo-1548588627-f978862b85e1?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '160 km',
    duration: '2.5 Saat',
    location: 'Ankara',
    bestSeason: 'İlkbahar',
    tags: ['Manzara', 'Renkler', 'Düz'],
    coordinates: { lat: 40.1000, lng: 31.6000 },
    path: [
        { lat: 39.9500, lng: 32.2000 }, // Ayaş
        { lat: 40.1600, lng: 31.9000 }, // Beypazarı
        { lat: 40.1000, lng: 31.6000 }  // Nallıhan
    ]
  },
  {
    id: 'route-22',
    title: 'Gökçeada Rüzgarı',
    description: 'Türkiye\'nin en batısında, rüzgar gülleri ve terk edilmiş Rum köyleri arasında sakin ada sürüşü.',
    image: 'https://images.unsplash.com/photo-1502088559253-7800204d96fa?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '80 km',
    duration: '3 Saat',
    location: 'Çanakkale',
    bestSeason: 'Sonbahar',
    tags: ['Ada', 'Rüzgar', 'Tarih'],
    coordinates: { lat: 40.1600, lng: 25.8500 },
    path: [
        { lat: 40.2000, lng: 25.9000 }, // Kuzu Limanı
        { lat: 40.1800, lng: 25.8000 }, // Merkez
        { lat: 40.1200, lng: 25.7000 }  // Uğurlu
    ]
  },
  {
    id: 'route-23',
    title: 'İshak Paşa Sarayı',
    description: 'Doğu\'nun en görkemli yapısına doğru, Ağrı Dağı manzaralı, düz ama etkileyici bir bozkır sürüşü.',
    image: 'https://images.unsplash.com/photo-1574356637654-2e94770337c7?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '100 km',
    duration: '1.5 Saat',
    location: 'Ağrı - Doğubayazıt',
    bestSeason: 'Yaz',
    tags: ['Tarih', 'Kültür', 'Epik'],
    coordinates: { lat: 39.5200, lng: 44.1300 },
    path: [
        { lat: 39.7100, lng: 43.0500 }, // Ağrı
        { lat: 39.6000, lng: 43.5000 },
        { lat: 39.5500, lng: 44.0500 }, // Doğubayazıt
        { lat: 39.5200, lng: 44.1300 }  // Saray
    ]
  },
  {
    id: 'route-24',
    title: 'Zigana Geçidi (Eski Yol)',
    description: 'Yeni tüneli kullanmak yerine, efsanevi eski Zigana yolunun sisli virajlarında kaybolmak isteyenler için.',
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Zor',
    distance: '50 km',
    duration: '1.5 Saat',
    location: 'Trabzon - Gümüşhane',
    bestSeason: 'Yaz',
    tags: ['Efsane', 'Viraj', 'Sis'],
    coordinates: { lat: 40.6300, lng: 39.4000 },
    path: [
        { lat: 40.8000, lng: 39.5500 }, // Maçka
        { lat: 40.7000, lng: 39.4500 }, // Tırmanış
        { lat: 40.6300, lng: 39.4000 }, // Zirve Tünel
        { lat: 40.5500, lng: 39.3500 }  // İniş
    ]
  },
  {
    id: 'route-25',
    title: 'Erciyes Dağı Turu',
    description: 'Kayseri\'nin sembolü Erciyes\'in eteklerinde, yüksek irtifada serin ve geniş yollarda sürüş keyfi.',
    image: 'https://images.unsplash.com/photo-1614777977395-926df9447477?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '60 km',
    duration: '1 Saat',
    location: 'Kayseri',
    bestSeason: 'Yaz',
    tags: ['Dağ', 'Serin', 'Asfalt'],
    coordinates: { lat: 38.5300, lng: 35.5200 },
    path: [
        { lat: 38.7200, lng: 35.4800 }, // Kayseri
        { lat: 38.6000, lng: 35.5000 },
        { lat: 38.5300, lng: 35.5200 }, // Tekir Kapı
        { lat: 38.4500, lng: 35.5500 }  // Develi
    ]
  },
  {
    id: 'route-26',
    title: 'İğneada Longoz Ormanları',
    description: 'Avrupa\'nın en büyük longoz ormanlarına giden, virajlı ve doğa ile iç içe, Trakya\'nın saklı cennet rotası.',
    image: 'https://images.unsplash.com/photo-1542253738-9274296dc4a3?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '100 km',
    duration: '2 Saat',
    location: 'Kırklareli',
    bestSeason: 'İlkbahar',
    tags: ['Orman', 'Doğa', 'Kamp'],
    coordinates: { lat: 41.8700, lng: 27.9800 },
    path: [
        { lat: 41.6500, lng: 27.6000 }, // Pınarhisar
        { lat: 41.7500, lng: 27.7500 }, // Demirköy
        { lat: 41.8700, lng: 27.9800 }  // İğneada
    ]
  },
  {
    id: 'route-27',
    title: 'Köprülü Kanyon',
    description: 'Antalya\'nın sıcağından kaçıp serin sulara ve kanyon manzarasına sığınmak için mükemmel bir rota.',
    image: 'https://images.unsplash.com/photo-1526493775878-c0b06b729606?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '85 km',
    duration: '1.5 Saat',
    location: 'Antalya - Manavgat',
    bestSeason: 'Yaz',
    tags: ['Kanyon', 'Su', 'Viraj'],
    coordinates: { lat: 37.1900, lng: 31.1800 },
    path: [
        { lat: 36.9000, lng: 31.1000 }, // Serik
        { lat: 37.0500, lng: 31.1500 },
        { lat: 37.1900, lng: 31.1800 }  // Kanyon
    ]
  },
  {
    id: 'route-28',
    title: 'Anamur - Gazipaşa Sahil',
    description: 'Viraj sevenler için bitmeyen bir rüya. Akdeniz sahil şeridinin en bakir ve en teknik kısımlarından biri.',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Zor',
    distance: '80 km',
    duration: '2 Saat',
    location: 'Mersin - Antalya',
    bestSeason: 'İlkbahar',
    tags: ['Viraj', 'Deniz', 'Teknik'],
    coordinates: { lat: 36.0800, lng: 32.8300 },
    path: [
        { lat: 36.0800, lng: 32.8300 }, // Anamur
        { lat: 36.1200, lng: 32.6000 }, // Virajlar
        { lat: 36.1500, lng: 32.4500 },
        { lat: 36.2600, lng: 32.3100 }  // Gazipaşa
    ]
  },
  {
    id: 'route-29',
    title: 'Sümela Manastırı Yolu',
    description: 'Altındere vadisi boyunca, yeşillikler ve şelaleler arasından geçerek sarp kayalıklara asılı manastıra çıkış.',
    image: 'https://images.unsplash.com/photo-1623169720639-66324903332c?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '45 km',
    duration: '1 Saat',
    location: 'Trabzon',
    bestSeason: 'Yaz',
    tags: ['Tarih', 'Doğa', 'Vadi'],
    coordinates: { lat: 40.6900, lng: 39.6500 },
    path: [
        { lat: 40.9800, lng: 39.7200 }, // Trabzon
        { lat: 40.8100, lng: 39.6100 }, // Maçka
        { lat: 40.6900, lng: 39.6500 }  // Sümela
    ]
  },
  {
    id: 'route-30',
    title: 'Assos - Behramkale',
    description: 'Zeytinlikler arasından antik limana inen, tarih kokan taş yollar. Ege\'nin en huzurlu köşelerinden biri.',
    image: 'https://images.unsplash.com/photo-1533633370976-432d69c27948?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Orta',
    distance: '70 km',
    duration: '1.5 Saat',
    location: 'Çanakkale',
    bestSeason: 'Sonbahar',
    tags: ['Antik', 'Taş Yol', 'Deniz'],
    coordinates: { lat: 39.4800, lng: 26.3300 },
    path: [
        { lat: 39.6000, lng: 26.4000 }, // Ayvacık
        { lat: 39.5500, lng: 26.3800 },
        { lat: 39.4800, lng: 26.3300 }  // Assos
    ]
  },
  {
    id: 'route-31',
    title: 'Cunda Adası & Şeytan Sofrası',
    description: 'Ayvalık\'ın dar sokaklarından Cunda\'ya, oradan da gün batımını izlemek için Şeytan Sofrası\'na uzanan keyif rotası.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbd02b?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Kolay',
    distance: '25 km',
    duration: '1 Saat',
    location: 'Balıkesir (Ayvalık)',
    bestSeason: 'İlkbahar',
    tags: ['Ada', 'Keyif', 'Manzara'],
    coordinates: { lat: 39.3300, lng: 26.6500 },
    path: [
        { lat: 39.3100, lng: 26.6900 }, // Ayvalık
        { lat: 39.3300, lng: 26.6500 }, // Cunda
        { lat: 39.2800, lng: 26.6400 }  // Şeytan Sofrası
    ]
  },
  {
    id: 'route-32',
    title: 'Gelidonya Feneri Yolu',
    description: 'Adrasan üzerinden toprak ve virajlı yollarla ulaşılan, Akdeniz\'in en uç ve en güzel manzaralı noktalarından biri.',
    image: 'https://images.unsplash.com/photo-1520699918507-3c3e05c46b90?q=80&w=1200&auto=format&fit=crop',
    difficulty: 'Extreme',
    distance: '40 km',
    duration: '1.5 Saat',
    location: 'Antalya (Kumluca)',
    bestSeason: 'İlkbahar',
    tags: ['Offroad', 'Macera', 'Manzara'],
    coordinates: { lat: 36.2300, lng: 30.4000 },
    path: [
        { lat: 36.3500, lng: 30.3000 }, // Kumluca
        { lat: 36.3000, lng: 30.4500 }, // Adrasan
        { lat: 36.2300, lng: 30.4000 }  // Fener Yolu
    ]
  }
];

export const routeService = {
  // ... existing methods (getRoutes, addRoute, updateRoute, deleteRoute)
  async getRoutes(): Promise<Route[]> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const stored = getStorage<Route[]>(DB.ROUTES, []);
        if (stored.length === 0) {
            setStorage(DB.ROUTES, DEFAULT_ROUTES);
            return DEFAULT_ROUTES;
        }
        // Merge defaults if stored has less (for demo purposes to show new items)
        if (stored.length < DEFAULT_ROUTES.length) {
             const merged = [...stored, ...DEFAULT_ROUTES.filter(d => !stored.some(s => s.id === d.id))];
             // Update storage with new merged list
             setStorage(DB.ROUTES, merged);
             return merged;
        }
        return stored;
    } else {
        // REAL BACKEND
        try {
            const response = await fetch(`${CONFIG.API_URL}/routes`);
            if (!response.ok) return DEFAULT_ROUTES;
            return await response.json();
        } catch {
            return DEFAULT_ROUTES;
        }
    }
  },

  async addRoute(route: Omit<Route, 'id'>): Promise<Route> {
    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const routes = getStorage<Route[]>(DB.ROUTES, []);
        const newRoute: Route = {
            ...route,
            id: `route-${Date.now()}`,
        };
        routes.unshift(newRoute);
        setStorage(DB.ROUTES, routes);
        return newRoute;
    } else {
        // REAL BACKEND
        const response = await fetch(`${CONFIG.API_URL}/routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(route)
        });
        return await response.json();
    }
  },

  async updateRoute(route: Route): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const routes = getStorage<Route[]>(DB.ROUTES, []);
        const index = routes.findIndex(r => r.id === route.id);
        if (index !== -1) {
            routes[index] = route;
            setStorage(DB.ROUTES, routes);
        }
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/routes/${route.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(route)
        });
    }
  },

  async deleteRoute(id: string): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const routes = getStorage<Route[]>(DB.ROUTES, []);
        const filtered = routes.filter(r => r.id !== id);
        setStorage(DB.ROUTES, filtered);
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/routes/${id}`, {
            method: 'DELETE'
        });
    }
  }
};
