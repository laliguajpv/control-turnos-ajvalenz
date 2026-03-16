import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ESTA LÍNEA ES LA MAGIA: Arregla la llave para Vercel sí o sí
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = rawKey
      .replace(/\\n/g, '\n')     // Cambia las barras de texto por saltos reales
      .replace(/"/g, '')         // Quita comillas si se colaron
      .trim();                   // Quita espacios locos al inicio o final

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim(),
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID?.trim(), serviceAccountAuth);
    await doc.loadInfo(); 
    
    const sheet = doc.sheetsByTitle['CONFIGURACION'] || doc.sheetsByIndex[1];
    const rows = await sheet.getRows();

    return NextResponse.json({
      guardias: rows.map(r => ({ 
        id: r._rawData[0] || '',      
        nombre: r._rawData[1] || ''   
      })).filter(g => g.nombre),
      instalaciones: rows.map(r => r._rawData[3]).filter(Boolean),
      supervisores: rows.map(r => r._rawData[4]).filter(Boolean),
      motivos: rows.map(r => r._rawData[5]).filter(Boolean),
      turnos: rows.map(r => r._rawData[6]).filter(Boolean),
    });

  } catch (error) {
    // Si falla, ahora el log te dirá la verdad pura y dura
    console.error("ERROR DETECTADO:", error.message);
    return NextResponse.json({ 
      error: "Error de conexión", 
      detalle: error.message 
    }, { status: 500 });
  }
}