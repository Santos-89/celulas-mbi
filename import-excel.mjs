import pkg from 'xlsx';
const { read, utils } = pkg;
import * as fs from 'fs';

const EXCEL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSW4b28Ow3VM5yWIv2RDtzxtj9gVHUPc-Jv17XSRwHvqD3URf06lHaO84lOKp6OSlkOgqNeuiCajZ8a/pub?output=xlsx";
const OUTPUT_PATH = "./src/data/cells.ts";

/**
 * Script para transformar el Google Sheet de Células en el formato TypeScript de la App.
 * Ejecución: node import-excel.mjs
 */

async function run() {
    try {
        console.log("☁️ Descargando datos desde Google Sheets...");
        const response = await fetch(EXCEL_URL);
        if (!response.ok) throw new Error(`Error al descargar: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = utils.sheet_to_json(worksheet);

        const getField = (row, alternatives) => {
            const keys = Object.keys(row);
            const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const normalizedAlts = alternatives.map(normalize);
            const foundKey = keys.find(k => normalizedAlts.includes(normalize(k)));
            return foundKey ? row[foundKey] : undefined;
        };

        console.log(`✅ ${rawData.length} filas encontradas.`);

        const processedCells = rawData.map((row, index) => {
            const id = (index + 1).toString();
            const leaderName = getField(row, ['LIDER', 'LÍDER', 'NOMBRE']) || 'Sin nombre';
            const leaderPhone = String(getField(row, ['TELEFONO', 'TELÉFONO', 'CELULAR', 'PHONE', 'WHATSAPP', 'CONTACTO', 'NUMERO', 'NÚMERO', 'CONTACT']) || '');
            const type = getField(row, ['CELULA DE', 'TIPO', 'TIPO DE CELULA', 'TIPO DE CÉLULA']) || 'Adultos';
            const day = getField(row, ['DIA DE CELULA', 'DÍA DE CÉLULA', 'DIA', 'DÍA', 'DIA DE REUNIÓN']) || 'Martes';
            let time = getField(row, ['HORA', 'TIME', 'HORARIO', 'TIEMPO']) || '7:00 PM';

            if (typeof time === 'number') {
                const totalSeconds = Math.round(time * 86400);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const h12 = hours % 12 || 12;
                time = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }

            const address = getField(row, ['DIRECCION', 'DIRECCIÓN', 'UBICACION', 'UBICACIÓN', 'DIRECION']) || '';
            const neighborhood = getField(row, ['BARRIO', 'SECTOR']) || address;

            let lat = -0.2820;
            let lng = -78.5276;

            const rowLat = getField(row, ['LATITUD', 'LAT', 'COORDENADA Y', 'Y']);
            const rowLng = getField(row, ['LONGITUD', 'LNG', 'COORDENADA X', 'X']);

            const parseCoord = (val) => {
                if (val === undefined || val === null || val === '') return null;
                let str = String(val).trim().replace(',', '.');
                const dots = str.split('.');
                if (dots.length > 2) {
                    str = dots[0] + '.' + dots.slice(1).join('');
                }
                let num = parseFloat(str);
                if (isNaN(num)) return null;
                // Final range adjustment for Quito (Lat ~-0.2, Lng ~-78)
                if (num < 0) {
                    const a = Math.abs(num);
                    if (a > 1) {
                        const firstDigit = String(a).replace('.', '')[0];
                        if (firstDigit === '2' || firstDigit === '3' || a < 10) {
                            while (Math.abs(num) >= 1) num = num / 10;
                        } else {
                            while (Math.abs(num) > 90) num = num / 10;
                        }
                    }
                }
                return num;
            };

            const parsedLat = parseCoord(rowLat);
            const parsedLng = parseCoord(rowLng);

            if (parsedLat !== null && parsedLng !== null) {
                lat = parsedLat;
                lng = parsedLng;
            } else {
                const mapsLink = getField(row, ['UBICACION MAPS', 'UBICACIÓN MAPS', 'GOOGLE MAPS', 'MAPS']);
                if (typeof mapsLink === 'string' && mapsLink.includes(',')) {
                    const parts = mapsLink.split(',').map(p => parseFloat(p.trim()));
                    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        lat = parts[0];
                        lng = parts[1];
                    }
                }

                if (lat === -0.2820 && lng === -78.5276) {
                    const b = neighborhood.toLowerCase();
                    if (b.includes('chillogallo')) { lat = -0.2775; lng = -78.5750; }
                    else if (b.includes('solanda')) { lat = -0.2659; lng = -78.5353; }
                    else if (b.includes('quitumbe')) { lat = -0.2954; lng = -78.5550; }
                    else if (b.includes('guamaní')) { lat = -0.3286; lng = -78.5598; }
                    else if (b.includes('argelia')) { lat = -0.2758; lng = -78.5261; }
                    else if (b.includes('pueblo unido')) { lat = -0.2980; lng = -78.5500; }
                    else if (b.includes('santa rita')) { lat = -0.2721; lng = -78.5445; }
                }
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

        const fileContent = `import { CellGroup } from "../types";

export const SAMPLE_CELLS: CellGroup[] = ${JSON.stringify(processedCells, null, 2)};
`;

        fs.writeFileSync(OUTPUT_PATH, fileContent);
        console.log(`✨ ¡Éxito! Archivo ${OUTPUT_PATH} actualizado.`);

    } catch (error) {
        console.error("❌ Error durante la importación:", error.message);
    }
}

run();
