
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

// Client instance holder
let ai: GoogleGenAI | null = null;

// Initialize the client lazily to prevent startup crashes if environment is not ready
const getAiClient = () => {
  if (!ai) {
    // API key must be obtained exclusively from process.env.API_KEY
    if (!process.env.API_KEY) {
      console.error("API Key is missing!");
      throw new Error("API Key eksik");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
Sen MotoVibe adında bir motosiklet aksesuar mağazasının uzman yapay zeka satış danışmanısın.
Amacın, kullanıcıların sürüş tarzına, bütçesine ve ihtiyaçlarına göre mağazamızdaki en uygun ürünleri önermektir.

Aşağıdaki ürün listesine tam erişimin var. Lütfen sadece bu listedeki ürünleri öner, ancak genel motosiklet tavsiyesi de verebilirsin.
Ürün önerirken ürünün adını ve neden o kullanıcı için uygun olduğunu belirt.

ÜRÜN LİSTESİ:
${JSON.stringify(PRODUCTS.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, features: p.features })))}

Kurallar:
1. Çok nazik, "kardeşim", "dostum" gibi samimi ama saygılı bir motorcu dili kullanabilirsin.
2. Kısa ve öz cevaplar ver.
3. Kullanıcı "Merhaba" derse, ona nasıl yardımcı olabileceğini sor (Örn: Hangi motoru sürüyorsun? Hava durumu nasıl? vb.)
4. Sadece Türkçe konuş.
5. Ürün önerdiğinde fiyatını da belirt.
`;

export const sendMessageToGemini = async (message: string, history: { role: 'user' | 'model'; text: string }[] = []): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Anahtarı eksik. Lütfen geliştirici ile iletişime geçin.";
  }

  try {
    const client = getAiClient();
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Yanıt alınamadı.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && (error.message.includes("Rpc failed") || error.message.includes("xhr error"))) {
        return "Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.";
    }
    return "Üzgünüm, şu an bağlantımda bir sorun var.";
  }
};

export const getValuationAnalysis = async (data: { brand: string; model: string; year: string; km: string; condition: string; city: string }): Promise<string> => {
    if (!process.env.API_KEY) return "API Key Eksik";

    try {
        const client = getAiClient();
        const prompt = `
            Bir motosiklet eksperi gibi davran. Aşağıdaki özelliklere sahip motosikletin Türkiye ikinci el piyasasındaki (Sahibinden.com, Arabam.com vb. pazar yerleri ortalamaları) tahmini satış fiyat aralığını analiz et.
            
            Marka: ${data.brand}
            Model: ${data.model}
            Yıl: ${data.year}
            KM: ${data.km}
            Durum: ${data.condition}
            Şehir: ${data.city}

            Yanıtını MUTLAKA şu formatta JSON olarak ver (başka metin ekleme):
            {
                "minPrice": number (TL cinsinden, örn: 250000),
                "maxPrice": number (TL cinsinden, örn: 280000),
                "avgPrice": number (TL cinsinden, örn: 265000),
                "liquidity": "Hızlı" | "Orta" | "Yavaş" (Satış hızı tahmini),
                "comment": "Kısa bir uzman yorumu (maksimum 2 cümle)."
            }
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        // Temizlik (Bazen markdown ```json ``` dönebilir)
        let text = response.text || "";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return text;
    } catch (e) {
        console.error("Valuation Error", e);
        return JSON.stringify({ minPrice: 0, maxPrice: 0, avgPrice: 0, liquidity: 'Bilinmiyor', comment: 'Hata oluştu.' });
    }
};
