
import { StolenItem } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

// Mock Data
const MOCK_STOLEN: StolenItem[] = [
    {
        _id: 'st_1',
        serialNumber: 'AGV-K6-88291',
        brand: 'AGV',
        model: 'K6 S Black',
        category: 'Kask',
        dateStolen: '2024-05-15',
        city: 'İstanbul',
        contactInfo: '0555 111 22 33',
        description: 'Kadıköy rıhtımda çalındı. Vizöründe belirgin bir çizik var.',
        status: 'stolen',
        dateReported: new Date().toLocaleDateString('tr-TR')
    },
    {
        _id: 'st_2',
        serialNumber: 'SENA-50S-9912',
        brand: 'Sena',
        model: '50S Harman Kardon',
        category: 'İnterkom',
        dateStolen: '2024-05-10',
        city: 'İzmir',
        contactInfo: '0532 999 88 77',
        description: 'Kaskın üzerinden sökülmüş. Kutusu bende.',
        status: 'stolen',
        dateReported: new Date().toLocaleDateString('tr-TR')
    }
];

export const stolenService = {
    async reportStolen(item: Omit<StolenItem, '_id' | 'dateReported' | 'status'>): Promise<StolenItem> {
        const newItem: StolenItem = {
            ...item,
            _id: `stol_${Date.now()}`,
            status: 'stolen',
            dateReported: new Date().toLocaleDateString('tr-TR')
        };

        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            const items = getStorage<StolenItem[]>(DB.STOLEN_ITEMS, []);
            items.unshift(newItem);
            setStorage(DB.STOLEN_ITEMS, items);
            return newItem;
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/stolen-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            return await response.json();
        }
    },

    async checkSerial(serialNumber: string): Promise<StolenItem[]> {
        if (!serialNumber) return [];

        await delay(500); // Simulate search delay

        let items: StolenItem[] = [];
        if (CONFIG.USE_MOCK_API) {
            const stored = getStorage<StolenItem[]>(DB.STOLEN_ITEMS, []);
            if (stored.length === 0) items = MOCK_STOLEN;
            else items = [...stored, ...MOCK_STOLEN];
        } else {
            try {
                const response = await fetch(`${CONFIG.API_URL}/stolen`);
                if (response.ok) items = await response.json();
            } catch {
                items = MOCK_STOLEN;
            }
        }

        // Normalize search
        const query = serialNumber.toLowerCase().replace(/\s/g, '');
        return items.filter(i => i.serialNumber.toLowerCase().replace(/\s/g, '').includes(query));
    },

    async getRecentReports(): Promise<StolenItem[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const stored = getStorage<StolenItem[]>(DB.STOLEN_ITEMS, []);
            if (stored.length === 0) return MOCK_STOLEN;
            return [...stored, ...MOCK_STOLEN].slice(0, 10); // Return last 10
        } else {
            try {
                const response = await fetch(`${CONFIG.API_URL}/stolen-items`);
                if (response.ok) return await response.json();
                return MOCK_STOLEN;
            } catch {
                return MOCK_STOLEN;
            }
        }
    }
};
