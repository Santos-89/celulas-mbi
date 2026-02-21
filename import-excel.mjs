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
        console.log("☁️ Descargando datos desde Google Sheets...");
        const response = await fetch(EXCEL_URL);
        if (!response.ok) throw new Error(`Error al descargar: ${response.statusText}`);

        const buffer = await response.arrayBuffer();
        const workbook = pkg.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = utils.sheet_to_json(worksheet);

        console.log(`✅ ${rawData.length} filas encontradas.`);

        const processedCells = rawData.map((row, index) => {
            // Mapeo de columnas del Excel (ajustar según los nombres exactos)
            const id = (index + 1).toString();
            const leaderName = row['LÍDER'] || 'Sin nombre';
            const leaderPhone = row['TELÉFONO'] || '';
            const type = row['CÉLULA DE'] || 'Adultos';
            const day = row['DÍA DE CÉLULA'] || 'Martes';
            let time = row['HORA'] || '7:00 PM';

            // Si Excel lo entrega como número (fracción de día), formatearlo
            if (typeof time === 'number') {
                const totalSeconds = Math.round(time * 86400);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const h12 = hours % 12 || 12;
                time = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }
            const address = row['DIRECCIÓN'] || '';
            const neighborhood = address; // Simplificado ya que no hay columna BARRIO explícita en el sample detectado

            // Coordenadas base por barrio (para evitar que todas estén en el centro)
            // Si el Excel tiene columnas LATITUD y LONGITUD, úsalas aquí.
            let lat = -0.2820; // Default (Sur de Quito)
            let lng = -78.5276;

            if (row['LATITUD'] && row['LONGITUD']) {
                lat = parseFloat(row['LATITUD']);
                lng = parseFloat(row['LONGITUD']);
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
