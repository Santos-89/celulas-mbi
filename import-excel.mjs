import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';

const EXCEL_PATH = "/Volumes/Proyectos/App Células/Datos Células.xlsx";
const OUTPUT_PATH = "./src/data/cells.ts";

/**
 * Script para transformar el Excel de Células en el formato TypeScript de la App.
 * Ejecución: node import-excel.mjs
 */

async function run() {
    try {
        console.log("📂 Leyendo archivo Excel...");
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`✅ ${rawData.length} filas encontradas.`);

        const processedCells = rawData.map((row, index) => {
            // Mapeo de columnas del Excel (ajustar según los nombres exactos)
            const id = (index + 1).toString();
            const leaderName = row['LIDER'] || 'Sin nombre';
            const leaderPhone = row['CELULAR'] || '';
            const type = row['TIPO'] || 'Adultos';
            const day = row['DIA'] || 'Martes';
            const time = row['HORA'] || '7:00 PM';
            const address = row['DIRECCIÓN'] || '';
            const neighborhood = row['BARRIO'] || address;

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
