import pkg from 'xlsx';
const { readFile, utils } = pkg;
import * as fs from 'fs';
import path from 'path';

const EXCEL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSW4b28Ow3VM5yWIv2RDtzxtj9gVHUPc-Jv17XSRwHvqD3URf06lHaO84lOKp6OSlkOgqNeuiCajZ8a/pub?output=xlsx";
const OUTPUT_PATH = "./src/data/cells.ts";

/**
 * Script para transformar el Google Sheet de Células en el formato TypeScript de la App.
 * Ejecución: node import-excel.mjs
 */

async function run() {
    try {
        const getField = (row, alternatives) => {
            const keys = Object.keys(row);
            for (const alt of alternatives) {
                const found = keys.find(k => k.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === alt.toUpperCase());
                if (found) return row[found];
            }
            return null;
        };

        console.log(`✅ ${rawData.length} filas encontradas.`);

        const processedCells = rawData.map((row, index) => {
            const id = (index + 1).toString();
            const leaderName = getField(row, ['LIDER', 'NOMBRE']) || 'Sin nombre';
            const leaderPhone = getField(row, ['TELEFONO', 'CELULAR']) || '';
            const type = getField(row, ['CELULA DE', 'TIPO']) || 'Adultos';
            const day = getField(row, ['DIA DE CELULA', 'DIA']) || 'Martes';
            let time = getField(row, ['HORA', 'TIEMPO']) || '7:00 PM';

            // Si Excel lo entrega como número (fracción de día), formatearlo
            if (typeof time === 'number') {
                const totalSeconds = Math.round(time * 86400);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const h12 = hours % 12 || 12;
                time = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }
            const address = getField(row, ['DIRECION', 'UBICACION']) || '';
            const neighborhood = getField(row, ['BARRIO']) || address;

            let lat = -0.2820;
            let lng = -78.5276;

            const sheetLat = getField(row, ['LATITUD', 'LAT', 'COORDENADA Y']);
            const sheetLng = getField(row, ['LONGITUD', 'LNG', 'COORDENADA X']);

            if (sheetLat && sheetLng) {
                lat = parseFloat(sheetLat);
                lng = parseFloat(sheetLng);
            } else {
                // Lógica de fallback por barrio conocido
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

        const fileContent = `import { CellGroup } from "../types";

export const SAMPLE_CELLS: CellGroup[] = ${JSON.stringify(processedCells, null, 2)};
`;

        fs.writeFileSync(OUTPUT_PATH, fileContent);
        console.log(`✨ ¡Éxito! Archivo ${OUTPUT_PATH} actualizado.`);
        console.log(`🚀 Ahora puedes ver los cambios en la app.`);

    } catch (error) {
        console.error("❌ Error durante la importación:", error.message);
    }
}

run();
