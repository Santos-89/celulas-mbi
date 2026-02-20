import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

/* load 'fs' for readFile and writeFile support */
import * as cfs from 'fs';
XLSX.set_fs(cfs);

const excelPath = "/Volumes/Proyectos/App Células/Datos Células.xlsx";
const outputPath = "./src/data/cells.ts";

function excelDateToTime(serial) {
    if (typeof serial !== 'number') return serial;
    const totalSeconds = Math.floor(serial * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const processedCells = data.filter(row => row['LÍDER'] && row['TELÉFONO'] && row['UBICACIÓN MAPS'])
        .map((row, index) => ({
            id: String(index + 1),
            leaderName: row['LÍDER'],
            leaderPhone: String(row['TELÉFONO']),
            type: row['CÉLULA DE'] || "General",
            day: row['DÍA DE CÉLULA'] || "Por definir",
            time: excelDateToTime(row['HORA']) || "Por definir",
            address: row['DIRECCIÓN'] || "Sin dirección",
            neighborhood: row['DIRECCIÓN'] || "Quito",
            coordinates: { lat: -0.1807, lng: -78.4678 } // Mocked coordinates (Quito)
        }));

    const fileContent = `import { CellGroup } from "../types";

export const SAMPLE_CELLS: CellGroup[] = ${JSON.stringify(processedCells, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Importación completada: ${processedCells.length} células procesadas.`);
} catch (error) {
    console.error("Error en la importación:", error.message);
}
