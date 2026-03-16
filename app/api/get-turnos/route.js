import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    
    // 1. Cargamos los turnos de la "Hoja 1"
    const sheetTurnos = doc.sheetsByIndex[0];
    const rowsTurnos = await sheetTurnos.getRows();

    // 2. Cargamos los RUTs de la pestaña "CONFIGURACION"
    const sheetConfig = doc.sheetsByTitle['CONFIGURACION'];
    const rowsConfig = await sheetConfig.getRows();

    // 3. Creamos un "diccionario" de RUTs para buscarlos rápido
    const diccionarioRuts = {};
    rowsConfig.forEach(row => {
      const nombre = row.get('Guardias')?.trim();
      const rut = row.get('RUT')?.trim();
      if (nombre) diccionarioRuts[nombre] = rut;
    });

    // 4. Cruzamos la información (Vínculo)
    const data = rowsTurnos.map(row => {
      const nombreGuardia = row.get('nombre') || '';
      return {
        id_guardia: row.get('id guardia') || '',
        nombre: nombreGuardia,
        // Buscamos el RUT en el diccionario usando el nombre
        rut: diccionarioRuts[nombreGuardia] || 'Sin RUT', 
        fecha: row.get('fecha') || '',
        turno: row.get('turno') || '',
        total_hrs: row.get('total hrs') || '0',
        instalacion: row.get('instalacion') || '',
        gestionado_por: row.get('gestionado por') || '',
        motivo: row.get('motivo') || '',
        observaciones: row.get('observaciones') || ''
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error vinculando datos:", error);
    return NextResponse.json([]);
  }
}