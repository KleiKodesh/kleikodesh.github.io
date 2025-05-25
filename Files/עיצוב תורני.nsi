!include "MUI2.nsh"
!define PRODUCT_NAME "RegexInWord"
OutFile "תוסף-עיצוב-תורני-8.1.7.exe"
!define MUI_ICON "C:\Users\Admin\source\vscode\kleikodesh.github.io\Files\תוסף-עיצוב-תורני.ico"
Icon "C:\Users\Admin\source\vscode\kleikodesh.github.io\Files\תוסף-עיצוב-תורני.ico"
InstallDir "$APPDATA\Microsoft\Word\STARTUP"

!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Hebrew"

Section "התקנת תוסף RegexInWord" SEC01

    FindWindow $0 "" "Microsoft Word"
    IntCmp $0 0 continue

    MessageBox MB_OK|MB_ICONEXCLAMATION "Microsoft Word פתוח כרגע. נא לסגור אותו לפני התקנה."
    ; Abort

continue:

    ReadRegStr $1 HKCU "Software\Microsoft\Office\16.0\Word\Options" "STARTUP-PATH"
    StrCmp $1 "" 0 +3
    StrCpy $1 "$APPDATA\Microsoft\Word\STARTUP"

    SetOutPath $1
    File /r "C:\Users\Admin\source\vscode\kleikodesh.github.io\Files\תוסף-עיצוב-תורני\*.*"

    MessageBox MB_OK|MB_ICONINFORMATION "התוסף הותקן בהצלחה.`nאם Word היה פתוח – נא לסגור ולהפעיל אותו מחדש."

Quit
SectionEnd
