#!/bin/bash
# Diagnostic script to help identify permission and environment issues
# Save this in the same directory as updateCommand.sh

# Create a timestamp for unique filenames
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="/tmp/webhook_diagnostic_$TIMESTAMP.log"

# Output header
echo "=== Webhook Diagnostic Script Run at $(date) ===" > $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Who am I?
echo "Running as user: $(whoami)" >> $OUTPUT_FILE
echo "User home: $HOME" >> $OUTPUT_FILE
echo "Groups membership: $(groups)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Environment
echo "=== Environment Variables ===" >> $OUTPUT_FILE
env | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# PATH inspection
echo "=== PATH Directories ===" >> $OUTPUT_FILE
echo "PATH=$PATH" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Checking if key directories exist in PATH:" >> $OUTPUT_FILE
for p in $(echo $PATH | tr ":" " "); do
  if [ -d "$p" ]; then
    echo "✓ $p (exists)" >> $OUTPUT_FILE
  else
    echo "✗ $p (does not exist)" >> $OUTPUT_FILE
  fi
done
echo "" >> $OUTPUT_FILE

# NVM Check
echo "=== NVM Check ===" >> $OUTPUT_FILE
if [ -d "$HOME/.nvm" ]; then
  echo "NVM directory exists at $HOME/.nvm" >> $OUTPUT_FILE
  if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "NVM script exists at $HOME/.nvm/nvm.sh" >> $OUTPUT_FILE
    echo "Attempting to source NVM..." >> $OUTPUT_FILE
    source "$HOME/.nvm/nvm.sh" >> $OUTPUT_FILE 2>&1
    echo "NVM version: $(nvm --version 2>&1)" >> $OUTPUT_FILE
    echo "Node version: $(node --version 2>&1)" >> $OUTPUT_FILE
    echo "NPM version: $(npm --version 2>&1)" >> $OUTPUT_FILE
  else
    echo "NVM script not found at $HOME/.nvm/nvm.sh" >> $OUTPUT_FILE
  fi
else
  echo "NVM directory not found at $HOME/.nvm" >> $OUTPUT_FILE
fi
echo "" >> $OUTPUT_FILE

# Check executable locations
echo "=== Executable Locations ===" >> $OUTPUT_FILE
for cmd in node npm git pm2; do
  echo -n "$cmd: " >> $OUTPUT_FILE
  which $cmd 2>/dev/null >> $OUTPUT_FILE || echo "not found in PATH" >> $OUTPUT_FILE
done
echo "" >> $OUTPUT_FILE

# Check file permissions for key directories
echo "=== Directory Permissions ===" >> $OUTPUT_FILE
PROJECT_PATH="/home/juljus/pimeduse-arhiiv"
echo "Project directory permissions:" >> $OUTPUT_FILE
ls -ld $PROJECT_PATH >> $OUTPUT_FILE 2>&1
echo "Can read project directory: $([[ -r $PROJECT_PATH ]] && echo 'Yes' || echo 'No')" >> $OUTPUT_FILE
echo "Can write to project directory: $([[ -w $PROJECT_PATH ]] && echo 'Yes' || echo 'No')" >> $OUTPUT_FILE
echo "Can execute in project directory: $([[ -x $PROJECT_PATH ]] && echo 'Yes' || echo 'No')" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Git configuration check
echo "=== Git Configuration ===" >> $OUTPUT_FILE
echo "Global git config:" >> $OUTPUT_FILE
git config --global --list >> $OUTPUT_FILE 2>&1
echo "" >> $OUTPUT_FILE
echo "Repository git config:" >> $OUTPUT_FILE
cd $PROJECT_PATH 2>/dev/null && git config --local --list >> $OUTPUT_FILE 2>&1
echo "" >> $OUTPUT_FILE

echo "=== File created at $OUTPUT_FILE ===" 
echo "Run 'cat $OUTPUT_FILE' to view the results"

# Also print a summary to stdout
echo "=== Diagnostic Summary ==="
echo "User: $(whoami)"
echo "Node: $(which node 2>/dev/null || echo 'not found')"
echo "NPM: $(which npm 2>/dev/null || echo 'not found')"
echo "Full details saved to: $OUTPUT_FILE"