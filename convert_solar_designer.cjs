const fs = require('fs');

try {
    let html = fs.readFileSync('solar_layout_app.html', 'utf8');

    // 1. Branding replacements
    // First replace the logo specifically so it doesn't get messed up by text replacements
    html = html.replace(/Logo Solar 24h\.png/g, '/logo-smarttech-nbg.png');
    
    html = html.replace(/Solar 24h/g, 'SMARTTECH');
    html = html.replace(/SOLAR 24H/g, 'SMARTTECH');
    html = html.replace(/HỒ MINH VIỆT/g, 'Nguyễn Thế Anh');
    html = html.replace(/Mr\.Sang 0888\.003\.205/g, '0984 807 679 | info@smarttech.vn<br>Số 1 Nổi, Phường Long Trường, TP. Hồ Chí Minh, MST: 3702675986');
    
    // Fix PDF cover text wrapping
    html = html.replace('.pdf-cover h1 {', '.pdf-cover h1 {\n            white-space: nowrap;\n            font-size: 2.8rem !important;');
    html = html.replace('.pdf-cover h2 {', '.pdf-cover h2 {\n            white-space: nowrap;\n            font-size: 1.4rem !important;');

    html = html.replace(/Logo SMARTTECH\.png/g, '/logo-smarttech-nbg.png');
    html = html.replace(/\/logo-smarttech-nbg\.png/g, '/logo-smarttech-nbg.png');

    // 2. Colors
    html = html.replace(/--primary-navy:\s*#[0-9A-Fa-f]{6};/g, '--primary-navy: #0f172a;');
    html = html.replace(/--primary-green:\s*#[0-9A-Fa-f]{6};/g, '--primary-green: #f59e0b;');
    // 3. Optimize PDF Export Performance - Now completely replaced with Native Print!
    
    // Inject Native Print CSS
    const printCSS = `
            /* NATIVE PRINT CSS (Replaces html2pdf) */
            @media print {
                body { margin: 0; padding: 0; background: white; }
                body > *:not(#exportModal) { display: none !important; }
                #exportModal { display: block !important; position: static !important; background: transparent !important; }
                .modal-content { display: block !important; border: none !important; box-shadow: none !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
                .btn-close-modal { display: none !important; }
                
                /* Hide the form sidebar */
                #exportModal > div > div > div:first-child { display: none !important; }
                
                #previewScrollArea { overflow: visible !important; position: static !important; width: 100% !important; padding: 0 !important; margin: 0 !important; background: transparent !important; display: block !important; }
                #pdfContainer { margin: 0 !important; padding: 0 !important; box-shadow: none !important; transform: none !important; width: 100% !important; }
                
                .pdf-page { margin: 0 !important; box-shadow: none !important; border: none !important; width: 100% !important; height: 100vh !important; padding: 15mm 15mm !important; box-sizing: border-box !important; page-break-after: always; page-break-inside: avoid; display: flex !important; flex-direction: column !important; justify-content: center !important; }
                .pdf-page:last-child { page-break-after: auto; }
                .page-break { display: none !important; }
                
                #pdfLoading { display: none !important; }
            }
            @page { size: A4 portrait; margin: 0; }
`;
    html = html.replace('</style>', printCSS + '\n</style>');

    // Replace html2pdf logic with window.print()
    const oldExportLogic = /document\.getElementById\('btnExportPDF'\)\.addEventListener\('click',\s*async\s*\(\)\s*=>\s*\{[\s\S]*?loading\.style\.display\s*=\s*'none';[\s\S]*?\}\);/m;
    const newExportLogic = `document.getElementById('btnExportPDF').addEventListener('click', async () => {
    const loading = document.getElementById('pdfLoading');
    loading.style.display = 'flex';
    
    // CUSTOM PDF EXPORT (Using htmlToImage + jsPDF)
    const container = document.getElementById('pdfContainer');
    const originalTransform = container.style.transform;
    container.style.transform = 'none';
    
    await new Promise(r => setTimeout(r, 800)); // allow UI to show spinner
    
    const custName = document.getElementById('custName').value || 'Khach_hang';
    const filename = \`Bao_Cao_Solar_SmartTech_\${custName.replace(/\\s+/g, '_')}.pdf\`;
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = document.querySelectorAll('.pdf-page');
        
        for (let i = 0; i < pages.length; i++) {
            const pageEl = pages[i];
            const dataUrl = await window.htmlToImage.toJpeg(pageEl, { 
                quality: 0.85, 
                backgroundColor: 'white', 
                pixelRatio: 1.5,
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            });
            if (i > 0) pdf.addPage();
            pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297);
        }
        
        pdf.save(filename);
    } catch (e) {
        console.error("Lỗi khi xuất PDF:", e);
        alert("Lỗi PDF: " + (e.message || e));
    } finally {
        container.style.transform = originalTransform;
        loading.style.display = 'none';
    }
});`;
    html = html.replace(oldExportLogic, newExportLogic);
    
    // Inject jsPDF
    html = html.replace(
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>',
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
    );

    // 4. Panels Array
    const oldPanels = /const panels = \[\s*\{ id: 'ae580'[\s\S]*?\];/m;
    const newPanels = `const panels = [
            { id: 'ja610', name: 'JA Solar JAM66D45 LB 610W', w: 1.134, h: 2.28, power: 610 },
            { id: 'ja630', name: 'JA Solar JAM72D42 LB 630W', w: 1.134, h: 2.38, power: 630 },
            { id: 'jinko580', name: 'Jinko Solar Tiger Neo 580W', w: 1.134, h: 2.278, power: 580 }
        ];`;
    html = html.replace(oldPanels, newPanels);

    // Update default panel in init or invertersConfig
    html = html.replace(/panelModel: "tcl650"/g, 'panelModel: "ja610"');
    html = html.replace(/panelModel: "ae730"/g, 'panelModel: "ja610"');
    html = html.replace(/model: "Deye 10kW"/g, 'model: "Sungrow SG10RS"');
    html = html.replace(/model: "Luxpower 12kW"/g, 'model: "Sungrow SH10RT"');
    html = html.replace(/batteryModel: "EJOR 16kWh"/g, 'batteryModel: "Pin Lithium Sungrow MBL160"');

    // 4. Inverter Options (lines 1237-1249)
    const oldInvertersStr = /<option value="Luxpower 5kW"[\s\S]*?<option value="SVE 6kW" \$\{inv\.model === 'SVE 6kW' \? 'selected' : ''\}>SVE 6kW \(Hybrid\)<\/option>/m;
    const newInvertersStr = `
<option value="Sungrow SG3.0RS" \${inv.model === 'Sungrow SG3.0RS' ? 'selected' : ''}>Sungrow SG3.0RS (3kW - 1 Pha Hòa Lưới)</option>
<option value="Sungrow SG5.0RS" \${inv.model === 'Sungrow SG5.0RS' ? 'selected' : ''}>Sungrow SG5.0RS (5kW - 1 Pha Hòa Lưới)</option>
<option value="Sungrow SG10RS" \${inv.model === 'Sungrow SG10RS' ? 'selected' : ''}>Sungrow SG10RS (10kW - 1 Pha Hòa Lưới)</option>
<option value="Sungrow SG15RT" \${inv.model === 'Sungrow SG15RT' ? 'selected' : ''}>Sungrow SG15RT (15kW - 3 Pha Hòa Lưới)</option>
<option value="Sungrow MG5RL" \${inv.model === 'Sungrow MG5RL' ? 'selected' : ''}>Sungrow MG5RL (5kW - 1 Pha Hybrid Áp Thấp)</option>
<option value="Sungrow MG6RL" \${inv.model === 'Sungrow MG6RL' ? 'selected' : ''}>Sungrow MG6RL (6kW - 1 Pha Hybrid Áp Thấp)</option>
<option value="Sungrow SH5.0RS" \${inv.model === 'Sungrow SH5.0RS' ? 'selected' : ''}>Sungrow SH5.0RS (5kW - 1 Pha Hybrid Áp Cao)</option>
<option value="Sungrow MG10TL" \${inv.model === 'Sungrow MG10TL' ? 'selected' : ''}>Sungrow MG10TL (10kW - 3 Pha Hybrid Biệt Thự)</option>
<option value="Sungrow SH10RT" \${inv.model === 'Sungrow SH10RT' ? 'selected' : ''}>Sungrow SH10RT (10kW - 3 Pha Hybrid Áp Cao)</option>
`;
    html = html.replace(oldInvertersStr, newInvertersStr.trim());

    // 5. Battery Options (lines 1270-1280)
    const oldBatteriesStr = /<option value="Gigabox 5E"[\s\S]*?<option value="Hithium Hero EE MaxPower 30kWh"[\s\S]*?<\/option>/m;
    const newBatteriesStr = `
<option value="Pin Lithium Sungrow MGL060" \${inv.batteryModel === 'Pin Lithium Sungrow MGL060' ? 'selected' : ''}>Pin Lithium Sungrow MGL060 (6.0 kWh - Áp Thấp)</option>
<option value="Pin Lithium Sungrow MBL160" \${inv.batteryModel === 'Pin Lithium Sungrow MBL160' ? 'selected' : ''}>Pin Lithium Sungrow MBL160 (16.0 kWh - Áp Thấp)</option>
<option value="Pin Cao Áp Sungrow SBS050" \${inv.batteryModel === 'Pin Cao Áp Sungrow SBS050' ? 'selected' : ''}>Pin Cao Áp Sungrow SBS050 (5.12 kWh - Áp Cao)</option>
<option value="Pin Cao Áp Sungrow SBR096" \${inv.batteryModel === 'Pin Cao Áp Sungrow SBR096' ? 'selected' : ''}>Pin Cao Áp Sungrow SBR096 (9.6 kWh - Áp Cao)</option>
`;
    html = html.replace(oldBatteriesStr, newBatteriesStr.trim());

    // 6. Inject postMessage listener
    const scriptInject = `
        window.externalTargetQty = null;
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SET_INITIAL_QTY') {
                window.externalTargetQty = event.data.qty;
                // Run auto layout if panels empty
                if (panelsOnRoof.length === 0) {
                    setTimeout(() => {
                        autoLayout();
                    }, 500);
                }
            }
        });
`;
    // Insert scriptInject right after function init() {
    html = html.replace(/function init\(\) \{/, 'function init() {' + scriptInject);

    // Modify autoLayout to respect externalTargetQty
    const oldAutoLayoutLoop = /for \(let r = 0; r < rows; r\+\+\) \{[\s\S]*?for \(let c = 0; c < cols; c\+\+\) \{/m;
    const newAutoLayoutLoop = `for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (window.externalTargetQty && panelsOnRoof.length >= window.externalTargetQty) break;`;
    html = html.replace(oldAutoLayoutLoop, newAutoLayoutLoop);

    fs.writeFileSync('./public/solar_designer_xb.html', html, 'utf8');
    console.log('Successfully wrote public/solar_designer_xb.html');
} catch (e) {
    console.error(e);
}
