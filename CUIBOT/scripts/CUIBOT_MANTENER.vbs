' Lanzador invisible del vigilante de CUIBOT.
' WScript es una aplicacion de ventana (no de consola), asi que Windows no
' muestra ninguna ventana negra al ejecutarlo desde el Programador de tareas.
'
' Uso: wscript.exe "CUIBOT_MANTENER.vbs"

Option Explicit

Dim fso, shell, carpeta, comando

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

carpeta = fso.GetParentFolderName(WScript.ScriptFullName)

comando = "powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass" & _
          " -WindowStyle Hidden -File """ & carpeta & "\CUIBOT_MANTENER.ps1"""

' 0 = ventana oculta, False = no esperar a que termine
shell.Run comando, 0, False
