const prisma = require('../config/prisma');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getDashboardStats = async (req, res) => {
    try {
        // Using $queryRaw for high performance as requested
        const totalUsers = await prisma.$queryRaw`SELECT COUNT(*) FROM "User"`;
        const totalComplaints = await prisma.$queryRaw`SELECT COUNT(*) FROM "Complaint"`;
        const totalOfficers = await prisma.$queryRaw`SELECT COUNT(*) FROM "Police_Officer"`;

        const complaintsByStatus = await prisma.$queryRaw`
            SELECT status, COUNT(*) as count 
            FROM "Complaint" 
            GROUP BY status
        `;

        const complaintsByPriority = await prisma.$queryRaw`
            SELECT priority, COUNT(*) as count 
            FROM "Complaint" 
            GROUP BY priority
        `;

        const complaintsTrend = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month, 
                COUNT(*) as count 
            FROM "Complaint" 
            WHERE created_at > NOW() - INTERVAL '6 months'
            GROUP BY month 
            ORDER BY month ASC
        `;

        // Convert BigInt to Number for JSON serialization
        const formattedStatus = complaintsByStatus.map(s => ({
            ...s,
            count: Number(s.count)
        }));

        const formattedPriority = complaintsByPriority.map(s => ({
            ...s,
            count: Number(s.count)
        }));

        const formattedTrend = complaintsTrend.map(s => ({
            ...s,
            count: Number(s.count)
        }));

        res.json({
            success: true,
            data: {
                counts: {
                    users: Number(totalUsers[0].count),
                    complaints: Number(totalComplaints[0].count),
                    officers: Number(totalOfficers[0].count)
                },
                complaintsByStatus: formattedStatus,
                complaintsByPriority: formattedPriority,
                complaintsTrend: formattedTrend
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
    }
};

const generateComplaintsExcel = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: {
                user: true,
                zone: true
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Complaints');

        worksheet.columns = [
            { header: 'ID', key: 'Id_complaint', width: 40 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Priority', key: 'priority', width: 10 },
            { header: 'Complainant', key: 'userName', width: 25 },
            { header: 'Zone', key: 'zoneName', width: 20 },
            { header: 'Created At', key: 'created_at', width: 20 }
        ];

        complaints.forEach(c => {
            worksheet.addRow({
                Id_complaint: c.Id_complaint,
                title: c.title,
                status: c.status,
                priority: c.priority,
                userName: `${c.user.first_name} ${c.user.last_name}`,
                zoneName: c.zone.name_zone,
                created_at: c.created_at.toISOString()
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateComplaintPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const complaint = await prisma.complaint.findUnique({
            where: { Id_complaint: id },
            include: {
                user: true,
                zone: true
            }
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=complaint_${id}.pdf`);
        doc.pipe(res);

        // --- Header Design ---
        doc.rect(0, 0, 612, 80).fill('#1a237e'); // Blue header bar
        doc.fillColor('white').fontSize(22).text('JUSTICE SYSTEM - OFFICIAL REPORT', 50, 30);
        doc.fontSize(10).text('National Public Security Management', 50, 55);

        // --- Logo/Seal Area ---
        doc.circle(530, 40, 25).lineWidth(2).stroke('white');
        doc.fontSize(8).text('OFFICIAL', 515, 33);
        doc.text('SEAL', 522, 43);

        doc.fillColor('black').moveDown(4);

        // --- Report Header Information ---
        doc.fontSize(10).fillColor('#666').text('Report ID:', 50, 100);
        doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text(complaint.Id_complaint, 110, 100);

        doc.fontSize(10).fillColor('#666').text('Issue Date:', 400, 100);
        doc.fontSize(12).fillColor('black').font('Helvetica').text(new Date().toLocaleDateString(), 460, 100);

        doc.moveDown(2);
        doc.lineWidth(1).strokeColor('#eee').moveTo(50, 120).lineTo(550, 120).stroke();

        // --- General Case Info Box ---
        doc.rect(50, 140, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('CASE DETAILS', 60, 147);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        doc.moveDown(1);

        const contentStartY = 175;
        doc.text('Title:', 60, contentStartY);
        doc.font('Helvetica-Bold').text(complaint.title, 130, contentStartY);

        doc.font('Helvetica').text('Status:', 60, contentStartY + 20);
        const statusColor = complaint.status === 'received' ? '#0d47a1' : '#2eb85c';
        doc.fillColor(statusColor).font('Helvetica-Bold').text(complaint.status.toUpperCase(), 130, contentStartY + 20);

        doc.fillColor('black').font('Helvetica').text('Priority:', 300, contentStartY + 20);
        const prioColor = complaint.priority === 'high' ? '#d32f2f' : '#fbc02d';
        doc.fillColor(prioColor).font('Helvetica-Bold').text(complaint.priority.toUpperCase(), 350, contentStartY + 20);

        // --- Complainant Info Box ---
        doc.fillColor('black').moveDown(3);
        doc.rect(50, 230, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('COMPLAINANT INFORMATION', 60, 237);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        doc.text('Full Name:', 60, 265);
        doc.font('Helvetica-Bold').text(`${complaint.user.first_name} ${complaint.user.last_name}`, 130, 265);

        doc.font('Helvetica').text('DNI:', 60, 285);
        doc.font('Helvetica-Bold').text(complaint.user.dni, 130, 285);

        doc.font('Helvetica').text('Contact Email:', 300, 285);
        doc.font('Helvetica-Bold').text(complaint.user.email, 380, 285);

        // --- Description Box ---
        doc.fillColor('black').moveDown(3);
        doc.rect(50, 320, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('INCIDENT DESCRIPTION', 60, 327);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        doc.text(complaint.description, 60, 355, { width: 480, align: 'justify' });

        // --- Location Box ---
        const locationY = doc.y + 30;
        doc.rect(50, locationY, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('LOCATION DATA', 60, locationY + 7);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        doc.text('Zone/Jurisdiction:', 60, locationY + 35);
        doc.font('Helvetica-Bold').text(complaint.zone.name_zone, 160, locationY + 35);

        doc.font('Helvetica').text('Full Address:', 60, locationY + 55);
        doc.font('Helvetica-Bold').text(complaint.address_detail || 'No specific address provided', 160, locationY + 55);

        // --- Footer ---
        doc.fontSize(8).fillColor('#aaa').text('Generated by Justice System Digital Authority. This document is valid without manual signature.', 50, 720, { align: 'center' });
        doc.text(`Page 1 of 1 - Reference ID: ${complaint.Id_complaint.substring(0, 8)}`, 50, 735, { align: 'center' });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateAssignmentPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { Id_assignment: id },
            include: {
                judge: true,
                officials: true,
                funcionaries: true,
                witnesses: true,
                jury: true
            }
        });

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=assignment_${assignment.case_number}.pdf`);
        doc.pipe(res);

        // --- Header ---
        doc.rect(0, 0, 612, 80).fill('#1a237e');
        doc.fillColor('white').fontSize(22).text('JUSTICE SYSTEM - ASSIGNMENT REPORT', 50, 30);
        doc.fontSize(10).text('Judicial Case Management Office', 50, 55);

        doc.fillColor('black').moveDown(4);

        // --- Metadata ---
        doc.fontSize(10).fillColor('#666').text('Case Number:', 50, 100);
        doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text(assignment.case_number, 130, 100);

        doc.fontSize(10).fillColor('#666').text('Date:', 400, 100);
        doc.fontSize(12).fillColor('black').font('Helvetica').text(new Date().toLocaleDateString(), 460, 100);

        doc.moveDown(2);
        doc.lineWidth(1).strokeColor('#eee').moveTo(50, 120).lineTo(550, 120).stroke();

        // --- Case Info ---
        doc.rect(50, 140, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('ASSIGNMENT SUMMARY', 60, 147);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        doc.text('Case Title:', 60, 175);
        doc.font('Helvetica-Bold').text(assignment.case_title, 130, 175);

        doc.font('Helvetica').text('Court:', 60, 195);
        doc.font('Helvetica-Bold').text(assignment.court || 'Not specified', 130, 195);

        doc.font('Helvetica').text('Judge:', 300, 195);
        doc.font('Helvetica-Bold').text(assignment.judge ? `${assignment.judge.first_name} ${assignment.judge.last_name}` : (assignment.judge_name || 'Unassigned'), 350, 195);

        // --- Dates ---
        doc.rect(50, 230, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('SCHEDULED HEARINGS', 60, 237);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        doc.text('Hearing Date:', 60, 265);
        doc.font('Helvetica-Bold').text(assignment.hearing_date ? assignment.hearing_date.toLocaleDateString() : 'TBD', 150, 265);
        doc.font('Helvetica').text('Time:', 300, 265);
        doc.font('Helvetica-Bold').text(assignment.hearing_time || 'N/A', 350, 265);

        doc.font('Helvetica').text('Trial Date:', 60, 285);
        doc.font('Helvetica-Bold').text(assignment.trial_date ? assignment.trial_date.toLocaleDateString() : 'TBD', 150, 285);
        doc.font('Helvetica').text('Time:', 300, 285);
        doc.font('Helvetica-Bold').text(assignment.trial_time || 'N/A', 350, 285);

        // --- Participants ---
        doc.rect(50, 320, 500, 25).fill('#f8f9fa');
        doc.fillColor('#1a237e').font('Helvetica-Bold').fontSize(12).text('PARTICIPANTS LIST', 60, 327);

        doc.fillColor('black').font('Helvetica').fontSize(10);
        let currentY = 350;

        const addCategory = (title, list) => {
            if (list.length > 0) {
                doc.font('Helvetica-Bold').text(title, 60, currentY);
                currentY += 15;
                doc.font('Helvetica');
                list.forEach(p => {
                    const name = p.first_name ? `${p.first_name} ${p.last_name}` : (p.name || 'Unknown');
                    doc.text(`• ${name}`, 80, currentY);
                    currentY += 15;
                });
                currentY += 5;
            }
        };

        addCategory('Officials:', assignment.officials);
        addCategory('Functionaries:', assignment.funcionaries);
        addCategory('Witnesses:', assignment.witnesses);
        addCategory('Jury:', assignment.jury);

        // --- Footer ---
        doc.fontSize(8).fillColor('#aaa').text('Generated by Justice System Digital Authority. Official Document.', 50, 735, { align: 'center' });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    generateComplaintsExcel,
    generateComplaintPDF,
    generateAssignmentPDF
};
