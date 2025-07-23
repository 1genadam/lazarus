#!/bin/bash

# Lazarus Chat Diagnostic - FTP Upload Script
# Uploads diagnostic reports to Claude Computer Use FTP server

echo "🚀 Lazarus Chat Diagnostic - FTP Upload"
echo "======================================"

# FTP Configuration
FTP_HOST="localhost"
FTP_PORT="21"
FTP_USER="ftpuser"
FTP_PASS="ftppass"
FTP_DIR="lazarus-chat-reports"

# Local directory containing reports
LOCAL_DIR="$HOME/Desktop/lazarus-chat-reports"

# Check if local directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: Directory $LOCAL_DIR not found"
    echo "   Please create the directory and save your diagnostic reports there first"
    exit 1
fi

# Check if there are any files to upload
if [ -z "$(ls -A $LOCAL_DIR 2>/dev/null)" ]; then
    echo "⚠️  Warning: Directory $LOCAL_DIR is empty"
    echo "   Please run the diagnostic tests and save reports there first"
    exit 1
fi

echo "📁 Local directory: $LOCAL_DIR"
echo "🔍 Files to upload:"
ls -la "$LOCAL_DIR"

echo ""
echo "📤 Starting FTP upload..."

# Create FTP script
ftp -n $FTP_HOST $FTP_PORT << EOF
user $FTP_USER $FTP_PASS
pwd
mkdir $FTP_DIR
cd $FTP_DIR
pwd
lcd "$LOCAL_DIR"
prompt off
binary
mput *
ls -la
quit
EOF

echo ""
echo "✅ Upload complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Access CCU web interface: http://localhost:8070"
echo "2. Navigate to FTP directory: /home/ftpuser/ftp/$FTP_DIR"
echo "3. Review uploaded diagnostic reports"
echo "4. Share findings with the developer"
echo ""
echo "🔧 FTP Access Details:"
echo "   Host: $FTP_HOST:$FTP_PORT"
echo "   User: $FTP_USER"
echo "   Directory: /home/ftpuser/ftp/$FTP_DIR"