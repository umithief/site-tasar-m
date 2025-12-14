
import { useState, useEffect } from 'react';

interface ColorStats {
  r: number;
  g: number;
  b: number;
  count: number;
  score: number;
}

export const useColorExtractor = (imageUrl: string, maxColors: number = 4) => {
  const [colors, setColors] = useState<string[]>([]);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) return;

    let isMounted = true;

    const extractColors = () => {
      setLoading(true);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // Sadece HTTP linkleri için cache-busting yap, base64 veya local path'leri bozma
      if (imageUrl.startsWith('http')) {
          img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
      } else {
          img.src = imageUrl;
      }

      img.onload = () => {
        if (!isMounted) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                setLoading(false);
                return;
            }

            // Performans için küçük boyut
            const width = 50; 
            const height = 50;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            
            const imageData = ctx.getImageData(0, 0, width, height).data;
            const colorMap: Record<string, ColorStats> = {};

            // Pikselleri tara
            for (let i = 0; i < imageData.length; i += 4) {
              const r = imageData[i];
              const g = imageData[i + 1];
              const b = imageData[i + 2];
              const a = imageData[i + 3];

              // Filtreleme: Tam şeffaf veya aşırı beyaz/parlak pikselleri atla.
              // Koyu renkleri tamamen dışlamıyoruz ama çok düşük parlaklıkları eliyoruz.
              if (a < 128 || (r > 245 && g > 245 && b > 245)) continue;

              // Renkleri grupla (Quantization)
              // Daha hassas gruplama için quantization değerini düşürdük (20 -> 16)
              const quantization = 16; 
              const rQ = Math.round(r / quantization) * quantization;
              const gQ = Math.round(g / quantization) * quantization;
              const bQ = Math.round(b / quantization) * quantization;

              const key = `${rQ},${gQ},${bQ}`;

              if (!colorMap[key]) {
                const max = Math.max(rQ, gQ, bQ);
                const min = Math.min(rQ, gQ, bQ);
                const saturation = max - min; 
                const brightness = (rQ + gQ + bQ) / 3;

                // Score Hesabı:
                // 1. Canlılık (Saturation) önemli.
                // 2. Çok koyu (<40) veya çok açık (>230) renklere ceza ver.
                let brightnessPenalty = 1;
                if (brightness < 40) brightnessPenalty = 0.6; // Çok koyu
                if (brightness > 220) brightnessPenalty = 0.5; // Çok açık

                const baseScore = (1 + (saturation / 255) * 4) * brightnessPenalty;

                colorMap[key] = { r: rQ, g: gQ, b: bQ, count: 0, score: baseScore };
              }
              
              colorMap[key].count++;
            }

            // Final skor = Base Score * Count
            // Yani; hem çok bulunan hem de canlı olan renkler kazanır.
            Object.values(colorMap).forEach(c => {
                c.score *= Math.sqrt(c.count); // Count'ın etkisini biraz yumuşat (karekök)
            });

            const sortedCandidates = Object.values(colorMap).sort((a, b) => b.score - a.score);
            
            // Distinct Color Selection (Mesafe Kontrolü)
            const distinctColors: {r: number, g: number, b: number, hex: string}[] = [];
            const minDistance = 60; // Renkler arası minimum RGB mesafesi

            for (const candidate of sortedCandidates) {
                if (distinctColors.length >= maxColors) break;

                const hex = rgbToHex(candidate.r, candidate.g, candidate.b);
                let isDistinct = true;

                for (const p of distinctColors) {
                    const dist = Math.sqrt(
                        Math.pow(candidate.r - p.r, 2) +
                        Math.pow(candidate.g - p.g, 2) +
                        Math.pow(candidate.b - p.b, 2)
                    );
                    if (dist < minDistance) {
                        isDistinct = false;
                        break;
                    }
                }

                if (isDistinct) {
                    distinctColors.push({ r: candidate.r, g: candidate.g, b: candidate.b, hex });
                }
            }

            const hexColors = distinctColors.map(c => c.hex);

            setColors(hexColors);
            if (hexColors.length > 0) {
                setDominantColor(hexColors[0]);
            } else {
                setDominantColor(null);
            }
        } catch (e) {
            console.warn("Color extraction failed:", e);
        } finally {
            if (isMounted) setLoading(false);
        }
      };

      img.onerror = () => {
          if (isMounted) setLoading(false);
      };
    };

    extractColors();

    return () => { isMounted = false; };
  }, [imageUrl, maxColors]);

  return { colors, dominantColor, loading };
};

// Yardımcı Fonksiyon
function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
