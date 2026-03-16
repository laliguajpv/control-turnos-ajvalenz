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
    
    // Si la hoja no existe, esto daría error, por eso usamos try/catch
    const sheet = doc.sheetsByTitle['CONFIGURACION'];
    if (!sheet) throw new Error("No existe la pestaña CONFIGURACION");

    const rows = await sheet.getRows();

    const config = {
      guardias: rows.map(r => ({ nombre: r.get('Guardias') || '', rut: r.get('RUT') || '' })).filter(g => g.nombre),
      instalaciones: rows.map(r => r.get('Instalaciones')).filter(Boolean),
      supervisores: rows.map(r => r.get('Supervisores')).filter(Boolean),
      motivos: rows.map(r => r.get('Motivos')).filter(Boolean),
      turnos: rows.map(r => r.get('Turnos')).filter(Boolean),
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error en CONFIG:", error.message);
    // Devolvemos listas vacías para que el frontend no explote
    return NextResponse.json({ guardias: [], instalaciones: [], supervisores: [], motivos: [], turnos: [] });
  }
}