import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as docx from 'docx';

const {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  Header, Footer, PageNumber, NumberFormat, PageBreak, ImageRun
} = docx;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../Reporte_Practica_FitNet_Distribucion_Integracion.docx');

// Paleta de colores profesionales
const COLOR_PRIMARY = '0F294A';    // Azul Marino Institucional
const COLOR_SECONDARY = '1E40AF';  // Azul Real
const COLOR_ACCENT = '059669';     // Verde Esmeralda
const COLOR_MUTED = '64748B';      // Gris Pizarra
const COLOR_DARK = '1E293B';       // Texto Principal
const COLOR_BORDER = 'CBD5E1';     // Borde Tablas

// Utilidades para párrafos con formato estándar
function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 38,
        color: COLOR_PRIMARY,
        font: 'Calibri'
      })
    ]
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 240 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: COLOR_SECONDARY,
        font: 'Calibri'
      })
    ]
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 30,
        color: COLOR_PRIMARY,
        font: 'Calibri'
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: COLOR_SECONDARY,
        font: 'Calibri'
      })
    ]
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 21,
        color: COLOR_DARK,
        font: 'Calibri'
      })
    ]
  });
}

function createBody(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 80, line: 276 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: COLOR_DARK,
        font: 'Calibri',
        bold: options.bold || false,
        italics: options.italics || false
      })
    ]
  });
}

function createBullet(text, boldPrefix = '') {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      ...(boldPrefix ? [new TextRun({ text: boldPrefix + ' ', bold: true, size: 22, color: COLOR_DARK, font: 'Calibri' })] : []),
      new TextRun({ text, size: 22, color: COLOR_DARK, font: 'Calibri' })
    ]
  });
}

function createCallout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_SECONDARY },
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE }
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 40 },
                children: [
                  new TextRun({ text: '📌 ' + title, bold: true, size: 22, color: COLOR_PRIMARY, font: 'Calibri' })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 60, line: 260 },
                children: [
                  new TextRun({ text, size: 21, color: COLOR_DARK, font: 'Calibri', italics: true })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createStyledTable(headers, rowsData) {
  const tableRows = [];

  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(h => 
        new TableCell({
          shading: { fill: COLOR_PRIMARY, type: ShadingType.CLEAR },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_PRIMARY },
            left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER },
            right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BORDER }
          },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF', font: 'Calibri' })
              ]
            })
          ]
        })
      )
    })
  );

  rowsData.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0;
    tableRows.push(
      new TableRow({
        children: row.map((cellText, colIndex) => 
          new TableCell({
            shading: { fill: isEven ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
            },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: colIndex === 0 ? AlignmentType.LEFT : (colIndex === row.length - 1 ? AlignmentType.CENTER : AlignmentType.LEFT),
                children: [
                  new TextRun({ text: cellText, size: 20, color: COLOR_DARK, font: 'Calibri' })
                ]
              })
            ]
          })
        )
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

function createImageFigure(imageFilename, width, height, caption, descriptionText) {
  const fullPath = path.resolve(__dirname, '../docs_images', imageFilename);
  if (!fs.existsSync(fullPath)) {
    console.warn('⚠️ Imagen no encontrada:', fullPath);
    return [];
  }
  const imgBuffer = fs.readFileSync(fullPath);

  const elements = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 220, after: 60 },
      children: [
        new ImageRun({
          data: imgBuffer,
          transformation: {
            width,
            height
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 80 },
      children: [
        new TextRun({
          text: caption,
          bold: true,
          size: 20,
          color: COLOR_SECONDARY,
          font: 'Calibri'
        })
      ]
    })
  ];

  if (descriptionText) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 20, after: 180, line: 260 },
        children: [
          new TextRun({
            text: descriptionText,
            italics: true,
            size: 19,
            color: COLOR_MUTED,
            font: 'Calibri'
          })
        ]
      })
    );
  }

  return elements;
}

function createTwoMobileFigures(img1Name, caption1, img2Name, caption2, generalDescription) {
  const p1 = path.resolve(__dirname, '../docs_images', img1Name);
  const p2 = path.resolve(__dirname, '../docs_images', img2Name);
  if (!fs.existsSync(p1) || !fs.existsSync(p2)) {
    console.warn('⚠️ Imagen móvil no encontrada:', p1, p2);
    return [];
  }
  const buf1 = fs.readFileSync(p1);
  const buf2 = fs.readFileSync(p2);

  const mWidth = 210;
  const mHeight = 465;

  const elements = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              margins: { left: 40, right: 40 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 60 },
                  children: [
                    new ImageRun({
                      data: buf1,
                      transformation: { width: mWidth, height: mHeight }
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 80 },
                  children: [
                    new TextRun({
                      text: caption1,
                      bold: true,
                      size: 19,
                      color: COLOR_SECONDARY,
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              margins: { left: 40, right: 40 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 60 },
                  children: [
                    new ImageRun({
                      data: buf2,
                      transformation: { width: mWidth, height: mHeight }
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 80 },
                  children: [
                    new TextRun({
                      text: caption2,
                      bold: true,
                      size: 19,
                      color: COLOR_SECONDARY,
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  ];

  if (generalDescription) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 40, after: 180, line: 260 },
        children: [
          new TextRun({
            text: generalDescription,
            italics: true,
            size: 19,
            color: COLOR_MUTED,
            font: 'Calibri'
          })
        ]
      })
    );
  }

  return elements;
}

console.log('Generando documento de Word...');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 22,
          color: COLOR_DARK
        }
      }
    }
  },
  sections: [
    // SECCIÓN 1: PORTADA ELEGANTE INSTITUCIONAL
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({ text: 'UNIVERSIDAD / INSTITUTO TECNOLÓGICO', bold: true, size: 26, color: COLOR_PRIMARY, font: 'Calibri' })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [
            new TextRun({ text: 'DEPARTAMENTO DE SISTEMAS COMPUTACIONALES E INFORMÁTICA', size: 20, color: COLOR_MUTED, font: 'Calibri' })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 600 },
          children: [
            new TextRun({ text: 'ASIGNATURA: BASES DE DATOS DISTRIBUIDAS', bold: true, size: 22, color: COLOR_SECONDARY, font: 'Calibri' })
          ]
        }),

        createTitle('REPORTE DE PRÁCTICA DE PROYECTO'),
        createSubtitle('SISTEMA DE BASE DE DATOS DISTRIBUIDA FIT.NET'),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 600 },
          children: [
            new TextRun({
              text: 'Tema: Demostración Práctica de Distribución (Fragmentación Horizontal y Autonomía Local) e Integración de Datos en Tiempo Real',
              italics: true,
              size: 22,
              color: COLOR_MUTED,
              font: 'Calibri'
            })
          ]
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                    bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                    left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                    right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY }
                  },
                  margins: { top: 180, bottom: 180, left: 240, right: 240 },
                  children: [
                    new Paragraph({
                      spacing: { before: 60, after: 60 },
                      children: [
                        new TextRun({ text: 'EQUIPO DE TRABAJO (2 INTEGRANTES):', bold: true, size: 22, color: COLOR_PRIMARY })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 40, after: 40 },
                      children: [
                        new TextRun({ text: '• Integrante 1: ', bold: true, size: 21 }),
                        new TextRun({ text: '[Nombre del Alumno 1] — Matrícula: [Número de Control / Matrícula]', size: 21, italics: true })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 40, after: 120 },
                      children: [
                        new TextRun({ text: '• Integrante 2: ', bold: true, size: 21 }),
                        new TextRun({ text: '[Nombre del Alumno 2] — Matrícula: [Número de Control / Matrícula]', size: 21, italics: true })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 60, after: 40 },
                      children: [
                        new TextRun({ text: 'DOCENTE / ASESOR:', bold: true, size: 22, color: COLOR_PRIMARY })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 40, after: 120 },
                      children: [
                        new TextRun({ text: '[Nombre del Profesor / Docente Titular]', size: 21, italics: true })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 60, after: 40 },
                      children: [
                        new TextRun({ text: 'PERIODO DE DESARROLLO Y ENTREGA:', bold: true, size: 22, color: COLOR_PRIMARY })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 40, after: 60 },
                      children: [
                        new TextRun({ text: 'Inicio: 04 de Septiembre de 2026  |  Entrega de Evidencia: 10 de Septiembre de 2026', size: 20 })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 0 },
          children: [
            new TextRun({ text: 'Semestre 2026-2  |  México', size: 18, color: COLOR_MUTED })
          ]
        }),

        new Paragraph({ children: [new PageBreak()] })
      ]
    },

    // SECCIÓN 2: CUERPO COMPLETO DEL REPORTE ACADÉMICO
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'Fit.Net • Reporte de Práctica BDD (Distribución e Integración)', size: 16, color: COLOR_MUTED, italics: true })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'Página ', size: 18, color: COLOR_MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLOR_MUTED }),
                new TextRun({ text: ' de ', size: 18, color: COLOR_MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: COLOR_MUTED })
              ]
            })
          ]
        })
      },
      children: [
        // ÍNDICE GENERAL
        createHeading1('Índice de Contenido'),
        createBullet('1. Introducción y Planteamiento del Caso Práctico', '1.'),
        createBullet('1.1 Contexto Académico y el Negocio "Fit.Net"', '  1.1'),
        createBullet('1.2 Problema de Distribución: Autonomía Local y Latencia Cero', '  1.2'),
        createBullet('1.3 Problema de Integración: Consolidación Federada en Tiempo Real', '  1.3'),
        createBullet('1.4 Fundamento Teórico: Reglas de Fragmentación Relacional', '  1.4'),
        createBullet('2. Desarrollo del Proyecto (Fases y Cronograma de Ejecución)', '2.'),
        createBullet('2.1 PASO 1 (04/09/2026): Organización del Equipo y Selección Tecnológica', '  2.1'),
        createBullet('2.2 PASO 2 (07/09/2026): Modelo Relacional y Conexión con el Lenguaje', '  2.2'),
        createBullet('2.3 PASO 3 (08/09/2026): Diseño e Implementación de Interfaces Gráficas', '  2.3'),
        createBullet('2.4 PASO 4 (09/09/2026): Validación de Tipos de Usuarios y Matriz de Casos', '  2.4'),
        createBullet('2.5 PASO 5 (09-10/09/2026): Revisión en Clase y Pruebas Automatizadas', '  2.5'),
        createBullet('3. Conclusiones y Lecciones Aprendidas', '3.'),
        createBullet('4. Referencias Bibliográficas', '4.'),

        new Paragraph({ spacing: { before: 160, after: 80 } }),
        createHeading2('Índice de Figuras e Ilustraciones del Sistema'),
        createBullet('Figura 1: Inspección de base de datos relacional local SQLite (centro.db).', 'Fig 1.'),
        createBullet('Figura 2: Terminal principal de torniquete de sucursal en funcionamiento.', 'Fig 2.'),
        createBullet('Figura 3: Panel de control de credencial RFID y perfiles de simulación.', 'Fig 3.'),
        createBullet('Figura 4: Demostración visual de rechazo por violación de disyunción relacional.', 'Fig 4.'),
        createBullet('Figura 5a: Caja consolidada e ingresos totales en tiempo real (Celular del Dueño).', 'Fig 5a.'),
        createBullet('Figura 5b: Monitoreo de aforo y ocupación simultánea de salas (Celular del Dueño).', 'Fig 5b.'),
        createBullet('Figura 6: Monitor de topología de red distribuida y simulación de contingencia.', 'Fig 6.'),
        createBullet('Figura 7a: Formulación matemática de unión relacional móvil (Integración).', 'Fig 7a.'),
        createBullet('Figura 7b: Reporte oficial de cierre de caja multisede para exportación PDF.', 'Fig 7b.'),

        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // 1. INTRODUCCIÓN Y PLANTEAMIENTO DEL PROBLEMA
        createHeading1('1. Introducción y Planteamiento del Caso Práctico'),
        
        createHeading2('1.1 Contexto Académico y el Negocio "Fit.Net"'),
        createBody(
          'En el ámbito de la ingeniería de bases de datos, los sistemas centralizados tradicionales presentan severas limitaciones cuando una organización opera en múltiples sedes geográficas con requisitos estrictos de alta disponibilidad y tiempos de respuesta en tiempo real. Si todos los puntos de venta dependen de un único servidor central, cualquier interrupción en el enlace de telecomunicaciones o saturación del ancho de banda paraliza de inmediato las operaciones físicas en las sucursales.'
        ),
        createBody(
          'El presente proyecto tiene como objetivo demostrar de forma práctica y comprobable los conceptos fundamentales de Distribución e Integración de Datos a través del caso práctico "Fit.Net", una cadena de gimnasios en crecimiento compuesta por dos sucursales operativas:'
        ),
        createBullet('Sucursal Centro: Nodo local asignado al rango primario de socios con identificadores del 1 al 100.', '•'),
        createBullet('Sucursal Norte: Nodo local asignado al rango primario de socios con identificadores del 101 al 200.', '•'),

        createHeading2('1.2 Problema de Distribución: Autonomía Local y Latencia Cero'),
        createBody(
          'Cada sucursal física de Fit.Net cuenta con un torniquete de entrada automatizado equipado con lectores de credenciales y pases de proximidad RFID. Los socios que asisten al gimnasio esperan una validación inmediata que abra el torniquete al instante. Si la validación dependiera de una consulta remota por Internet hacia un servidor en la nube, la latencia de red (frecuentemente superior a 300-800 ms) generaría filas inaceptables en recepción; peor aún, si el servicio de Internet de la sucursal se interrumpe, ningún socio podría ingresar, causando pérdidas financieras y descontento.'
        ),
        createBody(
          'Por tanto, el Problema de Distribución exige Autonomía Local estricta: cada sucursal debe almacenar sus propios datos en un motor de base de datos local embebido en la terminal de acceso. El torniquete debe verificar la vigencia de la membresía, registrar el cobro ($0 para socios activos o $60 para pases diarios) y autorizar el paso en menos de 2 milisegundos, operando con plena normalidad incluso si el cable de red es desconectado.'
        ),

        createHeading2('1.3 Problema de Integración: Consolidación Federada en Tiempo Real'),
        createBody(
          'Por otra parte, la dirección de la franquicia requiere control y supervisión permanente sobre el desempeño económico global de la empresa. El dueño no puede trasladarse físicamente a cada sucursal ni revisar archivos de base de datos individuales para saber cuánto se ha recaudado.'
        ),
        createBody(
          'El Problema de Integración demanda que el dueño pueda abrir en cualquier momento una aplicación en su teléfono móvil personal y observar, de manera unificada y en tiempo real, los ingresos totales acumulados hoy por la suma de todas las sucursales (Ingresos Centro + Ingresos Norte), el número consolidado de asistencias y el flujo detallado de transacciones. Esto requiere un esquema de replicación y sincronización reactiva bidireccional entre las bases locales autónomas y un almacén central de integración.'
        ),

        createHeading2('1.4 Fundamento Teórico: Reglas de Fragmentación Relacional'),
        createBody(
          'Para que un diseño de base de datos distribuida sea formalmente correcto, debe satisfacer rigurosamente las tres reglas de fragmentación horizontal postuladas en la teoría de bases de datos relacionales distribuidas (Özsu & Valduriez, 2011):'
        ),

        createCallout(
          'Reglas Teóricas de Fragmentación Relacional aplicadas a Fit.Net',
          '1. Condición de Completitud: Si una relación R se fragmenta en {R1, R2, ..., Rn}, cada elemento de dato en R debe encontrarse en algún fragmento Ri. En Fit.Net, cada socio registrado pertenece necesariamente al nodo de Centro o al nodo de Norte (ID ∈ [1, 100] ∪ [101, 200]).\n\n' +
          '2. Condición de Reconstrucción: Debe existir un operador relacional que permita recomponer la relación global a partir de sus fragmentos. Para fragmentación horizontal primaria, dicho operador es la Unión Relacional: Clientes_Global = Clientes_Centro ∪ Clientes_Norte.\n\n' +
          '3. Condición de Disyunción: Si un elemento de dato pertenece al fragmento Ri, no debe encontrarse en ningún otro fragmento Rj (i ≠ j). En Fit.Net, Centro ∩ Norte = ∅. Un socio del Centro jamás reside en la base de Norte ni viceversa, evitando anomalías de redundancia y conflicto de llaves primarias.'
        ),

        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // 2. DESARROLLO DEL PROYECTO
        createHeading1('2. Desarrollo del Proyecto (Cronograma y Fases de Ejecución)'),

        createHeading2('2.1 PASO 1 (04/09/2026): Organización del Equipo y Selección Tecnológica'),
        createBody(
          'Durante la primera sesión de trabajo, el equipo de dos integrantes analizó las alternativas de software para satisfacer simultáneamente la autonomía local en hardware de torniquete y la transmisión reactiva al móvil del dueño.'
        ),
        
        createHeading3('A. Asignación de Roles en el Equipo:'),
        createBullet('Integrante 1 (Arquitectura de Datos y Motor Distribuido): Diseño del modelo relacional, definición de restricciones DDL CHECK de fragmentación, gestión de motores locales SQLite, transacciones ACID con Write-Ahead Logging (WAL) y lógica de sincronización diferida.', '•'),
        createBullet('Integrante 2 (Integración, WebSockets e Interfaces Gráficas): Desarrollo del servidor de eventos en tiempo real con Socket.io, diseño visual retro-moderno (Neo-Luna / Frutiger Aero), módulo táctil para smartphone y pantallas de telemetría de torniquete.', '•'),

        createHeading3('B. Justificación del Sistema Gestor de Base de Datos Relacional (SGBD-R):'),
        createBody(
          'Para los nodos de sucursal (Centro y Norte), se seleccionó SQLite (mediante el driver de alto rendimiento better-sqlite3). Esta elección técnica se justifica en:'
        ),
        createBullet('Motor Embebido en Proceso: A diferencia de servidores pesados cliente-servidor (como MySQL o SQL Server), SQLite no requiere un proceso demonio de red ni puertos abiertos en la máquina del torniquete. La comunicación es vía llamadas directas a memoria C/C++, reduciendo la latencia de validación a menos de 2 milisegundos.', '1.'),
        createBullet('Autonomía Total sin Conexión: Cada nodo reside en un archivo binario independiente (centro.db y norte.db). Si falla la red local o Internet, el motor sigue ejecutando transacciones locales sin percatarse del aislamiento.', '2.'),
        createBullet('Concurrencia WAL (Write-Ahead Logging): Permite lecturas y escrituras simultáneas sin bloqueos de contención de tablas, garantizando durabilidad y consistencia estricta.', '3.'),
        createBody(
          'Para el nodo central de integración, se configuró un almacén central dual: una base SQLite central (central.db) como réplica espejo de alta velocidad y compatibilidad opcional con Supabase (PostgreSQL en la nube) para entornos de producción extendidos.'
        ),

        createHeading3('C. Justificación del Lenguaje de Programación y Librerías:'),
        createBullet('Node.js (JavaScript ES Modules): Plataforma asíncrona no bloqueante de alto rendimiento basada en el motor V8, ideal para procesar ráfagas de accesos de torniquete en paralelo.', '•'),
        createBullet('Express.js: Framework web para la exposición de endpoints RESTful limpios y estructurados.', '•'),
        createBullet('Socket.io (WebSockets): Protocolo de comunicación bidireccional en tiempo real que notifica al celular del dueño de cada acceso y cobro en el milisegundo exacto en que ocurre, sin necesidad de sondeos periódicos (polling).', '•'),
        createBullet('React + Tailwind CSS: Stack moderno para la interfaz gráfica, permitiendo componentes modulares, renderizado reactivo y simulación fiel del estilo visual nostálgico Windows XP Neo-Luna / Frutiger Aero.', '•'),

        createHeading2('2.2 PASO 2 (07/09/2026): Modelo Relacional y Conexión con el Lenguaje'),
        createBody(
          'El modelo relacional fue diseñado para forzar matemáticamente la fragmentación horizontal a nivel del motor de base de datos mediante restricciones de integridad CHECK en la clave primaria.'
        ),

        createHeading3('A. Diccionario de Datos del Sistema Distribuido:'),
        createStyledTable(
          ['Tabla', 'Base de Datos', 'Campos Clave', 'Restricción / Regla BDD', 'Propósito Operativo'],
          [
            ['clientes', 'centro.db', 'id (PK), nombre, apellidos, membresia, vigencia, activo', 'CHECK (id BETWEEN 1 AND 100)', 'Fragmento local exclusivo de socios de Sucursal Centro.'],
            ['accesos', 'centro.db', 'id_acceso (PK), cliente_id (FK), fecha_hora, monto, tipo_cobro, sincronizado', 'sincronizado INTEGER DEFAULT 0', 'Bitácora local de ingresos y cola offline de Centro.'],
            ['clientes', 'norte.db', 'id (PK), nombre, apellidos, membresia, vigencia, activo', 'CHECK (id BETWEEN 101 AND 200)', 'Fragmento local exclusivo de socios de Sucursal Norte.'],
            ['accesos', 'norte.db', 'id_acceso (PK), cliente_id (FK), fecha_hora, monto, tipo_cobro, sincronizado', 'sincronizado INTEGER DEFAULT 0', 'Bitácora local de ingresos y cola offline de Norte.'],
            ['sucursales', 'central.db', 'id (PK), codigo, nombre', 'UNIQUE(codigo)', 'Catálogo unificado de sedes (Centro y Norte).'],
            ['accesos_global', 'central.db', 'id_global (PK), sucursal_id, id_acceso_local, cliente_id, monto, tipo_cobro', 'UNIQUE(sucursal_id, id_acceso_local)', 'Integración federada de transacciones globales de ambas sedes.']
          ]
        ),

        new Paragraph({ spacing: { before: 120, after: 80 } }),
        createHeading3('B. Sentencias DDL de Implementación:'),
        createCallout(
          'Definición de Esquema SQL con Fragmentación Forzada (dbConnection.js)',
          '-- Esquema de Sucursal Centro (centro.db)\n' +
          'CREATE TABLE clientes (\n' +
          '  id INTEGER PRIMARY KEY CHECK(id BETWEEN 1 AND 100),\n' +
          '  nombre TEXT NOT NULL, apellidos TEXT NOT NULL,\n' +
          '  membresia TEXT NOT NULL, vigencia TEXT NOT NULL,\n' +
          '  activo INTEGER DEFAULT 1\n' +
          ');\n\n' +
          '-- Esquema de Sucursal Norte (norte.db)\n' +
          'CREATE TABLE clientes (\n' +
          '  id INTEGER PRIMARY KEY CHECK(id BETWEEN 101 AND 200),\n' +
          '  nombre TEXT NOT NULL, apellidos TEXT NOT NULL,\n' +
          '  membresia TEXT NOT NULL, vigencia TEXT NOT NULL,\n' +
          '  activo INTEGER DEFAULT 1\n' +
          ');\n\n' +
          '-- Tabla de Integración Central (central.db)\n' +
          'CREATE TABLE accesos_global (\n' +
          '  id_global INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
          '  sucursal_id INTEGER NOT NULL,\n' +
          '  id_acceso_local INTEGER NOT NULL,\n' +
          '  cliente_id INTEGER NOT NULL, cliente_nombre TEXT NOT NULL,\n' +
          '  fecha_hora TEXT NOT NULL, monto REAL NOT NULL,\n' +
          '  UNIQUE(sucursal_id, id_acceso_local)\n' +
          ');'
        ),

        createHeading3('C. Conexión y Gestión de Concurrencia desde Node.js:'),
        createBody(
          'La conexión se gestiona en server/src/database/dbConnection.js mediante instancias independientes de better-sqlite3. Se habilitó el modo WAL (Write-Ahead Logging) y la directiva wal_autocheckpoint = 10 para asegurar que las modificaciones en memoria se sincronicen continuamente con los archivos físicos .db, permitiendo que herramientas externas (como DB Browser for SQLite o SQLite Viewer en VS Code) consulten los datos de manera inmediata sin inconsistencias.'
        ),

        // FIGURA 1: SQLITE CLIENT
        ...createImageFigure(
          '09_sqlite_database_client.png',
          470,
          350,
          'Figura 1: Inspección de base de datos relacional local SQLite (centro.db)',
          'Entorno de desarrollo mostrando la base de datos embebida local centro.db, verificando la estructura de tablas y su completa autonomía física respecto a la nube.'
        ),

        createHeading2('2.3 PASO 3 (08/09/2026): Diseño e Implementación de Interfaces Gráficas'),
        createBody(
          'La interfaz de usuario fue construida bajo un paradigma de diseño temático Neo-Luna / Frutiger Aero, combinando estética de ventanas de escritorio de Windows XP con microinteracciones modernas de alta fidelidad. El sistema comprende tres pantallas principales:'
        ),

        createHeading3('1. Pantallas de Torniquete Terminal de Acceso (Centro & Norte):'),
        createBody(
          'Representa el punto de venta y control de acceso físico en cada sucursal. Se diseñó con elementos de gran escala y legibilidad:'
        ),
        createBullet('Lector y Validador Contactless: Entrada manual por teclado y sensor virtual RFID que procesa el socio en < 2 ms.', '•'),
        createBullet('Semáforo Visual y Sonidos Retro: Verde con campana XP Ding y confeti al autorizar; Rojo con acorde XP Chord si la membresía está vencida o el ID no corresponde al fragmento; Amarillo indicando Modo Autónomo Local cuando el nodo está desconectado.', '•'),
        createBullet('Cuadrícula de Simulación de Escenarios BDD: Botones de prueba rápida con un solo clic para disparar los 4 casos clave (Socio activo con $0, Pase diario con $60, Socio vencido, y Test de violación de fragmentación disjunta).', '•'),
        createBullet('Historial de Entradas Locales con Modal Elevado y Desenfoque: Incluye buscador instantáneo en tiempo real, filtros por cobro (Todos / Membresía / Cobrados) y estado de sincronización. Cuenta con un botón "Expandir Historial" que eleva la tabla al centro de la pantalla con una animación suave (.animate-elevate) y un fondo oscuro con desenfoque profundo (backdrop-blur-md), permitiendo una auditoría cómoda que se contrae con la tecla Escape o haciendo clic fuera del modal.', '•'),

        // FIGURA 2: TORNIQUETE PRINCIPAL
        ...createImageFigure(
          '01_torniquete_principal.png',
          480,
          280,
          'Figura 2: Terminal principal de torniquete de sucursal en funcionamiento',
          'Vista operativa de la Sucursal Centro: muestra el estado del enlace activo, el punto de validación RFID, los perfiles de socios locales y la bitácora de transacciones del día con cobros de $0.00 MXN.'
        ),

        // FIGURA 3: CONTROLES RFID
        ...createImageFigure(
          '03_torniquete_controles_rfid.png',
          440,
          285,
          'Figura 3: Panel de control de credencial RFID y perfiles de simulación',
          'Consola de entrada donde el recepcionista o torniquete digita el identificador del socio (1-100) o selecciona perfiles de prueba precargados para verificar vigencia y tarifas.'
        ),

        // FIGURA 4: RECHAZO POR DISYUNCIÓN
        ...createImageFigure(
          '02_torniquete_rechazo_disyuncion.png',
          330,
          315,
          'Figura 4: Demostración visual de rechazo por violación de disyunción relacional',
          'Al ingresar el socio #105 en el nodo de Centro, el sistema detecta que el identificador excede el fragmento asignado (1-100), bloquea la puerta y notifica explícitamente que el usuario pertenece a la Sucursal Norte.'
        ),

        createHeading3('2. Pantalla del Celular del Dueño (Executive Mobile Dashboard):'),
        createBody(
          'Simula el smartphone ejecutivo del franquiciatario, optimizado para consulta en red local (LAN) o mediante escaneo de código QR en un teléfono físico real:'
        ),
        createBullet('Dock Flotante Liquid Glass estilo Apple: Píldora inferior ultra translúcida con desenfoque de 28px y saturación al 210%, que se compacta instantáneamente al desplazarse hacia abajo y se expande al volver a la parte superior.', '•'),
        createBullet('Pestaña de Finanzas en Vivo: Tarjeta ejecutiva con el total de ingresos recaudados hoy (Centro + Norte) que se incrementa en vivo vía WebSockets cada vez que un torniquete cobra un pase en cualquier sucursal.', '•'),
        createBullet('Pestaña de Reportes y Cierre de Caja Oficial: Muestra ticket promedio, ocupación de aforo actual, distribución porcentual y dispone de un botón de generación de Cierre de Caja imprimible a PDF/Carta con folio oficial, desglose contable y dobles firmas de auditoría.', '•'),

        // FIGURAS 5a y 5b: CELULAR DEL DUEÑO (CAJA Y AFORO)
        ...createTwoMobileFigures(
          '04_celular_dueno_caja.png',
          'Figura 5a: Caja consolidada en tiempo real',
          '05_celular_dueno_aforo.png',
          'Figura 5b: Monitoreo de aforo simultáneo',
          'Capturas reales de la aplicación móvil del dueño: a la izquierda, consolidación financiera instantánea ($2,100.00 MXN recaudados hoy con 49% aportado por Centro y 51% por Norte); a la derecha, aforo en sala en vivo (26/100 personas) y curva horaria de concurrencia.'
        ),

        createHeading3('3. Pantalla del Monitor de Topología de Red y Arquitectura BDD:'),
        createBody(
          'Herramienta interactiva diseñada específicamente para la evaluación académica frente al docente. Contiene un interruptor para "Cortar Cable de Red (Simular Caída)" en cualquiera de las sucursales. Al cortar la red, el torniquete demuestra que sigue operando con total normalidad (Autonomía Local), incrementando un contador de transacciones en cola offline. Al pulsar "Reconectar y Sincronizar", las transacciones acumuladas se replican a la base central y el celular del dueño actualiza sus cifras al instante sin pérdida de datos.'
        ),

        // FIGURA 6: TOPOLOGÍA DE RED
        ...createImageFigure(
          '07_monitor_topologia_red.png',
          490,
          145,
          'Figura 6: Monitor de topología de red distribuida y simulación de contingencia',
          'Panel de supervisión que exhibe los tres nodos independientes (Centro, Central y Norte), con indicadores de enlace en vivo, colas offline y botones para simular cortes de red física durante la sustentación.'
        ),

        createHeading2('2.4 PASO 4 (09/09/2026): Validación de Tipos de Usuarios y Casos de Uso'),
        createBody(
          'Se establecieron perfiles de usuario y reglas de negocio formales para garantizar que el sistema distribuido responda con la acción apropiada ante cada situación operativa:'
        ),

        createStyledTable(
          ['Tipo de Usuario / Evento', 'Sucursal Evaluada', 'Estado de Membresía', 'Respuesta del Sistema', 'Monto y Registro BDD'],
          [
            ['Socio Regular Activo', 'Centro (ID #1)', 'Mensual Vigente', 'Acceso Autorizado (Luz Verde + Ding)', 'Cobro: $0.00 MXN. Registrado en centro.db.'],
            ['Visitante / Pase Diario', 'Norte (ID #104)', 'Pase por Día', 'Acceso Autorizado con Cobro (Verde)', 'Cobro: $60.00 MXN. Sincronizado a central.db.'],
            ['Socio con Membresía Vencida', 'Centro (ID #5)', 'Expirada en 2025', 'Acceso Denegado (Luz Roja + Chord)', 'Sin cobro. Mensaje: "Acuda a recepción".'],
            ['Socio Fuera de Fragmento', 'Centro (ID #105 de Norte)', 'Activo en Norte', 'Rechazado por Regla Disjunta BDD', 'Error BDD: "ID #105 reside en Norte [101-200]".'],
            ['Socio en Sucursal Desconectada', 'Norte (ID #109)', 'Vigente (Sin Internet)', 'Acceso Autorizado (Modo Autónomo Local)', 'Cobro $60 local. Encolado: sincronizado = 0.'],
            ['Dueño de Franquicia', 'Celular Móvil', 'Perfil Gerencial', 'Consulta Federada Global', 'Visualiza $ Total Hoy consolidado en tiempo real.']
          ]
        ),

        // FIGURAS 7a y 7b: ÁLGEBRA RELACIONAL Y CIERRE DE CAJA
        ...createTwoMobileFigures(
          '06_celular_dueno_algebra.png',
          'Figura 7a: Formulación relacional móvil',
          '08_cierre_caja_reporte.png',
          'Figura 7b: Cierre de caja formal para PDF',
          'Demostración de rigor técnico: a la izquierda, la aplicación móvil exhibe al usuario la fórmula de unión relacional y garantía de cero colisiones; a la derecha, el diálogo de impresión oficial listo para exportar el corte de caja unificado a formato PDF en tamaño carta.'
        ),

        createHeading2('2.5 PASO 5 (09-10/09/2026): Revisión en Clase y Pruebas Automatizadas'),
        createBody(
          'El proyecto cuenta con una suite de pruebas de regresión automatizadas ejecutable mediante el comando npm test (archivo server/test-endpoints.js). La ejecución valida de forma estricta los 7 escenarios arquitectónicos fundamentales:'
        ),

        createStyledTable(
          ['No.', 'Prueba de Arquitectura BDD', 'Condición Evaluada', 'Resultado Obtenido', 'Estatus'],
          [
            ['1', 'Validación y Cobro en Centro', 'Socio #1 vigente en centro.db', 'Autorizado con cobro $0.00 MXN', '✅ APROBADO'],
            ['2', 'Violación de Fragmentación', 'Socio #105 (Norte) en centro.db', 'Rechazado: ERROR_FRAGMENTACION', '✅ APROBADO'],
            ['3', 'Vigencia de Membresía', 'Socio #5 con fecha expirada', 'Rechazado: MEMBRESIA_VENCIDA', '✅ APROBADO'],
            ['4', 'Cobro de Tarifa en Puerta', 'Socio #104 (Pase Diario) en norte.db', 'Autorizado con cobro $60.00 MXN', '✅ APROBADO'],
            ['5', 'Autonomía Local sin Red', 'Corte simulado de red en Norte', 'Pase offline exitoso, 1 en cola', '✅ APROBADO'],
            ['6', 'Reconexión y Sync Diferido', 'Restablecimiento de enlace Norte', 'Sincronizados registros, 0 en cola', '✅ APROBADO'],
            ['7', 'Consulta Federada del Dueño', 'Unión global Centro + Norte', 'Total Ingresos Hoy = $ Centro + $ Norte', '✅ APROBADO']
          ]
        ),

        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // 3. CONCLUSIONES
        createHeading1('3. Conclusiones y Lecciones Aprendidas'),
        createBody(
          'La implementación del proyecto "Fit.Net" permitió comprobar de manera práctica, rigurosa y visual la relevancia de las arquitecturas de bases de datos distribuidas en escenarios del mundo real. Entre las principales conclusiones destacan:'
        ),
        createBullet('Autonomía Local como Pilar de Continuidad: Aislar la base de datos de cada sucursal en un motor embebido local (SQLite) garantiza que el negocio nunca deje de operar por fallas de conectividad externa. Los socios ingresan y pagan sin demoras, eliminando el riesgo del punto único de falla (Single Point of Failure).', '1.'),
        createBullet('Integración sin Interferencia en la Operación: El dueño de la franquicia puede auditar las finanzas consolidadas en tiempo real desde su teléfono móvil gracias al desacoplamiento entre el procesamiento transaccional local (OLTP) y la replicación federada central impulsada por WebSockets.', '2.'),
        createBullet('Rigor Teórico en la Fragmentación Horizontal: Las cláusulas CHECK aplicadas a las claves primarias demostraron ser el mecanismo más robusto para imponer la condición de Disyunción a nivel de esquema físico, impidiendo que datos foráneos contaminen los fragmentos locales.', '3.'),
        createBullet('Experiencia de Usuario e Interfaces Especializadas: Diseñar interfaces adaptadas al contexto de uso (pantalla táctil y quiosco para el torniquete, y dashboard móvil estilo iOS/Liquid Glass para el dueño) humaniza la tecnología y facilita la toma de decisiones basada en datos.', '4.'),

        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // 4. REFERENCIAS
        createHeading1('4. Referencias Bibliográficas'),
        createBullet('Özsu, M. T., & Valduriez, P. (2011). Principles of Distributed Database Systems (3rd ed.). Springer Science & Business Media.', '[1]'),
        createBullet('Elmasri, R., & Navathe, S. B. (2016). Fundamentals of Database Systems (7th ed.). Pearson Education.', '[2]'),
        createBullet('Date, C. J. (2004). An Introduction to Database Systems (8th ed.). Addison-Wesley.', '[3]'),
        createBullet('SQLite Documentation. (2026). Write-Ahead Logging (WAL Mode) & Checkpoint Architecture. https://www.sqlite.org/wal.html', '[4]'),
        createBullet('Socket.io Documentation. (2026). Real-Time Bidirectional Event-Based Communication. https://socket.io/docs/', '[5]')
      ]
    }
  ]
});

docx.Packer.toBuffer(doc).then(buffer => {
  let savedPath = outputPath;
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Documento de Word actualizado exitosamente en:');
    console.log(outputPath);
  } catch (e) {
    if (e.code === 'EBUSY') {
      savedPath = path.resolve(__dirname, '../Reporte_Practica_FitNet_Con_Capturas.docx');
      fs.writeFileSync(savedPath, buffer);
      console.log('⚠️ El archivo original está actualmente abierto en Microsoft Word.');
      console.log('✅ Se ha generado exitosamente la versión con capturas en:');
      console.log(savedPath);
    } else {
      throw e;
    }
  }
  console.log(`Tamaño del archivo: ${(buffer.length / 1024).toFixed(2)} KB`);
}).catch(err => {
  console.error('Error generando documento:', err);
  process.exit(1);
});
