# Windows Installer Script (NSIS)
# This script creates a Windows installer with file associations

!include "MUI2.nsh"
!include "FileAssociation.nsh"

Name "AI PDF Viewer"
OutFile "AI-PDF-Viewer-Installer.exe"
InstallDir "$PROGRAMFILES\AI PDF Viewer"
InstallDirRegKey HKLM "Software\AI PDF Viewer" "Install_Dir"

RequestExecutionLevel admin

# Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

# Pages
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

# Languages
!insertmacro MUI_LANGUAGE "English"

# Installation Section
Section "Install"
  SetOutPath "$INSTDIR"
  
  # Copy files
  File /r "dist\*.*"
  
  # Create shortcuts
  CreateDirectory "$SMPROGRAMS\AI PDF Viewer"
  CreateShortcut "$SMPROGRAMS\AI PDF Viewer\AI PDF Viewer.lnk" "$INSTDIR\AI PDF Viewer.exe"
  CreateShortcut "$DESKTOP\AI PDF Viewer.lnk" "$INSTDIR\AI PDF Viewer.exe"
  
  # Write uninstall information
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AI PDF Viewer" \
                   "DisplayName" "AI PDF Viewer"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AI PDF Viewer" \
                   "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AI PDF Viewer" \
                   "DisplayIcon" "$INSTDIR\AI PDF Viewer.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AI PDF Viewer" \
                   "Publisher" "AI PDF Viewer Contributors"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AI PDF Viewer" \
                   "DisplayVersion" "1.0.0"
  
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  # Register file associations for PDF
  ${registerExtension} "$INSTDIR\AI PDF Viewer.exe" ".pdf" "AI PDF Document"
  
  # Set as default PDF viewer (optional, with user consent)
  MessageBox MB_YESNO "Set AI PDF Viewer as default PDF application?" IDYES setdefault IDNO skipdefault
  setdefault:
    WriteRegStr HKCR ".pdf" "" "AI PDF Viewer.pdf"
    WriteRegStr HKCR "AI PDF Viewer.pdf" "" "AI PDF Document"
    WriteRegStr HKCR "AI PDF Viewer.pdf\DefaultIcon" "" "$INSTDIR\AI PDF Viewer.exe,0"
    WriteRegStr HKCR "AI PDF Viewer.pdf\shell\open\command" "" \
                '$INSTDIR\AI PDF Viewer.exe "%1"'
  skipdefault:
  
SectionEnd

# Uninstall Section
Section "Uninstall"
  # Remove files
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  
  # Remove shortcuts
  Delete "$SMPROGRAMS\AI PDF Viewer\*.*"
  RMDir "$SMPROGRAMS\AI PDF Viewer"
  Delete "$DESKTOP\AI PDF Viewer.lnk"
  
  # Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AI PDF Viewer"
  DeleteRegKey HKLM "Software\AI PDF Viewer"
  
  # Unregister file associations
  ${unregisterExtension} ".pdf" "AI PDF Document"
  
SectionEnd
