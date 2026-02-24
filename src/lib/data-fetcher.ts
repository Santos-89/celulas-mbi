import * as XLSX from 'xlsx';
import { CellGroup } from '../types';

const EXCEL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSW4b28Ow3VM5yWIv2RDtzxtj9gVHUPc-Jv17XSRwHvqD3URf06lHaO84lOKp6OSlkOgqNeuiCajZ8a/pub?output=xlsx";
const CACHE_KEY = "cells_data";

export async function fetchLiveCells(): Promise<CellGroup[]> {
    try {
        console.log("☁️ Fetching live data from Google Sheets...");
        const response = await fetch(EXCEL_URL);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const processedCells: CellGroup[] = rawData.map((row, index) => {
            // Helper to find a field regardless of accents or case
            const getField = (row: any, searchNames: string[]) => {
                const keys = Object.keys(row);
                const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                const normalizedSearch = searchNames.map(normalize);

                const foundKey = keys.find(k => normalizedSearch.includes(normalize(k)));
                return foundKey ? row[foundKey] : undefined;
            };

            const id = (index + 1).toString();
            const leaderName = getField(row, ['LÍDER', 'LIDER', 'NOMBRE']) || 'Sin nombre';
            const leaderPhone = String(getField(row, ['TELÉFONO', 'TELEFONO', 'CELULAR', 'PHONE']) || '');
            const type = getField(row, ['CÉLULA DE', 'TIPO', 'TIPO DE CÉLULA']) || 'Adultos';
            const day = getField(row, ['DÍA DE CÉLULA', 'DIA', 'DIA DE REUNION']) || 'Martes';
            let time = getField(row, ['HORA']) || '7:00 PM';

            if (typeof time === 'number') {
                const totalSeconds = Math.round(time * 86400);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const h12 = hours % 12 || 12;
                time = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }

            const address = getField(row, ['DIRECCIÓN', 'DIRECCION', 'UBICACIÓN']) || '';
            const neighborhood = address;

            let lat = -0.2820;
            let lng = -78.5276;

            const rowLat = getField(row, ['LATITUD', 'LAT']);
            const rowLng = getField(row, ['LONGITUD', 'LNG', 'LON']);

            if (rowLat && rowLng) {
                lat = parseFloat(rowLat);
                lng = parseFloat(rowLng);
            } else {
                const b = neighborhood.toLowerCase();
                if (b.includes('chillogallo')) { lat = -0.2775; lng = -78.5750; }
                else if (b.includes('solanda')) { lat = -0.2659; lng = -78.5353; }
                else if (b.includes('quitumbe')) { lat = -0.2954; lng = -78.5550; }
                else if (b.includes('guamaní')) { lat = -0.3286; lng = -78.5598; }
                else if (b.includes('argelia')) { lat = -0.2758; lng = -78.5261; }
                else if (b.includes('pueblo unido')) { lat = -0.2980; lng = -78.5500; }
                else if (b.includes('santa rita')) { lat = -0.2721; lng = -78.5445; }
            }

            return {
                id,
                leaderName,
                leaderPhone,
                type,
                day,
                time,
                address,
                neighborhood,
                coordinates: { lat, lng }
            };
        });

        // Cache the data
        if (typeof window !== "undefined") {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: processedCells
            }));
        }

        return processedCells;
    } catch (error) {
        console.error("❌ Error fetching live data:", error);

        // Try to return cached data
        if (typeof window !== "undefined") {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data } = JSON.parse(cached);
                return data;
            }
        }

        throw error;
    }
}
