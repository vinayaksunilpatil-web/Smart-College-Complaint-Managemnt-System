import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header
        self.drawString(54, 11 * inch - 36, "MongoDB Complete Query Reference — Smart College Complaint Management System")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Footer
        self.line(54, 48, 8.5 * inch - 54, 48)
        self.drawString(54, 34, "Database: smart_complaint_db | MongoDB 8.x / Mongoose 9 ODM | Production Ready")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_str)
        self.restoreState()


def build_mongo_pdf(filename="MongoDB_Queries_Reference_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Color Palette
    MONGO_GREEN = colors.HexColor("#00684a")      # Official MongoDB Forest Green
    MONGO_LIGHT_BG = colors.HexColor("#f0fdf4")   # Green 50
    SLATE_DARK = colors.HexColor("#0f172a")       # Slate 900
    SLATE_MUTED = colors.HexColor("#475569")      # Slate 600
    CODE_BG = colors.HexColor("#0f172a")          # Dark IDE code background
    CODE_TEXT = colors.HexColor("#38bdf8")        # Cyan/Sky code text
    ACCENT_AMBER = colors.HexColor("#d97706")     # Amber

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=MONGO_GREEN,
        alignment=1,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=SLATE_MUTED,
        alignment=1,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'H1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=MONGO_GREEN,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SLATE_DARK,
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=5
    )

    code_block_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.2,
        leading=9.5,
        textColor=CODE_TEXT,
        spaceBefore=2,
        spaceAfter=2
    )

    table_header_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor("#1e293b"),
        alignment=0
    )

    def make_code_box(code_str):
        p = Paragraph(f"<pre>{code_str}</pre>", code_block_style)
        t = Table([[p]], colWidths=[512])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), CODE_BG),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#1e293b")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        return t

    story = []

    # =========================================================================
    # COVER / HEADER
    # =========================================================================
    story.append(Paragraph("MONGODB DATABASE ARCHITECTURE & QUERY HANDBOOK", ParagraphStyle('SubHeader', fontName='Helvetica-Bold', fontSize=10, textColor=MONGO_GREEN, alignment=1, spaceAfter=4)))
    story.append(HRFlowable(width="100%", thickness=2, color=MONGO_GREEN, spaceBefore=2, spaceAfter=14))
    story.append(Paragraph("Smart College Complaint Management System", title_style))
    story.append(Paragraph("Complete Production Reference: Schemas, CRUD Queries, Multi-Stage Aggregation Pipelines, and MongoDB Compass/Shell Commands", subtitle_style))

    # Meta Info Card
    meta_data = [
        [Paragraph("<b>Database Name:</b>", table_cell_style), Paragraph("<code>smart_complaint_db</code> (MongoDB 8.x Community Server)", table_cell_style)],
        [Paragraph("<b>Connection URI:</b>", table_cell_style), Paragraph("<code>mongodb://127.0.0.1:27017/smart_complaint_db</code>", table_cell_style)],
        [Paragraph("<b>Object Data Mapper (ODM):</b>", table_cell_style), Paragraph("Mongoose 9.10+ with strict ObjectId casting & schemas", table_cell_style)],
        [Paragraph("<b>Collections:</b>", table_cell_style), Paragraph("5 Collections: <code>users</code>, <code>departments</code>, <code>categories</code>, <code>complaints</code>, <code>notifications</code>", table_cell_style)],
        [Paragraph("<b>Supported Interfaces:</b>", table_cell_style), Paragraph("Express.js API, MongoDB Compass GUI, mongosh CLI Shell, Recharts Telemetry", table_cell_style)]
    ]
    meta_table = Table(meta_data, colWidths=[140, 372])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), MONGO_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 1: SCHEMAS & INDEX DEFINITIONS
    # =========================================================================
    story.append(Paragraph("1. Schema Definitions & Collection Indexes", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=MONGO_GREEN, spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("<b>1.1 Users Collection Schema (<code>db.users</code>)</b>", h2_style))
    u_schema = (
        "// Mongoose 9 Schema: User\n"
        "const userSchema = new mongoose.Schema({\n"
        "  name:          { type: String, required: true, trim: true },\n"
        "  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },\n"
        "  password_hash: { type: String, required: true },\n"
        "  role:          { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },\n"
        "  roll_no:       { type: String, trim: true },\n"
        "  dept_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },\n"
        "  phone:         { type: String, trim: true },\n"
        "  is_active:     { type: Boolean, default: true }\n"
        "}, { timestamps: true });\n"
        "// Indexes: { email: 1 (unique) }, { role: 1 }, { dept_id: 1 }"
    )
    story.append(make_code_box(u_schema))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>1.2 Complaints Collection Schema (<code>db.complaints</code>)</b>", h2_style))
    c_schema = (
        "// Mongoose 9 Schema: Complaint\n"
        "const complaintSchema = new mongoose.Schema({\n"
        "  title:       { type: String, required: true, trim: true },\n"
        "  description: { type: String, required: true, trim: true },\n"
        "  student_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },\n"
        "  dept_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },\n"
        "  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },\n"
        "  staff_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },\n"
        "  priority:    { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },\n"
        "  status:      { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },\n"
        "  attachments: [{ filename: String, path: String, mimetype: String }],\n"
        "  comments:    [{ user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, message: String, createdAt: { type: Date, default: Date.now } }],\n"
        "  feedback:    { rating: { type: Number, min: 1, max: 5 }, comment: String, given_at: Date }\n"
        "}, { timestamps: true });\n"
        "// Indexes: { dept_id: 1, status: 1 }, { student_id: 1 }, { createdAt: -1 }"
    )
    story.append(make_code_box(c_schema))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 2: AUTHENTICATION & USER MANAGEMENT QUERIES
    # =========================================================================
    story.append(Paragraph("2. Authentication & User Management Queries", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=MONGO_GREEN, spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("<b>2.1 User Login with Populated Department Details</b>", h2_style))
    q_login = (
        "// Query: Find user by email and populate department name\n"
        "const user = await User.findOne({ email: email.toLowerCase() })\n"
        "  .populate('dept_id', 'dept_name location');\n\n"
        "// MongoDB Shell Equivalent:\n"
        "db.users.aggregate([\n"
        "  { $match: { email: 'admin@college.edu' } },\n"
        "  { $lookup: { from: 'departments', localField: 'dept_id', foreignField: '_id', as: 'department' } },\n"
        "  { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } }\n"
        "]);"
    )
    story.append(make_code_box(q_login))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>2.2 Admin Filtered User Directory with Regex Search & Pagination</b>", h2_style))
    q_users = (
        "// Query: Filtered user listing by role, dept, and case-insensitive search\n"
        "const query = {};\n"
        "if (role && role !== 'All') query.role = role;\n"
        "if (dept_id && dept_id !== 'All') query.dept_id = dept_id;\n"
        "if (search) {\n"
        "  query.$or = [\n"
        "    { name: { $regex: search, $options: 'i' } },\n"
        "    { email: { $regex: search, $options: 'i' } },\n"
        "    { roll_no: { $regex: search, $options: 'i' } }\n"
        "  ];\n"
        "}\n"
        "const users = await User.find(query)\n"
        "  .select('-password_hash')\n"
        "  .populate('dept_id', 'dept_name')\n"
        "  .sort({ createdAt: -1 });"
    )
    story.append(make_code_box(q_users))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>2.3 User Count Aggregation by Role</b>", h2_style))
    q_userstats = (
        "// Parallel count execution for role-based metrics\n"
        "const [students, staff, admins] = await Promise.all([\n"
        "  User.countDocuments({ role: 'student' }),\n"
        "  User.countDocuments({ role: 'staff' }),\n"
        "  User.countDocuments({ role: 'admin' })\n"
        "]);"
    )
    story.append(make_code_box(q_userstats))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: COMPLAINT LIFECYCLE & TRANSACTION QUERIES
    # =========================================================================
    story.append(Paragraph("3. Complaint CRUD & Lifecycle Operations", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=MONGO_GREEN, spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("<b>3.1 Register New Complaint with Category & Dynamic Department Routing</b>", h2_style))
    q_create_comp = (
        "// Query: Create complaint document referencing student, dept, category ObjectIds\n"
        "const complaint = await Complaint.create({\n"
        "  title:       formData.title.trim(),\n"
        "  description: formData.description.trim(),\n"
        "  student_id:  req.user.id,\n"
        "  dept_id:     category.dept_id._id, // Auto-resolved from Category\n"
        "  category_id: category._id,\n"
        "  priority:    formData.priority || 'Medium',\n"
        "  status:      'Open',\n"
        "  attachments: req.files.map(f => ({ filename: f.filename, path: f.path, mimetype: f.mimetype }))\n"
        "});"
    )
    story.append(make_code_box(q_create_comp))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>3.2 Staff Status Update & Atomic Technical Remarks Append ($push)</b>", h2_style))
    q_update_status = (
        "// Query: Atomically update status and append technical audit remark into comments array\n"
        "const updatedComplaint = await Complaint.findByIdAndUpdate(\n"
        "  complaintId,\n"
        "  {\n"
        "    $set: { status: new_status, staff_id: req.user.id },\n"
        "    $push: {\n"
        "      comments: {\n"
        "        user_id: req.user.id,\n"
        "        message: `[Status changed to ${new_status}] ${remarks || ''}`.trim(),\n"
        "        createdAt: new Date()\n"
        "      }\n"
        "    }\n"
        "  },\n"
        "  { new: true }\n"
        ").populate('student_id dept_id category_id staff_id');"
    )
    story.append(make_code_box(q_update_status))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>3.3 Student Submit Resolution Feedback & 1-5 Star Rating</b>", h2_style))
    q_feedback = (
        "// Query: Record student satisfaction feedback upon ticket resolution\n"
        "await Complaint.findByIdAndUpdate(\n"
        "  complaintId,\n"
        "  {\n"
        "    $set: {\n"
        "      'feedback.rating': Number(rating),\n"
        "      'feedback.comment': comment.trim(),\n"
        "      'feedback.given_at': new Date()\n"
        "    }\n"
        "  }\n"
        ");"
    )
    story.append(make_code_box(q_feedback))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 4: PRODUCTION MONGODB AGGREGATION PIPELINES
    # =========================================================================
    story.append(Paragraph("4. Real-Time MongoDB Aggregation Pipelines", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=MONGO_GREEN, spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("<b>Pipeline 1: Institutional Complaints by Department ($group, $lookup, $unwind, $project)</b>", h2_style))
    story.append(Paragraph("Aggregates all tickets per department with open, in-progress, resolved, and closed counts.", body_style))
    p1 = (
        "db.complaints.aggregate([\n"
        "  { $group: {\n"
        "      _id: '$dept_id',\n"
        "      total: { $sum: 1 },\n"
        "      open_count:        { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },\n"
        "      in_progress_count: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },\n"
        "      resolved_count:    { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },\n"
        "      closed_count:      { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }\n"
        "  }},\n"
        "  { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },\n"
        "  { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },\n"
        "  { $project: {\n"
        "      _id: 0,\n"
        "      dept_id: '$_id',\n"
        "      dept_name: '$department.dept_name',\n"
        "      total: 1, open_count: 1, in_progress_count: 1, resolved_count: 1, closed_count: 1\n"
        "  }},\n"
        "  { $sort: { total: -1 } }\n"
        "]);"
    )
    story.append(make_code_box(p1))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Pipeline 2: Monthly Time-Series Inflow vs Resolution Velocity ($year, $month, $concat)</b>", h2_style))
    story.append(Paragraph("Calculates monthly volume trends across Academic Years (2025, 2026, 2027) with formatted month names.", body_style))
    p2 = (
        "db.complaints.aggregate([\n"
        "  { $group: {\n"
        "      _id: {\n"
        "        year:  { $year: '$createdAt' },\n"
        "        month: { $month: '$createdAt' }\n"
        "      },\n"
        "      total_raised:   { $sum: 1 },\n"
        "      total_resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } }\n"
        "  }},\n"
        "  { $project: {\n"
        "      _id: 0,\n"
        "      year: '$_id.year',\n"
        "      month: '$_id.month',\n"
        "      month_name: {\n"
        "        $concat: [\n"
        "          { $arrayElemAt: [['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], { $subtract: ['$_id.month', 1] }] },\n"
        "          ' ',\n"
        "          { $toString: '$_id.year' }\n"
        "        ]\n"
        "      },\n"
        "      total_raised: 1,\n"
        "      total_resolved: 1\n"
        "  }},\n"
        "  { $sort: { year: 1, month: 1 } }\n"
        "]);"
    )
    story.append(make_code_box(p2))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: ADVANCED ANALYTICS & STAFF QUERIES
    # =========================================================================
    story.append(Paragraph("5. Staff Analytics & Facility Health Pipelines", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=MONGO_GREEN, spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("<b>Pipeline 3: Department-Specific Category Volume for Staff Visualizations</b>", h2_style))
    story.append(Paragraph("Executed by <code>GET /api/staff/analytics</code> to render department bar charts.", body_style))
    p3 = (
        "db.complaints.aggregate([\n"
        "  { $match: { dept_id: ObjectId('66f912...dept_id...') } },\n"
        "  { $group: { _id: '$category_id', count: { $sum: 1 } } },\n"
        "  { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },\n"
        "  { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },\n"
        "  { $project: {\n"
        "      _id: 0,\n"
        "      category_name: { $ifNull: ['$category.category_name', 'General Issue'] },\n"
        "      sla_hours: { $ifNull: ['$category.sla_hours', 48] },\n"
        "      count: 1\n"
        "  }},\n"
        "  { $sort: { count: -1 } }\n"
        "]);"
    )
    story.append(make_code_box(p3))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Pipeline 4: Department SLA Resolution Rate Percentage ($divide, $multiply, $round)</b>", h2_style))
    p4 = (
        "db.complaints.aggregate([\n"
        "  { $group: {\n"
        "      _id: '$dept_id',\n"
        "      total:    { $sum: 1 },\n"
        "      resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } }\n"
        "  }},\n"
        "  { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },\n"
        "  { $unwind: '$dept' },\n"
        "  { $project: {\n"
        "      _id: 0,\n"
        "      dept_name: '$dept.dept_name',\n"
        "      total: 1,\n"
        "      resolved: 1,\n"
        "      resolution_rate_percent: {\n"
        "        $round: [\n"
        "          { $multiply: [{ $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$resolved', '$total'] }] }, 100] },\n"
        "          1\n"
        "        ]\n"
        "      }\n"
        "  }},\n"
        "  { $sort: { resolution_rate_percent: -1 } }\n"
        "]);"
    )
    story.append(make_code_box(p4))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Pipeline 5: Student Feedback & Average Rating Matrix ($avg, $match)</b>", h2_style))
    p5 = (
        "db.complaints.aggregate([\n"
        "  { $match: { 'feedback.rating': { $exists: true, $ne: null } } },\n"
        "  { $group: {\n"
        "      _id: '$feedback.rating',\n"
        "      rating_count: { $sum: 1 },\n"
        "      avg_score:    { $avg: '$feedback.rating' }\n"
        "  }},\n"
        "  { $project: { _id: 0, star_rating: '$_id', count: '$rating_count' } },\n"
        "  { $sort: { star_rating: -1 } }\n"
        "]);"
    )
    story.append(make_code_box(p5))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: MONGODB COMPASS & CLI CHEAT SHEET
    # =========================================================================
    story.append(Paragraph("6. MongoDB Compass & mongosh CLI Commands", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=MONGO_GREEN, spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("Quick commands to run directly in MongoDB Compass embedded Shell or terminal:", body_style))

    shell_cmds = (
        "// 1. Connect to Database\n"
        "use smart_complaint_db\n\n"
        "// 2. View Collection Document Counts & Storage Size\n"
        "db.stats()\n"
        "db.complaints.countDocuments()\n"
        "db.users.countDocuments({ role: 'student' })\n\n"
        "// 3. Find All Open Critical Priority Complaints\n"
        "db.complaints.find({ priority: 'Critical', status: 'Open' }).pretty()\n\n"
        "// 4. Inspect Indexes on Complaints Collection\n"
        "db.complaints.getIndexes()\n\n"
        "// 5. Create Compound Index for Accelerated Department Queries\n"
        "db.complaints.createIndex({ dept_id: 1, status: 1, createdAt: -1 })\n\n"
        "// 6. Reset Database to Seed State (Seed Script)\n"
        "// Run in terminal: cd backend && node seed.js"
    )
    story.append(make_code_box(shell_cmds))

    story.append(Spacer(1, 10))

    # Summary Table
    summary_data = [
        [Paragraph("<b>Feature / Pipeline</b>", table_header_style), Paragraph("<b>Target Collection</b>", table_header_style), Paragraph("<b>Key Operators</b>", table_header_style), Paragraph("<b>UI Consumer</b>", table_header_style)],
        [Paragraph("Department Distribution", table_cell_style), Paragraph("<code>complaints</code>", table_cell_style), Paragraph("<code>$group, $lookup, $unwind, $sort</code>", table_cell_style), Paragraph("Admin & Staff Bar Charts", table_cell_style)],
        [Paragraph("Status Lifecycle", table_cell_style), Paragraph("<code>complaints</code>", table_cell_style), Paragraph("<code>$group, $project</code>", table_cell_style), Paragraph("Donut Status Visualizer", table_cell_style)],
        [Paragraph("Monthly Velocity", table_cell_style), Paragraph("<code>complaints</code>", table_cell_style), Paragraph("<code>$year, $month, $concat</code>", table_cell_style), Paragraph("Recharts Area Chart", table_cell_style)],
        [Paragraph("Dynamic Categories", table_cell_style), Paragraph("<code>categories</code>", table_cell_style), Paragraph("<code>$lookup, $unwind</code>", table_cell_style), Paragraph("Voice & NLP Submission", table_cell_style)],
        [Paragraph("Document Browser", table_cell_style), Paragraph("All 5 collections", table_cell_style), Paragraph("<code>.find().skip().limit()</code>", table_cell_style), Paragraph("Admin MongoDB Inspector", table_cell_style)]
    ]
    summary_table = Table(summary_data, colWidths=[110, 85, 160, 157])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), MONGO_GREEN),
        ('BACKGROUND', (0,1), (-1,-1), MONGO_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(summary_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"MongoDB Queries PDF Generated: {os.path.abspath(filename)}")

if __name__ == '__main__':
    out_file = sys.argv[1] if len(sys.argv) > 1 else "MongoDB_Queries_Reference_Guide.pdf"
    build_mongo_pdf(out_file)
