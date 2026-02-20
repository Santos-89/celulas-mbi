import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

/* load 'fs' for readFile and writeFile support */
import * as cfs from 'fs';
XLSX.set_fs(cfs);

const excelPath = "/Volumes/Proyectos/App Células/Datos Células.xlsx";

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log("Columnas detectadas:", Object.keys(data[0] || {}));
    console.log("Primeros 2 registros:", JSON.stringify(data.slice(0, 2), null, 2));
} catch (error) {
    console.error("Error al leer el archivo:", error.message);
}
