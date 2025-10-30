# BuildWise Pro by Kyle

## Description
BuildWise Pro is a comprehensive personal tracking application designed to help superintendents manage their tasks, schedules, reports, inventory, and logsheets efficiently and effectively. The application provides a complete solution for construction management with inventory tracking, forms management, supplier integration, and Microsoft services integration.

## Features

### 1. **Inventory Management System**
- Track parts with comprehensive fields:
  - Part name
  - Quantity
  - Status (In Stock, Out of Stock, Ordered, Low Stock)
  - Supplier information
  - Notes and additional details
- Dashboard to view, add, update, and manage inventory items
- Search and filter functionality
- Automatic status updates based on quantity thresholds
- Real-time inventory statistics on dashboard

### 2. **Forms for Logsheets**
Create and manage various types of logsheets:

#### Sprinkler Logsheets
- Record date, time, sprinkler status, and comments
- Track maintenance and operational status

#### Temperature Logsheets
- Record date, time, location, temperature, and inspector name
- Monitor temperature compliance across different locations

#### Inspection Records
- Comprehensive inspection forms with:
  - Inspection type (Safety, Structural, Electrical, Plumbing, HVAC, General)
  - Area/location details
  - Inspector information
  - Detailed inspection results
  - Pass/Fail/Needs Follow-up status

#### Export Options
- Export logs to PDF format for archival
- Export logs to Excel for data analysis
- Bulk export capabilities for all log types

### 3. **Integration with HD Supply and H&S Supplies**
- Pre-configured links to major supplier catalogs
- HD Supply integration with direct catalog access
- H&S Supplies integration for HVAC and plumbing equipment
- Custom link management for frequently used catalog pages
- Add custom suppliers with website and catalog URLs

### 4. **Microsoft Integration** (Planned)
Future integration with Microsoft services:
- Microsoft Graph API for task synchronization
- Sync maintenance requests with Microsoft To Do
- Calendar integration with Outlook
- OneDrive storage for logs and forms
- OAuth2 authentication for secure access

### 5. **Responsive Design**
- Fully optimized for mobile devices
- Tablet-friendly interface
- Desktop-enhanced experience
- Adaptive navigation and layouts
- Touch-friendly controls

### 6. **User Authentication**
- Secure login system
- Session management
- User-specific data persistence

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kyleeelmoo/Kygab.git
cd Kygab
```

2. Install dependencies (optional, for development server):
```bash
npm install
```

3. Start the application:
   - **Option A**: Open `index.html` directly in your web browser
   - **Option B**: Use the development server:
```bash
npm start
```
   Then navigate to `http://localhost:8080`

## Usage

### Getting Started
1. Open the application in your web browser
2. Log in with your credentials (any username/password for demo)
3. You'll be redirected to the dashboard

### Inventory Management
1. Navigate to **Inventory** from the top menu
2. Click **Add New Item** to create inventory entries
3. Fill in the part details:
   - Part name (required)
   - Quantity (required)
   - Status (auto-updated based on quantity)
   - Supplier information
   - Notes
4. Use the search bar to find specific items
5. Filter by status to view items in specific states
6. Edit or delete items using the action buttons

### Managing Logsheets
1. Navigate to **Logsheets** from the top menu
2. Select the appropriate tab:
   - Sprinkler Logs
   - Temperature Logs
   - Inspection Records
3. Fill out the form with required information
4. Click **Save Log** to store the entry
5. View previous logs in the list below the form
6. Export logs using the **Export to PDF** or **Export to Excel** buttons

### Supplier Catalogs
1. Navigate to **Suppliers** from the top menu
2. Access pre-configured supplier links:
   - HD Supply
   - H&S Supplies
3. Add custom links to frequently used catalog pages
4. Add new suppliers with custom URLs
5. Manage and organize supplier resources

### Dashboard Overview
The dashboard provides:
- Real-time inventory statistics
- Recent logsheet entries
- Quick action buttons for common tasks
- Microsoft integration status (when configured)

## Data Storage

All data is stored locally in your browser's localStorage:
- Inventory items
- Logsheet entries
- Custom supplier links
- User preferences

**Note**: Data is browser-specific and device-specific. To backup or transfer data, use the export features.

## Integration Setup

### HD Supply Integration
- Pre-configured links to HD Supply website and catalog
- Add custom links to specific product categories
- Direct access to frequently used sections

### H&S Supplies Integration
- Pre-configured links to H&S Supplies resources
- Manage custom catalog links
- Quick access to HVAC and plumbing equipment

### Microsoft Integration (Future Feature)
To enable Microsoft integration:
1. Register your application in Azure AD
2. Configure OAuth2 credentials
3. Update the Microsoft Graph API settings
4. Enable task sync and OneDrive storage

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Storage**: Browser localStorage
- **Export Libraries**: 
  - jsPDF for PDF generation
  - SheetJS (xlsx) for Excel export
- **Styling**: Custom CSS with dark theme
- **Icons & Fonts**: System fonts for performance

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera
- Modern mobile browsers

## Development

### Project Structure
```
Kygab/
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── inventory.html          # Inventory management
├── forms.html             # Logsheets and forms
├── suppliers.html         # Supplier catalogs
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   └── js/
│       ├── login.js       # Authentication logic
│       ├── dashboard.js   # Dashboard functionality
│       ├── inventory.js   # Inventory management
│       ├── forms.js       # Logsheet forms
│       └── suppliers.js   # Supplier management
├── package.json           # Project dependencies
└── README.md             # This file
```

### Adding New Features
1. Create HTML structure in the appropriate file
2. Add styling to `assets/css/style.css`
3. Implement functionality in a new or existing JS file
4. Test across different screen sizes
5. Update documentation

## Contribution Guidelines

We welcome contributions! Here's how you can help:

### How to Contribute
1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```
3. Make your changes
4. Test thoroughly across different browsers and devices
5. Commit your changes:
```bash
git commit -m "Add: description of your changes"
```
6. Push to your fork:
```bash
git push origin feature/your-feature-name
```
7. Create a Pull Request

### Code Standards
- Use consistent indentation (2 spaces)
- Follow existing code style
- Add comments for complex logic
- Test all features before submitting
- Ensure responsive design works on all screen sizes
- Maintain the dark theme aesthetic

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed descriptions
- Include steps to reproduce
- Add screenshots if applicable
- Specify browser and device information

## Deployment

### Deployment Automation
The project includes GitHub Actions workflow for CI/CD:
- Automatic testing on push/PR
- Deployment to hosting service (configure as needed)

### Manual Deployment
Deploy to any static hosting service:
- GitHub Pages
- Vercel
- Netlify
- AWS S3
- Any web server

Simply upload all files to the hosting service.

## Future Enhancements

- [ ] Backend API integration for multi-device sync
- [ ] Advanced reporting and analytics
- [ ] Email notifications for low stock
- [ ] Barcode/QR code scanning for inventory
- [ ] Mobile app version
- [ ] Multi-user support with roles
- [ ] Advanced Microsoft Graph integration
- [ ] Real-time API integration with suppliers
- [ ] Automated backup and restore

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Open an issue on GitHub
- Contact the maintainer
- Check existing documentation

## Acknowledgments

- Built with modern web standards
- Inspired by construction management best practices
- Community feedback and contributions

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-30  
**Maintainer**: Kyle
